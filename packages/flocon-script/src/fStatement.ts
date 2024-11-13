import {
    BlockStatement,
    BreakStatement,
    ContinueStatement,
    Directive,
    ExpressionStatement,
    ForOfStatement,
    ForStatement,
    IfStatement,
    ModuleDeclaration,
    ReturnStatement,
    Statement,
    SwitchCase,
    SwitchStatement,
    VariableDeclaration,
} from 'estree';
import { ScriptError } from './ScriptError';
import { FExpression, fExpression } from './fExpression';
import { FPattern, fPattern } from './fPattern';
import { toRange } from './range';

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
        body: statement.body.map(x => fStatement(x)),
    };
}

type FBreakStatement = Omit<BreakStatement, 'label'>;

type FContinueStatement = Omit<ContinueStatement, 'label'>;

const fExpressionStatement = (statement: ExpressionStatement) => {
    return {
        ...statement,
        expression: fExpression(statement.expression),
    };
};
type FExpressionStatement = ReturnType<typeof fExpressionStatement>;

type ForLeft = FPattern | FVariableDeclaration;

type FForOfStatement = Omit<ForOfStatement, 'left' | 'right' | 'body'> & {
    left: ForLeft;
    right: FExpression;
    body: FStatement;
};

type FForStatement = Omit<ForStatement, 'init' | 'test' | 'update' | 'body'> & {
    init: FVariableDeclaration | FExpression | null | undefined;
    test: FExpression | null | undefined;
    update: FExpression | null | undefined;
    body: FStatement;
};

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
type FSwitchStatement = Omit<SwitchStatement, 'discriminant' | 'cases'> & {
    discriminant: FExpression;
    cases: Array<FSwitchCase>;
};

const fVariableDeclaration = (statement: VariableDeclaration) => {
    if (statement.kind === 'var') {
        throw new ScriptError(
            `'${statement.kind}' is not supported. Use 'let' instead.`,
            toRange(statement),
        );
    }
    const declarations = statement.declarations.map(d => {
        return {
            ...d,
            id: fPattern(d.id),
            init: d.init == null ? d.init : fExpression(d.init),
        };
    });
    return {
        ...statement,
        kind: statement.kind,
        declarations,
    };
};
export type FVariableDeclaration = ReturnType<typeof fVariableDeclaration>;

export type FStatement =
    | FBlockStatement
    | FBreakStatement
    | FContinueStatement
    | FIfStatement
    | FExpressionStatement
    | FForOfStatement
    | FForStatement
    | FReturnStatement
    | FSwitchStatement
    | FVariableDeclaration;

export function fStatement(statement: Directive | Statement | ModuleDeclaration): FStatement {
    switch (statement.type) {
        case 'BlockStatement':
            return fBlockStatement(statement);
        case 'BreakStatement':
            if (statement.label != null) {
                throw new ScriptError('labels are not supported');
            }
            return statement;
        case 'ContinueStatement':
            if (statement.label != null) {
                throw new ScriptError('labels are not supported');
            }
            return statement;
        case 'ExpressionStatement':
            return fExpressionStatement(statement);
        case 'ForOfStatement':
            return {
                ...statement,
                left:
                    statement.left.type === 'VariableDeclaration'
                        ? fVariableDeclaration(statement.left)
                        : fPattern(statement.left),
                right: fExpression(statement.right),
                body: fStatement(statement.body),
            };
        case 'ForStatement': {
            let init: FForStatement['init'];
            if (statement.init == null) {
                init = statement.init;
            } else if (statement.init.type === 'VariableDeclaration') {
                init = fVariableDeclaration(statement.init);
            } else {
                init = fExpression(statement.init);
            }
            return {
                ...statement,
                init,
                test: statement.test == null ? statement.test : fExpression(statement.test),
                update: statement.update == null ? statement.update : fExpression(statement.update),
                body: fStatement(statement.body),
            };
        }
        case 'IfStatement':
            return {
                ...statement,
                alternate:
                    statement.alternate == null
                        ? statement.alternate
                        : fStatement(statement.alternate),
                consequent: fStatement(statement.consequent),
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
        case 'SwitchStatement': {
            return {
                ...statement,
                cases: statement.cases.map(c => ({
                    ...c,
                    consequent: c.consequent.map(s => fStatement(s)),
                    test: c.test == null ? c.test : fExpression(c.test),
                })),
                discriminant: fExpression(statement.discriminant),
            };
        }
        case 'VariableDeclaration':
            return fVariableDeclaration(statement);
        default:
            throw new ScriptError(`'${statement.type}' is not supported`, toRange(statement));
    }
}
