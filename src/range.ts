import { BaseNodeWithoutComments } from 'estree';

export type Range = readonly [number, number];

export const toRange = (source: BaseNodeWithoutComments | null | undefined): Range | undefined => {
    if (source == null) {
        return undefined;
    }
    // @types/estreeとacornでは型が異なる。このライブラリではacornを用いているため、それに合わせて型変換している。
    const range = source as { start?: unknown; end?: unknown };
    if (typeof range.start === 'number' && typeof range.end === 'number') {
        return [range.start, range.end];
    }
    return undefined;
};
