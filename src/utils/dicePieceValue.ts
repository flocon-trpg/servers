import { DicePieceValueState } from '@kizahasi/flocon-core';
import { recordToArray } from '@kizahasi/util';

export namespace DicePieceValue {
    export const stringify = (source: DicePieceValueState, createdByMe: boolean): string => {
        const array = recordToArray(source.dice).sort((x, y) => x.key.localeCompare(y.key));
        if (array.length === 0) {
            return 'なし';
        }
        const menashi = '0';
        return array.reduce((seed, elem, i) => {
            let toAppend: string | number;
            if (elem.value.value == null) {
                if (createdByMe && elem.value.isValuePrivate) {
                    toAppend = '?';
                } else {
                    toAppend = menashi;
                }
            } else {
                toAppend = elem.value.value;
            }
            if (i === 0) {
                return `${toAppend}`;
            }
            return `${seed}, ${toAppend}`;
        }, '');
    };

    export const toKonvaText = (source: DicePieceValueState, createdByMe: boolean): string => {
        return stringify(source, createdByMe);
    };
}