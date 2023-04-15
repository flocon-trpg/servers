import { z } from 'zod';
import { maybe } from '../../../../../../maybe';
import { createObjectValueTemplate, createReplaceValueTemplate } from '../../../../../generator';

// 今の所D6しか対応していない。D4は将来のために予約されている。
export const D4 = 'D4';
export const D6 = 'D6';
export const dieType = z.union([z.literal(D4), z.literal(D6)]);
export type DieType = z.TypeOf<typeof dieType>;

export const template = createObjectValueTemplate(
    {
        dieType: createReplaceValueTemplate(dieType),
        isValuePrivate: createReplaceValueTemplate(z.boolean()),
        // undefined になるのは、次の2つのいずれかもしくは両方のケース。
        // 1. isValuePrivate === trueになっておりvalueが隠されているとき
        // 2. 目なしのとき
        value: createReplaceValueTemplate(maybe(z.number())),
    },
    1,
    1
);
