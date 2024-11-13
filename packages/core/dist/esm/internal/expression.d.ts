import { Result } from '@kizahasi/result';
export declare const plain = "plain";
export declare const expr1 = "expr1";
export type Expression = {
    type: typeof plain;
    text: string;
} | {
    type: typeof expr1;
    path: string[];
    raw: string;
};
export declare const analyze: (text: string) => Result<Expression[]>;
//# sourceMappingURL=expression.d.ts.map