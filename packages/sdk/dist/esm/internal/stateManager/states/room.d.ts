import { State as S, UpOperation as U, roomTemplate } from '@flocon-trpg/core';
import { RoomGetStateFragment, RoomOperationFragment, RoomOperationInput } from '@flocon-trpg/typed-document-node-v0.7.1';
declare type State = S<typeof roomTemplate>;
declare type UpOperation = U<typeof roomTemplate>;
export declare namespace Room {
    const createState: (source: RoomGetStateFragment) => State;
    const createGetOperation: (source: RoomOperationFragment) => UpOperation;
    const toGraphQLInput: (source: UpOperation, clientId: string) => RoomOperationInput;
}
export {};
//# sourceMappingURL=room.d.ts.map