import { parse } from 'acorn';
import { Program } from 'estree';
import { ScriptError } from './ScriptError';
import { Context } from './context';
import {
    FExpression,
    FLiteral,
    FMemberExpression,
    FNewExpression,
    FSimpleCallExpression,
} from './fExpression';
import { FPattern } from './fPattern';
import { FStatement, FVariableDeclaration, fStatement } from './fStatement';
import { getRestValues } from './getRestValues';
import { toRange } from './range';
import { FArray } from './scriptValue/FArray';
import { FBoolean } from './scriptValue/FBoolean';
import { FFunction } from './scriptValue/FFunction';
import { FNumber } from './scriptValue/FNumber';
import { FRecord } from './scriptValue/FRecord';
import { FString } from './scriptValue/FString';
import { FType } from './scriptValue/FType';
import { FValue } from './scriptValue/FValue';
import { compareToBoolean, compareToNumber, compareToNumberOrString } from './scriptValue/compare';
import { eqeq } from './scriptValue/eqeq';
import { eqeqeq } from './scriptValue/eqeqeq';
import { isTruthy } from './scriptValue/isTruthy';
import { toFGlobalRecord } from './scriptValue/toFGlobalRecord';
import { toTypeName } from './scriptValue/toTypeName';
import { FObjectBase } from './scriptValue/types';
import { toJObject } from './utils/toJObject';

function ofFLiteral(literal: FLiteral): FBoolean | FNumber | FString | null {
    if (literal.value == null) {
        return null;
    }
    switch (typeof literal.value) {
        case 'boolean':
            return new FBoolean(literal.value);
        case 'string':
            return new FString(literal.value);
        case 'number':
            return new FNumber(literal.value);
        default:
            throw new Error('This should not happen.');
    }
}

// @types/estree では CallExpression = SimpleCallExpression | NewExpression なのでそれに合わせた命名をしている
function ofFCallExpression(
    expression: FSimpleCallExpression | FNewExpression,
    context: Context,
    isChain: boolean,
    isNew?: 'new' | undefined
): FValue {
    const callee = ofFExpression(expression.callee, context);
    const args = expression.arguments.map(arg => {
        return ofFExpression(arg, context);
    });
    if (isChain && callee == null) {
        return undefined;
    }
    if (callee?.type !== FType.Function) {
        throw new Error(`${callee} is not a function`);
    }
    return callee.exec({ args, isNew: isNew != null, astInfo: { range: toRange(expression) } });
}

function ofFMemberExpressionAsGet(
    expression: FMemberExpression,
    context: Context,
    isChain: boolean
): FValue {
    const object = ofFExpression(expression.object, context);
    if (object == null) {
        if (isChain) {
            return undefined;
        }
        throw new Error('object is null or undefined');
    }
    if (expression.computed) {
        const property = ofFExpression(expression.property, context);
        return object.get({ property, astInfo: { range: toRange(expression) } });
    }
    if (expression.property.type !== 'Identifier') {
        throw new Error('this should not happen');
    }
    return object.get({
        property: new FString(expression.property.name),
        astInfo: { range: toRange(expression) },
    });
}

function ofFMemberExpressionAsAssign(
    expression: FMemberExpression,
    newValue: FValue,
    context: Context
): FValue {
    const object = ofFExpression(expression.object, context);
    let property: FValue;
    if (!expression.computed && expression.property.type === 'Identifier') {
        property = new FString(expression.property.name);
    } else {
        property = ofFExpression(expression.property, context);
    }
    if (object == null) {
        throw new Error(`Object is ${toTypeName(object)}`);
    }
    object.set({
        property,
        newValue: newValue,
        astInfo: { range: toRange(expression) },
    });
    return undefined;
}

type SetToRestElementAs = 'array' | 'object';

function ofFPattern(
    pattern: FPattern,
    context: Context,
    kind: 'let' | 'const' | 'assign',
    value: FValue,

    // let {a, ...b} = foo; のbのようにbにobjectが入る場面では'object'を、let [a, ...b] = bar; のbのようにbにArrayが入る場面では'array'を渡す。
    // function f(...p) { return p; } のpの場面ではArrayが入るため'array'を渡す。再帰以外でofFPatternが呼ばれてなおかつpatternがRestElementであるケースはそれしかないと思われるため、引数のデフォルト値は'array'としている。
    setToRestElementAs: SetToRestElementAs = 'array'
): void {
    switch (pattern.type) {
        case 'Identifier':
            switch (kind) {
                case 'assign':
                    context.assign(pattern.name, value, toRange(pattern));
                    return;
                default:
                    context.declare(pattern.name, value, kind);
                    return;
            }
        case 'AssignmentPattern':
            // JavaScriptでは引数が存在しない場合は引数がundefinedとみなされるため、このように単にundefinedかどうかチェックするだけでよい。
            ofFPattern(
                pattern.left,
                context,
                kind,
                value === undefined ? ofFExpression(pattern.right, context) : value,
                setToRestElementAs
            );
            return;
        case 'MemberExpression':
            ofFMemberExpressionAsAssign(pattern, value, context);
            return;
        case 'ArrayPattern': {
            const valueAsFObjectBase: FObjectBase | null | undefined = value;
            if (valueAsFObjectBase?.iterate == null) {
                throw new ScriptError(`${value} is not iterable`);
            }

            const valueIterator: IterableIterator<FValue> = valueAsFObjectBase.iterate();
            const valueIteratorNext = () => {
                const next = valueIterator.next();
                if (next.done) {
                    return undefined;
                }
                return next.value;
            };
            for (const arrayPatternElement of pattern.elements) {
                if (arrayPatternElement?.type === 'RestElement') {
                    ofFPattern(
                        arrayPatternElement.argument,
                        context,
                        kind,
                        FArray.create(getRestValues(valueIterator)),
                        setToRestElementAs
                    );
                    // RestElementはArrayPatternの最後にしか存在し得ないため、breakで抜けてしまって構わない。
                    break;
                }
                const rightValueElement = valueIteratorNext();
                if (arrayPatternElement === null) {
                    continue;
                }
                ofFPattern(arrayPatternElement, context, kind, rightValueElement, 'array');
            }
            return;
        }
        case 'ObjectPattern': {
            if (value == null) {
                throw new ScriptError(`${value} has no properties`);
            }

            // 本題の前に前提として、ObjectPattern内にRestElementがある場合、FRecordでなければエラーとみなすようにしている。理由は、TypeScriptでも同様の挙動を示すため（JavaScriptではエラーは出ないが、TypeScriptとして使う前提であるため考慮していない）。
            // RestElementが来たときにそれ以前に書かれたプロパティを除外していなければならないため、valueがFRecordであれば、それらを除外した状態のオブジェクトをnextValueとして保持している。ただし、FRecordでない場合はnextValueは常にvalueと等しくなる。これは、RestElementはFRecordに対応していないので、FRecord以外のオブジェクトのプロパティを除外する必要がないため。
            let nextValue = value;
            for (const objectPatternProperty of pattern.properties) {
                if (objectPatternProperty.type === 'RestElement') {
                    ofFPattern(objectPatternProperty, context, kind, nextValue, 'object');
                    continue;
                }
                if (objectPatternProperty.key.type === 'Literal') {
                    // どのような場面でここに来るのかまだ分かっていない
                    throw new ScriptError('Literal as a key of ObjectPattern is not supported');
                }
                const key = new FString(objectPatternProperty.key.name);
                switch (kind) {
                    case 'assign':
                        context.assign(
                            objectPatternProperty.key.name,
                            nextValue.get({ property: key, astInfo: objectPatternProperty.key }),
                            toRange(pattern)
                        );
                        break;
                    default:
                        context.declare(
                            objectPatternProperty.key.name,
                            nextValue.get({ property: key, astInfo: objectPatternProperty.key }),
                            kind
                        );
                        break;
                }
                if (value instanceof FRecord) {
                    const $nextValue = value.clone();
                    $nextValue.source.delete(objectPatternProperty.key.name);
                    nextValue = $nextValue;
                } else {
                    nextValue = value;
                }
            }
            return;
        }
        case 'RestElement':
            if (setToRestElementAs === 'array') {
                const valueAsFObjectBase: FObjectBase | null | undefined = value;
                if (valueAsFObjectBase?.iterate == null) {
                    throw new ScriptError(`${value} is not iterable`);
                }
                ofFPattern(pattern.argument, context, kind, value, 'array');
                return;
            }
            ofFPattern(pattern.argument, context, kind, value, 'object');
            return;
    }
}

/*
let x; や let x = 1; のようなコードでは、valueToSetにundefinedを渡す。
for (let x of [1]) {} のようなコードではinitはnullishであるため、valueToSetに1を渡さなければならない。
*/
function ofFVariableDeclaration(
    statement: FVariableDeclaration,
    context: Context,
    valueToSet?: FValue
): void {
    const kind = statement.kind;
    statement.declarations.forEach(d => {
        // let x; のような場合は let x = undefined; と同等とみなして良さそう。const x; はparseの時点で弾かれるはず。
        ofFPattern(
            d.id,
            context,
            kind,
            d.init == null ? valueToSet : ofFExpression(d.init, context)
        );
    });
}

function ofFExpression(expression: FExpression, context: Context): FValue {
    switch (expression.type) {
        case 'ArrayExpression': {
            const result: FValue[] = [];
            expression.elements.forEach(d => {
                if (d === null) {
                    result.push(null);
                    return;
                }
                if (!d.isSpread) {
                    result.push(ofFExpression(d.expression, context));
                    return;
                }
                const argument: FObjectBase | null | undefined = ofFExpression(d.argument, context);
                if (argument == null || argument.iterate == null) {
                    throw new ScriptError(
                        `${argument?.toPrimitiveAsString()} is not iterable`,
                        toRange(d.argument)
                    );
                }
                for (const elem of argument.iterate()) {
                    result.push(elem);
                }
            });
            return FArray.create(result);
        }
        case 'ArrowFunctionExpression': {
            const f = ({ args, isNew }: { args: FValue[]; isNew: boolean }): FValue => {
                if (isNew) {
                    throw new ScriptError(
                        'ArrowFunction is not a constructor',
                        toRange(expression)
                    );
                }
                context.scopeIn();
                expression.params.forEach((param, i) => {
                    ofFPattern(param, context, 'let', args[i]);
                });
                if (expression.body.type === 'BlockStatement') {
                    const result = ofFStatement(expression.body, context);
                    context.scopeOut();
                    if (result.type === 'earlyReturn') {
                        return result.value;
                    }
                    return undefined;
                }
                const result = ofFExpression(expression.body, context);
                context.scopeOut();
                return result;
            };
            return new FFunction(f);
        }
        case 'AssignmentExpression': {
            if (expression.operator === '=') {
                const newValue = ofFExpression(expression.right, context);
                switch (expression.left.type) {
                    case 'Identifier': {
                        context.assign(expression.left.name, newValue, toRange(expression));
                        return newValue;
                    }
                    case 'MemberExpression': {
                        ofFMemberExpressionAsAssign(expression.left, newValue, context);
                        return newValue;
                    }
                }
            }
            let oldValue: FValue;
            let newValue: FValue;
            if (expression.left.type === 'Identifier') {
                oldValue = context.get(expression.left.name, toRange(expression.left));
            } else {
                oldValue = ofFMemberExpressionAsGet(expression.left, context, false);
            }
            const right = ofFExpression(expression.right, context);
            switch (expression.operator) {
                case '+=':
                    newValue = compareToNumber(oldValue, right, 'default', (l, r) => l + r);
                    break;
                case '-=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l - r);
                    break;
                case '%=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l % r);
                    break;
                case '&=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l & r);
                    break;
                case '*=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l * r);
                    break;
                case '**=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l ** r);
                    break;
                case '/=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l / r);
                    break;
                case '<<=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l << r);
                    break;
                case '>>=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l >> r);
                    break;
                case '>>>=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l >>> r);
                    break;
                case '^=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l ^ r);
                    break;
                case '|=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l | r);
                    break;
            }
            if (expression.left.type === 'Identifier') {
                context.assign(expression.left.name, newValue, toRange(expression));
            } else {
                ofFMemberExpressionAsAssign(expression.left, newValue, context);
            }
            return newValue;
        }
        case 'BinaryExpression': {
            const left = ofFExpression(expression.left, context);
            const right = ofFExpression(expression.right, context);
            switch (expression.operator) {
                case '!=':
                    return new FBoolean(!eqeq(left, right));
                case '!==':
                    return new FBoolean(!eqeqeq(left, right));
                case '%':
                    return compareToNumber(left, right, 'number', (l, r) => l % r);
                case '&':
                    return compareToNumber(left, right, 'number', (l, r) => l & r);
                case '*':
                    return compareToNumber(left, right, 'number', (l, r) => l * r);
                case '**':
                    return compareToNumber(left, right, 'number', (l, r) => l ** r);
                case '+':
                    return compareToNumberOrString(left, right, 'default', (l, r) => l + r);
                case '-':
                    return compareToNumber(left, right, 'number', (l, r) => l - r);
                case '/':
                    return compareToNumber(left, right, 'number', (l, r) => l / r);
                case '<':
                    return compareToBoolean(left, right, 'JObject', (l, r) => l < r);
                case '<<':
                    return compareToNumber(left, right, 'number', (l, r) => l << r);
                case '<=':
                    return compareToBoolean(left, right, 'JObject', (l, r) => l <= r);
                case '==':
                    return new FBoolean(eqeq(left, right));
                case '===':
                    return new FBoolean(eqeqeq(left, right));
                case '>':
                    return compareToBoolean(left, right, 'JObject', (l, r) => l > r);
                case '>=':
                    return compareToBoolean(left, right, 'JObject', (l, r) => l >= r);
                case '>>':
                    return compareToNumber(left, right, 'number', (l, r) => l >> r);
                case '>>>':
                    return compareToNumber(left, right, 'number', (l, r) => l >>> r);
                case '^':
                    return compareToNumber(left, right, 'number', (l, r) => l ^ r);
                case '|':
                    return compareToNumber(left, right, 'number', (l, r) => l | r);
            }
            break;
        }
        case 'CallExpression': {
            return ofFCallExpression(expression, context, false);
        }
        case 'ChainExpression': {
            switch (expression.expression.type) {
                case 'CallExpression': {
                    return ofFCallExpression(expression.expression, context, true);
                }
                case 'MemberExpression': {
                    return ofFMemberExpressionAsGet(expression.expression, context, true);
                }
            }
            break;
        }
        case 'ConditionalExpression': {
            const test = ofFExpression(expression.test, context);
            if (test) {
                return ofFExpression(expression.consequent, context);
            }
            return ofFExpression(expression.alternate, context);
        }
        case 'Identifier': {
            // a; のようなコードであれば正常に処理される
            // a.b; のようなコードではbがIdentifierになるがこのケースでは正常に処理されない（代わりにMemberExpressionやAssignmentExpressionで処理されなければならない）
            return context.get(expression.name, toRange(expression));
        }
        case 'Literal': {
            return ofFLiteral(expression);
        }
        case 'LogicalExpression': {
            const left = ofFExpression(expression.left, context);
            const right = ofFExpression(expression.right, context);
            switch (expression.operator) {
                case '&&':
                    return isTruthy(left) ? right : left;
                case '??':
                    return left ?? right;
                case '||':
                    return !isTruthy(left) ? right : left;
            }
            break;
        }
        case 'MemberExpression': {
            return ofFMemberExpressionAsGet(expression, context, false);
        }
        case 'NewExpression': {
            return ofFCallExpression(expression, context, false, 'new');
        }
        case 'ObjectExpression': {
            const result = new FRecord();
            expression.properties.forEach(d => {
                if (d.isSpread) {
                    const spreadObject = ofFExpression(d.argument, context);
                    if (spreadObject instanceof FRecord) {
                        spreadObject.forEach((value, key) => {
                            result.source.set(key, value);
                        });
                    } else {
                        throw new ScriptError(
                            'Record is expected, but actually not.',
                            toRange(d.argument)
                        );
                    }
                    return;
                }
                let key: string | number;
                switch (d.property.key.type) {
                    case 'Literal': {
                        const literal = ofFLiteral(d.property.key);
                        switch (typeof literal) {
                            case 'string':
                            case 'number':
                                key = literal;
                                break;
                            default:
                                throw new Error('this should not happen');
                        }
                        break;
                    }
                    case 'Identifier': {
                        key = d.property.key.name;
                        break;
                    }
                }
                const value = ofFExpression(d.property.value, context);
                switch (d.property.kind) {
                    case 'init':
                        result.set({
                            property: new FString(key),
                            newValue: value,
                            astInfo: { range: toRange(d.property.value) },
                        });
                        break;
                }
            });
            return result;
        }
        case 'ThisExpression':
            /*
            javascriptのthisは複雑な挙動を示す。そのため、functionやclassを使用不可能にすることで、常にthis===globalThisとして扱えるようにして実装を簡略化している。ただし、これにより例えば下のコードにおいて本来のjavascriptと異なる挙動を示す。本来のjavascriptであればエラーだが、このライブラリでは正常に終了しaは[1]となる。

            let a = [];
            let f = a.push;
            f(1);

            thisを完全に無効化してglobalThisを使ってもらうという作戦は、monaco editorの設定がうまくいかなかったので却下。
            */
            return context.globalThis;
        case 'UnaryExpression': {
            const argument = ofFExpression(expression.argument, context);
            switch (expression.operator) {
                case '!':
                    return new FBoolean(!isTruthy(argument));
                case '+':
                    return argument == null
                        ? argument
                        : new FNumber(argument.toPrimitiveAsNumber());
                case '-':
                    return argument == null
                        ? argument
                        : new FNumber(-argument.toPrimitiveAsNumber());
                case '~':
                    return argument == null
                        ? argument
                        : new FNumber(~argument.toPrimitiveAsNumber());
                case 'typeof':
                    if (argument == null) {
                        return new FString(typeof argument);
                    }
                    switch (argument.type) {
                        case FType.Boolean:
                            return new FString('boolean');
                        case FType.Function:
                            return new FString('function');
                        case FType.Number:
                            return new FString('number');
                        case FType.String:
                            return new FString('string');
                        case FType.Symbol:
                            return new FString('symbol');
                        default:
                            return new FString('object');
                    }
            }
            break;
        }
        case 'UpdateExpression': {
            let oldValue: FValue;
            let newValue: FValue;
            if (expression.argument.type === 'Identifier') {
                oldValue = context.get(expression.argument.name, toRange(expression.argument));
                newValue = compareToNumber(
                    oldValue,
                    new FNumber(expression.operator === '++' ? 1 : -1),
                    'number',
                    (left, right) => left + right
                );
                context.assign(expression.argument.name, newValue, toRange(expression));
            } else {
                oldValue = ofFMemberExpressionAsGet(expression.argument, context, false);
                newValue = compareToNumber(
                    oldValue,
                    new FNumber(expression.operator === '++' ? 1 : -1),
                    'number',
                    (left, right) => left + right
                );
                ofFMemberExpressionAsAssign(expression.argument, newValue, context);
            }
            return expression.prefix ? newValue : oldValue;
        }
        default:
            throw new Error('this should not happen');
    }
}

type FStatementResult =
    | {
          type: 'break' | 'continue';
      }
    | {
          type: 'earlyReturn';
          value: FValue;
      }
    | {
          type: 'end';
          value: FValue;
      };

function ofFStatement(statement: FStatement, context: Context): FStatementResult {
    switch (statement.type) {
        case 'BlockStatement': {
            context.scopeIn();
            for (const b of statement.body) {
                const bodyResult = ofFStatement(b, context);
                if (bodyResult.type !== 'end') {
                    context.scopeOut();
                    return bodyResult;
                }
            }
            context.scopeOut();
            return { type: 'end', value: undefined };
        }
        case 'BreakStatement':
            return { type: 'break' };
        case 'ContinueStatement':
            return { type: 'continue' };
        case 'ReturnStatement':
            return {
                type: 'earlyReturn',
                value:
                    statement.argument == null
                        ? undefined
                        : ofFExpression(statement.argument, context),
            };
        case 'ExpressionStatement': {
            return {
                type: 'end',
                value: ofFExpression(statement.expression, context),
            };
        }
        case 'ForOfStatement': {
            if (statement.await) {
                throw new ScriptError('await is not supported');
            }
            const rightValue = ofFExpression(statement.right, context);
            const rightValueAsFObjectBase: FObjectBase | null | undefined = rightValue;
            if (rightValueAsFObjectBase?.iterate == null) {
                throw new ScriptError(`${rightValue?.toPrimitiveAsString()} is not iterable`);
            }
            for (const elem of rightValueAsFObjectBase.iterate()) {
                context.scopeIn();
                switch (statement.left.type) {
                    case 'Identifier':
                        context.assign(statement.left.name, elem, statement.left.range);
                        break;
                    case 'MemberExpression': {
                        ofFMemberExpressionAsAssign(statement.left, elem, context);
                        break;
                    }
                    case 'VariableDeclaration':
                        ofFVariableDeclaration(statement.left, context, elem);
                        break;
                    default:
                        throw new ScriptError(
                            `${statement.left.type} is not supported yet.`,
                            toRange(statement.left)
                        );
                }
                ofFStatement(statement.body, context);
                context.scopeOut();
            }
            return { type: 'end', value: undefined };
        }
        case 'ForStatement': {
            context.scopeIn();
            if (statement.init != null) {
                if (statement.init.type === 'VariableDeclaration') {
                    ofFVariableDeclaration(statement.init, context);
                } else {
                    ofFExpression(statement.init, context);
                }
            }
            let isFirstLoop = true;
            // eslint-disable-next-line no-constant-condition
            while (true) {
                if (!isFirstLoop && statement.update != null) {
                    ofFExpression(statement.update, context);
                }
                isFirstLoop = false;
                if (statement.test != null) {
                    const test = ofFExpression(statement.test, context);
                    if (!isTruthy(test)) {
                        break;
                    }
                }
                const bodyResult = ofFStatement(statement.body, context);
                if (bodyResult.type === 'earlyReturn') {
                    context.scopeOut();
                    return { type: 'end', value: bodyResult.value };
                } else if (bodyResult.type === 'break') {
                    break;
                }
            }
            context.scopeOut();
            return { type: 'end', value: undefined };
        }
        case 'IfStatement': {
            const test = ofFExpression(statement.test, context);
            if (toJObject(test)) {
                return ofFStatement(statement.consequent, context);
            }
            if (statement.alternate == null) {
                return { type: 'end', value: undefined };
            }
            return ofFStatement(statement.alternate, context);
        }
        case 'SwitchStatement': {
            const discriminant = ofFExpression(statement.discriminant, context);
            let caseMatched = false;
            for (const $case of statement.cases) {
                if (
                    $case.test == null || // default:のときは$case.test==nullとなる
                    toJObject(discriminant) === toJObject(ofFExpression($case.test, context))
                ) {
                    caseMatched = true;
                }

                // caseにどれか1つでもマッチしたら、breakなどがない限りはそれ以降のcaseもすべてマッチする扱いとなる。いわゆるフォールスルー。
                if (!caseMatched) {
                    continue;
                }

                for (const consequent of $case.consequent) {
                    const consequentResult = ofFStatement(consequent, context);
                    switch (consequentResult.type) {
                        case 'earlyReturn':
                        case 'continue':
                            return consequentResult;
                        case 'break':
                            return { type: 'end', value: undefined };
                        default:
                            break;
                    }
                }
            }
            return { type: 'end', value: undefined };
        }
        case 'VariableDeclaration': {
            ofFVariableDeclaration(statement, context);
            return { type: 'end', value: undefined };
        }
    }
}

type ExecResult = {
    result: unknown;
    getGlobalThis(): unknown;
};

const toProgram = (script: string) => {
    // @types/estreeが2020までにしか対応していない模様（AssignmentOperatorに&&=などがない）ため、acornもとりあえず2020としている。
    return parse(script, { ecmaVersion: 2020, ranges: true }) as unknown as Program;
};

// globalThisは、FValueであればそのまま維持し、それ以外であればFValueに自動変換される。
export const exec = (script: string, globalThis: Record<string, unknown>): ExecResult => {
    const parsed = toProgram(script);
    const context = new Context(toFGlobalRecord(globalThis));
    const lastResult = parsed.body.map(statement => {
        return ofFStatement(fStatement(statement), context);
    })[parsed.body.length - 1];
    let result: unknown;
    if (lastResult?.type === 'end') {
        result = lastResult.value == null ? lastResult.value : lastResult.value.toJObject();
    } else {
        result = undefined;
    }
    return {
        result,
        getGlobalThis: () => context.globalThis.toJObject(),
    };
};

// エディターなどでエラーをチェックする際に用いる
export const test = (script: string): void => {
    const parsed = toProgram(script);
    parsed.body.forEach(statement => {
        fStatement(statement);
    });
};
