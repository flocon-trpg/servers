import {
    BlockStatement,
    BreakStatement,
    ContinueStatement,
    Directive,
    ExpressionStatement,
    IfStatement,
    ModuleDeclaration,
    ReturnStatement,
    Statement,
    SwitchCase,
    SwitchStatement,
    VariableDeclaration,
} from 'estree';
import { FExpression, fExpression } from './fExpression';
import { toRange } from './range';
import { ScriptError } from './ScriptError';

/*
classやvarなど、対応していないものはここで弾いている。スクリプト実行のコードと分離しているため、エディターで「基本的にはjavascriptの文法でチェックするが、サポート外のキーワードなどが見つかった場合はエラーを返す」という処理をさせるのが簡単になる。

当初は「このファイルを作らず、ofExpressionやofStatementのcontextにnullを渡したら文法チェックモードとする」という作戦をとっていた。
だが、例えば a ? f() : g() のようなコードはf()とg()のいずれかのみ実行される。だが、文法チェックモードでは両方とも実行しなければならない。このような場合分けが必要になってしまい、コードが複雑化することが予想されたので却下。
*/

export type FBlockStatement = Omit<BlockStatement, 'body'> & {
    body: Array<FStatement>;
};
export function fBlockStatement(statement: BlockStatement): FBlockStatement {
    return {
        ...statement,
        body: statement.body.map(x => fFStatement(x)),
    };
}

type FBreakStatement = Omit<BreakStatement, 'label'>;

const fExpressionStatement = (statement: ExpressionStatement) => {
    return {
        ...statement,
        expression: fExpression(statement.expression),
    };
};
type FExpressionStatement = ReturnType<typeof fExpressionStatement>;

type FIfStatement = Omit<IfStatement, 'alternate' | 'consequent' | 'test'> & {
    alternate?: FStatement | null;
    consequent: FStatement;
    test: FExpression;
};

type FReturnStatement = Omit<ReturnStatement, 'argument'> & {
    argument?: FExpression | null;
};

type FSwitchCase = Omit<SwitchCase, 'consequent' | 'test'> & {
    test?: FExpression | null;
    consequent: Array<FStatement>;
};
type FSwitchStatement = Omit<SwitchStatement, 'alternate' | 'consequent' | 'test'> & {
    discriminant: FExpression;
    cases: Array<FSwitchCase>;
};

const fVariableDeclaration = (statement: VariableDeclaration) => {
    if (statement.kind === 'var') {
        throw new ScriptError(
            `'${statement.kind}' is not supported. Use 'let' instead.`,
            toRange(statement)
        );
    }
    const declarations = statement.declarations.map(d => {
        if (d.id.type !== 'Identifier') {
            throw new ScriptError(`'${d.id.type}' is not supported`, toRange(d.id));
        }
        return {
            ...d,
            init: d.init == null ? d.init : fExpression(d.init),
        };
    });
    return {
        ...statement,
        kind: statement.kind,
        declarations,
    };
};
type FVariableDeclaration = ReturnType<typeof fVariableDeclaration>;

export type FStatement =
    | FBlockStatement
    | FBreakStatement
    | ContinueStatement
    | FIfStatement
    | FExpressionStatement
    | FReturnStatement
    | FSwitchStatement
    | FVariableDeclaration;

export function fFStatement(statement: Directive | Statement | ModuleDeclaration): FStatement {
    switch (statement.type) {
        case 'BlockStatement':
            return fBlockStatement(statement);
        case 'BreakStatement':
            return statement;
        case 'ContinueStatement':
            return statement;
        case 'ExpressionStatement':
            return fExpressionStatement(statement);
        case 'IfStatement':
            return {
                ...statement,
                alternate:
                    statement.alternate == null
                        ? statement.alternate
                        : fFStatement(statement.alternate),
                consequent: fFStatement(statement.consequent),
                test: fExpression(statement.test),
            };
        case 'ReturnStatement':
            return {
                ...statement,
                argument:
                    statement.argument == null
                        ? statement.argument
                        : fExpression(statement.argument),
            };
        case 'SwitchStatement':
            return {
                ...statement,
                cases: statement.cases.map(c => ({
                    ...c,
                    consequent: c.consequent.map(s => fFStatement(s)),
                    test: c.test == null ? c.test : fExpression(c.test),
                })),
                discriminant: fExpression(statement.discriminant),
            };
        case 'VariableDeclaration':
            return fVariableDeclaration(statement);
        default:
            throw new ScriptError(`'${statement.type}' is not supported`, toRange(statement));
    }
}
