import { State, stringPieceTemplate } from '@flocon-trpg/core';

type StringPieceState = State<typeof stringPieceTemplate>;

export namespace StringPieceValue {
    export const toKonvaText = <T>(
        state: StringPieceState,
        createdByMe: boolean,
        defaultValue: T,
    ): string | T => {
        if (state.isValuePrivate && !createdByMe) {
            return defaultValue;
        }
        return state.value;
    };

    export const stringify = (source: StringPieceState): string => {
        return `${source.value ?? '？'}} ${
            source.value != null && source.isValuePrivate ? '(値は非公開)' : ''
        }`;
    };
}
