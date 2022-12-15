import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends {
    [key: string]: unknown;
}> = {
    [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
};
export declare enum AnswerRollCallFailureType {
    NotAuthorizedParticipant = "NotAuthorizedParticipant",
    RollCallNotFound = "RollCallNotFound",
    RoomNotFound = "RoomNotFound",
    TooManyRequests = "TooManyRequests"
}
export type AnswerRollCallResult = {
    __typename?: 'AnswerRollCallResult';
    failureType?: Maybe<AnswerRollCallFailureType>;
};
export type AvailableGameSystem = {
    __typename?: 'AvailableGameSystem';
    id: Scalars['String'];
    name: Scalars['String'];
    sortKey: Scalars['String'];
};
export declare enum ChangeParticipantNameFailureType {
    NotFound = "NotFound",
    NotParticipant = "NotParticipant"
}
export type ChangeParticipantNameResult = {
    __typename?: 'ChangeParticipantNameResult';
    failureType?: Maybe<ChangeParticipantNameFailureType>;
};
export type CharacterValueForMessage = {
    __typename?: 'CharacterValueForMessage';
    image?: Maybe<FilePath>;
    isPrivate: Scalars['Boolean'];
    name: Scalars['String'];
    portraitImage?: Maybe<FilePath>;
    stateId: Scalars['String'];
};
export declare enum CloseRollCallFailureType {
    AlreadyClosed = "AlreadyClosed",
    NotAuthorizedParticipant = "NotAuthorizedParticipant",
    RollCallNotFound = "RollCallNotFound",
    RoomNotFound = "RoomNotFound",
    TooManyRequests = "TooManyRequests"
}
export type CloseRollCallResult = {
    __typename?: 'CloseRollCallResult';
    failureType?: Maybe<CloseRollCallFailureType>;
};
export type CommandResult = {
    __typename?: 'CommandResult';
    /** 成功判定のないコマンドの場合はnullish。成功判定のあるコマンドの場合はその結果。 */
    isSuccess?: Maybe<Scalars['Boolean']>;
    text: Scalars['String'];
};
export type CreateRoomFailureResult = {
    __typename?: 'CreateRoomFailureResult';
    failureType: CreateRoomFailureType;
};
export declare enum CreateRoomFailureType {
    UnknownError = "UnknownError"
}
export type CreateRoomInput = {
    participantName: Scalars['String'];
    playerPassword?: InputMaybe<Scalars['String']>;
    roomName: Scalars['String'];
    spectatorPassword?: InputMaybe<Scalars['String']>;
};
export type CreateRoomResult = CreateRoomFailureResult | CreateRoomSuccessResult;
export type CreateRoomSuccessResult = {
    __typename?: 'CreateRoomSuccessResult';
    id: Scalars['String'];
    room: RoomGetState;
};
export declare enum DeleteMessageFailureType {
    MessageDeleted = "MessageDeleted",
    MessageNotFound = "MessageNotFound",
    NotParticipant = "NotParticipant",
    NotYourMessage = "NotYourMessage",
    RoomNotFound = "RoomNotFound"
}
export type DeleteMessageResult = {
    __typename?: 'DeleteMessageResult';
    failureType?: Maybe<DeleteMessageFailureType>;
};
export declare enum DeleteRoomAsAdminFailureType {
    NotFound = "NotFound"
}
export type DeleteRoomAsAdminResult = {
    __typename?: 'DeleteRoomAsAdminResult';
    failureType?: Maybe<DeleteRoomAsAdminFailureType>;
};
export declare enum DeleteRoomFailureType {
    NotCreatedByYou = "NotCreatedByYou",
    NotFound = "NotFound"
}
export type DeleteRoomOperation = {
    __typename?: 'DeleteRoomOperation';
    deletedBy: Scalars['String'];
    /** since v0.7.2 */
    deletedByAdmin: Scalars['Boolean'];
};
export type DeleteRoomResult = {
    __typename?: 'DeleteRoomResult';
    failureType?: Maybe<DeleteRoomFailureType>;
};
export type EditFileTagActionInput = {
    add: Array<Scalars['String']>;
    filename: Scalars['String'];
    remove: Array<Scalars['String']>;
};
export type EditFileTagsInput = {
    actions: Array<EditFileTagActionInput>;
};
export declare enum EditMessageFailureType {
    MessageDeleted = "MessageDeleted",
    MessageNotFound = "MessageNotFound",
    NotParticipant = "NotParticipant",
    NotYourMessage = "NotYourMessage",
    RoomNotFound = "RoomNotFound"
}
export type EditMessageResult = {
    __typename?: 'EditMessageResult';
    failureType?: Maybe<EditMessageFailureType>;
};
export type EntryToServerResult = {
    __typename?: 'EntryToServerResult';
    type: EntryToServerResultType;
};
export declare enum EntryToServerResultType {
    AlreadyEntried = "AlreadyEntried",
    NoPasswordRequired = "NoPasswordRequired",
    NotSignIn = "NotSignIn",
    Success = "Success",
    WrongPassword = "WrongPassword"
}
export type FileItem = {
    __typename?: 'FileItem';
    createdAt?: Maybe<Scalars['Float']>;
    /** ファイルをアップロードしたユーザー。Firebase AuthenticationのUserUidで表現される。 */
    createdBy: Scalars['String'];
    /** サーバーで管理されているファイル名。axiosなどでファイルを取得する際はこれを用いる。ソートするとアップロードした時系列順になる。 */
    filename: Scalars['ID'];
    listType: FileListType;
    /** ユーザーが名付けたファイル名。 */
    screenname: Scalars['String'];
    /** サムネイル画像のファイル名。axiosなどを用いてファイルを取得する。 */
    thumbFilename?: Maybe<Scalars['String']>;
};
export declare enum FileListType {
    Public = "Public",
    Unlisted = "Unlisted"
}
export type FilePath = {
    __typename?: 'FilePath';
    path: Scalars['String'];
    sourceType: FileSourceType;
};
export type FilePathInput = {
    path: Scalars['String'];
    sourceType: FileSourceType;
};
export declare enum FileSourceType {
    Default = "Default",
    FirebaseStorage = "FirebaseStorage",
    Uploader = "Uploader"
}
export type FileTag = {
    __typename?: 'FileTag';
    id: Scalars['String'];
    name: Scalars['String'];
};
export type GetAvailableGameSystemsResult = {
    __typename?: 'GetAvailableGameSystemsResult';
    value: Array<AvailableGameSystem>;
};
export type GetFilesInput = {
    /** FileTagのidを指定することで、指定したタグが付いているファイルのみを抽出して表示する。例えばidがx,yの3つのタグが付いているファイルは、[]や[x]や[x,y]と指定した場合にマッチするが、[x,y,z]と指定された場合は除外される。 */
    fileTagIds: Array<Scalars['String']>;
};
export type GetFilesResult = {
    __typename?: 'GetFilesResult';
    files: Array<FileItem>;
};
export type GetJoinedRoomResult = {
    __typename?: 'GetJoinedRoomResult';
    /** 自分の現在のParticipantRoleType。room.roleと同じ値をとる。 */
    role: ParticipantRole;
    room: RoomGetState;
};
export type GetNonJoinedRoomResult = {
    __typename?: 'GetNonJoinedRoomResult';
    roomAsListItem: RoomAsListItem;
};
export type GetRoomAsListItemFailureResult = {
    __typename?: 'GetRoomAsListItemFailureResult';
    failureType: GetRoomFailureType;
};
export type GetRoomAsListItemResult = GetRoomAsListItemFailureResult | GetRoomAsListItemSuccessResult;
export type GetRoomAsListItemSuccessResult = {
    __typename?: 'GetRoomAsListItemSuccessResult';
    room: RoomAsListItem;
};
export declare enum GetRoomConnectionFailureType {
    NotParticipant = "NotParticipant",
    RoomNotFound = "RoomNotFound"
}
export type GetRoomConnectionsFailureResult = {
    __typename?: 'GetRoomConnectionsFailureResult';
    failureType: GetRoomConnectionFailureType;
};
export type GetRoomConnectionsResult = GetRoomConnectionsFailureResult | GetRoomConnectionsSuccessResult;
export type GetRoomConnectionsSuccessResult = {
    __typename?: 'GetRoomConnectionsSuccessResult';
    connectedUserUids: Array<Scalars['String']>;
    fetchedAt: Scalars['Float'];
};
export type GetRoomFailureResult = {
    __typename?: 'GetRoomFailureResult';
    failureType: GetRoomFailureType;
};
export declare enum GetRoomFailureType {
    NotFound = "NotFound"
}
export type GetRoomLogFailureResult = {
    __typename?: 'GetRoomLogFailureResult';
    failureType: GetRoomLogFailureType;
};
export declare enum GetRoomLogFailureType {
    NotAuthorized = "NotAuthorized",
    NotParticipant = "NotParticipant",
    RoomNotFound = "RoomNotFound",
    UnknownError = "UnknownError"
}
export type GetRoomLogResult = GetRoomLogFailureResult | RoomMessages;
export type GetRoomMessagesFailureResult = {
    __typename?: 'GetRoomMessagesFailureResult';
    failureType: GetRoomMessagesFailureType;
};
export declare enum GetRoomMessagesFailureType {
    NotParticipant = "NotParticipant",
    RoomNotFound = "RoomNotFound"
}
export type GetRoomMessagesResult = GetRoomMessagesFailureResult | RoomMessages;
export type GetRoomResult = GetJoinedRoomResult | GetNonJoinedRoomResult | GetRoomFailureResult;
export type GetRoomsListFailureResult = {
    __typename?: 'GetRoomsListFailureResult';
    failureType: GetRoomFailureType;
};
export type GetRoomsListResult = GetRoomsListFailureResult | GetRoomsListSuccessResult;
export type GetRoomsListSuccessResult = {
    __typename?: 'GetRoomsListSuccessResult';
    rooms: Array<RoomAsListItem>;
};
export type JoinRoomFailureResult = {
    __typename?: 'JoinRoomFailureResult';
    failureType: JoinRoomFailureType;
};
export declare enum JoinRoomFailureType {
    AlreadyParticipant = "AlreadyParticipant",
    NotFound = "NotFound",
    TransformError = "TransformError",
    WrongPassword = "WrongPassword"
}
export type JoinRoomResult = JoinRoomFailureResult | JoinRoomSuccessResult;
export type JoinRoomSuccessResult = {
    __typename?: 'JoinRoomSuccessResult';
    operation?: Maybe<RoomOperation>;
};
export declare enum LeaveRoomFailureType {
    NotFound = "NotFound",
    NotParticipant = "NotParticipant"
}
export type LeaveRoomResult = {
    __typename?: 'LeaveRoomResult';
    failureType?: Maybe<LeaveRoomFailureType>;
};
export declare enum MakeMessageNotSecretFailureType {
    MessageNotFound = "MessageNotFound",
    NotParticipant = "NotParticipant",
    NotSecret = "NotSecret",
    NotYourMessage = "NotYourMessage",
    RoomNotFound = "RoomNotFound"
}
export type MakeMessageNotSecretResult = {
    __typename?: 'MakeMessageNotSecretResult';
    failureType?: Maybe<MakeMessageNotSecretFailureType>;
};
export type Mutation = {
    __typename?: 'Mutation';
    /** since v0.7.13 */
    answerRollCall: AnswerRollCallResult;
    changeParticipantName: ChangeParticipantNameResult;
    /** since v0.7.13 */
    closeRollCall: CloseRollCallResult;
    /** @deprecated Use screenname to group files by folders instead. */
    createFileTag?: Maybe<FileTag>;
    createRoom: CreateRoomResult;
    /** @deprecated Use screenname to group files by folders instead. */
    deleteFileTag: Scalars['Boolean'];
    /** since v0.7.8 */
    deleteFiles: Array<Scalars['String']>;
    deleteMessage: DeleteMessageResult;
    deleteRoom: DeleteRoomResult;
    /** since v0.7.2 */
    deleteRoomAsAdmin: DeleteRoomAsAdminResult;
    /** @deprecated Use screenname to group files by folders instead. */
    editFileTags: Scalars['Boolean'];
    editMessage: EditMessageResult;
    entryToServer: EntryToServerResult;
    joinRoomAsPlayer: JoinRoomResult;
    joinRoomAsSpectator: JoinRoomResult;
    leaveRoom: LeaveRoomResult;
    makeMessageNotSecret: MakeMessageNotSecretResult;
    /** この Mutation を直接実行することは非推奨です。代わりに @flocon-trpg/sdk を用いてください。 */
    operate: OperateRoomResult;
    /** since v0.7.13 */
    performRollCall: PerformRollCallResult;
    /** GraphQL の動作テストに用いられます。3rd-party の Web サーバーを作成する際は利用しなくて構いません。 */
    ping: Pong;
    promoteToPlayer: PromoteResult;
    renameFiles: Array<Scalars['String']>;
    resetMessages: ResetRoomMessagesResult;
    updateBookmark: UpdateBookmarkResult;
    /** この Mutation を直接実行することは非推奨です。代わりに @flocon-trpg/sdk を用いてください。 */
    updateWritingMessageStatus: Scalars['Boolean'];
    writePrivateMessage: WriteRoomPrivateMessageResult;
    writePublicMessage: WriteRoomPublicMessageResult;
    writeRoomSoundEffect: WriteRoomSoundEffectResult;
};
export type MutationAnswerRollCallArgs = {
    answer: Scalars['Boolean'];
    rollCallId: Scalars['String'];
    roomId: Scalars['String'];
};
export type MutationChangeParticipantNameArgs = {
    newName: Scalars['String'];
    roomId: Scalars['String'];
};
export type MutationCloseRollCallArgs = {
    rollCallId: Scalars['String'];
    roomId: Scalars['String'];
};
export type MutationCreateFileTagArgs = {
    tagName: Scalars['String'];
};
export type MutationCreateRoomArgs = {
    input: CreateRoomInput;
};
export type MutationDeleteFileTagArgs = {
    tagId: Scalars['String'];
};
export type MutationDeleteFilesArgs = {
    filenames: Array<Scalars['String']>;
};
export type MutationDeleteMessageArgs = {
    messageId: Scalars['String'];
    roomId: Scalars['String'];
};
export type MutationDeleteRoomArgs = {
    id: Scalars['String'];
};
export type MutationDeleteRoomAsAdminArgs = {
    id: Scalars['String'];
};
export type MutationEditFileTagsArgs = {
    input: EditFileTagsInput;
};
export type MutationEditMessageArgs = {
    messageId: Scalars['String'];
    roomId: Scalars['String'];
    text: Scalars['String'];
};
export type MutationEntryToServerArgs = {
    password?: InputMaybe<Scalars['String']>;
};
export type MutationJoinRoomAsPlayerArgs = {
    id: Scalars['String'];
    name: Scalars['String'];
    password?: InputMaybe<Scalars['String']>;
};
export type MutationJoinRoomAsSpectatorArgs = {
    id: Scalars['String'];
    name: Scalars['String'];
    password?: InputMaybe<Scalars['String']>;
};
export type MutationLeaveRoomArgs = {
    id: Scalars['String'];
};
export type MutationMakeMessageNotSecretArgs = {
    messageId: Scalars['String'];
    roomId: Scalars['String'];
};
export type MutationOperateArgs = {
    id: Scalars['String'];
    operation: RoomOperationInput;
    prevRevision: Scalars['Int'];
    requestId: Scalars['String'];
};
export type MutationPerformRollCallArgs = {
    input: PerformRollCallInput;
};
export type MutationPingArgs = {
    value: Scalars['Float'];
};
export type MutationPromoteToPlayerArgs = {
    password?: InputMaybe<Scalars['String']>;
    roomId: Scalars['String'];
};
export type MutationRenameFilesArgs = {
    input: Array<RenameFileInput>;
};
export type MutationResetMessagesArgs = {
    roomId: Scalars['String'];
};
export type MutationUpdateBookmarkArgs = {
    newValue: Scalars['Boolean'];
    roomId: Scalars['String'];
};
export type MutationUpdateWritingMessageStatusArgs = {
    newStatus: WritingMessageStatusInputType;
    roomId: Scalars['String'];
};
export type MutationWritePrivateMessageArgs = {
    characterId?: InputMaybe<Scalars['String']>;
    customName?: InputMaybe<Scalars['String']>;
    gameType?: InputMaybe<Scalars['String']>;
    roomId: Scalars['String'];
    text: Scalars['String'];
    textColor?: InputMaybe<Scalars['String']>;
    visibleTo: Array<Scalars['String']>;
};
export type MutationWritePublicMessageArgs = {
    channelKey: Scalars['String'];
    characterId?: InputMaybe<Scalars['String']>;
    customName?: InputMaybe<Scalars['String']>;
    gameType?: InputMaybe<Scalars['String']>;
    roomId: Scalars['String'];
    text: Scalars['String'];
    textColor?: InputMaybe<Scalars['String']>;
};
export type MutationWriteRoomSoundEffectArgs = {
    file: FilePathInput;
    roomId: Scalars['String'];
    volume: Scalars['Float'];
};
export type OperateRoomFailureResult = {
    __typename?: 'OperateRoomFailureResult';
    failureType: OperateRoomFailureType;
};
export declare enum OperateRoomFailureType {
    NotFound = "NotFound"
}
export type OperateRoomIdResult = {
    __typename?: 'OperateRoomIdResult';
    requestId: Scalars['String'];
};
export type OperateRoomNonJoinedResult = {
    __typename?: 'OperateRoomNonJoinedResult';
    roomAsListItem: RoomAsListItem;
};
export type OperateRoomResult = OperateRoomFailureResult | OperateRoomIdResult | OperateRoomNonJoinedResult | OperateRoomSuccessResult;
export type OperateRoomSuccessResult = {
    __typename?: 'OperateRoomSuccessResult';
    operation: RoomOperation;
};
export type OperatedBy = {
    __typename?: 'OperatedBy';
    clientId: Scalars['String'];
    userUid: Scalars['String'];
};
export declare enum ParticipantRole {
    Master = "Master",
    Player = "Player",
    Spectator = "Spectator"
}
export declare enum PerformRollCallFailureType {
    HasOpenRollCall = "HasOpenRollCall",
    NotAuthorizedParticipant = "NotAuthorizedParticipant",
    NotFound = "NotFound",
    TooManyRequests = "TooManyRequests"
}
export type PerformRollCallInput = {
    roomId: Scalars['String'];
    /** SE を設定する場合、これと併せて soundEffectVolume もセットする必要があります。 */
    soundEffectFile?: InputMaybe<FilePathInput>;
    /** SE を設定する場合、これと併せて soundEffectFile もセットする必要があります。 */
    soundEffectVolume?: InputMaybe<Scalars['Float']>;
};
export type PerformRollCallResult = {
    __typename?: 'PerformRollCallResult';
    failureType?: Maybe<PerformRollCallFailureType>;
};
export type PieceLog = {
    __typename?: 'PieceLog';
    createdAt: Scalars['Float'];
    logType: PieceLogType;
    messageId: Scalars['String'];
    stateId: Scalars['String'];
    valueJson: Scalars['String'];
};
export declare enum PieceLogType {
    Dice = "Dice",
    String = "String"
}
export type Pong = {
    __typename?: 'Pong';
    createdBy?: Maybe<Scalars['String']>;
    value: Scalars['Float'];
};
export type Prerelease = {
    __typename?: 'Prerelease';
    type: PrereleaseType;
    version: Scalars['Float'];
};
export declare enum PrereleaseType {
    Alpha = "Alpha",
    Beta = "Beta",
    Rc = "Rc"
}
export declare enum PromoteFailureType {
    NoNeedToPromote = "NoNeedToPromote",
    NotFound = "NotFound",
    NotParticipant = "NotParticipant",
    WrongPassword = "WrongPassword"
}
export type PromoteResult = {
    __typename?: 'PromoteResult';
    failureType?: Maybe<PromoteFailureType>;
};
export type Query = {
    __typename?: 'Query';
    getAvailableGameSystems: GetAvailableGameSystemsResult;
    getDiceHelpMessage?: Maybe<Scalars['String']>;
    getFiles: GetFilesResult;
    getLog: GetRoomLogResult;
    getMessages: GetRoomMessagesResult;
    /** since v0.7.2 */
    getMyRoles: Roles;
    /** 通常はこの Query を直接実行する必要はありません。@flocon-trpg/sdk を用いることで、リアルタイムに Room を取得および自動更新できます。 */
    getRoom: GetRoomResult;
    getRoomAsListItem: GetRoomAsListItemResult;
    /** 通常はこの Query を直接実行する必要はありません。@flocon-trpg/sdk を用いることで、リアルタイムに値を取得および自動更新できます。 */
    getRoomConnections: GetRoomConnectionsResult;
    getRoomsList: GetRoomsListResult;
    getServerInfo: ServerInfo;
    isEntry: Scalars['Boolean'];
};
export type QueryGetDiceHelpMessageArgs = {
    id: Scalars['String'];
};
export type QueryGetFilesArgs = {
    input: GetFilesInput;
};
export type QueryGetLogArgs = {
    roomId: Scalars['String'];
};
export type QueryGetMessagesArgs = {
    roomId: Scalars['String'];
};
export type QueryGetRoomArgs = {
    id: Scalars['String'];
};
export type QueryGetRoomAsListItemArgs = {
    roomId: Scalars['String'];
};
export type QueryGetRoomConnectionsArgs = {
    roomId: Scalars['String'];
};
export type RenameFileInput = {
    filename: Scalars['String'];
    newScreenname: Scalars['String'];
};
export declare enum ResetRoomMessagesFailureType {
    NotAuthorized = "NotAuthorized",
    NotParticipant = "NotParticipant",
    RoomNotFound = "RoomNotFound"
}
export type ResetRoomMessagesResult = {
    __typename?: 'ResetRoomMessagesResult';
    failureType?: Maybe<ResetRoomMessagesFailureType>;
};
export type Roles = {
    __typename?: 'Roles';
    admin: Scalars['Boolean'];
};
export type RoomAsListItem = {
    __typename?: 'RoomAsListItem';
    /** since v0.7.2 */
    createdAt?: Maybe<Scalars['Float']>;
    /** この部屋の作成者。Firebase AuthenticationのUserUidで表現される。 */
    createdBy: Scalars['String'];
    id: Scalars['ID'];
    /** since v0.7.2 */
    isBookmarked: Scalars['Boolean'];
    name: Scalars['String'];
    requiresPlayerPassword: Scalars['Boolean'];
    requiresSpectatorPassword: Scalars['Boolean'];
    /** since v0.7.2 */
    role?: Maybe<ParticipantRole>;
    /**
     * データベースのRoomエンティティが最後に更新された日時。Roomエンティティのみが対象であるため、例えばメッセージの投稿などは反映されないことに注意。
     * since v0.7.2
     */
    updatedAt?: Maybe<Scalars['Float']>;
};
export type RoomConnectionEvent = {
    __typename?: 'RoomConnectionEvent';
    isConnected: Scalars['Boolean'];
    updatedAt: Scalars['Float'];
    userUid: Scalars['String'];
};
export type RoomEvent = {
    __typename?: 'RoomEvent';
    deleteRoomOperation?: Maybe<DeleteRoomOperation>;
    isRoomMessagesResetEvent: Scalars['Boolean'];
    roomConnectionEvent?: Maybe<RoomConnectionEvent>;
    roomMessageEvent?: Maybe<RoomMessageEvent>;
    roomOperation?: Maybe<RoomOperation>;
    writingMessageStatus?: Maybe<WritingMessageStatus>;
};
export type RoomGetState = {
    __typename?: 'RoomGetState';
    /** since v0.7.2 */
    createdAt?: Maybe<Scalars['Float']>;
    /** この部屋の作成者。Firebase AuthenticationのUserUidで表現される。 */
    createdBy: Scalars['String'];
    /** since v0.7.2 */
    isBookmarked: Scalars['Boolean'];
    /** Current revision of Room. Whenever Room is updated, this value is incremented by 1. This value is required when you apply RoomOperation. / Roomの現在のリビジョン。Roomが更新されるたび、この値は1増加する。RoomOperationを適用する際に必要となる。 */
    revision: Scalars['Float'];
    /** since v0.7.2 */
    role?: Maybe<ParticipantRole>;
    /** room.state をJSON化したもの */
    stateJson: Scalars['String'];
    /**
     * データベースのRoomエンティティが最後に更新された日時。Roomエンティティのみが対象であるため、例えばメッセージの投稿などは反映されないことに注意。
     * since v0.7.2
     */
    updatedAt?: Maybe<Scalars['Float']>;
};
export type RoomMessageEvent = PieceLog | RoomMessagesReset | RoomPrivateMessage | RoomPrivateMessageUpdate | RoomPublicChannel | RoomPublicChannelUpdate | RoomPublicMessage | RoomPublicMessageUpdate | RoomSoundEffect;
export type RoomMessageSyntaxError = {
    __typename?: 'RoomMessageSyntaxError';
    errorMessage: Scalars['String'];
};
export type RoomMessages = {
    __typename?: 'RoomMessages';
    pieceLogs: Array<PieceLog>;
    privateMessages: Array<RoomPrivateMessage>;
    publicChannels: Array<RoomPublicChannel>;
    publicMessages: Array<RoomPublicMessage>;
    soundEffects: Array<RoomSoundEffect>;
};
export type RoomMessagesReset = {
    __typename?: 'RoomMessagesReset';
    publicMessagesDeleted: Scalars['Boolean'];
};
export type RoomOperation = {
    __typename?: 'RoomOperation';
    /** operateRoomを呼んだ人物。promoteなどの結果の場合はnullishになる。 */
    operatedBy?: Maybe<OperatedBy>;
    revisionTo: Scalars['Float'];
    /** room.upOperationをJSONにしたもの。idならばnullish。 */
    valueJson: Scalars['String'];
};
export type RoomOperationInput = {
    /** クライアントを識別するID。適当なIDをクライアント側で生成して渡す。Operationごとに変える必要はない */
    clientId: Scalars['String'];
    /** room.upOperationをJSONにしたもの */
    valueJson: Scalars['String'];
};
export type RoomPrivateMessage = {
    __typename?: 'RoomPrivateMessage';
    altTextToSecret?: Maybe<Scalars['String']>;
    /** 発言がCharacterと紐付いているときはnon-nullish。PLとしての発言、もしくはcreatedByがnullishのときはnullish。後からCharacterの値が更新されても、この値が更新されることはない。 */
    character?: Maybe<CharacterValueForMessage>;
    commandResult?: Maybe<CommandResult>;
    createdAt: Scalars['Float'];
    createdBy?: Maybe<Scalars['String']>;
    customName?: Maybe<Scalars['String']>;
    initText?: Maybe<Scalars['String']>;
    initTextSource?: Maybe<Scalars['String']>;
    isSecret: Scalars['Boolean'];
    messageId: Scalars['String'];
    textColor?: Maybe<Scalars['String']>;
    updatedAt?: Maybe<Scalars['Float']>;
    updatedText?: Maybe<UpdatedText>;
    visibleTo: Array<Scalars['String']>;
};
export type RoomPrivateMessageUpdate = {
    __typename?: 'RoomPrivateMessageUpdate';
    altTextToSecret?: Maybe<Scalars['String']>;
    commandResult?: Maybe<CommandResult>;
    initText?: Maybe<Scalars['String']>;
    initTextSource?: Maybe<Scalars['String']>;
    isSecret: Scalars['Boolean'];
    messageId: Scalars['String'];
    updatedAt?: Maybe<Scalars['Float']>;
    updatedText?: Maybe<UpdatedText>;
};
export type RoomPublicChannel = {
    __typename?: 'RoomPublicChannel';
    /** 現在の仕様では、$system, $free, '1', … , '10' の12個のみをサポートしている。このうち、$systemはシステムメッセージ専用チャンネルであるため誰も書き込むことができない。'1', …, '10'はSpectatorが書き込むことはできないが、$freeはSpectatorも書き込むことができる。 */
    key: Scalars['String'];
    name?: Maybe<Scalars['String']>;
};
export type RoomPublicChannelUpdate = {
    __typename?: 'RoomPublicChannelUpdate';
    key: Scalars['String'];
    name?: Maybe<Scalars['String']>;
};
export type RoomPublicMessage = {
    __typename?: 'RoomPublicMessage';
    altTextToSecret?: Maybe<Scalars['String']>;
    channelKey: Scalars['String'];
    /** 発言がCharacterと紐付いているときはnon-nullish。PLとしての発言、もしくはcreatedByがnullishのときはnullish。 */
    character?: Maybe<CharacterValueForMessage>;
    commandResult?: Maybe<CommandResult>;
    createdAt: Scalars['Float'];
    /** channelKeyが$system以外のときは、システムメッセージならばnullishで、そうでないならばnullishではない。$systemのとき、原則として全てシステムメッセージであるため常にnullishになる。 */
    createdBy?: Maybe<Scalars['String']>;
    customName?: Maybe<Scalars['String']>;
    initText?: Maybe<Scalars['String']>;
    initTextSource?: Maybe<Scalars['String']>;
    isSecret: Scalars['Boolean'];
    messageId: Scalars['String'];
    textColor?: Maybe<Scalars['String']>;
    updatedAt?: Maybe<Scalars['Float']>;
    updatedText?: Maybe<UpdatedText>;
};
export type RoomPublicMessageUpdate = {
    __typename?: 'RoomPublicMessageUpdate';
    altTextToSecret?: Maybe<Scalars['String']>;
    commandResult?: Maybe<CommandResult>;
    initText?: Maybe<Scalars['String']>;
    initTextSource?: Maybe<Scalars['String']>;
    isSecret: Scalars['Boolean'];
    messageId: Scalars['String'];
    updatedAt?: Maybe<Scalars['Float']>;
    updatedText?: Maybe<UpdatedText>;
};
export type RoomSoundEffect = {
    __typename?: 'RoomSoundEffect';
    createdAt: Scalars['Float'];
    createdBy?: Maybe<Scalars['String']>;
    file: FilePath;
    messageId: Scalars['String'];
    volume: Scalars['Float'];
};
export type SemVer = {
    __typename?: 'SemVer';
    major: Scalars['Float'];
    minor: Scalars['Float'];
    patch: Scalars['Float'];
    prerelease?: Maybe<Prerelease>;
};
export type ServerInfo = {
    __typename?: 'ServerInfo';
    uploaderEnabled: Scalars['Boolean'];
    version: SemVer;
};
export type Subscription = {
    __typename?: 'Subscription';
    /** GraphQL の動作テストに用いられます。3rd-party の Web サーバーを作成する際は利用しなくて構いません。 */
    pong: Pong;
    /** この Subscription を直接実行することは非推奨です。代わりに @flocon-trpg/sdk を用いてください。 */
    roomEvent?: Maybe<RoomEvent>;
};
export type SubscriptionRoomEventArgs = {
    id: Scalars['String'];
};
export type UpdateBookmarkFailureResult = {
    __typename?: 'UpdateBookmarkFailureResult';
    failureType: UpdateBookmarkFailureType;
};
export declare enum UpdateBookmarkFailureType {
    NotFound = "NotFound"
}
export type UpdateBookmarkResult = UpdateBookmarkFailureResult | UpdateBookmarkSuccessResult;
export type UpdateBookmarkSuccessResult = {
    __typename?: 'UpdateBookmarkSuccessResult';
    currentValue: Scalars['Boolean'];
    prevValue: Scalars['Boolean'];
};
export type UpdatedText = {
    __typename?: 'UpdatedText';
    currentText?: Maybe<Scalars['String']>;
    updatedAt: Scalars['Float'];
};
export type WriteRoomPrivateMessageFailureResult = {
    __typename?: 'WriteRoomPrivateMessageFailureResult';
    failureType: WriteRoomPrivateMessageFailureType;
};
export declare enum WriteRoomPrivateMessageFailureType {
    NotParticipant = "NotParticipant",
    RoomNotFound = "RoomNotFound",
    SyntaxError = "SyntaxError",
    VisibleToIsInvalid = "VisibleToIsInvalid"
}
export type WriteRoomPrivateMessageResult = RoomMessageSyntaxError | RoomPrivateMessage | WriteRoomPrivateMessageFailureResult;
export type WriteRoomPublicMessageFailureResult = {
    __typename?: 'WriteRoomPublicMessageFailureResult';
    failureType: WriteRoomPublicMessageFailureType;
};
export declare enum WriteRoomPublicMessageFailureType {
    NotAllowedChannelKey = "NotAllowedChannelKey",
    NotAuthorized = "NotAuthorized",
    NotParticipant = "NotParticipant",
    RoomNotFound = "RoomNotFound",
    SyntaxError = "SyntaxError"
}
export type WriteRoomPublicMessageResult = RoomMessageSyntaxError | RoomPublicMessage | WriteRoomPublicMessageFailureResult;
export type WriteRoomSoundEffectFailureResult = {
    __typename?: 'WriteRoomSoundEffectFailureResult';
    failureType: WriteRoomSoundEffectFailureType;
};
export declare enum WriteRoomSoundEffectFailureType {
    NotAuthorized = "NotAuthorized",
    NotParticipant = "NotParticipant",
    RoomNotFound = "RoomNotFound"
}
export type WriteRoomSoundEffectResult = RoomSoundEffect | WriteRoomSoundEffectFailureResult;
export type WritingMessageStatus = {
    __typename?: 'WritingMessageStatus';
    status: WritingMessageStatusType;
    updatedAt: Scalars['Float'];
    userUid: Scalars['String'];
};
export declare enum WritingMessageStatusInputType {
    Cleared = "Cleared",
    KeepWriting = "KeepWriting",
    StartWriting = "StartWriting"
}
export declare enum WritingMessageStatusType {
    Cleared = "Cleared",
    Disconnected = "Disconnected",
    Submit = "Submit",
    Writing = "Writing"
}
export type CharacterValueForMessageFragment = {
    __typename?: 'CharacterValueForMessage';
    stateId: string;
    isPrivate: boolean;
    name: string;
    image?: {
        __typename?: 'FilePath';
        sourceType: FileSourceType;
        path: string;
    } | null;
    portraitImage?: {
        __typename?: 'FilePath';
        sourceType: FileSourceType;
        path: string;
    } | null;
};
type CreateRoomResult_CreateRoomFailureResult_Fragment = {
    __typename: 'CreateRoomFailureResult';
    failureType: CreateRoomFailureType;
};
type CreateRoomResult_CreateRoomSuccessResult_Fragment = {
    __typename: 'CreateRoomSuccessResult';
    id: string;
    room: {
        __typename?: 'RoomGetState';
        revision: number;
        createdBy: string;
        createdAt?: number | null;
        updatedAt?: number | null;
        role?: ParticipantRole | null;
        isBookmarked: boolean;
        stateJson: string;
    };
};
export type CreateRoomResultFragment = CreateRoomResult_CreateRoomFailureResult_Fragment | CreateRoomResult_CreateRoomSuccessResult_Fragment;
export type FileItemFragment = {
    __typename?: 'FileItem';
    filename: string;
    thumbFilename?: string | null;
    screenname: string;
    createdBy: string;
    createdAt?: number | null;
    listType: FileListType;
};
export type FilePathFragment = {
    __typename?: 'FilePath';
    sourceType: FileSourceType;
    path: string;
};
export type FileTagFragment = {
    __typename?: 'FileTag';
    id: string;
    name: string;
};
export type GetNonJoinedRoomResultFragment = {
    __typename?: 'GetNonJoinedRoomResult';
    roomAsListItem: {
        __typename?: 'RoomAsListItem';
        id: string;
        name: string;
        createdBy: string;
        createdAt?: number | null;
        updatedAt?: number | null;
        role?: ParticipantRole | null;
        isBookmarked: boolean;
        requiresPlayerPassword: boolean;
        requiresSpectatorPassword: boolean;
    };
};
type GetRoomListResult_GetRoomsListFailureResult_Fragment = {
    __typename: 'GetRoomsListFailureResult';
    failureType: GetRoomFailureType;
};
type GetRoomListResult_GetRoomsListSuccessResult_Fragment = {
    __typename: 'GetRoomsListSuccessResult';
    rooms: Array<{
        __typename?: 'RoomAsListItem';
        id: string;
        name: string;
        createdBy: string;
        createdAt?: number | null;
        updatedAt?: number | null;
        role?: ParticipantRole | null;
        isBookmarked: boolean;
        requiresPlayerPassword: boolean;
        requiresSpectatorPassword: boolean;
    }>;
};
export type GetRoomListResultFragment = GetRoomListResult_GetRoomsListFailureResult_Fragment | GetRoomListResult_GetRoomsListSuccessResult_Fragment;
type GetRoomResult_GetJoinedRoomResult_Fragment = {
    __typename: 'GetJoinedRoomResult';
    role: ParticipantRole;
    room: {
        __typename?: 'RoomGetState';
        revision: number;
        createdBy: string;
        createdAt?: number | null;
        updatedAt?: number | null;
        role?: ParticipantRole | null;
        isBookmarked: boolean;
        stateJson: string;
    };
};
type GetRoomResult_GetNonJoinedRoomResult_Fragment = {
    __typename: 'GetNonJoinedRoomResult';
    roomAsListItem: {
        __typename?: 'RoomAsListItem';
        id: string;
        name: string;
        createdBy: string;
        createdAt?: number | null;
        updatedAt?: number | null;
        role?: ParticipantRole | null;
        isBookmarked: boolean;
        requiresPlayerPassword: boolean;
        requiresSpectatorPassword: boolean;
    };
};
type GetRoomResult_GetRoomFailureResult_Fragment = {
    __typename: 'GetRoomFailureResult';
    failureType: GetRoomFailureType;
};
export type GetRoomResultFragment = GetRoomResult_GetJoinedRoomResult_Fragment | GetRoomResult_GetNonJoinedRoomResult_Fragment | GetRoomResult_GetRoomFailureResult_Fragment;
type JoinRoomResult_JoinRoomFailureResult_Fragment = {
    __typename: 'JoinRoomFailureResult';
    failureType: JoinRoomFailureType;
};
type JoinRoomResult_JoinRoomSuccessResult_Fragment = {
    __typename: 'JoinRoomSuccessResult';
    operation?: {
        __typename?: 'RoomOperation';
        revisionTo: number;
        valueJson: string;
        operatedBy?: {
            __typename?: 'OperatedBy';
            userUid: string;
            clientId: string;
        } | null;
    } | null;
};
export type JoinRoomResultFragment = JoinRoomResult_JoinRoomFailureResult_Fragment | JoinRoomResult_JoinRoomSuccessResult_Fragment;
export type PieceLogFragment = {
    __typename?: 'PieceLog';
    messageId: string;
    stateId: string;
    createdAt: number;
    logType: PieceLogType;
    valueJson: string;
};
export type RoomAsListItemFragment = {
    __typename?: 'RoomAsListItem';
    id: string;
    name: string;
    createdBy: string;
    createdAt?: number | null;
    updatedAt?: number | null;
    role?: ParticipantRole | null;
    isBookmarked: boolean;
    requiresPlayerPassword: boolean;
    requiresSpectatorPassword: boolean;
};
export type RoomGetStateFragment = {
    __typename?: 'RoomGetState';
    revision: number;
    createdBy: string;
    createdAt?: number | null;
    updatedAt?: number | null;
    role?: ParticipantRole | null;
    isBookmarked: boolean;
    stateJson: string;
};
export type RoomOperationFragment = {
    __typename?: 'RoomOperation';
    revisionTo: number;
    valueJson: string;
    operatedBy?: {
        __typename?: 'OperatedBy';
        userUid: string;
        clientId: string;
    } | null;
};
export type RoomPublicChannelFragment = {
    __typename?: 'RoomPublicChannel';
    key: string;
    name?: string | null;
};
export type RoomPublicMessageFragment = {
    __typename?: 'RoomPublicMessage';
    messageId: string;
    channelKey: string;
    initText?: string | null;
    initTextSource?: string | null;
    textColor?: string | null;
    altTextToSecret?: string | null;
    isSecret: boolean;
    createdBy?: string | null;
    customName?: string | null;
    createdAt: number;
    updatedAt?: number | null;
    updatedText?: {
        __typename?: 'UpdatedText';
        currentText?: string | null;
        updatedAt: number;
    } | null;
    commandResult?: {
        __typename?: 'CommandResult';
        text: string;
        isSuccess?: boolean | null;
    } | null;
    character?: {
        __typename?: 'CharacterValueForMessage';
        stateId: string;
        isPrivate: boolean;
        name: string;
        image?: {
            __typename?: 'FilePath';
            sourceType: FileSourceType;
            path: string;
        } | null;
        portraitImage?: {
            __typename?: 'FilePath';
            sourceType: FileSourceType;
            path: string;
        } | null;
    } | null;
};
export type RoomPrivateMessageFragment = {
    __typename?: 'RoomPrivateMessage';
    messageId: string;
    visibleTo: Array<string>;
    initText?: string | null;
    initTextSource?: string | null;
    textColor?: string | null;
    altTextToSecret?: string | null;
    isSecret: boolean;
    createdBy?: string | null;
    customName?: string | null;
    createdAt: number;
    updatedAt?: number | null;
    updatedText?: {
        __typename?: 'UpdatedText';
        currentText?: string | null;
        updatedAt: number;
    } | null;
    commandResult?: {
        __typename?: 'CommandResult';
        text: string;
        isSuccess?: boolean | null;
    } | null;
    character?: {
        __typename?: 'CharacterValueForMessage';
        stateId: string;
        isPrivate: boolean;
        name: string;
        image?: {
            __typename?: 'FilePath';
            sourceType: FileSourceType;
            path: string;
        } | null;
        portraitImage?: {
            __typename?: 'FilePath';
            sourceType: FileSourceType;
            path: string;
        } | null;
    } | null;
};
export type RoomSoundEffectFragment = {
    __typename?: 'RoomSoundEffect';
    messageId: string;
    createdBy?: string | null;
    createdAt: number;
    volume: number;
    file: {
        __typename?: 'FilePath';
        sourceType: FileSourceType;
        path: string;
    };
};
type RoomMessageEvent_PieceLog_Fragment = {
    __typename: 'PieceLog';
    messageId: string;
    stateId: string;
    createdAt: number;
    logType: PieceLogType;
    valueJson: string;
};
type RoomMessageEvent_RoomMessagesReset_Fragment = {
    __typename: 'RoomMessagesReset';
};
type RoomMessageEvent_RoomPrivateMessage_Fragment = {
    __typename: 'RoomPrivateMessage';
    messageId: string;
    visibleTo: Array<string>;
    initText?: string | null;
    initTextSource?: string | null;
    textColor?: string | null;
    altTextToSecret?: string | null;
    isSecret: boolean;
    createdBy?: string | null;
    customName?: string | null;
    createdAt: number;
    updatedAt?: number | null;
    updatedText?: {
        __typename?: 'UpdatedText';
        currentText?: string | null;
        updatedAt: number;
    } | null;
    commandResult?: {
        __typename?: 'CommandResult';
        text: string;
        isSuccess?: boolean | null;
    } | null;
    character?: {
        __typename?: 'CharacterValueForMessage';
        stateId: string;
        isPrivate: boolean;
        name: string;
        image?: {
            __typename?: 'FilePath';
            sourceType: FileSourceType;
            path: string;
        } | null;
        portraitImage?: {
            __typename?: 'FilePath';
            sourceType: FileSourceType;
            path: string;
        } | null;
    } | null;
};
type RoomMessageEvent_RoomPrivateMessageUpdate_Fragment = {
    __typename: 'RoomPrivateMessageUpdate';
    messageId: string;
    initText?: string | null;
    initTextSource?: string | null;
    altTextToSecret?: string | null;
    isSecret: boolean;
    updatedAt?: number | null;
    updatedText?: {
        __typename?: 'UpdatedText';
        currentText?: string | null;
        updatedAt: number;
    } | null;
    commandResult?: {
        __typename?: 'CommandResult';
        text: string;
        isSuccess?: boolean | null;
    } | null;
};
type RoomMessageEvent_RoomPublicChannel_Fragment = {
    __typename: 'RoomPublicChannel';
    key: string;
    name?: string | null;
};
type RoomMessageEvent_RoomPublicChannelUpdate_Fragment = {
    __typename: 'RoomPublicChannelUpdate';
    key: string;
    name?: string | null;
};
type RoomMessageEvent_RoomPublicMessage_Fragment = {
    __typename: 'RoomPublicMessage';
    messageId: string;
    channelKey: string;
    initText?: string | null;
    initTextSource?: string | null;
    textColor?: string | null;
    altTextToSecret?: string | null;
    isSecret: boolean;
    createdBy?: string | null;
    customName?: string | null;
    createdAt: number;
    updatedAt?: number | null;
    updatedText?: {
        __typename?: 'UpdatedText';
        currentText?: string | null;
        updatedAt: number;
    } | null;
    commandResult?: {
        __typename?: 'CommandResult';
        text: string;
        isSuccess?: boolean | null;
    } | null;
    character?: {
        __typename?: 'CharacterValueForMessage';
        stateId: string;
        isPrivate: boolean;
        name: string;
        image?: {
            __typename?: 'FilePath';
            sourceType: FileSourceType;
            path: string;
        } | null;
        portraitImage?: {
            __typename?: 'FilePath';
            sourceType: FileSourceType;
            path: string;
        } | null;
    } | null;
};
type RoomMessageEvent_RoomPublicMessageUpdate_Fragment = {
    __typename: 'RoomPublicMessageUpdate';
    messageId: string;
    initText?: string | null;
    initTextSource?: string | null;
    altTextToSecret?: string | null;
    isSecret: boolean;
    updatedAt?: number | null;
    updatedText?: {
        __typename?: 'UpdatedText';
        currentText?: string | null;
        updatedAt: number;
    } | null;
    commandResult?: {
        __typename?: 'CommandResult';
        text: string;
        isSuccess?: boolean | null;
    } | null;
};
type RoomMessageEvent_RoomSoundEffect_Fragment = {
    __typename: 'RoomSoundEffect';
    messageId: string;
    createdBy?: string | null;
    createdAt: number;
    volume: number;
    file: {
        __typename?: 'FilePath';
        sourceType: FileSourceType;
        path: string;
    };
};
export type RoomMessageEventFragment = RoomMessageEvent_PieceLog_Fragment | RoomMessageEvent_RoomMessagesReset_Fragment | RoomMessageEvent_RoomPrivateMessage_Fragment | RoomMessageEvent_RoomPrivateMessageUpdate_Fragment | RoomMessageEvent_RoomPublicChannel_Fragment | RoomMessageEvent_RoomPublicChannelUpdate_Fragment | RoomMessageEvent_RoomPublicMessage_Fragment | RoomMessageEvent_RoomPublicMessageUpdate_Fragment | RoomMessageEvent_RoomSoundEffect_Fragment;
export type SemVerFragment = {
    __typename?: 'SemVer';
    major: number;
    minor: number;
    patch: number;
    prerelease?: {
        __typename?: 'Prerelease';
        type: PrereleaseType;
        version: number;
    } | null;
};
export type GetAvailableGameSystemsQueryVariables = Exact<{
    [key: string]: never;
}>;
export type GetAvailableGameSystemsQuery = {
    __typename?: 'Query';
    result: {
        __typename?: 'GetAvailableGameSystemsResult';
        value: Array<{
            __typename?: 'AvailableGameSystem';
            id: string;
            name: string;
            sortKey: string;
        }>;
    };
};
export type GetDiceHelpMessagesQueryVariables = Exact<{
    id: Scalars['String'];
}>;
export type GetDiceHelpMessagesQuery = {
    __typename?: 'Query';
    result?: string | null;
};
export type GetFilesQueryVariables = Exact<{
    input: GetFilesInput;
}>;
export type GetFilesQuery = {
    __typename?: 'Query';
    result: {
        __typename?: 'GetFilesResult';
        files: Array<{
            __typename?: 'FileItem';
            filename: string;
            thumbFilename?: string | null;
            screenname: string;
            createdBy: string;
            createdAt?: number | null;
            listType: FileListType;
        }>;
    };
};
export type GetRoomQueryVariables = Exact<{
    id: Scalars['String'];
}>;
export type GetRoomQuery = {
    __typename?: 'Query';
    result: {
        __typename: 'GetJoinedRoomResult';
        role: ParticipantRole;
        room: {
            __typename?: 'RoomGetState';
            revision: number;
            createdBy: string;
            createdAt?: number | null;
            updatedAt?: number | null;
            role?: ParticipantRole | null;
            isBookmarked: boolean;
            stateJson: string;
        };
    } | {
        __typename: 'GetNonJoinedRoomResult';
        roomAsListItem: {
            __typename?: 'RoomAsListItem';
            id: string;
            name: string;
            createdBy: string;
            createdAt?: number | null;
            updatedAt?: number | null;
            role?: ParticipantRole | null;
            isBookmarked: boolean;
            requiresPlayerPassword: boolean;
            requiresSpectatorPassword: boolean;
        };
    } | {
        __typename: 'GetRoomFailureResult';
        failureType: GetRoomFailureType;
    };
};
export type GetRoomsListQueryVariables = Exact<{
    [key: string]: never;
}>;
export type GetRoomsListQuery = {
    __typename?: 'Query';
    result: {
        __typename: 'GetRoomsListFailureResult';
        failureType: GetRoomFailureType;
    } | {
        __typename: 'GetRoomsListSuccessResult';
        rooms: Array<{
            __typename?: 'RoomAsListItem';
            id: string;
            name: string;
            createdBy: string;
            createdAt?: number | null;
            updatedAt?: number | null;
            role?: ParticipantRole | null;
            isBookmarked: boolean;
            requiresPlayerPassword: boolean;
            requiresSpectatorPassword: boolean;
        }>;
    };
};
export type GetMessagesQueryVariables = Exact<{
    roomId: Scalars['String'];
}>;
export type GetMessagesQuery = {
    __typename?: 'Query';
    result: {
        __typename: 'GetRoomMessagesFailureResult';
        failureType: GetRoomMessagesFailureType;
    } | {
        __typename: 'RoomMessages';
        publicMessages: Array<{
            __typename?: 'RoomPublicMessage';
            messageId: string;
            channelKey: string;
            initText?: string | null;
            initTextSource?: string | null;
            textColor?: string | null;
            altTextToSecret?: string | null;
            isSecret: boolean;
            createdBy?: string | null;
            customName?: string | null;
            createdAt: number;
            updatedAt?: number | null;
            updatedText?: {
                __typename?: 'UpdatedText';
                currentText?: string | null;
                updatedAt: number;
            } | null;
            commandResult?: {
                __typename?: 'CommandResult';
                text: string;
                isSuccess?: boolean | null;
            } | null;
            character?: {
                __typename?: 'CharacterValueForMessage';
                stateId: string;
                isPrivate: boolean;
                name: string;
                image?: {
                    __typename?: 'FilePath';
                    sourceType: FileSourceType;
                    path: string;
                } | null;
                portraitImage?: {
                    __typename?: 'FilePath';
                    sourceType: FileSourceType;
                    path: string;
                } | null;
            } | null;
        }>;
        privateMessages: Array<{
            __typename?: 'RoomPrivateMessage';
            messageId: string;
            visibleTo: Array<string>;
            initText?: string | null;
            initTextSource?: string | null;
            textColor?: string | null;
            altTextToSecret?: string | null;
            isSecret: boolean;
            createdBy?: string | null;
            customName?: string | null;
            createdAt: number;
            updatedAt?: number | null;
            updatedText?: {
                __typename?: 'UpdatedText';
                currentText?: string | null;
                updatedAt: number;
            } | null;
            commandResult?: {
                __typename?: 'CommandResult';
                text: string;
                isSuccess?: boolean | null;
            } | null;
            character?: {
                __typename?: 'CharacterValueForMessage';
                stateId: string;
                isPrivate: boolean;
                name: string;
                image?: {
                    __typename?: 'FilePath';
                    sourceType: FileSourceType;
                    path: string;
                } | null;
                portraitImage?: {
                    __typename?: 'FilePath';
                    sourceType: FileSourceType;
                    path: string;
                } | null;
            } | null;
        }>;
        pieceLogs: Array<{
            __typename?: 'PieceLog';
            messageId: string;
            stateId: string;
            createdAt: number;
            logType: PieceLogType;
            valueJson: string;
        }>;
        publicChannels: Array<{
            __typename?: 'RoomPublicChannel';
            key: string;
            name?: string | null;
        }>;
        soundEffects: Array<{
            __typename?: 'RoomSoundEffect';
            messageId: string;
            createdBy?: string | null;
            createdAt: number;
            volume: number;
            file: {
                __typename?: 'FilePath';
                sourceType: FileSourceType;
                path: string;
            };
        }>;
    };
};
export type GetLogQueryVariables = Exact<{
    roomId: Scalars['String'];
}>;
export type GetLogQuery = {
    __typename?: 'Query';
    result: {
        __typename: 'GetRoomLogFailureResult';
        failureType: GetRoomLogFailureType;
    } | {
        __typename: 'RoomMessages';
        publicMessages: Array<{
            __typename?: 'RoomPublicMessage';
            messageId: string;
            channelKey: string;
            initText?: string | null;
            initTextSource?: string | null;
            textColor?: string | null;
            altTextToSecret?: string | null;
            isSecret: boolean;
            createdBy?: string | null;
            customName?: string | null;
            createdAt: number;
            updatedAt?: number | null;
            updatedText?: {
                __typename?: 'UpdatedText';
                currentText?: string | null;
                updatedAt: number;
            } | null;
            commandResult?: {
                __typename?: 'CommandResult';
                text: string;
                isSuccess?: boolean | null;
            } | null;
            character?: {
                __typename?: 'CharacterValueForMessage';
                stateId: string;
                isPrivate: boolean;
                name: string;
                image?: {
                    __typename?: 'FilePath';
                    sourceType: FileSourceType;
                    path: string;
                } | null;
                portraitImage?: {
                    __typename?: 'FilePath';
                    sourceType: FileSourceType;
                    path: string;
                } | null;
            } | null;
        }>;
        privateMessages: Array<{
            __typename?: 'RoomPrivateMessage';
            messageId: string;
            visibleTo: Array<string>;
            initText?: string | null;
            initTextSource?: string | null;
            textColor?: string | null;
            altTextToSecret?: string | null;
            isSecret: boolean;
            createdBy?: string | null;
            customName?: string | null;
            createdAt: number;
            updatedAt?: number | null;
            updatedText?: {
                __typename?: 'UpdatedText';
                currentText?: string | null;
                updatedAt: number;
            } | null;
            commandResult?: {
                __typename?: 'CommandResult';
                text: string;
                isSuccess?: boolean | null;
            } | null;
            character?: {
                __typename?: 'CharacterValueForMessage';
                stateId: string;
                isPrivate: boolean;
                name: string;
                image?: {
                    __typename?: 'FilePath';
                    sourceType: FileSourceType;
                    path: string;
                } | null;
                portraitImage?: {
                    __typename?: 'FilePath';
                    sourceType: FileSourceType;
                    path: string;
                } | null;
            } | null;
        }>;
        pieceLogs: Array<{
            __typename?: 'PieceLog';
            messageId: string;
            stateId: string;
            createdAt: number;
            logType: PieceLogType;
            valueJson: string;
        }>;
        publicChannels: Array<{
            __typename?: 'RoomPublicChannel';
            key: string;
            name?: string | null;
        }>;
        soundEffects: Array<{
            __typename?: 'RoomSoundEffect';
            messageId: string;
            createdBy?: string | null;
            createdAt: number;
            volume: number;
            file: {
                __typename?: 'FilePath';
                sourceType: FileSourceType;
                path: string;
            };
        }>;
    };
};
export type GetMyRolesQueryVariables = Exact<{
    [key: string]: never;
}>;
export type GetMyRolesQuery = {
    __typename?: 'Query';
    result: {
        __typename?: 'Roles';
        admin: boolean;
    };
};
export type GetRoomConnectionsQueryVariables = Exact<{
    roomId: Scalars['String'];
}>;
export type GetRoomConnectionsQuery = {
    __typename?: 'Query';
    result: {
        __typename: 'GetRoomConnectionsFailureResult';
        failureType: GetRoomConnectionFailureType;
    } | {
        __typename: 'GetRoomConnectionsSuccessResult';
        fetchedAt: number;
        connectedUserUids: Array<string>;
    };
};
export type GetServerInfoQueryVariables = Exact<{
    [key: string]: never;
}>;
export type GetServerInfoQuery = {
    __typename?: 'Query';
    result: {
        __typename?: 'ServerInfo';
        uploaderEnabled: boolean;
        version: {
            __typename?: 'SemVer';
            major: number;
            minor: number;
            patch: number;
            prerelease?: {
                __typename?: 'Prerelease';
                type: PrereleaseType;
                version: number;
            } | null;
        };
    };
};
export type IsEntryQueryVariables = Exact<{
    [key: string]: never;
}>;
export type IsEntryQuery = {
    __typename?: 'Query';
    result: boolean;
};
export type GetRoomAsListItemQueryVariables = Exact<{
    roomId: Scalars['String'];
}>;
export type GetRoomAsListItemQuery = {
    __typename?: 'Query';
    result: {
        __typename: 'GetRoomAsListItemFailureResult';
        failureType: GetRoomFailureType;
    } | {
        __typename: 'GetRoomAsListItemSuccessResult';
        room: {
            __typename?: 'RoomAsListItem';
            id: string;
            name: string;
            createdBy: string;
            createdAt?: number | null;
            updatedAt?: number | null;
            role?: ParticipantRole | null;
            isBookmarked: boolean;
            requiresPlayerPassword: boolean;
            requiresSpectatorPassword: boolean;
        };
    };
};
export type AnswerRollCallMutationVariables = Exact<{
    roomId: Scalars['String'];
    rollCallId: Scalars['String'];
    answer: Scalars['Boolean'];
}>;
export type AnswerRollCallMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'AnswerRollCallResult';
        failureType?: AnswerRollCallFailureType | null;
    };
};
export type CreateFileTagMutationVariables = Exact<{
    tagName: Scalars['String'];
}>;
export type CreateFileTagMutation = {
    __typename?: 'Mutation';
    result?: {
        __typename?: 'FileTag';
        id: string;
        name: string;
    } | null;
};
export type ChangeParticipantNameMutationVariables = Exact<{
    roomId: Scalars['String'];
    newName: Scalars['String'];
}>;
export type ChangeParticipantNameMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'ChangeParticipantNameResult';
        failureType?: ChangeParticipantNameFailureType | null;
    };
};
export type CloseRollCallMutationVariables = Exact<{
    roomId: Scalars['String'];
    rollCallId: Scalars['String'];
}>;
export type CloseRollCallMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'CloseRollCallResult';
        failureType?: CloseRollCallFailureType | null;
    };
};
export type CreateRoomMutationVariables = Exact<{
    input: CreateRoomInput;
}>;
export type CreateRoomMutation = {
    __typename?: 'Mutation';
    result: {
        __typename: 'CreateRoomFailureResult';
        failureType: CreateRoomFailureType;
    } | {
        __typename: 'CreateRoomSuccessResult';
        id: string;
        room: {
            __typename?: 'RoomGetState';
            revision: number;
            createdBy: string;
            createdAt?: number | null;
            updatedAt?: number | null;
            role?: ParticipantRole | null;
            isBookmarked: boolean;
            stateJson: string;
        };
    };
};
export type DeleteFilesMutationVariables = Exact<{
    filenames: Array<Scalars['String']> | Scalars['String'];
}>;
export type DeleteFilesMutation = {
    __typename?: 'Mutation';
    result: Array<string>;
};
export type DeleteFileTagMutationVariables = Exact<{
    tagId: Scalars['String'];
}>;
export type DeleteFileTagMutation = {
    __typename?: 'Mutation';
    result: boolean;
};
export type DeleteRoomMutationVariables = Exact<{
    id: Scalars['String'];
}>;
export type DeleteRoomMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'DeleteRoomResult';
        failureType?: DeleteRoomFailureType | null;
    };
};
export type DeleteRoomAsAdminMutationVariables = Exact<{
    id: Scalars['String'];
}>;
export type DeleteRoomAsAdminMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'DeleteRoomAsAdminResult';
        failureType?: DeleteRoomAsAdminFailureType | null;
    };
};
export type EditFileTagsMutationVariables = Exact<{
    input: EditFileTagsInput;
}>;
export type EditFileTagsMutation = {
    __typename?: 'Mutation';
    result: boolean;
};
export type JoinRoomAsPlayerMutationVariables = Exact<{
    id: Scalars['String'];
    name: Scalars['String'];
    password?: InputMaybe<Scalars['String']>;
}>;
export type JoinRoomAsPlayerMutation = {
    __typename?: 'Mutation';
    result: {
        __typename: 'JoinRoomFailureResult';
        failureType: JoinRoomFailureType;
    } | {
        __typename: 'JoinRoomSuccessResult';
        operation?: {
            __typename?: 'RoomOperation';
            revisionTo: number;
            valueJson: string;
            operatedBy?: {
                __typename?: 'OperatedBy';
                userUid: string;
                clientId: string;
            } | null;
        } | null;
    };
};
export type JoinRoomAsSpectatorMutationVariables = Exact<{
    id: Scalars['String'];
    name: Scalars['String'];
    password?: InputMaybe<Scalars['String']>;
}>;
export type JoinRoomAsSpectatorMutation = {
    __typename?: 'Mutation';
    result: {
        __typename: 'JoinRoomFailureResult';
        failureType: JoinRoomFailureType;
    } | {
        __typename: 'JoinRoomSuccessResult';
        operation?: {
            __typename?: 'RoomOperation';
            revisionTo: number;
            valueJson: string;
            operatedBy?: {
                __typename?: 'OperatedBy';
                userUid: string;
                clientId: string;
            } | null;
        } | null;
    };
};
export type EntryToServerMutationVariables = Exact<{
    password: Scalars['String'];
}>;
export type EntryToServerMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'EntryToServerResult';
        type: EntryToServerResultType;
    };
};
export type LeaveRoomMutationVariables = Exact<{
    id: Scalars['String'];
}>;
export type LeaveRoomMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'LeaveRoomResult';
        failureType?: LeaveRoomFailureType | null;
    };
};
export type OperateMutationVariables = Exact<{
    id: Scalars['String'];
    revisionFrom: Scalars['Int'];
    operation: RoomOperationInput;
    requestId: Scalars['String'];
}>;
export type OperateMutation = {
    __typename?: 'Mutation';
    result: {
        __typename: 'OperateRoomFailureResult';
        failureType: OperateRoomFailureType;
    } | {
        __typename: 'OperateRoomIdResult';
        requestId: string;
    } | {
        __typename: 'OperateRoomNonJoinedResult';
        roomAsListItem: {
            __typename?: 'RoomAsListItem';
            id: string;
            name: string;
            createdBy: string;
            createdAt?: number | null;
            updatedAt?: number | null;
            role?: ParticipantRole | null;
            isBookmarked: boolean;
            requiresPlayerPassword: boolean;
            requiresSpectatorPassword: boolean;
        };
    } | {
        __typename: 'OperateRoomSuccessResult';
        operation: {
            __typename?: 'RoomOperation';
            revisionTo: number;
            valueJson: string;
            operatedBy?: {
                __typename?: 'OperatedBy';
                userUid: string;
                clientId: string;
            } | null;
        };
    };
};
export type PerformRollCallMutationVariables = Exact<{
    input: PerformRollCallInput;
}>;
export type PerformRollCallMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'PerformRollCallResult';
        failureType?: PerformRollCallFailureType | null;
    };
};
export type PingMutationVariables = Exact<{
    value: Scalars['Float'];
}>;
export type PingMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'Pong';
        createdBy?: string | null;
        value: number;
    };
};
export type PromoteToPlayerMutationVariables = Exact<{
    roomId: Scalars['String'];
    password?: InputMaybe<Scalars['String']>;
}>;
export type PromoteToPlayerMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'PromoteResult';
        failureType?: PromoteFailureType | null;
    };
};
export type RenameFilesMutationVariables = Exact<{
    input: Array<RenameFileInput> | RenameFileInput;
}>;
export type RenameFilesMutation = {
    __typename?: 'Mutation';
    result: Array<string>;
};
export type ResetMessagesMutationVariables = Exact<{
    roomId: Scalars['String'];
}>;
export type ResetMessagesMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'ResetRoomMessagesResult';
        failureType?: ResetRoomMessagesFailureType | null;
    };
};
export type UpdateBookmarkMutationVariables = Exact<{
    roomId: Scalars['String'];
    newValue: Scalars['Boolean'];
}>;
export type UpdateBookmarkMutation = {
    __typename?: 'Mutation';
    result: {
        __typename: 'UpdateBookmarkFailureResult';
        failureType: UpdateBookmarkFailureType;
    } | {
        __typename: 'UpdateBookmarkSuccessResult';
        prevValue: boolean;
        currentValue: boolean;
    };
};
export type WritePublicMessageMutationVariables = Exact<{
    roomId: Scalars['String'];
    text: Scalars['String'];
    textColor?: InputMaybe<Scalars['String']>;
    channelKey: Scalars['String'];
    characterId?: InputMaybe<Scalars['String']>;
    customName?: InputMaybe<Scalars['String']>;
    gameType?: InputMaybe<Scalars['String']>;
}>;
export type WritePublicMessageMutation = {
    __typename?: 'Mutation';
    result: {
        __typename: 'RoomMessageSyntaxError';
        errorMessage: string;
    } | {
        __typename: 'RoomPublicMessage';
        messageId: string;
        channelKey: string;
        initText?: string | null;
        initTextSource?: string | null;
        textColor?: string | null;
        altTextToSecret?: string | null;
        isSecret: boolean;
        createdBy?: string | null;
        customName?: string | null;
        createdAt: number;
        updatedAt?: number | null;
        updatedText?: {
            __typename?: 'UpdatedText';
            currentText?: string | null;
            updatedAt: number;
        } | null;
        commandResult?: {
            __typename?: 'CommandResult';
            text: string;
            isSuccess?: boolean | null;
        } | null;
        character?: {
            __typename?: 'CharacterValueForMessage';
            stateId: string;
            isPrivate: boolean;
            name: string;
            image?: {
                __typename?: 'FilePath';
                sourceType: FileSourceType;
                path: string;
            } | null;
            portraitImage?: {
                __typename?: 'FilePath';
                sourceType: FileSourceType;
                path: string;
            } | null;
        } | null;
    } | {
        __typename: 'WriteRoomPublicMessageFailureResult';
        failureType: WriteRoomPublicMessageFailureType;
    };
};
export type WritePrivateMessageMutationVariables = Exact<{
    roomId: Scalars['String'];
    visibleTo: Array<Scalars['String']> | Scalars['String'];
    text: Scalars['String'];
    textColor?: InputMaybe<Scalars['String']>;
    characterId?: InputMaybe<Scalars['String']>;
    customName?: InputMaybe<Scalars['String']>;
    gameType?: InputMaybe<Scalars['String']>;
}>;
export type WritePrivateMessageMutation = {
    __typename?: 'Mutation';
    result: {
        __typename: 'RoomMessageSyntaxError';
        errorMessage: string;
    } | {
        __typename: 'RoomPrivateMessage';
        messageId: string;
        visibleTo: Array<string>;
        initText?: string | null;
        initTextSource?: string | null;
        textColor?: string | null;
        altTextToSecret?: string | null;
        isSecret: boolean;
        createdBy?: string | null;
        customName?: string | null;
        createdAt: number;
        updatedAt?: number | null;
        updatedText?: {
            __typename?: 'UpdatedText';
            currentText?: string | null;
            updatedAt: number;
        } | null;
        commandResult?: {
            __typename?: 'CommandResult';
            text: string;
            isSuccess?: boolean | null;
        } | null;
        character?: {
            __typename?: 'CharacterValueForMessage';
            stateId: string;
            isPrivate: boolean;
            name: string;
            image?: {
                __typename?: 'FilePath';
                sourceType: FileSourceType;
                path: string;
            } | null;
            portraitImage?: {
                __typename?: 'FilePath';
                sourceType: FileSourceType;
                path: string;
            } | null;
        } | null;
    } | {
        __typename: 'WriteRoomPrivateMessageFailureResult';
        failureType: WriteRoomPrivateMessageFailureType;
    };
};
export type WriteRoomSoundEffectMutationVariables = Exact<{
    roomId: Scalars['String'];
    file: FilePathInput;
    volume: Scalars['Float'];
}>;
export type WriteRoomSoundEffectMutation = {
    __typename?: 'Mutation';
    result: {
        __typename: 'RoomSoundEffect';
        messageId: string;
        createdBy?: string | null;
        createdAt: number;
        volume: number;
        file: {
            __typename?: 'FilePath';
            sourceType: FileSourceType;
            path: string;
        };
    } | {
        __typename: 'WriteRoomSoundEffectFailureResult';
        failureType: WriteRoomSoundEffectFailureType;
    };
};
export type EditMessageMutationVariables = Exact<{
    roomId: Scalars['String'];
    messageId: Scalars['String'];
    text: Scalars['String'];
}>;
export type EditMessageMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'EditMessageResult';
        failureType?: EditMessageFailureType | null;
    };
};
export type DeleteMessageMutationVariables = Exact<{
    roomId: Scalars['String'];
    messageId: Scalars['String'];
}>;
export type DeleteMessageMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'DeleteMessageResult';
        failureType?: DeleteMessageFailureType | null;
    };
};
export type MakeMessageNotSecretMutationVariables = Exact<{
    roomId: Scalars['String'];
    messageId: Scalars['String'];
}>;
export type MakeMessageNotSecretMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'MakeMessageNotSecretResult';
        failureType?: MakeMessageNotSecretFailureType | null;
    };
};
export type UpdateWritingMessageStatusMutationVariables = Exact<{
    roomId: Scalars['String'];
    newStatus: WritingMessageStatusInputType;
}>;
export type UpdateWritingMessageStatusMutation = {
    __typename?: 'Mutation';
    result: boolean;
};
export type RoomEventSubscriptionVariables = Exact<{
    id: Scalars['String'];
}>;
export type RoomEventSubscription = {
    __typename?: 'Subscription';
    roomEvent?: {
        __typename?: 'RoomEvent';
        isRoomMessagesResetEvent: boolean;
        roomOperation?: {
            __typename?: 'RoomOperation';
            revisionTo: number;
            valueJson: string;
            operatedBy?: {
                __typename?: 'OperatedBy';
                userUid: string;
                clientId: string;
            } | null;
        } | null;
        deleteRoomOperation?: {
            __typename?: 'DeleteRoomOperation';
            deletedBy: string;
        } | null;
        roomMessageEvent?: {
            __typename: 'PieceLog';
            messageId: string;
            stateId: string;
            createdAt: number;
            logType: PieceLogType;
            valueJson: string;
        } | {
            __typename: 'RoomMessagesReset';
        } | {
            __typename: 'RoomPrivateMessage';
            messageId: string;
            visibleTo: Array<string>;
            initText?: string | null;
            initTextSource?: string | null;
            textColor?: string | null;
            altTextToSecret?: string | null;
            isSecret: boolean;
            createdBy?: string | null;
            customName?: string | null;
            createdAt: number;
            updatedAt?: number | null;
            updatedText?: {
                __typename?: 'UpdatedText';
                currentText?: string | null;
                updatedAt: number;
            } | null;
            commandResult?: {
                __typename?: 'CommandResult';
                text: string;
                isSuccess?: boolean | null;
            } | null;
            character?: {
                __typename?: 'CharacterValueForMessage';
                stateId: string;
                isPrivate: boolean;
                name: string;
                image?: {
                    __typename?: 'FilePath';
                    sourceType: FileSourceType;
                    path: string;
                } | null;
                portraitImage?: {
                    __typename?: 'FilePath';
                    sourceType: FileSourceType;
                    path: string;
                } | null;
            } | null;
        } | {
            __typename: 'RoomPrivateMessageUpdate';
            messageId: string;
            initText?: string | null;
            initTextSource?: string | null;
            altTextToSecret?: string | null;
            isSecret: boolean;
            updatedAt?: number | null;
            updatedText?: {
                __typename?: 'UpdatedText';
                currentText?: string | null;
                updatedAt: number;
            } | null;
            commandResult?: {
                __typename?: 'CommandResult';
                text: string;
                isSuccess?: boolean | null;
            } | null;
        } | {
            __typename: 'RoomPublicChannel';
            key: string;
            name?: string | null;
        } | {
            __typename: 'RoomPublicChannelUpdate';
            key: string;
            name?: string | null;
        } | {
            __typename: 'RoomPublicMessage';
            messageId: string;
            channelKey: string;
            initText?: string | null;
            initTextSource?: string | null;
            textColor?: string | null;
            altTextToSecret?: string | null;
            isSecret: boolean;
            createdBy?: string | null;
            customName?: string | null;
            createdAt: number;
            updatedAt?: number | null;
            updatedText?: {
                __typename?: 'UpdatedText';
                currentText?: string | null;
                updatedAt: number;
            } | null;
            commandResult?: {
                __typename?: 'CommandResult';
                text: string;
                isSuccess?: boolean | null;
            } | null;
            character?: {
                __typename?: 'CharacterValueForMessage';
                stateId: string;
                isPrivate: boolean;
                name: string;
                image?: {
                    __typename?: 'FilePath';
                    sourceType: FileSourceType;
                    path: string;
                } | null;
                portraitImage?: {
                    __typename?: 'FilePath';
                    sourceType: FileSourceType;
                    path: string;
                } | null;
            } | null;
        } | {
            __typename: 'RoomPublicMessageUpdate';
            messageId: string;
            initText?: string | null;
            initTextSource?: string | null;
            altTextToSecret?: string | null;
            isSecret: boolean;
            updatedAt?: number | null;
            updatedText?: {
                __typename?: 'UpdatedText';
                currentText?: string | null;
                updatedAt: number;
            } | null;
            commandResult?: {
                __typename?: 'CommandResult';
                text: string;
                isSuccess?: boolean | null;
            } | null;
        } | {
            __typename: 'RoomSoundEffect';
            messageId: string;
            createdBy?: string | null;
            createdAt: number;
            volume: number;
            file: {
                __typename?: 'FilePath';
                sourceType: FileSourceType;
                path: string;
            };
        } | null;
        roomConnectionEvent?: {
            __typename?: 'RoomConnectionEvent';
            userUid: string;
            isConnected: boolean;
            updatedAt: number;
        } | null;
        writingMessageStatus?: {
            __typename?: 'WritingMessageStatus';
            userUid: string;
            status: WritingMessageStatusType;
        } | null;
    } | null;
};
export type PongSubscriptionVariables = Exact<{
    [key: string]: never;
}>;
export type PongSubscription = {
    __typename?: 'Subscription';
    pong: {
        __typename?: 'Pong';
        createdBy?: string | null;
        value: number;
    };
};
export declare const RoomGetStateFragmentDoc: DocumentNode<RoomGetStateFragment, unknown>;
export declare const CreateRoomResultFragmentDoc: DocumentNode<CreateRoomResultFragment, unknown>;
export declare const FileItemFragmentDoc: DocumentNode<FileItemFragment, unknown>;
export declare const FileTagFragmentDoc: DocumentNode<FileTagFragment, unknown>;
export declare const RoomAsListItemFragmentDoc: DocumentNode<RoomAsListItemFragment, unknown>;
export declare const GetRoomListResultFragmentDoc: DocumentNode<GetRoomListResultFragment, unknown>;
export declare const GetNonJoinedRoomResultFragmentDoc: DocumentNode<GetNonJoinedRoomResultFragment, unknown>;
export declare const GetRoomResultFragmentDoc: DocumentNode<GetRoomResultFragment, unknown>;
export declare const RoomOperationFragmentDoc: DocumentNode<RoomOperationFragment, unknown>;
export declare const JoinRoomResultFragmentDoc: DocumentNode<JoinRoomResultFragment, unknown>;
export declare const FilePathFragmentDoc: DocumentNode<FilePathFragment, unknown>;
export declare const RoomSoundEffectFragmentDoc: DocumentNode<RoomSoundEffectFragment, unknown>;
export declare const CharacterValueForMessageFragmentDoc: DocumentNode<CharacterValueForMessageFragment, unknown>;
export declare const RoomPublicMessageFragmentDoc: DocumentNode<RoomPublicMessageFragment, unknown>;
export declare const RoomPublicChannelFragmentDoc: DocumentNode<RoomPublicChannelFragment, unknown>;
export declare const RoomPrivateMessageFragmentDoc: DocumentNode<RoomPrivateMessageFragment, unknown>;
export declare const PieceLogFragmentDoc: DocumentNode<PieceLogFragment, unknown>;
export declare const RoomMessageEventFragmentDoc: DocumentNode<RoomMessageEventFragment, unknown>;
export declare const SemVerFragmentDoc: DocumentNode<SemVerFragment, unknown>;
export declare const GetAvailableGameSystemsDocument: DocumentNode<GetAvailableGameSystemsQuery, Exact<{
    [key: string]: never;
}>>;
export declare const GetDiceHelpMessagesDocument: DocumentNode<GetDiceHelpMessagesQuery, Exact<{
    id: Scalars['String'];
}>>;
export declare const GetFilesDocument: DocumentNode<GetFilesQuery, Exact<{
    input: GetFilesInput;
}>>;
export declare const GetRoomDocument: DocumentNode<GetRoomQuery, Exact<{
    id: Scalars['String'];
}>>;
export declare const GetRoomsListDocument: DocumentNode<GetRoomsListQuery, Exact<{
    [key: string]: never;
}>>;
export declare const GetMessagesDocument: DocumentNode<GetMessagesQuery, Exact<{
    roomId: Scalars['String'];
}>>;
export declare const GetLogDocument: DocumentNode<GetLogQuery, Exact<{
    roomId: Scalars['String'];
}>>;
export declare const GetMyRolesDocument: DocumentNode<GetMyRolesQuery, Exact<{
    [key: string]: never;
}>>;
export declare const GetRoomConnectionsDocument: DocumentNode<GetRoomConnectionsQuery, Exact<{
    roomId: Scalars['String'];
}>>;
export declare const GetServerInfoDocument: DocumentNode<GetServerInfoQuery, Exact<{
    [key: string]: never;
}>>;
export declare const IsEntryDocument: DocumentNode<IsEntryQuery, Exact<{
    [key: string]: never;
}>>;
export declare const GetRoomAsListItemDocument: DocumentNode<GetRoomAsListItemQuery, Exact<{
    roomId: Scalars['String'];
}>>;
export declare const AnswerRollCallDocument: DocumentNode<AnswerRollCallMutation, Exact<{
    roomId: Scalars['String'];
    rollCallId: Scalars['String'];
    answer: Scalars['Boolean'];
}>>;
export declare const CreateFileTagDocument: DocumentNode<CreateFileTagMutation, Exact<{
    tagName: Scalars['String'];
}>>;
export declare const ChangeParticipantNameDocument: DocumentNode<ChangeParticipantNameMutation, Exact<{
    roomId: Scalars['String'];
    newName: Scalars['String'];
}>>;
export declare const CloseRollCallDocument: DocumentNode<CloseRollCallMutation, Exact<{
    roomId: Scalars['String'];
    rollCallId: Scalars['String'];
}>>;
export declare const CreateRoomDocument: DocumentNode<CreateRoomMutation, Exact<{
    input: CreateRoomInput;
}>>;
export declare const DeleteFilesDocument: DocumentNode<DeleteFilesMutation, Exact<{
    filenames: Array<Scalars['String']> | Scalars['String'];
}>>;
export declare const DeleteFileTagDocument: DocumentNode<DeleteFileTagMutation, Exact<{
    tagId: Scalars['String'];
}>>;
export declare const DeleteRoomDocument: DocumentNode<DeleteRoomMutation, Exact<{
    id: Scalars['String'];
}>>;
export declare const DeleteRoomAsAdminDocument: DocumentNode<DeleteRoomAsAdminMutation, Exact<{
    id: Scalars['String'];
}>>;
export declare const EditFileTagsDocument: DocumentNode<EditFileTagsMutation, Exact<{
    input: EditFileTagsInput;
}>>;
export declare const JoinRoomAsPlayerDocument: DocumentNode<JoinRoomAsPlayerMutation, Exact<{
    id: Scalars['String'];
    name: Scalars['String'];
    password?: InputMaybe<string> | undefined;
}>>;
export declare const JoinRoomAsSpectatorDocument: DocumentNode<JoinRoomAsSpectatorMutation, Exact<{
    id: Scalars['String'];
    name: Scalars['String'];
    password?: InputMaybe<string> | undefined;
}>>;
export declare const EntryToServerDocument: DocumentNode<EntryToServerMutation, Exact<{
    password: Scalars['String'];
}>>;
export declare const LeaveRoomDocument: DocumentNode<LeaveRoomMutation, Exact<{
    id: Scalars['String'];
}>>;
export declare const OperateDocument: DocumentNode<OperateMutation, Exact<{
    id: Scalars['String'];
    revisionFrom: Scalars['Int'];
    operation: RoomOperationInput;
    requestId: Scalars['String'];
}>>;
export declare const PerformRollCallDocument: DocumentNode<PerformRollCallMutation, Exact<{
    input: PerformRollCallInput;
}>>;
export declare const PingDocument: DocumentNode<PingMutation, Exact<{
    value: Scalars['Float'];
}>>;
export declare const PromoteToPlayerDocument: DocumentNode<PromoteToPlayerMutation, Exact<{
    roomId: Scalars['String'];
    password?: InputMaybe<string> | undefined;
}>>;
export declare const RenameFilesDocument: DocumentNode<RenameFilesMutation, Exact<{
    input: Array<RenameFileInput> | RenameFileInput;
}>>;
export declare const ResetMessagesDocument: DocumentNode<ResetMessagesMutation, Exact<{
    roomId: Scalars['String'];
}>>;
export declare const UpdateBookmarkDocument: DocumentNode<UpdateBookmarkMutation, Exact<{
    roomId: Scalars['String'];
    newValue: Scalars['Boolean'];
}>>;
export declare const WritePublicMessageDocument: DocumentNode<WritePublicMessageMutation, Exact<{
    roomId: Scalars['String'];
    text: Scalars['String'];
    textColor?: InputMaybe<string> | undefined;
    channelKey: Scalars['String'];
    characterId?: InputMaybe<string> | undefined;
    customName?: InputMaybe<string> | undefined;
    gameType?: InputMaybe<string> | undefined;
}>>;
export declare const WritePrivateMessageDocument: DocumentNode<WritePrivateMessageMutation, Exact<{
    roomId: Scalars['String'];
    visibleTo: Array<Scalars['String']> | Scalars['String'];
    text: Scalars['String'];
    textColor?: InputMaybe<string> | undefined;
    characterId?: InputMaybe<string> | undefined;
    customName?: InputMaybe<string> | undefined;
    gameType?: InputMaybe<string> | undefined;
}>>;
export declare const WriteRoomSoundEffectDocument: DocumentNode<WriteRoomSoundEffectMutation, Exact<{
    roomId: Scalars['String'];
    file: FilePathInput;
    volume: Scalars['Float'];
}>>;
export declare const EditMessageDocument: DocumentNode<EditMessageMutation, Exact<{
    roomId: Scalars['String'];
    messageId: Scalars['String'];
    text: Scalars['String'];
}>>;
export declare const DeleteMessageDocument: DocumentNode<DeleteMessageMutation, Exact<{
    roomId: Scalars['String'];
    messageId: Scalars['String'];
}>>;
export declare const MakeMessageNotSecretDocument: DocumentNode<MakeMessageNotSecretMutation, Exact<{
    roomId: Scalars['String'];
    messageId: Scalars['String'];
}>>;
export declare const UpdateWritingMessageStatusDocument: DocumentNode<UpdateWritingMessageStatusMutation, Exact<{
    roomId: Scalars['String'];
    newStatus: WritingMessageStatusInputType;
}>>;
export declare const RoomEventDocument: DocumentNode<RoomEventSubscription, Exact<{
    id: Scalars['String'];
}>>;
export declare const PongDocument: DocumentNode<PongSubscription, Exact<{
    [key: string]: never;
}>>;
export {};
//# sourceMappingURL=graphql.d.ts.map