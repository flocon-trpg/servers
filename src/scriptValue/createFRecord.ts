import { createFValue } from './createFValue';
import { FRecord } from './FRecord';
import { FString } from './FString';

// __proto__ のチェックなどは行われない
export const createFRecord = (source: Record<string, unknown>): FRecord => {
    const result = new FRecord();
    for (const key in source) {
        result.set({
            property: new FString(key),
            newValue: createFValue(source[key]),
            astInfo: undefined,
        });
    }
    return result;
};
