import { StringPieceState } from '@flocon-trpg/core';

export namespace StringPieceValue {
    export const toKonvaText = (state: StringPieceState, createdByMe: boolean): string => {
        if (state.isValuePrivate && !createdByMe) {
            return '?';
        }
        const number = state.value?.toString() ?? 'null';
        if (state.isValuePrivate) {
            return `(${number})`;
        }
        return number;
    };

    export const stringify = (source: StringPieceState): string => {
        const range = null;
        return `${source.value ?? '？'} ${range == null ? '' : `(${range})`} ${
            source.value != null && source.isValuePrivate ? '(値は非公開)' : ''
        }`;
    };
}
