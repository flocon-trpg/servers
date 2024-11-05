import { ArrayExpression, ArrowFunctionExpression, AssignmentExpression, AssignmentOperator, BaseCallExpression, BinaryExpression, BinaryOperator, ChainExpression, ConditionalExpression, Expression, Identifier, Literal, LogicalExpression, MemberExpression, NewExpression, ObjectExpression, Property, SimpleCallExpression, ThisExpression, UnaryExpression, UnaryOperator, UpdateExpression } from 'estree';
import { FPattern } from './fPattern';
import { FBlockStatement } from './fStatement';
import { Range } from './range';
type FArrayExpressionElement = {
    isSpread: false;
    expression: FExpression;
} | {
    isSpread: true;
    argument: FExpression;
};
export type FArrayExpression = Omit<ArrayExpression, 'elements'> & {
    elements: Array<FArrayExpressionElement | null>;
};
export type FArrowFunctionExpression = Omit<ArrowFunctionExpression, 'body' | 'params'> & {
    body: FBlockStatement | FExpression;
    params: Array<FPattern>;
};
declare function fAssignmentOperator(operator: AssignmentOperator): AssignmentOperator;
export type FAssignmentOperator = ReturnType<typeof fAssignmentOperator>;
export type FAssignmentExpression = Omit<AssignmentExpression, 'operator' | 'left' | 'right'> & {
    operator: FAssignmentOperator;
    left: FIdentifier | FMemberExpression;
    right: FExpression;
};
export type FBaseCallExpression = Omit<BaseCallExpression, 'callee' | 'arguments'> & {
    callee: FExpression;
    arguments: Array<FExpression>;
};
declare function fBinaryOperator(operator: BinaryOperator, range: Range | undefined): "==" | "!=" | "===" | "!==" | "<" | "<=" | ">" | ">=" | "<<" | ">>" | ">>>" | "+" | "-" | "*" | "/" | "%" | "**" | "|" | "^" | "&";
export type FBinaryOperator = ReturnType<typeof fBinaryOperator>;
export type FBinaryExpression = Omit<BinaryExpression, 'operator' | 'left' | 'right'> & {
    operator: FBinaryOperator;
    left: FExpression;
    right: FExpression;
};
export type FChainExpression = Omit<ChainExpression, 'expression'> & {
    expression: FSimpleCallExpression | FMemberExpression;
};
export type FConditionalExpression = Omit<ConditionalExpression, 'test' | 'alternate' | 'consequent'> & {
    test: FExpression;
    alternate: FExpression;
    consequent: FExpression;
};
export type FIdentifier = Identifier;
declare function fLiteral(expression: Literal): import("estree").SimpleLiteral;
export type FLiteral = ReturnType<typeof fLiteral>;
export type FLogicalExpression = Omit<LogicalExpression, 'left' | 'right'> & {
    left: FExpression;
    right: FExpression;
};
export type FMemberExpression = Omit<MemberExpression, 'object' | 'property'> & {
    object: FExpression;
    property: FExpression;
};
export declare function fMemberExpression(expression: MemberExpression): FMemberExpression;
export type FNewExpression = Omit<NewExpression, 'callee' | 'arguments'> & {
    callee: FExpression;
    arguments: Array<FExpression>;
};
type FObjectExpressionElement = {
    isSpread: false;
    property: FProperty;
} | {
    isSpread: true;
    argument: FExpression;
};
export type FObjectExpression = Omit<ObjectExpression, 'properties'> & {
    properties: Array<FObjectExpressionElement>;
};
export type FProperty = Omit<Property, 'key' | 'value' | 'kind'> & {
    key: FIdentifier | FLiteral;
    value: FExpression;
    kind: 'init';
};
export declare function fProperty(property: Property): FProperty;
export type FSimpleCallExpression = Omit<SimpleCallExpression, 'callee' | 'arguments'> & {
    callee: FExpression;
    arguments: Array<FExpression>;
};
export type FThisExpression = ThisExpression;
declare function fUnaryOperator(operator: UnaryOperator, range: Range | undefined): "+" | "-" | "!" | "~" | "typeof";
export type FUnaryOperator = ReturnType<typeof fUnaryOperator>;
export type FUnaryExpression = Omit<UnaryExpression, 'operator' | 'argument'> & {
    operator: FUnaryOperator;
    argument: FExpression;
};
export type FUpdateExpression = Omit<UpdateExpression, 'argument'> & {
    argument: FIdentifier | FMemberExpression;
};
export type FExpression = FArrayExpression | FArrowFunctionExpression | FAssignmentExpression | FBinaryExpression | FChainExpression | FConditionalExpression | FIdentifier | FLiteral | FLogicalExpression | FMemberExpression | FNewExpression | FObjectExpression | FThisExpression | FSimpleCallExpression | FUnaryExpression | FUpdateExpression;
export declare function fExpression(expression: Expression): FExpression;
export {};
//# sourceMappingURL=fExpression.d.ts.map