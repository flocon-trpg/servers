import { parse } from 'acorn';
import {
    CallExpression,
    Expression,
    Literal,
    MemberExpression,
    Program,
    Statement,
} from 'estree';
import { Context } from './context';
import {
    compareToBoolean,
    compareToNumber,
    compareToNumberOrString,
    createSGlobalRecord,
    eqeq,
    eqeqeq,
    isTruthy,
    SArray,
    SBoolean,
    SFunction,
    SNumber,
    SObject,
    SString,
    SType,
    SValue,
    toTypeName,
} from './scriptValue';

function ofLiteral(literal: Literal): SBoolean | SNumber | SString | null {
    if ('bigint' in literal) {
        throw new Error('bigint not supported');
    }
    if ('regex' in literal) {
        throw new Error('regex not supported');
    }
    if (literal.value == null) {
        return null;
    }
    switch (typeof literal.value) {
        case 'boolean':
            return new SBoolean(literal.value);
        case 'string':
            return new SString(literal.value);
        case 'number':
            return new SNumber(literal.value);
    }
}

function ofCallExpressionOrNewExpression(
    expression: CallExpression,
    context: Context,
    isChain: boolean,
    isNew?: 'new' | undefined
): SValue {
    if (expression.callee.type === 'Super') {
        throw new Error('this should not happen');
    }
    const callee = ofExpression(expression.callee, context);
    const args = expression.arguments.map(arg => {
        if (arg.type === 'SpreadElement') {
            throw new Error('SpreadElement not supported');
        }
        return ofExpression(arg, context);
    });
    if (isChain && callee == null) {
        return undefined;
    }
    if (callee?.type !== SType.Function) {
        throw new Error(`${callee} is not a function`);
    }
    return callee.exec(args, isNew != null);
}

function ofMemberExpression(
    expression: MemberExpression,
    context: Context,
    isChain: boolean
): SValue {
    if (expression.object.type === 'Super') {
        throw new Error('this should not happen');
    }
    const object = ofExpression(expression.object, context);
    if (expression.property.type === 'PrivateIdentifier') {
        // 用途が不明
        throw new Error('not supported');
    }
    if (object == null) {
        if (isChain) {
            return undefined;
        }
        throw new Error('object is null or undefined');
    }
    if (expression.computed) {
        const property = ofExpression(expression.property, context);
        return object.get(property);
    }
    if (expression.property.type !== 'Identifier') {
        throw new Error('this should not happen');
    }
    return object.get(new SString(expression.property.name));
}

function ofExpression(expression: Expression, context: Context): SValue {
    switch (expression.type) {
        case 'ArrayExpression': {
            const result: SValue[] = [];
            expression.elements.forEach(d => {
                if (d === null) {
                    result.push(null);
                    return;
                }
                if (d.type === 'SpreadElement') {
                    throw new Error('not supported');
                }
                result.push(ofExpression(d, context));
            });
            return new SArray(result);
        }
        case 'ArrowFunctionExpression': {
            const f = (args: SValue[]): SValue => {
                context.scopeIn();
                expression.params.forEach((param, i) => {
                    if (param.type !== 'Identifier') {
                        throw new Error(`'${param.type}' is not supported`);
                    }
                    context.declare(param.name, args[i], 'let');
                });
                if (expression.body.type === 'BlockStatement') {
                    const result = ofStatement(expression.body, context);
                    context.scopeOut();
                    if (result.type !== 'continue') {
                        return result.value;
                    }
                    return undefined;
                }
                const result = ofExpression(expression.body, context);
                context.scopeOut();
                return result;
            };
            return new SFunction(f);
        }
        case 'AssignmentExpression': {
            switch (expression.left.type) {
                case 'Identifier': {
                    context.assign(
                        expression.left.name,
                        ofExpression(expression.right, context)
                    );
                    return undefined;
                }
                case 'MemberExpression': {
                    if (expression.left.object.type === 'Super') {
                        throw new Error('this should not happen');
                    }
                    const object = ofExpression(
                        expression.left.object,
                        context
                    );
                    if (expression.left.property.type === 'PrivateIdentifier') {
                        // 用途が不明
                        throw new Error('not supported');
                    }
                    let property: SValue;
                    if (expression.left.property.type === 'Identifier') {
                        property = new SString(expression.left.property.name);
                    } else {
                        property = ofExpression(
                            expression.left.property,
                            context
                        );
                    }
                    switch (expression.operator) {
                        case '=': {
                            if (object == null) {
                                throw new Error(
                                    `Object is ${toTypeName(object)}`
                                );
                            }
                            object.set(
                                property,
                                ofExpression(expression.right, context)
                            );
                            return undefined;
                        }
                        default:
                            throw new Error(
                                `'${expression.operator}' is not supported`
                            );
                    }
                }
                default:
                    throw new Error(
                        `'${expression.left.type}' is not supported`
                    );
            }
        }
        case 'BinaryExpression': {
            const left = ofExpression(expression.left, context);
            const right = ofExpression(expression.right, context);
            switch (expression.operator) {
                case '!=':
                    return new SBoolean(!eqeq(left, right));
                case '!==':
                    return new SBoolean(!eqeqeq(left, right));
                case '%':
                    return compareToNumber(
                        left,
                        right,
                        'number',
                        (l, r) => l % r
                    );
                case '&':
                    return compareToNumber(
                        left,
                        right,
                        'number',
                        (l, r) => l & r
                    );
                case '*':
                    return compareToNumber(
                        left,
                        right,
                        'number',
                        (l, r) => l * r
                    );
                case '**':
                    return compareToNumber(
                        left,
                        right,
                        'number',
                        (l, r) => l ** r
                    );
                case '+':
                    return compareToNumberOrString(
                        left,
                        right,
                        'default',
                        (l, r) => l + r
                    );
                case '-':
                    return compareToNumber(
                        left,
                        right,
                        'number',
                        (l, r) => l - r
                    );
                case '/':
                    return compareToNumber(
                        left,
                        right,
                        'number',
                        (l, r) => l / r
                    );
                case '<':
                    return compareToBoolean(
                        left,
                        right,
                        'number',
                        (l, r) => l < r
                    );
                case '<<':
                    return compareToNumber(
                        left,
                        right,
                        'number',
                        (l, r) => l << r
                    );
                case '<=':
                    return compareToBoolean(
                        left,
                        right,
                        'number',
                        (l, r) => l <= r
                    );
                case '==':
                    return new SBoolean(eqeq(left, right));
                case '===':
                    return new SBoolean(eqeqeq(left, right));
                case '>':
                    return compareToBoolean(
                        left,
                        right,
                        'number',
                        (l, r) => l > r
                    );
                case '>=':
                    return compareToBoolean(
                        left,
                        right,
                        'number',
                        (l, r) => l >= r
                    );
                case '>>':
                    return compareToNumber(
                        left,
                        right,
                        'number',
                        (l, r) => l >> r
                    );
                case '>>>':
                    return compareToNumber(
                        left,
                        right,
                        'number',
                        (l, r) => l >>> r
                    );
                case '^':
                    return compareToNumber(
                        left,
                        right,
                        'number',
                        (l, r) => l ^ r
                    );
                case 'in':
                    throw new Error("'in' is not supported");
                case 'instanceof':
                    throw new Error("'instanceof' is not supported");
                case '|':
                    return compareToNumber(
                        left,
                        right,
                        'number',
                        (l, r) => l | r
                    );
                default: {
                    throw new Error('this should not happen');
                }
            }
        }
        case 'CallExpression': {
            return ofCallExpressionOrNewExpression(expression, context, false);
        }
        case 'ChainExpression': {
            switch (expression.expression.type) {
                case 'CallExpression': {
                    return ofCallExpressionOrNewExpression(
                        expression.expression,
                        context,
                        true
                    );
                }
                case 'MemberExpression': {
                    return ofMemberExpression(
                        expression.expression,
                        context,
                        true
                    );
                }
            }
            break;
        }
        case 'ConditionalExpression': {
            const test = ofExpression(expression.test, context);
            if (test) {
                return ofExpression(expression.consequent, context);
            }
            return ofExpression(expression.alternate, context);
        }
        case 'Identifier': {
            // a; のようなコードであれば正常に処理される
            // a.b; のようなコードではbがIdentifierになるがこのケースでは正常に処理されない（代わりにMemberExpressionやAssignmentExpressionで処理されなければならない）
            return context.get(expression.name);
        }
        case 'Literal': {
            return ofLiteral(expression);
        }
        case 'LogicalExpression': {
            const left = ofExpression(expression.left, context);
            const right = ofExpression(expression.right, context);
            switch (expression.operator) {
                case '&&':
                    return isTruthy(left) ? right : left;
                case '??':
                    return left ?? right;
                case '||':
                    return !isTruthy(left) ? right : left;
                default: {
                    throw new Error('this should not happen');
                }
            }
        }
        case 'MemberExpression': {
            return ofMemberExpression(expression, context, false);
        }
        case 'NewExpression': {
            return ofCallExpressionOrNewExpression(
                expression,
                context,
                false,
                'new'
            );
        }
        case 'ObjectExpression': {
            const result = new SObject();
            expression.properties.forEach(d => {
                if (d.type === 'SpreadElement') {
                    throw new Error('not supported');
                }
                let key: string | number;
                switch (d.key.type) {
                    case 'Literal': {
                        const literal = ofLiteral(d.key);
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
                    default: {
                        throw new Error('this should not happen');
                    }
                }
                let value;
                switch (d.value.type) {
                    case 'ArrayPattern':
                    case 'ObjectPattern':
                    case 'RestElement':
                    case 'AssignmentPattern': {
                        throw new Error();
                    }
                    default:
                        value = ofExpression(d.value, context);
                        break;
                }
                switch (d.kind) {
                    case 'init':
                        result.set(new SString(key), value);
                        break;
                    case 'get':
                    case 'set':
                        throw new Error('not supported');
                }
            });
            return result;
        }
        case 'UnaryExpression': {
            const argument = ofExpression(expression.argument, context);
            switch (expression.operator) {
                case '!':
                    return new SBoolean(!isTruthy(argument));
                case '+':
                    return argument == null
                        ? argument
                        : new SNumber(argument.toPrimitiveAsNumber());
                case '-':
                    return argument == null
                        ? argument
                        : new SNumber(-argument.toPrimitiveAsNumber());
                case 'delete':
                    throw new Error('delete operator is not supported');
                case 'typeof':
                    throw new Error('typeof operator is not supported');
                case 'void':
                    throw new Error('void operator is not supported');
                case '~':
                    return argument == null
                        ? argument
                        : new SNumber(~argument.toPrimitiveAsNumber());
                default:
                    throw new Error('this should not happen');
            }
        }
        default:
            throw new Error(`'${expression.type}' is not supported`);
    }
}

type StatementResult =
    | {
          type: 'continue';
      }
    | {
          type: 'earlyReturn';
          value: SValue;
      }
    | {
          type: 'end';
          value: SValue;
      };

function ofStatement(statement: Statement, context: Context): StatementResult {
    switch (statement.type) {
        case 'BlockStatement': {
            context.scopeIn();
            for (const b of statement.body) {
                if (b.type === 'ReturnStatement') {
                    context.scopeOut();
                    return {
                        type: 'earlyReturn',
                        value:
                            b.argument == null
                                ? undefined
                                : ofExpression(b.argument, context),
                    };
                }
                if (b.type === 'ContinueStatement') {
                    context.scopeOut();
                    return {
                        type: 'continue',
                    };
                }
                ofStatement(b, context);
            }
            context.scopeOut();
            return { type: 'end', value: undefined };
        }
        case 'ExpressionStatement': {
            return {
                type: 'end',
                value: ofExpression(statement.expression, context),
            };
        }
        case 'IfStatement': {
            const test = ofExpression(statement.test, context);
            if (test) {
                return ofStatement(statement.consequent, context);
            }
            if (statement.alternate == null) {
                return { type: 'end', value: undefined };
            }
            return ofStatement(statement.alternate, context);
        }
        case 'SwitchStatement': {
            const discriminant = ofExpression(statement.discriminant, context);
            for (const $case of statement.cases) {
                if (
                    $case.test != null &&
                    discriminant !== ofExpression($case.test, context)
                ) {
                    continue;
                }
                for (const consequent of $case.consequent) {
                    if (consequent.type === 'ReturnStatement') {
                        return {
                            type: 'earlyReturn',
                            value:
                                consequent.argument == null
                                    ? undefined
                                    : ofExpression(
                                          consequent.argument,
                                          context
                                      ),
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
                        if (consequent.label != null) {
                            throw new Error('continue label not supported');
                        }
                        break;
                    }
                    ofStatement(consequent, context);
                }
            }
            return { type: 'end', value: undefined };
        }
        case 'VariableDeclaration': {
            if (statement.kind === 'var') {
                throw new Error("'var' is not supported");
            }
            const kind = statement.kind;
            statement.declarations.forEach(d => {
                if (d.id.type !== 'Identifier') {
                    throw new Error(`${d.id.type} is not supported`);
                }
                // let x; のような場合は let x = undefined; と同等とみなして良さそう。const x; はparseの時点で弾かれるはず。
                context.declare(
                    d.id.name,
                    d.init == null ? undefined : ofExpression(d.init, context),
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
    getGlobalThis(): Record<string, unknown>;
};

// globalThisは、SValueであればそのまま維持し、それ以外であればSValueに自動変換される。
export const exec = (
    script: string,
    globalThis: Record<string, unknown>
): ExecResult => {
    const parsed = parse(script, { ecmaVersion: 2020 }) as unknown as Program;
    const context = new Context(createSGlobalRecord(globalThis));
    const lastResult = parsed.body.map(statement => {
        switch (statement.type) {
            case 'ImportDeclaration':
            case 'ExportAllDeclaration':
            case 'ExportDefaultDeclaration':
            case 'ExportNamedDeclaration':
                throw new Error(`'${statement.type}' is not supported`);
            default:
                return ofStatement(statement, context);
        }
    })[parsed.body.length - 1];
    let result: unknown;
    if (lastResult?.type === 'end') {
        result =
            lastResult.value == null
                ? lastResult.value
                : lastResult.value.toJObject();
    } else {
        result = undefined;
    }
    return {
        result,
        getGlobalThis: () => context.globalThis.toJObject(),
    };
};
