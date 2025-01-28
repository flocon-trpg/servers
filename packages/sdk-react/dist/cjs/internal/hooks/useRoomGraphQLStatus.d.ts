import { RoomClient } from '@flocon-trpg/sdk';
export declare const useRoomGraphQLStatus: <TGraphQLError>(roomClient: Pick<RoomClient<any, TGraphQLError>, "graphQLStatus">) => {
    RoomEventSubscription: {
        type: "ok";
    } | {
        type: "error";
        error: import("@flocon-trpg/sdk").ObservableError<TGraphQLError>;
    };
    GetMessagesQuery: {
        type: "fetching";
    } | {
        type: "success";
    } | {
        type: "error";
        error: import("@flocon-trpg/sdk").PromiseError<TGraphQLError>;
    };
    GetRoomConnectionsQuery: {
        type: "fetching";
    } | {
        type: "success";
    } | {
        type: "error";
        error: import("@flocon-trpg/sdk").PromiseError<TGraphQLError>;
    };
    GetRoomQuery: {
        type: "fetching";
    } | {
        type: "success";
    } | {
        type: "error";
        error: import("@flocon-trpg/sdk").PromiseError<TGraphQLError>;
    };
} & {
    hasError: boolean;
};
//# sourceMappingURL=useRoomGraphQLStatus.d.ts.map