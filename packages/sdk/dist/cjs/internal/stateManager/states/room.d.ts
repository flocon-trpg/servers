import { State as S, UpOperation as U, roomTemplate } from '@flocon-trpg/core';
import { OperateRoomDoc, RoomGetStateFragmentDoc } from '@flocon-trpg/graphql-documents';
import { ResultOf, VariablesOf } from '@graphql-typed-document-node/core';
type State = S<typeof roomTemplate>;
type UpOperation = U<typeof roomTemplate>;
export declare namespace Room {
    const createState: (source: ResultOf<typeof RoomGetStateFragmentDoc>) => State;
    const createGetOperation: (source: Extract<ResultOf<typeof OperateRoomDoc>["result"], {
        __typename?: "OperateRoomSuccessResult";
    }>["operation"]) => UpOperation;
    const toGraphQLInput: (source: UpOperation, clientId: string) => VariablesOf<typeof OperateRoomDoc>["operation"];
}
export {};
//# sourceMappingURL=room.d.ts.map