import {
    State as S,
    UpOperation as U,
    parseState,
    parseUpOperation,
    roomTemplate,
    stringifyUpOperation,
} from '@flocon-trpg/core';
import { OperateRoomDoc, RoomGetStateFragmentDoc } from '@flocon-trpg/graphql-documents';
import { ResultOf, VariablesOf } from '@graphql-typed-document-node/core';

type State = S<typeof roomTemplate>;
type UpOperation = U<typeof roomTemplate>;

export namespace Room {
    export const createState = (source: ResultOf<typeof RoomGetStateFragmentDoc>): State => {
        return parseState(source.stateJson);
    };

    export const createGetOperation = (
        source: Extract<
            ResultOf<typeof OperateRoomDoc>['result'],
            { __typename?: 'OperateRoomSuccessResult' }
        >['operation'],
    ): UpOperation => {
        return parseUpOperation(source.valueJson);
    };

    export const toGraphQLInput = (
        source: UpOperation,
        clientId: string,
    ): VariablesOf<typeof OperateRoomDoc>['operation'] => {
        return {
            clientId,
            valueJson: stringifyUpOperation(source),
        };
    };
}
