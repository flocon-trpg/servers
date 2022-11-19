import { ArrayExpression, ArrowFunctionExpression, AssignmentExpression, AssignmentOperator, BaseCallExpression, BinaryExpression, BinaryOperator, ChainExpression, ConditionalExpression, Expression, Identifier, Literal, LogicalExpression, MemberExpression, NewExpression, ObjectExpression, Property, SimpleCallExpression, ThisExpression, UnaryExpression, UnaryOperator, UpdateExpression } from 'estree';
import { FPattern } from './fPattern';
import { FBlockStatement } from './fStatement';
import { Range } from './range';
declare type FArrayExpressionElement = {
    isSpread: false;
    expression: FExpression;
} | {
    isSpread: true;
    argument: FExpression;
};
export declare type FArrayExpression = Omit<ArrayExpression, 'elements'> & {
    elements: Array<FArrayExpressionElement | null>;
};
export declare type FArrowFunctionExpression = Omit<ArrowFunctionExpression, 'body' | 'params'> & {
    body: FBlockStatement | FExpression;
    params: Array<FPattern>;
};
declare function fAssignmentOperator(operator: AssignmentOperator): AssignmentOperator;
export declare type FAssignmentOperator = ReturnType<typeof fAssignmentOperator>;
export declare type FAssignmentExpression = Omit<AssignmentExpression, 'operator' | 'left' | 'right'> & {
    operator: FAssignmentOperator;
    left: FIdentifier | FMemberExpression;
    right: FExpression;
};
export declare type FBaseCallExpression = Omit<BaseCallExpression, 'callee' | 'arguments'> & {
    callee: FExpression;
    arguments: Array<FExpression>;
};
declare function fBinaryOperator(operator: BinaryOperator, range: Range | undefined): "==" | "!=" | "===" | "!==" | "<" | "<=" | ">" | ">=" | "<<" | ">>" | ">>>" | "+" | "-" | "*" | "/" | "%" | "**" | "|" | "^" | "&";
export declare type FBinaryOperator = ReturnType<typeof fBinaryOperator>;
export declare type FBinaryExpression = Omit<BinaryExpression, 'operator' | 'left' | 'right'> & {
    operator: FBinaryOperator;
    left: FExpression;
    right: FExpression;
};
export declare type FChainExpression = Omit<ChainExpression, 'expression'> & {
    expression: FSimpleCallExpression | FMemberExpression;
};
export declare type FConditionalExpression = Omit<ConditionalExpression, 'test' | 'alternate' | 'consequent'> & {
    test: FExpression;
    alternate: FExpression;
    consequent: FExpression;
};
export declare type FIdentifier = Identifier;
declare function fLiteral(expression: Literal): import("estree").SimpleLiteral;
export declare type FLiteral = ReturnType<typeof fLiteral>;
export declare type FLogicalExpression = Omit<LogicalExpression, 'left' | 'right'> & {
    left: FExpression;
    right: FExpression;
};
export declare type FMemberExpression = Omit<MemberExpression, 'object' | 'property'> & {
    object: FExpression;
    property: FExpression;
};
export declare function fMemberExpression(expression: MemberExpression): FMemberExpression;
export declare type FNewExpression = Omit<NewExpression, 'callee' | 'arguments'> & {
    callee: FExpression;
    arguments: Array<FExpression>;
};
declare type FObjectExpressionElement = {
    isSpread: false;
    property: FProperty;
} | {
    isSpread: true;
    argument: FExpression;
};
export declare type FObjectExpression = Omit<ObjectExpression, 'properties'> & {
    properties: Array<FObjectExpressionElement>;
};
export declare type FProperty = Omit<Property, 'key' | 'value' | 'kind'> & {
    key: FIdentifier | FLiteral;
    value: FExpression;
    kind: 'init';
};
export declare function fProperty(property: Property): FProperty;
export declare type FSimpleCallExpression = Omit<SimpleCallExpression, 'callee' | 'arguments'> & {
    callee: FExpression;
    arguments: Array<FExpression>;
};
export declare type FThisExpression = ThisExpression;
declare function fUnaryOperator(operator: UnaryOperator, range: Range | undefined): "+" | "-" | "!" | "~" | "typeof";
export declare type FUnaryOperator = ReturnType<typeof fUnaryOperator>;
export declare type FUnaryExpression = Omit<UnaryExpression, 'operator' | 'argument'> & {
    operator: FUnaryOperator;
    argument: FExpression;
};
export declare type FUpdateExpression = Omit<UpdateExpression, 'argument'> & {
    argument: FIdentifier | FMemberExpression;
};
export declare type FExpression = FArrayExpression | FArrowFunctionExpression | FAssignmentExpression | FBinaryExpression | FChainExpression | FConditionalExpression | FIdentifier | FLiteral | FLogicalExpression | FMemberExpression | FNewExpression | FObjectExpression | FThisExpression | FSimpleCallExpression | FUnaryExpression | FUpdateExpression;
export declare function fExpression(expression: Expression): FExpression;
export {};
//# sourceMappingURL=fExpression.d.ts.map