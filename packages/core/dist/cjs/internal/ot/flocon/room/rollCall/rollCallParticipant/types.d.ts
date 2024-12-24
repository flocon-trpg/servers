import { z } from 'zod';
export declare const template: {
    readonly type: "object";
    readonly $v: 1;
    readonly $r: 1;
    readonly value: {
        /** 点呼に返事したかどうか。`number` の場合は返事をしたことを表し、値は返事した日時となります。 `undefined` の場合は返事をしていないことを表します。`number` から `undefined` に戻すことで返事を撤回することもできます。また、`number` から `number` に変更することで、返事をした時間を更新することもできます。 */
        answeredAt: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodOptional<z.ZodNumber>;
        };
    };
};
//# sourceMappingURL=types.d.ts.map