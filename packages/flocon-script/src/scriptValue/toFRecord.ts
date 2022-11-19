import { FRecord } from './FRecord';
import { FString } from './FString';
import { toFValue } from './toFValue';

// __proto__ のチェックなどは行われない
export const toFRecord = (source: Record<string, unknown>): FRecord => {
    const result = new FRecord();
    for (const key in source) {
        result.set({
            property: new FString(key),
            newValue: toFValue(source[key]),
            astInfo: undefined,
        });
    }
    return result;
};
