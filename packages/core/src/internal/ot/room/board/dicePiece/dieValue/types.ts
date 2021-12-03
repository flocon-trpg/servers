import * as t from 'io-ts';
import * as ReplaceOperation from '../../../../util/replaceOperation';
import { createOperation } from '../../../../util/createOperation';
import { maybe, Maybe } from '../../../../../maybe';

// 今の所D6しか対応していない。D4は将来のために予約されている。
export const D4 = 'D4';
export const D6 = 'D6';
export const dieType = t.union([t.literal(D4), t.literal(D6)]);
export type DieType = t.TypeOf<typeof dieType>;

export const state = t.type({
    $v: t.literal(1),
    $r: t.literal(1),
    dieType,
    isValuePrivate: t.boolean,
    // undefined になるのは、次の2つのいずれかもしくは両方のケース。
    // 1. isValuePrivate === trueになっておりvalueが隠されているとき
    // 2. 目なしのとき
    value: maybe(t.number),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, 1, {
    dieType: t.type({ oldValue: dieType }),
    isValuePrivate: t.type({ oldValue: t.boolean }),
    value: t.type({ oldValue: maybe(t.number) }),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, 1, {
    dieType: t.type({ newValue: dieType }),
    isValuePrivate: t.type({ newValue: t.boolean }),
    value: t.type({ newValue: maybe(t.number) }),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 1;
    $r: 1;
    dieType?: ReplaceOperation.ReplaceValueTwoWayOperation<DieType>;
    isValuePrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    value?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<number>>;
};
