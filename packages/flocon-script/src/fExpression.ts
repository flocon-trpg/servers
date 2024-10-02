import {
    ArrayExpression,
    ArrowFunctionExpression,
    AssignmentExpression,
    AssignmentOperator,
    BaseCallExpression,
    BinaryExpression,
    BinaryOperator,
    ChainExpression,
    ConditionalExpression,
    Expression,
    Identifier,
    Literal,
    LogicalExpression,
    MemberExpression,
    NewExpression,
    ObjectExpression,
    Property,
    SimpleCallExpression,
    ThisExpression,
    UnaryExpression,
    UnaryOperator,
    UpdateExpression,
} from 'estree';
import { ScriptError } from './ScriptError';
import { FPattern, fPattern } from './fPattern';
import { FBlockStatement, fBlockStatement } from './fStatement';
import { Range, toRange } from './range';

type FArrayExpressionElement =
    | {
          isSpread: false;
          expression: FExpression;
      }
    | {
          isSpread: true;
          argument: FExpression;
      };

export type FArrayExpression = Omit<ArrayExpression, 'elements'> & {
    elements: Array<FArrayExpressionElement | null>;
};
function fArrayExpression(expression: ArrayExpression): FArrayExpression {
    return {
        ...expression,
        elements: expression.elements.map(e => {
            if (e == null) {
                return e;
            }
            if (e.type === 'SpreadElement') {
                return {
                    isSpread: true,
                    argument: fExpression(e.argument),
                };
            }
            return { isSpread: false, expression: fExpression(e) };
        }),
    };
}

export type FArrowFunctionExpression = Omit<ArrowFunctionExpression, 'body' | 'params'> & {
    body: FBlockStatement | FExpression;
    params: Array<FPattern>;
};
function fArrowFuntionExpression(expression: ArrowFunctionExpression): FArrowFunctionExpression {
    const params = expression.params.map(param => fPattern(param));
    let body: FBlockStatement | FExpression;
    if (expression.body.type === 'BlockStatement') {
        body = fBlockStatement(expression.body);
    } else {
        body = fExpression(expression.body);
    }
    return {
        ...expression,
        body,
        params,
    };
}

function fAssignmentOperator(operator: AssignmentOperator) {
    return operator;
}
export type FAssignmentOperator = ReturnType<typeof fAssignmentOperator>;

export type FAssignmentExpression = Omit<AssignmentExpression, 'operator' | 'left' | 'right'> & {
    operator: FAssignmentOperator;
    left: FIdentifier | FMemberExpression;
    right: FExpression;
};
function fAssignmentExpression(expression: AssignmentExpression): FAssignmentExpression {
    let left: FIdentifier | FMemberExpression;
    switch (expression.left.type) {
        case 'Identifier':
            left = expression.left;
            break;
        case 'MemberExpression':
            left = fMemberExpression(expression.left);
            break;
        default:
            throw new ScriptError(
                `'${expression.left.type}' is not supported`,
                toRange(expression),
            );
    }
    return {
        ...expression,
        operator: fAssignmentOperator(expression.operator),
        left,
        right: fExpression(expression.right),
    };
}

export type FBaseCallExpression = Omit<BaseCallExpression, 'callee' | 'arguments'> & {
    callee: FExpression;
    arguments: Array<FExpression>;
};
function fBaseCallExpression(expression: BaseCallExpression): FBaseCallExpression {
    if (expression.callee.type === 'Super') {
        throw new ScriptError(`'${expression.callee.type}' is not supported`, toRange(expression));
    }
    return {
        ...expression,
        callee: fExpression(expression.callee),
        arguments: expression.arguments.map(arg => {
            if (arg.type === 'SpreadElement') {
                throw new ScriptError(`'${arg.type} is not supported'`, toRange(arg));
            }
            return fExpression(arg);
        }),
    };
}

function fBinaryOperator(operator: BinaryOperator, range: Range | undefined) {
    switch (operator) {
        case 'in':
        case 'instanceof':
            throw new ScriptError(`'${operator}' is not supported`, range);
        default:
            return operator;
    }
}
export type FBinaryOperator = ReturnType<typeof fBinaryOperator>;

export type FBinaryExpression = Omit<BinaryExpression, 'operator' | 'left' | 'right'> & {
    operator: FBinaryOperator;
    left: FExpression;
    right: FExpression;
};
function fBinaryExpression(expression: BinaryExpression): FBinaryExpression {
    return {
        ...expression,
        operator: fBinaryOperator(expression.operator, toRange(expression)),
        left: fExpression(expression.left),
        right: fExpression(expression.right),
    };
}

export type FChainExpression = Omit<ChainExpression, 'expression'> & {
    expression: FSimpleCallExpression | FMemberExpression;
};
function fChainExpression(expression: ChainExpression): FChainExpression {
    if (expression.expression.type === 'CallExpression') {
        return {
            ...expression,
            expression: fSimpleCallExpression(expression.expression),
        };
    }
    return {
        ...expression,
        expression: fMemberExpression(expression.expression),
    };
}

export type FConditionalExpression = Omit<
    ConditionalExpression,
    'test' | 'alternate' | 'consequent'
> & {
    test: FExpression;
    alternate: FExpression;
    consequent: FExpression;
};
function fConditionalExpression(expression: ConditionalExpression): FConditionalExpression {
    return {
        ...expression,
        test: fExpression(expression.test),
        alternate: fExpression(expression.alternate),
        consequent: fExpression(expression.consequent),
    };
}

export type FIdentifier = Identifier;

function fLiteral(expression: Literal) {
    if ('bigint' in expression) {
        throw new ScriptError(`'bigint' is not supported`, toRange(expression));
    }
    if ('regex' in expression) {
        throw new ScriptError(`'regex' is not supported`, toRange(expression));
    }
    return expression;
}
export type FLiteral = ReturnType<typeof fLiteral>;

export type FLogicalExpression = Omit<LogicalExpression, 'left' | 'right'> & {
    left: FExpression;
    right: FExpression;
};
function fLogicalExpression(expression: LogicalExpression): FLogicalExpression {
    return {
        ...expression,
        left: fExpression(expression.left),
        right: fExpression(expression.right),
    };
}

export type FMemberExpression = Omit<MemberExpression, 'object' | 'property'> & {
    object: FExpression;
    property: FExpression;
};
export function fMemberExpression(expression: MemberExpression): FMemberExpression {
    if (expression.object.type === 'Super') {
        throw new ScriptError("'Super' is not supported", toRange(expression));
    }
    if (expression.property.type === 'PrivateIdentifier') {
        // 用途が不明
        throw new ScriptError("'PrivateIdentifier' is not supported", toRange(expression));
    }
    return {
        ...expression,
        object: fExpression(expression.object),
        property: fExpression(expression.property),
    };
}

export type FNewExpression = Omit<NewExpression, 'callee' | 'arguments'> & {
    callee: FExpression;
    arguments: Array<FExpression>;
};
function fNewExpression(expression: NewExpression): FNewExpression {
    return {
        ...expression,
        ...fBaseCallExpression(expression),
        type: expression.type,
    };
}

type FObjectExpressionElement =
    | {
          isSpread: false;
          property: FProperty;
      }
    | {
          isSpread: true;
          argument: FExpression;
      };

export type FObjectExpression = Omit<ObjectExpression, 'properties'> & {
    properties: Array<FObjectExpressionElement>;
};
function fObjectExpression(expression: ObjectExpression): FObjectExpression {
    return {
        ...expression,
        properties: expression.properties.map(prop => {
            if (prop.type === 'SpreadElement') {
                return { isSpread: true, argument: fExpression(prop.argument) };
            }
            return { isSpread: false, property: fProperty(prop) };
        }),
    };
}

export type FProperty = Omit<Property, 'key' | 'value' | 'kind'> & {
    key: FIdentifier | FLiteral;
    value: FExpression;
    kind: 'init';
};
export function fProperty(property: Property): FProperty {
    let key: FIdentifier | FLiteral;
    switch (property.key.type) {
        case 'Identifier':
            key = property.key;
            break;
        case 'Literal':
            key = fLiteral(property.key);
            break;
        default:
            throw new ScriptError(`'${property.key}' is not supported`, toRange(property.key));
    }
    switch (property.value.type) {
        case 'ArrayPattern':
        case 'ObjectPattern':
        case 'RestElement':
        case 'AssignmentPattern': {
            throw new ScriptError(
                `'${property.value.type}' is not supported`,
                toRange(property.value),
            );
        }
        default:
            break;
    }
    switch (property.kind) {
        case 'init':
            break;
        default:
            throw new ScriptError(`'${property.kind}' is not supported`, toRange(property.value));
    }

    return {
        ...property,
        key,
        value: fExpression(property.value),
        kind: property.kind,
    };
}

export type FSimpleCallExpression = Omit<SimpleCallExpression, 'callee' | 'arguments'> & {
    callee: FExpression;
    arguments: Array<FExpression>;
};
function fSimpleCallExpression(expression: SimpleCallExpression): FSimpleCallExpression {
    return {
        ...expression,
        ...fBaseCallExpression(expression),
        type: expression.type,
    };
}

export type FThisExpression = ThisExpression;

function fUnaryOperator(operator: UnaryOperator, range: Range | undefined) {
    switch (operator) {
        case 'delete':
        case 'void':
            throw new ScriptError(`'${operator}' is not supported`, range);
        default:
            return operator;
    }
}
export type FUnaryOperator = ReturnType<typeof fUnaryOperator>;

export type FUnaryExpression = Omit<UnaryExpression, 'operator' | 'argument'> & {
    operator: FUnaryOperator;
    argument: FExpression;
};
function fUnaryExpression(expression: UnaryExpression): FUnaryExpression {
    return {
        ...expression,
        operator: fUnaryOperator(expression.operator, toRange(expression)),
        argument: fExpression(expression.argument),
    };
}

export type FUpdateExpression = Omit<UpdateExpression, 'argument'> & {
    argument: FIdentifier | FMemberExpression;
};
function fUpdateExpression(expression: UpdateExpression): FUpdateExpression {
    switch (expression.argument.type) {
        case 'Identifier':
            return {
                ...expression,
                argument: expression.argument,
            };
        case 'MemberExpression':
            return {
                ...expression,
                argument: fMemberExpression(expression.argument),
            };
        default:
            // ここに来る状況があるかどうか不明
            throw new ScriptError('Invalid update expression argument', toRange(expression));
    }
}

export type FExpression =
    | FArrayExpression
    | FArrowFunctionExpression
    | FAssignmentExpression
    | FBinaryExpression
    | FChainExpression
    | FConditionalExpression
    | FIdentifier
    | FLiteral
    | FLogicalExpression
    | FMemberExpression
    | FNewExpression
    | FObjectExpression
    | FThisExpression
    | FSimpleCallExpression
    | FUnaryExpression
    | FUpdateExpression;

export function fExpression(expression: Expression): FExpression {
    switch (expression.type) {
        case 'ArrayExpression':
            return fArrayExpression(expression);
        case 'ArrowFunctionExpression':
            return fArrowFuntionExpression(expression);
        case 'AssignmentExpression':
            return fAssignmentExpression(expression);
        case 'BinaryExpression':
            return fBinaryExpression(expression);
        case 'CallExpression':
            return fSimpleCallExpression(expression);
        case 'ChainExpression':
            return fChainExpression(expression);
        case 'ConditionalExpression':
            return fConditionalExpression(expression);
        case 'Identifier':
            return expression;
        case 'Literal':
            return fLiteral(expression);
        case 'LogicalExpression':
            return fLogicalExpression(expression);
        case 'MemberExpression':
            return fMemberExpression(expression);
        case 'NewExpression':
            return fNewExpression(expression);
        case 'ObjectExpression':
            return fObjectExpression(expression);
        case 'ThisExpression':
            return expression;
        case 'UnaryExpression':
            return fUnaryExpression(expression);
        case 'UpdateExpression':
            return fUpdateExpression(expression);
        default:
            throw new ScriptError(`'${expression.type}' is not supported`, toRange(expression));
    }
}
