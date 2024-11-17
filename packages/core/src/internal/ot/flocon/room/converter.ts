import {
    DownOperation,
    State,
    UpOperation,
    downOperation,
    state,
    upOperation,
} from '../../generator/types';
import * as Room from './types';

type RoomState = State<typeof Room.template>;
type RoomDbState = State<typeof Room.dbTemplate>;
type RoomUpOperation = UpOperation<typeof Room.dbTemplate>;
type RoomDownOperation = DownOperation<typeof Room.dbTemplate>;

export const decodeState = (source: unknown): RoomState => {
    return state(Room.template).parse(source);
};

export const parseState = (source: string): RoomState => {
    return decodeState(JSON.parse(source));
};

export const stringifyState = (source: RoomState): string => {
    const result = state(Room.template).parse(source);
    return JSON.stringify(result);
};

export const decodeDbState = (source: unknown): RoomDbState => {
    return state(Room.dbTemplate).parse(source);
};

export const exactDbState = (source: RoomDbState): RoomDbState => {
    return state(Room.dbTemplate).parse(source);
};

const decodeUpOperation = (source: unknown): RoomUpOperation => {
    return upOperation(Room.template).parse(source);
};

export const parseUpOperation = (source: string): RoomUpOperation => {
    return decodeUpOperation(JSON.parse(source));
};

export const stringifyUpOperation = (source: RoomUpOperation): string => {
    const result = upOperation(Room.template).parse(source);
    return JSON.stringify(result);
};

export const decodeDownOperation = (source: unknown): RoomDownOperation => {
    return downOperation(Room.template).parse(source);
};

export const exactDownOperation = (source: RoomDownOperation): RoomDownOperation => {
    return downOperation(Room.template).parse(source);
};
