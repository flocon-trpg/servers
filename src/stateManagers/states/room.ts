import {
    RoomGetStateFragment,
    RoomOperationFragment,
    RoomOperationInput,
} from '../../generated/graphql';
import {
    parseState,
    parseUpOperation,
    State,
    stringifyUpOperation,
    UpOperation,
} from '@kizahasi/flocon-core';

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
