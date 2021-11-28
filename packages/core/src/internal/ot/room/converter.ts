import * as t from 'io-ts';
import * as Room from './types';

export const decodeState = (source: unknown): Room.State => {
    const result = t.exact(Room.state).decode(source);
    if (result._tag === 'Right') {
        return result.right;
    }
    throw new Error('decodeState failure');
};

export const parseState = (source: string): Room.State => {
    return decodeState(JSON.parse(source));
};

export const stringifyState = (source: Room.State): string => {
    const result = t.exact(Room.state).encode(source);
    return JSON.stringify(result);
};

export const decodeDbState = (source: unknown): Room.DbState => {
    const result = t.exact(Room.dbState).decode(source);
    if (result._tag === 'Right') {
        return result.right;
    }
    throw new Error('decodeDbState failure');
};

export const exactDbState = (source: Room.DbState): Room.DbState => {
    return t.exact(Room.dbState).encode(source);
};

const decodeUpOperation = (source: unknown): Room.UpOperation => {
    const result = t.exact(Room.upOperation).decode(source);
    if (result._tag === 'Right') {
        return result.right;
    }
    throw new Error('decodeUpOperation failure');
};

export const parseUpOperation = (source: string): Room.UpOperation => {
    return decodeUpOperation(JSON.parse(source));
};

export const stringifyUpOperation = (source: Room.UpOperation): string => {
    const result = t.exact(Room.upOperation).decode(source);
    if (result._tag === 'Left') {
        throw new Error('decode failed');
    }
    return JSON.stringify(result.right);
};

export const decodeDownOperation = (source: unknown): Room.DownOperation => {
    const result = t.exact(Room.downOperation).decode(source);
    if (result._tag === 'Right') {
        return result.right;
    }
    throw new Error('decodeDownOperation failure');
};

export const exactDownOperation = (source: Room.DownOperation): Room.DownOperation => {
    const result = t.exact(Room.downOperation).decode(source);
    if (result._tag === 'Left') {
        throw new Error('decode failed');
    }
    return result.right;
};
