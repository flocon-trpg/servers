import { BlockStatement, BreakStatement, ContinueStatement, Directive, ExpressionStatement, ForOfStatement, ForStatement, IfStatement, ModuleDeclaration, ReturnStatement, Statement, SwitchCase, SwitchStatement, VariableDeclaration } from 'estree';
import { FExpression } from './fExpression';
import { FPattern } from './fPattern';
export declare type FBlockStatement = Omit<BlockStatement, 'body'> & {
    body: Array<FStatement>;
};
export declare function fBlockStatement(statement: BlockStatement): FBlockStatement;
declare type FBreakStatement = Omit<BreakStatement, 'label'>;
declare type FContinueStatement = Omit<ContinueStatement, 'label'>;
declare const fExpressionStatement: (statement: ExpressionStatement) => {
    expression: FExpression;
    type: "ExpressionStatement";
    leadingComments?: import("estree").Comment[] | undefined;
    trailingComments?: import("estree").Comment[] | undefined;
    loc?: import("estree").SourceLocation | null | undefined;
    range?: [number, number] | undefined;
};
declare type FExpressionStatement = ReturnType<typeof fExpressionStatement>;
declare type ForLeft = FPattern | FVariableDeclaration;
declare type FForOfStatement = Omit<ForOfStatement, 'left' | 'right' | 'body'> & {
    left: ForLeft;
    right: FExpression;
    body: FStatement;
};
declare type FForStatement = Omit<ForStatement, 'init' | 'test' | 'update' | 'body'> & {
    init: FVariableDeclaration | FExpression | null | undefined;
    test: FExpression | null | undefined;
    update: FExpression | null | undefined;
    body: FStatement;
};
declare type FIfStatement = Omit<IfStatement, 'alternate' | 'consequent' | 'test'> & {
    alternate?: FStatement | null;
    consequent: FStatement;
    test: FExpression;
};
declare type FReturnStatement = Omit<ReturnStatement, 'argument'> & {
    argument?: FExpression | null;
};
declare type FSwitchCase = Omit<SwitchCase, 'consequent' | 'test'> & {
    test?: FExpression | null;
    consequent: Array<FStatement>;
};
declare type FSwitchStatement = Omit<SwitchStatement, 'discriminant' | 'cases'> & {
    discriminant: FExpression;
    cases: Array<FSwitchCase>;
};
declare const fVariableDeclaration: (statement: VariableDeclaration) => {
    kind: "let" | "const";
    declarations: {
        id: FPattern;
        init: FExpression | null | undefined;
        type: "VariableDeclarator";
        leadingComments?: import("estree").Comment[] | undefined;
        trailingComments?: import("estree").Comment[] | undefined;
        loc?: import("estree").SourceLocation | null | undefined;
        range?: [number, number] | undefined;
    }[];
    type: "VariableDeclaration";
    leadingComments?: import("estree").Comment[] | undefined;
    trailingComments?: import("estree").Comment[] | undefined;
    loc?: import("estree").SourceLocation | null | undefined;
    range?: [number, number] | undefined;
};
export declare type FVariableDeclaration = ReturnType<typeof fVariableDeclaration>;
export declare type FStatement = FBlockStatement | FBreakStatement | FContinueStatement | FIfStatement | FExpressionStatement | FForOfStatement | FForStatement | FReturnStatement | FSwitchStatement | FVariableDeclaration;
export declare function fStatement(statement: Directive | Statement | ModuleDeclaration): FStatement;
export {};
//# sourceMappingURL=fStatement.d.ts.map