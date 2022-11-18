import { DownOperation, State, UpOperation } from '../../generator';
import * as Room from './types';
declare type RoomState = State<typeof Room.template>;
declare type RoomDbState = State<typeof Room.dbTemplate>;
declare type RoomUpOperation = UpOperation<typeof Room.dbTemplate>;
declare type RoomDownOperation = DownOperation<typeof Room.dbTemplate>;
export declare const decodeState: (source: unknown) => RoomState;
export declare const parseState: (source: string) => RoomState;
export declare const stringifyState: (source: RoomState) => string;
export declare const decodeDbState: (source: unknown) => RoomDbState;
export declare const exactDbState: (source: RoomDbState) => RoomDbState;
export declare const parseUpOperation: (source: string) => RoomUpOperation;
export declare const stringifyUpOperation: (source: RoomUpOperation) => string;
export declare const decodeDownOperation: (source: unknown) => RoomDownOperation;
export declare const exactDownOperation: (source: RoomDownOperation) => RoomDownOperation;
export {};
//# sourceMappingURL=converter.d.ts.map