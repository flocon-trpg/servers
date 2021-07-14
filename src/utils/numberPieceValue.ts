import { NumberPieceValueState } from '@kizahasi/flocon-core';

export namespace NumberPieceValue {
    export const toKonvaText = (state: NumberPieceValueState, createdByMe: boolean): string => {
        if (state.isValuePrivate && !createdByMe) {
            return '?';
        }
        const number = state.value?.toString() ?? 'null';
        if (state.isValuePrivate) {
            return `(${number})`;
        }
        return number;
    };

    export const stringify = (source: NumberPieceValueState): string => {
        // const range: string | null = (() => {
        //     if (source.valueRangeMin == null && source.valueRangeMax == null) {
        //         return null;
        //     }
        //     return `範囲: ${source.valueRangeMin ?? '？'}～${source.valueRangeMax ?? '？'}`;
        // })();
        const range = null;
        return `${source.value ?? '？'} ${range == null ? '' : `(${range})`} ${
            source.value != null && source.isValuePrivate ? '(値は非公開)' : ''
        }`;
    };
}
