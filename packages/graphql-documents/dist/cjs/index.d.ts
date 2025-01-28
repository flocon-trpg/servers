export declare const CharacterValueForMessageFragmentDoc: import("@graphql-typed-document-node/core").TypedDocumentNode<import("./graphql-codegen/graphql").CharacterValueForMessageFragment, unknown>;
export declare const RoomPublicMessageFragmentDoc: import("@graphql-typed-document-node/core").TypedDocumentNode<import("./graphql-codegen/graphql").RoomPublicMessageFragment, unknown>;
export declare const RoomPrivateMessageFragmentDoc: import("@graphql-typed-document-node/core").TypedDocumentNode<import("./graphql-codegen/graphql").RoomPrivateMessageFragment, unknown>;
export declare const PieceLogFragmentDoc: import("@graphql-typed-document-node/core").TypedDocumentNode<import("./graphql-codegen/graphql").PieceLogFragment, unknown>;
export declare const RoomPrivateMessageUpdateFragmentDoc: import("@graphql-typed-document-node/core").TypedDocumentNode<import("./graphql-codegen/graphql").RoomPrivateMessageUpdateFragment, unknown>;
export declare const RoomPublicMessageUpdateFragmentDoc: import("@graphql-typed-document-node/core").TypedDocumentNode<import("./graphql-codegen/graphql").RoomPublicMessageUpdateFragment, unknown>;
export declare const RoomSoundEffectFragmentDoc: import("@graphql-typed-document-node/core").TypedDocumentNode<import("./graphql-codegen/graphql").RoomSoundEffectFragment, unknown>;
export declare const RoomPublicChannelFragmentDoc: import("@graphql-typed-document-node/core").TypedDocumentNode<import("./graphql-codegen/graphql").RoomPublicChannelFragment, unknown>;
export declare const RoomPublicChannelUpdateFragmentDoc: import("@graphql-typed-document-node/core").TypedDocumentNode<import("./graphql-codegen/graphql").RoomPublicChannelUpdateFragment, unknown>;
export declare const RoomGetStateFragmentDoc: import("@graphql-typed-document-node/core").TypedDocumentNode<import("./graphql-codegen/graphql").RoomGetStateFragment, unknown>;
export declare const RoomAsListItemFragmentDoc: import("@graphql-typed-document-node/core").TypedDocumentNode<import("./graphql-codegen/graphql").RoomAsListItemFragment, unknown>;
export declare const RoomOperationFragmentDoc: import("@graphql-typed-document-node/core").TypedDocumentNode<import("./graphql-codegen/graphql").RoomOperationFragment, unknown>;
export declare const RoomEventDoc: import("@graphql-typed-document-node/core").TypedDocumentNode<import("./graphql-codegen/graphql").RoomEventSubscription, import("./graphql-codegen/graphql").Exact<{
    roomId: import("./graphql-codegen/graphql").Scalars["String"]["input"];
}>>;
export declare const GetMessagesDoc: import("@graphql-typed-document-node/core").TypedDocumentNode<import("./graphql-codegen/graphql").GetMessagesQuery, import("./graphql-codegen/graphql").Exact<{
    roomId: import("./graphql-codegen/graphql").Scalars["String"]["input"];
}>>;
export declare const WritePublicMessageDoc: import("@graphql-typed-document-node/core").TypedDocumentNode<import("./graphql-codegen/graphql").WritePublicMessageMutation, import("./graphql-codegen/graphql").Exact<{
    roomId: import("./graphql-codegen/graphql").Scalars["String"]["input"];
    text: import("./graphql-codegen/graphql").Scalars["String"]["input"];
    textColor?: import("./graphql-codegen/graphql").InputMaybe<import("./graphql-codegen/graphql").Scalars["String"]["input"]>;
    channelKey: import("./graphql-codegen/graphql").Scalars["String"]["input"];
    characterId?: import("./graphql-codegen/graphql").InputMaybe<import("./graphql-codegen/graphql").Scalars["String"]["input"]>;
    customName?: import("./graphql-codegen/graphql").InputMaybe<import("./graphql-codegen/graphql").Scalars["String"]["input"]>;
    gameType?: import("./graphql-codegen/graphql").InputMaybe<import("./graphql-codegen/graphql").Scalars["String"]["input"]>;
}>>;
export declare const WritePrivateMessageDoc: import("@graphql-typed-document-node/core").TypedDocumentNode<import("./graphql-codegen/graphql").WritePrivateMessageMutation, import("./graphql-codegen/graphql").Exact<{
    roomId: import("./graphql-codegen/graphql").Scalars["String"]["input"];
    visibleTo: Array<import("./graphql-codegen/graphql").Scalars["String"]["input"]> | import("./graphql-codegen/graphql").Scalars["String"]["input"];
    text: import("./graphql-codegen/graphql").Scalars["String"]["input"];
    textColor?: import("./graphql-codegen/graphql").InputMaybe<import("./graphql-codegen/graphql").Scalars["String"]["input"]>;
    characterId?: import("./graphql-codegen/graphql").InputMaybe<import("./graphql-codegen/graphql").Scalars["String"]["input"]>;
    customName?: import("./graphql-codegen/graphql").InputMaybe<import("./graphql-codegen/graphql").Scalars["String"]["input"]>;
    gameType?: import("./graphql-codegen/graphql").InputMaybe<import("./graphql-codegen/graphql").Scalars["String"]["input"]>;
}>>;
export declare const OperateRoomDoc: import("@graphql-typed-document-node/core").TypedDocumentNode<import("./graphql-codegen/graphql").OperateRoomMutation, import("./graphql-codegen/graphql").Exact<{
    roomId: import("./graphql-codegen/graphql").Scalars["String"]["input"];
    revisionFrom: import("./graphql-codegen/graphql").Scalars["Int"]["input"];
    operation: import("./graphql-codegen/graphql").RoomOperationInput;
    requestId: import("./graphql-codegen/graphql").Scalars["String"]["input"];
}>>;
export declare const GetRoomDoc: import("@graphql-typed-document-node/core").TypedDocumentNode<import("./graphql-codegen/graphql").GetRoomQuery, import("./graphql-codegen/graphql").Exact<{
    roomId: import("./graphql-codegen/graphql").Scalars["String"]["input"];
}>>;
export declare const UpdateWritingMessageStatusDoc: import("@graphql-typed-document-node/core").TypedDocumentNode<import("./graphql-codegen/graphql").UpdateWritingMessageStatusMutation, import("./graphql-codegen/graphql").Exact<{
    roomId: import("./graphql-codegen/graphql").Scalars["String"]["input"];
    newStatus: import("./graphql-codegen/graphql").WritingMessageStatusInputType;
}>>;
export declare const GetRoomConnectionsDoc: import("@graphql-typed-document-node/core").TypedDocumentNode<import("./graphql-codegen/graphql").GetRoomConnectionsQuery, import("./graphql-codegen/graphql").Exact<{
    roomId: import("./graphql-codegen/graphql").Scalars["String"]["input"];
}>>;
export { GetRoomMessagesFailureType, PieceLogType, FileSourceType, WritingMessageStatusType, OperateRoomFailureType, GetRoomFailureType, WritingMessageStatusInputType, FilePathInput, ParticipantRole, JoinRoomFailureType, PrereleaseType, WriteRoomPublicMessageFailureType, WriteRoomPrivateMessageFailureType, } from './graphql-codegen/graphql';
//# sourceMappingURL=index.d.ts.map