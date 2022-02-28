import { CompositeKey } from './compositeKey';
import { CustomDualKeyMap, KeyFactory, ReadonlyCustomDualKeyMap } from './customDualKeyMap';
import { DualKeyMap, DualKeyMapSource } from './dualKeyMap';

const keyFactory: KeyFactory<CompositeKey, string, string> = {
    createDualKey: x => ({ first: x.createdBy, second: x.id }),
    createKey: x => ({ createdBy: x.first, id: x.second }),
};

export type StateMap<T> = CustomDualKeyMap<CompositeKey, string, string, T>;
export type ReadonlyStateMap<T> = ReadonlyCustomDualKeyMap<CompositeKey, string, string, T>;

export const createStateMap = <T>(
    source?: DualKeyMapSource<string, string, T> | DualKeyMap<string, string, T>
): StateMap<T> => {
    return new CustomDualKeyMap({ ...keyFactory, sourceMap: source });
};
