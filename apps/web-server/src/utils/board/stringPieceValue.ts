import { StringPieceState } from '@flocon-trpg/core';

export namespace StringPieceValue {
    export const toKonvaText = <T>(
        state: StringPieceState,
        createdByMe: boolean,
        defaultValue: T
    ): string | T => {
        if (state.isValuePrivate && !createdByMe) {
            return defaultValue;
        }
        return state.value;
    };

    export const stringify = (source: StringPieceState): string => {
        const range = null;
        return `${source.value ?? '？'} ${range == null ? '' : `(${range})`} ${
            source.value != null && source.isValuePrivate ? '(値は非公開)' : ''
        }`;
    };
}
