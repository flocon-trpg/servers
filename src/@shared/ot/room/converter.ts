import * as t from 'io-ts';
import * as Room from './v1';

export const parseState = (source: string): Room.State => {
    const result = t.exact(Room.state).decode(JSON.parse(source));
    if (result._tag === 'Left') {
        throw 'parseState failure';
    }
    return result.right;
};

export const stringifyState = (source: Room.State): string => {
    const result = t.exact(Room.state).encode(source);
    return JSON.stringify(result);
};

export const decodeDbState = (source: unknown): Room.DbState => {
    const result = t.exact(Room.dbState).decode(source);
    if (result._tag === 'Left') {
        throw 'decodeDbState failure';
    }
    return result.right;
};

export const exactDbState = (source: Room.DbState): Room.DbState => {
    return t.exact(Room.dbState).encode(source);
};

export const parseUpOperation = (source: string): Room.UpOperation => {
    const result = t.exact(Room.upOperation).decode(JSON.parse(source));
    if (result._tag === 'Left') {
        throw 'parseUpOperation failure';
    }
    return result.right;
};

export const stringifyUpOperation = (source: Room.UpOperation): string => {
    const result = t.exact(Room.upOperation).encode(source);
    return JSON.stringify(result);
};

export const decodeDownOperation = (source: unknown): Room.DownOperation => {
    const result = t.exact(Room.downOperation).decode(source);
    if (result._tag === 'Left') {
        throw 'decodeDownOperation failure';
    }
    return result.right;
};

export const exactDownOperation = (source: Room.DownOperation): Room.DownOperation => {
    return t.exact(Room.downOperation).encode(source);
};
