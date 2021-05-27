import {
    CustomDualKeyMap,
    KeyFactory,
    ReadonlyCustomDualKeyMap,
} from './customDualKeyMap';
import { DualKeyMap, DualKeyMapSource } from './dualKeyMap';

export type CompositeKey = {
    id: string;
    createdBy: string;
};

export const compositeKeyToString = (source: CompositeKey): string => {
    return `${source.id}@${source.createdBy}`;
};

export const stringToCompositeKey = (source: string): CompositeKey | null => {
    const array = source.split('@');
    if (array.length !== 2) {
        return null;
    }
    return { id: array[0], createdBy: array[1] };
};

export const toJsonString = (source: CompositeKey): string => {
    return `{ id: ${source.id}, createdBy: ${source.createdBy} }`;
};

export const equals = (x: CompositeKey, y: CompositeKey): boolean => {
    return x.createdBy === y.createdBy && x.id === y.id;
};

const keyFactory: KeyFactory<CompositeKey, string, string> = {
    createDualKey: x => ({ first: x.createdBy, second: x.id }),
    createKey: x => ({ createdBy: x.first, id: x.second }),
};

export type StateMap<T> = CustomDualKeyMap<CompositeKey, string, string, T>;
export type ReadonlyStateMap<T> = ReadonlyCustomDualKeyMap<
    CompositeKey,
    string,
    string,
    T
>;

export const createStateMap = <T>(
    source?: DualKeyMapSource<string, string, T> | DualKeyMap<string, string, T>
): StateMap<T> => {
    return new CustomDualKeyMap({ ...keyFactory, sourceMap: source });
};
