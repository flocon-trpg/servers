import { parse } from 'acorn';
import { Program } from 'estree';
import { Context } from './context';
import {
    FExpression,
    FLiteral,
    FMemberExpression,
    FNewExpression,
    FSimpleCallExpression,
} from './fExpression';
import { fFStatement as fStatement, FStatement } from './fStatement';
import { toRange } from './range';
import { ScriptError } from './ScriptError';
import { compareToBoolean, compareToNumber, compareToNumberOrString } from './scriptValue/compare';
import { createFGlobalRecord } from './scriptValue/createFGlobalRecord';
import { eqeq } from './scriptValue/eqeq';
import { eqeqeq } from './scriptValue/eqeqeq';
import { FArray } from './scriptValue/FArray';
import { FBoolean } from './scriptValue/FBoolean';
import { FFunction } from './scriptValue/FFunction';
import { FNumber } from './scriptValue/FNumber';
import { FRecord } from './scriptValue/FRecord';
import { FString } from './scriptValue/FString';
import { FType } from './scriptValue/FType';
import { FValue } from './scriptValue/FValue';
import { isTruthy } from './scriptValue/isTruthy';
import { toTypeName } from './scriptValue/toTypeName';
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
    return callee.exec({ args, isNew: isNew != null });
}

function ofFMemberExpression(
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

function ofFExpression(expression: FExpression, context: Context): FValue {
    switch (expression.type) {
        case 'ArrayExpression': {
            const result: FValue[] = [];
            expression.elements.forEach(d => {
                if (d === null) {
                    result.push(null);
                    return;
                }
                result.push(ofFExpression(d, context));
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
                    context.declare(param.name, args[i], 'let');
                });
                if (expression.body.type === 'BlockStatement') {
                    const result = ofFStatement(expression.body, context);
                    context.scopeOut();
                    if (result.type !== 'continue') {
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
            switch (expression.left.type) {
                case 'Identifier': {
                    context.assign(
                        expression.left.name,
                        ofFExpression(expression.right, context),
                        toRange(expression)
                    );
                    return undefined;
                }
                case 'MemberExpression': {
                    const object = ofFExpression(expression.left.object, context);
                    let property: FValue;
                    if (expression.left.property.type === 'Identifier') {
                        property = new FString(expression.left.property.name);
                    } else {
                        property = ofFExpression(expression.left.property, context);
                    }
                    switch (expression.operator) {
                        case '=': {
                            if (object == null) {
                                throw new Error(`Object is ${toTypeName(object)}`);
                            }
                            object.set({
                                property,
                                newValue: ofFExpression(expression.right, context),
                                astInfo: { range: toRange(expression) },
                            });
                            return undefined;
                        }
                    }
                }
            }
            break;
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
                    return compareToBoolean(left, right, 'number', (l, r) => l < r);
                case '<<':
                    return compareToNumber(left, right, 'number', (l, r) => l << r);
                case '<=':
                    return compareToBoolean(left, right, 'number', (l, r) => l <= r);
                case '==':
                    return new FBoolean(eqeq(left, right));
                case '===':
                    return new FBoolean(eqeqeq(left, right));
                case '>':
                    return compareToBoolean(left, right, 'number', (l, r) => l > r);
                case '>=':
                    return compareToBoolean(left, right, 'number', (l, r) => l >= r);
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
                    return ofFMemberExpression(expression.expression, context, true);
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
            return ofFMemberExpression(expression, context, false);
        }
        case 'NewExpression': {
            return ofFCallExpression(expression, context, false, 'new');
        }
        case 'ObjectExpression': {
            const result = new FRecord();
            expression.properties.forEach(d => {
                let key: string | number;
                switch (d.key.type) {
                    case 'Literal': {
                        const literal = ofFLiteral(d.key);
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
                        key = d.key.name;
                        break;
                    }
                }
                const value = ofFExpression(d.value, context);
                switch (d.kind) {
                    case 'init':
                        result.set({
                            property: new FString(key),
                            newValue: value,
                            astInfo: { range: toRange(d.value) },
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
                        default:
                            return new FString('object');
                    }
            }
            break;
        }
        default:
            throw new Error('this should not happen');
    }
}

type FStatementResult =
    | {
          type: 'continue';
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
                if (b.type === 'ReturnStatement') {
                    context.scopeOut();
                    return {
                        type: 'earlyReturn',
                        value: b.argument == null ? undefined : ofFExpression(b.argument, context),
                    };
                }
                if (b.type === 'ContinueStatement') {
                    context.scopeOut();
                    return {
                        type: 'continue',
                    };
                }
                ofFStatement(b, context);
            }
            context.scopeOut();
            return { type: 'end', value: undefined };
        }
        case 'ExpressionStatement': {
            return {
                type: 'end',
                value: ofFExpression(statement.expression, context),
            };
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
                    if (consequent.type === 'ReturnStatement') {
                        return {
                            type: 'earlyReturn',
                            value:
                                consequent.argument == null
                                    ? undefined
                                    : ofFExpression(consequent.argument, context),
                        };
                    }
                    if (consequent.type === 'ContinueStatement') {
                        if (consequent.label != null) {
                            throw new Error('continue label not supported');
                        }
                        return {
                            type: 'continue',
                        };
                    }
                    if (consequent.type === 'BreakStatement') {
                        return { type: 'end', value: undefined };
                    }
                    ofFStatement(consequent, context);
                }
            }
            return { type: 'end', value: undefined };
        }
        case 'VariableDeclaration': {
            const kind = statement.kind;
            statement.declarations.forEach(d => {
                if (d.id.type !== 'Identifier') {
                    throw new Error(`'${d.id.type}' is not supported`);
                }
                // let x; のような場合は let x = undefined; と同等とみなして良さそう。const x; はparseの時点で弾かれるはず。
                context.declare(
                    d.id.name,
                    d.init == null ? undefined : ofFExpression(d.init, context),
                    kind
                );
            });
            return { type: 'end', value: undefined };
        }
        default:
            throw new Error(`'${statement.type}' is not supported`);
    }
}

type ExecResult = {
    result: unknown;
    getGlobalThis(): unknown;
};

const toProgram = (script: string) => {
    return parse(script, { ecmaVersion: 2020, ranges: true }) as unknown as Program;
};

// globalThisは、SValueであればそのまま維持し、それ以外であればSValueに自動変換される。
export const exec = (script: string, globalThis: Record<string, unknown>): ExecResult => {
    const parsed = toProgram(script);
    const context = new Context(createFGlobalRecord(globalThis));
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
