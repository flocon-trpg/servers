import {
    RoomGetStateFragment,
    RoomOperationFragment,
    RoomOperationInput,
} from '@flocon-trpg/typed-document-node';
import {
    State as S,
    UpOperation as U,
    parseState,
    parseUpOperation,
    roomTemplate,
    stringifyUpOperation,
} from '@flocon-trpg/core';

type State = S<typeof roomTemplate>;
type UpOperation = U<typeof roomTemplate>;

export namespace Room {
    export const createState = (source: RoomGetStateFragment): State => {
        return parseState(source.stateJson);
    };

    export const createGetOperation = (source: RoomOperationFragment): UpOperation => {
        return parseUpOperation(source.valueJson);
    };

    export const toGraphQLInput = (source: UpOperation, clientId: string): RoomOperationInput => {
        return {
            clientId,
            valueJson: stringifyUpOperation(source),
        };
    };
}
