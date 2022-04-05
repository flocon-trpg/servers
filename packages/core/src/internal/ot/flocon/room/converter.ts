import {
    DownOperation,
    State,
    UpOperation,
    state,
    upOperation,
    downOperation,
} from '../../generator';
import * as Room from './types';

type RoomState = State<typeof Room.template>;
type RoomDbState = State<typeof Room.dbTemplate>;
type RoomUpOperation = UpOperation<typeof Room.dbTemplate>;
type RoomDownOperation = DownOperation<typeof Room.dbTemplate>;

export const decodeState = (source: unknown): RoomState => {
    const result = state(Room.template, { exact: true }).decode(source);
    if (result._tag === 'Right') {
        return result.right;
    }
    throw new Error('decodeState failure');
};

export const parseState = (source: string): RoomState => {
    return decodeState(JSON.parse(source));
};

export const stringifyState = (source: RoomState): string => {
    const result = state(Room.template, { exact: true }).encode(source);
    return JSON.stringify(result);
};

export const decodeDbState = (source: unknown): RoomDbState => {
    const result = state(Room.dbTemplate, { exact: true }).decode(source);
    if (result._tag === 'Right') {
        return result.right;
    }
    throw new Error('decodeDbState failure');
};

export const exactDbState = (source: RoomDbState): RoomDbState => {
    return state(Room.dbTemplate, { exact: true }).encode(source);
};

const decodeUpOperation = (source: unknown): RoomUpOperation => {
    const result = upOperation(Room.template, { exact: true }).decode(source);
    if (result._tag === 'Right') {
        return result.right;
    }
    throw new Error('decodeUpOperation failure');
};

export const parseUpOperation = (source: string): RoomUpOperation => {
    return decodeUpOperation(JSON.parse(source));
};

export const stringifyUpOperation = (source: RoomUpOperation): string => {
    const result = upOperation(Room.template, { exact: true }).decode(source);
    if (result._tag === 'Left') {
        throw new Error('decode failed');
    }
    return JSON.stringify(result.right);
};

export const decodeDownOperation = (source: unknown): RoomDownOperation => {
    const result = downOperation(Room.template, { exact: false }).decode(source);
    if (result._tag === 'Right') {
        return result.right;
    }
    throw new Error('decodeDownOperation failure');
};

export const exactDownOperation = (source: RoomDownOperation): RoomDownOperation => {
    const result = downOperation(Room.template, { exact: true }).decode(source);
    if (result._tag === 'Left') {
        throw new Error('decode failed');
    }
    return result.right;
};
