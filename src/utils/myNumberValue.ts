import { MyNumberValueState } from '@kizahasi/flocon-core';

export namespace MyNumberValue {
    export const stringify = (source: MyNumberValueState): string => {
        // const range: string | null = (() => {
        //     if (source.valueRangeMin == null && source.valueRangeMax == null) {
        //         return null;
        //     }
        //     return `範囲: ${source.valueRangeMin ?? '？'}～${source.valueRangeMax ?? '？'}`;
        // })();
        const range = null;
        return `${source.value ?? '？'} ${range == null ? '' : `(${range})`} ${(source.value != null && source.isValuePrivate) ? '(値は非公開)' : ''}`;
    };
}