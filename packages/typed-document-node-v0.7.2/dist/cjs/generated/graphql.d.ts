import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export declare type Maybe<T> = T | null;
export declare type InputMaybe<T> = Maybe<T>;
export declare type Exact<T extends {
    [key: string]: unknown;
}> = {
    [K in keyof T]: T[K];
};
export declare type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]?: Maybe<T[SubKey]>;
};
export declare type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export declare type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
};
export declare type AvailableGameSystem = {
    __typename?: 'AvailableGameSystem';
    id: Scalars['String'];
    name: Scalars['String'];
    sortKey: Scalars['String'];
};
export declare enum ChangeParticipantNameFailureType {
    NotFound = "NotFound",
    NotParticipant = "NotParticipant"
}
export declare type ChangeParticipantNameResult = {
    __typename?: 'ChangeParticipantNameResult';
    failureType?: Maybe<ChangeParticipantNameFailureType>;
};
export declare type CharacterValueForMessage = {
    __typename?: 'CharacterValueForMessage';
    image?: Maybe<FilePath>;
    isPrivate: Scalars['Boolean'];
    name: Scalars['String'];
    portraitImage?: Maybe<FilePath>;
    stateId: Scalars['String'];
};
export declare type CommandResult = {
    __typename?: 'CommandResult';
    /** 成功判定のないコマンドの場合はnullish。成功判定のあるコマンドの場合はその結果。 */
    isSuccess?: Maybe<Scalars['Boolean']>;
    text: Scalars['String'];
};
export declare type CreateRoomFailureResult = {
    __typename?: 'CreateRoomFailureResult';
    failureType: CreateRoomFailureType;
};
export declare enum CreateRoomFailureType {
    UnknownError = "UnknownError"
}
export declare type CreateRoomInput = {
    participantName: Scalars['String'];
    playerPassword?: InputMaybe<Scalars['String']>;
    roomName: Scalars['String'];
    spectatorPassword?: InputMaybe<Scalars['String']>;
};
export declare type CreateRoomResult = CreateRoomFailureResult | CreateRoomSuccessResult;
export declare type CreateRoomSuccessResult = {
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
export declare type DeleteMessageResult = {
    __typename?: 'DeleteMessageResult';
    failureType?: Maybe<DeleteMessageFailureType>;
};
export declare enum DeleteRoomAsAdminFailureType {
    NotFound = "NotFound"
}
export declare type DeleteRoomAsAdminResult = {
    __typename?: 'DeleteRoomAsAdminResult';
    failureType?: Maybe<DeleteRoomAsAdminFailureType>;
};
export declare enum DeleteRoomFailureType {
    NotCreatedByYou = "NotCreatedByYou",
    NotFound = "NotFound"
}
export declare type DeleteRoomOperation = {
    __typename?: 'DeleteRoomOperation';
    deletedBy: Scalars['String'];
    /** since v0.7.2 */
    deletedByAdmin: Scalars['Boolean'];
};
export declare type DeleteRoomResult = {
    __typename?: 'DeleteRoomResult';
    failureType?: Maybe<DeleteRoomFailureType>;
};
export declare type EditFileTagActionInput = {
    add: Array<Scalars['String']>;
    filename: Scalars['String'];
    remove: Array<Scalars['String']>;
};
export declare type EditFileTagsInput = {
    actions: Array<EditFileTagActionInput>;
};
export declare enum EditMessageFailureType {
    MessageDeleted = "MessageDeleted",
    MessageNotFound = "MessageNotFound",
    NotParticipant = "NotParticipant",
    NotYourMessage = "NotYourMessage",
    RoomNotFound = "RoomNotFound"
}
export declare type EditMessageResult = {
    __typename?: 'EditMessageResult';
    failureType?: Maybe<EditMessageFailureType>;
};
export declare type EntryToServerResult = {
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
export declare type FileItem = {
    __typename?: 'FileItem';
    createdAt?: Maybe<Scalars['Float']>;
    /** ファイルをアップロードしたユーザー。Firebase AuthenticationのUserUidで表現される。 */
    createdBy: Scalars['String'];
    /** サーバーで管理されているファイル名。axiosなどでファイルを取得する際はこれを用いる。ソートするとアップロードした時系列順になる。 */
    filename: Scalars['ID'];
    /** ユーザーが名付けたファイル名。 */
    screenname: Scalars['String'];
    /** サムネイル画像のファイル名。axiosなどを用いてファイルを取得する。 */
    thumbFilename?: Maybe<Scalars['String']>;
};
export declare type FilePath = {
    __typename?: 'FilePath';
    path: Scalars['String'];
    sourceType: FileSourceType;
};
export declare type FilePathInput = {
    path: Scalars['String'];
    sourceType: FileSourceType;
};
export declare enum FileSourceType {
    Default = "Default",
    FirebaseStorage = "FirebaseStorage",
    Uploader = "Uploader"
}
export declare type FileTag = {
    __typename?: 'FileTag';
    id: Scalars['String'];
    name: Scalars['String'];
};
export declare type GetAvailableGameSystemsResult = {
    __typename?: 'GetAvailableGameSystemsResult';
    value: Array<AvailableGameSystem>;
};
export declare type GetFilesInput = {
    /** FileTagのidを指定することで、指定したタグが付いているファイルのみを抽出して表示する。例えばidがx,yの3つのタグが付いているファイルは、[]や[x]や[x,y]と指定した場合にマッチするが、[x,y,z]と指定された場合は除外される。 */
    fileTagIds: Array<Scalars['String']>;
};
export declare type GetFilesResult = {
    __typename?: 'GetFilesResult';
    files: Array<FileItem>;
};
export declare type GetJoinedRoomResult = {
    __typename?: 'GetJoinedRoomResult';
    /** 自分の現在のParticipantRoleType。room.roleと同じ値をとる。 */
    role: ParticipantRole;
    room: RoomGetState;
};
export declare type GetNonJoinedRoomResult = {
    __typename?: 'GetNonJoinedRoomResult';
    roomAsListItem: RoomAsListItem;
};
export declare type GetRoomAsListItemFailureResult = {
    __typename?: 'GetRoomAsListItemFailureResult';
    failureType: GetRoomFailureType;
};
export declare type GetRoomAsListItemResult = GetRoomAsListItemFailureResult | GetRoomAsListItemSuccessResult;
export declare type GetRoomAsListItemSuccessResult = {
    __typename?: 'GetRoomAsListItemSuccessResult';
    room: RoomAsListItem;
};
export declare enum GetRoomConnectionFailureType {
    NotParticipant = "NotParticipant",
    RoomNotFound = "RoomNotFound"
}
export declare type GetRoomConnectionsFailureResult = {
    __typename?: 'GetRoomConnectionsFailureResult';
    failureType: GetRoomConnectionFailureType;
};
export declare type GetRoomConnectionsResult = GetRoomConnectionsFailureResult | GetRoomConnectionsSuccessResult;
export declare type GetRoomConnectionsSuccessResult = {
    __typename?: 'GetRoomConnectionsSuccessResult';
    connectedUserUids: Array<Scalars['String']>;
    fetchedAt: Scalars['Float'];
};
export declare type GetRoomFailureResult = {
    __typename?: 'GetRoomFailureResult';
    failureType: GetRoomFailureType;
};
export declare enum GetRoomFailureType {
    NotFound = "NotFound"
}
export declare type GetRoomLogFailureResult = {
    __typename?: 'GetRoomLogFailureResult';
    failureType: GetRoomLogFailureType;
};
export declare enum GetRoomLogFailureType {
    NotAuthorized = "NotAuthorized",
    NotParticipant = "NotParticipant",
    RoomNotFound = "RoomNotFound",
    UnknownError = "UnknownError"
}
export declare type GetRoomLogResult = GetRoomLogFailureResult | RoomMessages;
export declare type GetRoomMessagesFailureResult = {
    __typename?: 'GetRoomMessagesFailureResult';
    failureType: GetRoomMessagesFailureType;
};
export declare enum GetRoomMessagesFailureType {
    NotParticipant = "NotParticipant",
    RoomNotFound = "RoomNotFound"
}
export declare type GetRoomMessagesResult = GetRoomMessagesFailureResult | RoomMessages;
export declare type GetRoomResult = GetJoinedRoomResult | GetNonJoinedRoomResult | GetRoomFailureResult;
export declare type GetRoomsListFailureResult = {
    __typename?: 'GetRoomsListFailureResult';
    failureType: GetRoomFailureType;
};
export declare type GetRoomsListResult = GetRoomsListFailureResult | GetRoomsListSuccessResult;
export declare type GetRoomsListSuccessResult = {
    __typename?: 'GetRoomsListSuccessResult';
    rooms: Array<RoomAsListItem>;
};
export declare type JoinRoomFailureResult = {
    __typename?: 'JoinRoomFailureResult';
    failureType: JoinRoomFailureType;
};
export declare enum JoinRoomFailureType {
    AlreadyParticipant = "AlreadyParticipant",
    NotFound = "NotFound",
    TransformError = "TransformError",
    WrongPassword = "WrongPassword"
}
export declare type JoinRoomResult = JoinRoomFailureResult | JoinRoomSuccessResult;
export declare type JoinRoomSuccessResult = {
    __typename?: 'JoinRoomSuccessResult';
    operation?: Maybe<RoomOperation>;
};
export declare enum LeaveRoomFailureType {
    NotFound = "NotFound",
    NotParticipant = "NotParticipant"
}
export declare type LeaveRoomResult = {
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
export declare type MakeMessageNotSecretResult = {
    __typename?: 'MakeMessageNotSecretResult';
    failureType?: Maybe<MakeMessageNotSecretFailureType>;
};
export declare type Mutation = {
    __typename?: 'Mutation';
    changeParticipantName: ChangeParticipantNameResult;
    createFileTag?: Maybe<FileTag>;
    createRoom: CreateRoomResult;
    deleteFileTag: Scalars['Boolean'];
    deleteFiles: Array<Scalars['String']>;
    deleteMessage: DeleteMessageResult;
    deleteRoom: DeleteRoomResult;
    /** since v0.7.2 */
    deleteRoomAsAdmin: DeleteRoomAsAdminResult;
    editFileTags: Scalars['Boolean'];
    editMessage: EditMessageResult;
    entryToServer: EntryToServerResult;
    joinRoomAsPlayer: JoinRoomResult;
    joinRoomAsSpectator: JoinRoomResult;
    leaveRoom: LeaveRoomResult;
    makeMessageNotSecret: MakeMessageNotSecretResult;
    operate: OperateRoomResult;
    /** for test */
    ping: Pong;
    promoteToPlayer: PromoteResult;
    resetMessages: ResetRoomMessagesResult;
    updateBookmark: UpdateBookmarkResult;
    updateWritingMessageStatus: Scalars['Boolean'];
    writePrivateMessage: WriteRoomPrivateMessageResult;
    writePublicMessage: WriteRoomPublicMessageResult;
    writeRoomSoundEffect: WriteRoomSoundEffectResult;
};
export declare type MutationChangeParticipantNameArgs = {
    newName: Scalars['String'];
    roomId: Scalars['String'];
};
export declare type MutationCreateFileTagArgs = {
    tagName: Scalars['String'];
};
export declare type MutationCreateRoomArgs = {
    input: CreateRoomInput;
};
export declare type MutationDeleteFileTagArgs = {
    tagId: Scalars['String'];
};
export declare type MutationDeleteFilesArgs = {
    filenames: Array<Scalars['String']>;
};
export declare type MutationDeleteMessageArgs = {
    messageId: Scalars['String'];
    roomId: Scalars['String'];
};
export declare type MutationDeleteRoomArgs = {
    id: Scalars['String'];
};
export declare type MutationDeleteRoomAsAdminArgs = {
    id: Scalars['String'];
};
export declare type MutationEditFileTagsArgs = {
    input: EditFileTagsInput;
};
export declare type MutationEditMessageArgs = {
    messageId: Scalars['String'];
    roomId: Scalars['String'];
    text: Scalars['String'];
};
export declare type MutationEntryToServerArgs = {
    password?: InputMaybe<Scalars['String']>;
};
export declare type MutationJoinRoomAsPlayerArgs = {
    id: Scalars['String'];
    name: Scalars['String'];
    password?: InputMaybe<Scalars['String']>;
};
export declare type MutationJoinRoomAsSpectatorArgs = {
    id: Scalars['String'];
    name: Scalars['String'];
    password?: InputMaybe<Scalars['String']>;
};
export declare type MutationLeaveRoomArgs = {
    id: Scalars['String'];
};
export declare type MutationMakeMessageNotSecretArgs = {
    messageId: Scalars['String'];
    roomId: Scalars['String'];
};
export declare type MutationOperateArgs = {
    id: Scalars['String'];
    operation: RoomOperationInput;
    prevRevision: Scalars['Int'];
    requestId: Scalars['String'];
};
export declare type MutationPingArgs = {
    value: Scalars['Float'];
};
export declare type MutationPromoteToPlayerArgs = {
    password?: InputMaybe<Scalars['String']>;
    roomId: Scalars['String'];
};
export declare type MutationResetMessagesArgs = {
    roomId: Scalars['String'];
};
export declare type MutationUpdateBookmarkArgs = {
    newValue: Scalars['Boolean'];
    roomId: Scalars['String'];
};
export declare type MutationUpdateWritingMessageStatusArgs = {
    newStatus: WritingMessageStatusInputType;
    roomId: Scalars['String'];
};
export declare type MutationWritePrivateMessageArgs = {
    characterId?: InputMaybe<Scalars['String']>;
    customName?: InputMaybe<Scalars['String']>;
    gameType?: InputMaybe<Scalars['String']>;
    roomId: Scalars['String'];
    text: Scalars['String'];
    textColor?: InputMaybe<Scalars['String']>;
    visibleTo: Array<Scalars['String']>;
};
export declare type MutationWritePublicMessageArgs = {
    channelKey: Scalars['String'];
    characterId?: InputMaybe<Scalars['String']>;
    customName?: InputMaybe<Scalars['String']>;
    gameType?: InputMaybe<Scalars['String']>;
    roomId: Scalars['String'];
    text: Scalars['String'];
    textColor?: InputMaybe<Scalars['String']>;
};
export declare type MutationWriteRoomSoundEffectArgs = {
    file: FilePathInput;
    roomId: Scalars['String'];
    volume: Scalars['Float'];
};
export declare type OperateRoomFailureResult = {
    __typename?: 'OperateRoomFailureResult';
    failureType: OperateRoomFailureType;
};
export declare enum OperateRoomFailureType {
    NotFound = "NotFound"
}
export declare type OperateRoomIdResult = {
    __typename?: 'OperateRoomIdResult';
    requestId: Scalars['String'];
};
export declare type OperateRoomNonJoinedResult = {
    __typename?: 'OperateRoomNonJoinedResult';
    roomAsListItem: RoomAsListItem;
};
export declare type OperateRoomResult = OperateRoomFailureResult | OperateRoomIdResult | OperateRoomNonJoinedResult | OperateRoomSuccessResult;
export declare type OperateRoomSuccessResult = {
    __typename?: 'OperateRoomSuccessResult';
    operation: RoomOperation;
};
export declare type OperatedBy = {
    __typename?: 'OperatedBy';
    clientId: Scalars['String'];
    userUid: Scalars['String'];
};
export declare enum ParticipantRole {
    Master = "Master",
    Player = "Player",
    Spectator = "Spectator"
}
export declare type PieceLog = {
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
export declare type Pong = {
    __typename?: 'Pong';
    createdBy?: Maybe<Scalars['String']>;
    value: Scalars['Float'];
};
export declare type Prerelease = {
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
export declare type PromoteResult = {
    __typename?: 'PromoteResult';
    failureType?: Maybe<PromoteFailureType>;
};
export declare type Query = {
    __typename?: 'Query';
    getAvailableGameSystems: GetAvailableGameSystemsResult;
    getDiceHelpMessage?: Maybe<Scalars['String']>;
    getFiles: GetFilesResult;
    getLog: GetRoomLogResult;
    getMessages: GetRoomMessagesResult;
    /** since v0.7.2 */
    getMyRoles: Roles;
    getRoom: GetRoomResult;
    getRoomAsListItem: GetRoomAsListItemResult;
    getRoomConnections: GetRoomConnectionsResult;
    getRoomsList: GetRoomsListResult;
    getServerInfo: ServerInfo;
    isEntry: Scalars['Boolean'];
};
export declare type QueryGetDiceHelpMessageArgs = {
    id: Scalars['String'];
};
export declare type QueryGetFilesArgs = {
    input: GetFilesInput;
};
export declare type QueryGetLogArgs = {
    roomId: Scalars['String'];
};
export declare type QueryGetMessagesArgs = {
    roomId: Scalars['String'];
};
export declare type QueryGetRoomArgs = {
    id: Scalars['String'];
};
export declare type QueryGetRoomAsListItemArgs = {
    roomId: Scalars['String'];
};
export declare type QueryGetRoomConnectionsArgs = {
    roomId: Scalars['String'];
};
export declare enum ResetRoomMessagesFailureType {
    NotAuthorized = "NotAuthorized",
    NotParticipant = "NotParticipant",
    RoomNotFound = "RoomNotFound"
}
export declare type ResetRoomMessagesResult = {
    __typename?: 'ResetRoomMessagesResult';
    failureType?: Maybe<ResetRoomMessagesFailureType>;
};
export declare type Roles = {
    __typename?: 'Roles';
    admin: Scalars['Boolean'];
};
export declare type RoomAsListItem = {
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
export declare type RoomConnectionEvent = {
    __typename?: 'RoomConnectionEvent';
    isConnected: Scalars['Boolean'];
    updatedAt: Scalars['Float'];
    userUid: Scalars['String'];
};
export declare type RoomEvent = {
    __typename?: 'RoomEvent';
    deleteRoomOperation?: Maybe<DeleteRoomOperation>;
    isRoomMessagesResetEvent: Scalars['Boolean'];
    roomConnectionEvent?: Maybe<RoomConnectionEvent>;
    roomMessageEvent?: Maybe<RoomMessageEvent>;
    roomOperation?: Maybe<RoomOperation>;
    writingMessageStatus?: Maybe<WritingMessageStatus>;
};
export declare type RoomGetState = {
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
export declare type RoomMessageEvent = PieceLog | RoomMessagesReset | RoomPrivateMessage | RoomPrivateMessageUpdate | RoomPublicChannel | RoomPublicChannelUpdate | RoomPublicMessage | RoomPublicMessageUpdate | RoomSoundEffect;
export declare type RoomMessageSyntaxError = {
    __typename?: 'RoomMessageSyntaxError';
    errorMessage: Scalars['String'];
};
export declare type RoomMessages = {
    __typename?: 'RoomMessages';
    pieceLogs: Array<PieceLog>;
    privateMessages: Array<RoomPrivateMessage>;
    publicChannels: Array<RoomPublicChannel>;
    publicMessages: Array<RoomPublicMessage>;
    soundEffects: Array<RoomSoundEffect>;
};
export declare type RoomMessagesReset = {
    __typename?: 'RoomMessagesReset';
    publicMessagesDeleted: Scalars['Boolean'];
};
export declare type RoomOperation = {
    __typename?: 'RoomOperation';
    /** operateRoomを呼んだ人物。promoteなどの結果の場合はnullishになる。 */
    operatedBy?: Maybe<OperatedBy>;
    revisionTo: Scalars['Float'];
    /** room.upOperationをJSONにしたもの。idならばnullish。 */
    valueJson: Scalars['String'];
};
export declare type RoomOperationInput = {
    /** クライアントを識別するID。適当なIDをクライアント側で生成して渡す。Operationごとに変える必要はない */
    clientId: Scalars['String'];
    /** room.upOperationをJSONにしたもの */
    valueJson: Scalars['String'];
};
export declare type RoomPrivateMessage = {
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
export declare type RoomPrivateMessageUpdate = {
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
export declare type RoomPublicChannel = {
    __typename?: 'RoomPublicChannel';
    /** 現在の仕様では、$system, $free, '1', … , '10' の12個のみをサポートしている。このうち、$systemはシステムメッセージ専用チャンネルであるため誰も書き込むことができない。'1', …, '10'はSpectatorが書き込むことはできないが、$freeはSpectatorも書き込むことができる。 */
    key: Scalars['String'];
    name?: Maybe<Scalars['String']>;
};
export declare type RoomPublicChannelUpdate = {
    __typename?: 'RoomPublicChannelUpdate';
    key: Scalars['String'];
    name?: Maybe<Scalars['String']>;
};
export declare type RoomPublicMessage = {
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
export declare type RoomPublicMessageUpdate = {
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
export declare type RoomSoundEffect = {
    __typename?: 'RoomSoundEffect';
    createdAt: Scalars['Float'];
    createdBy?: Maybe<Scalars['String']>;
    file: FilePath;
    messageId: Scalars['String'];
    volume: Scalars['Float'];
};
export declare type SemVer = {
    __typename?: 'SemVer';
    major: Scalars['Float'];
    minor: Scalars['Float'];
    patch: Scalars['Float'];
    prerelease?: Maybe<Prerelease>;
};
export declare type ServerInfo = {
    __typename?: 'ServerInfo';
    uploaderEnabled: Scalars['Boolean'];
    version: SemVer;
};
export declare type Subscription = {
    __typename?: 'Subscription';
    /** for test */
    pong: Pong;
    roomEvent?: Maybe<RoomEvent>;
};
export declare type SubscriptionRoomEventArgs = {
    id: Scalars['String'];
};
export declare type UpdateBookmarkFailureResult = {
    __typename?: 'UpdateBookmarkFailureResult';
    failureType: UpdateBookmarkFailureType;
};
export declare enum UpdateBookmarkFailureType {
    NotFound = "NotFound"
}
export declare type UpdateBookmarkResult = UpdateBookmarkFailureResult | UpdateBookmarkSuccessResult;
export declare type UpdateBookmarkSuccessResult = {
    __typename?: 'UpdateBookmarkSuccessResult';
    currentValue: Scalars['Boolean'];
    prevValue: Scalars['Boolean'];
};
export declare type UpdatedText = {
    __typename?: 'UpdatedText';
    currentText?: Maybe<Scalars['String']>;
    updatedAt: Scalars['Float'];
};
export declare type WriteRoomPrivateMessageFailureResult = {
    __typename?: 'WriteRoomPrivateMessageFailureResult';
    failureType: WriteRoomPrivateMessageFailureType;
};
export declare enum WriteRoomPrivateMessageFailureType {
    NotParticipant = "NotParticipant",
    RoomNotFound = "RoomNotFound",
    SyntaxError = "SyntaxError",
    VisibleToIsInvalid = "VisibleToIsInvalid"
}
export declare type WriteRoomPrivateMessageResult = RoomMessageSyntaxError | RoomPrivateMessage | WriteRoomPrivateMessageFailureResult;
export declare type WriteRoomPublicMessageFailureResult = {
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
export declare type WriteRoomPublicMessageResult = RoomMessageSyntaxError | RoomPublicMessage | WriteRoomPublicMessageFailureResult;
export declare type WriteRoomSoundEffectFailureResult = {
    __typename?: 'WriteRoomSoundEffectFailureResult';
    failureType: WriteRoomSoundEffectFailureType;
};
export declare enum WriteRoomSoundEffectFailureType {
    NotAuthorized = "NotAuthorized",
    NotParticipant = "NotParticipant",
    RoomNotFound = "RoomNotFound"
}
export declare type WriteRoomSoundEffectResult = RoomSoundEffect | WriteRoomSoundEffectFailureResult;
export declare type WritingMessageStatus = {
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
export declare type CharacterValueForMessageFragment = {
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
declare type CreateRoomResult_CreateRoomFailureResult_Fragment = {
    __typename: 'CreateRoomFailureResult';
    failureType: CreateRoomFailureType;
};
declare type CreateRoomResult_CreateRoomSuccessResult_Fragment = {
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
export declare type CreateRoomResultFragment = CreateRoomResult_CreateRoomFailureResult_Fragment | CreateRoomResult_CreateRoomSuccessResult_Fragment;
export declare type FileItemFragment = {
    __typename?: 'FileItem';
    filename: string;
    thumbFilename?: string | null;
    screenname: string;
    createdBy: string;
    createdAt?: number | null;
};
export declare type FilePathFragment = {
    __typename?: 'FilePath';
    sourceType: FileSourceType;
    path: string;
};
export declare type FileTagFragment = {
    __typename?: 'FileTag';
    id: string;
    name: string;
};
export declare type GetNonJoinedRoomResultFragment = {
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
declare type GetRoomListResult_GetRoomsListFailureResult_Fragment = {
    __typename: 'GetRoomsListFailureResult';
    failureType: GetRoomFailureType;
};
declare type GetRoomListResult_GetRoomsListSuccessResult_Fragment = {
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
export declare type GetRoomListResultFragment = GetRoomListResult_GetRoomsListFailureResult_Fragment | GetRoomListResult_GetRoomsListSuccessResult_Fragment;
declare type GetRoomResult_GetJoinedRoomResult_Fragment = {
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
declare type GetRoomResult_GetNonJoinedRoomResult_Fragment = {
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
declare type GetRoomResult_GetRoomFailureResult_Fragment = {
    __typename: 'GetRoomFailureResult';
    failureType: GetRoomFailureType;
};
export declare type GetRoomResultFragment = GetRoomResult_GetJoinedRoomResult_Fragment | GetRoomResult_GetNonJoinedRoomResult_Fragment | GetRoomResult_GetRoomFailureResult_Fragment;
declare type JoinRoomResult_JoinRoomFailureResult_Fragment = {
    __typename: 'JoinRoomFailureResult';
    failureType: JoinRoomFailureType;
};
declare type JoinRoomResult_JoinRoomSuccessResult_Fragment = {
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
export declare type JoinRoomResultFragment = JoinRoomResult_JoinRoomFailureResult_Fragment | JoinRoomResult_JoinRoomSuccessResult_Fragment;
export declare type PieceLogFragment = {
    __typename?: 'PieceLog';
    messageId: string;
    stateId: string;
    createdAt: number;
    logType: PieceLogType;
    valueJson: string;
};
export declare type RoomAsListItemFragment = {
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
export declare type RoomGetStateFragment = {
    __typename?: 'RoomGetState';
    revision: number;
    createdBy: string;
    createdAt?: number | null;
    updatedAt?: number | null;
    role?: ParticipantRole | null;
    isBookmarked: boolean;
    stateJson: string;
};
export declare type RoomOperationFragment = {
    __typename?: 'RoomOperation';
    revisionTo: number;
    valueJson: string;
    operatedBy?: {
        __typename?: 'OperatedBy';
        userUid: string;
        clientId: string;
    } | null;
};
export declare type RoomPublicChannelFragment = {
    __typename?: 'RoomPublicChannel';
    key: string;
    name?: string | null;
};
export declare type RoomPublicMessageFragment = {
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
export declare type RoomPrivateMessageFragment = {
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
export declare type RoomSoundEffectFragment = {
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
declare type RoomMessageEvent_PieceLog_Fragment = {
    __typename: 'PieceLog';
    messageId: string;
    stateId: string;
    createdAt: number;
    logType: PieceLogType;
    valueJson: string;
};
declare type RoomMessageEvent_RoomMessagesReset_Fragment = {
    __typename: 'RoomMessagesReset';
};
declare type RoomMessageEvent_RoomPrivateMessage_Fragment = {
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
declare type RoomMessageEvent_RoomPrivateMessageUpdate_Fragment = {
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
declare type RoomMessageEvent_RoomPublicChannel_Fragment = {
    __typename: 'RoomPublicChannel';
    key: string;
    name?: string | null;
};
declare type RoomMessageEvent_RoomPublicChannelUpdate_Fragment = {
    __typename: 'RoomPublicChannelUpdate';
    key: string;
    name?: string | null;
};
declare type RoomMessageEvent_RoomPublicMessage_Fragment = {
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
declare type RoomMessageEvent_RoomPublicMessageUpdate_Fragment = {
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
declare type RoomMessageEvent_RoomSoundEffect_Fragment = {
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
export declare type RoomMessageEventFragment = RoomMessageEvent_PieceLog_Fragment | RoomMessageEvent_RoomMessagesReset_Fragment | RoomMessageEvent_RoomPrivateMessage_Fragment | RoomMessageEvent_RoomPrivateMessageUpdate_Fragment | RoomMessageEvent_RoomPublicChannel_Fragment | RoomMessageEvent_RoomPublicChannelUpdate_Fragment | RoomMessageEvent_RoomPublicMessage_Fragment | RoomMessageEvent_RoomPublicMessageUpdate_Fragment | RoomMessageEvent_RoomSoundEffect_Fragment;
export declare type SemVerFragment = {
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
export declare type GetAvailableGameSystemsQueryVariables = Exact<{
    [key: string]: never;
}>;
export declare type GetAvailableGameSystemsQuery = {
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
export declare type GetDiceHelpMessagesQueryVariables = Exact<{
    id: Scalars['String'];
}>;
export declare type GetDiceHelpMessagesQuery = {
    __typename?: 'Query';
    result?: string | null;
};
export declare type GetFilesQueryVariables = Exact<{
    input: GetFilesInput;
}>;
export declare type GetFilesQuery = {
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
        }>;
    };
};
export declare type GetRoomQueryVariables = Exact<{
    id: Scalars['String'];
}>;
export declare type GetRoomQuery = {
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
export declare type GetRoomsListQueryVariables = Exact<{
    [key: string]: never;
}>;
export declare type GetRoomsListQuery = {
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
export declare type GetMessagesQueryVariables = Exact<{
    roomId: Scalars['String'];
}>;
export declare type GetMessagesQuery = {
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
export declare type GetLogQueryVariables = Exact<{
    roomId: Scalars['String'];
}>;
export declare type GetLogQuery = {
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
export declare type GetMyRolesQueryVariables = Exact<{
    [key: string]: never;
}>;
export declare type GetMyRolesQuery = {
    __typename?: 'Query';
    result: {
        __typename?: 'Roles';
        admin: boolean;
    };
};
export declare type GetRoomConnectionsQueryVariables = Exact<{
    roomId: Scalars['String'];
}>;
export declare type GetRoomConnectionsQuery = {
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
export declare type GetServerInfoQueryVariables = Exact<{
    [key: string]: never;
}>;
export declare type GetServerInfoQuery = {
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
export declare type IsEntryQueryVariables = Exact<{
    [key: string]: never;
}>;
export declare type IsEntryQuery = {
    __typename?: 'Query';
    result: boolean;
};
export declare type GetRoomAsListItemQueryVariables = Exact<{
    roomId: Scalars['String'];
}>;
export declare type GetRoomAsListItemQuery = {
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
export declare type CreateFileTagMutationVariables = Exact<{
    tagName: Scalars['String'];
}>;
export declare type CreateFileTagMutation = {
    __typename?: 'Mutation';
    result?: {
        __typename?: 'FileTag';
        id: string;
        name: string;
    } | null;
};
export declare type ChangeParticipantNameMutationVariables = Exact<{
    roomId: Scalars['String'];
    newName: Scalars['String'];
}>;
export declare type ChangeParticipantNameMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'ChangeParticipantNameResult';
        failureType?: ChangeParticipantNameFailureType | null;
    };
};
export declare type CreateRoomMutationVariables = Exact<{
    input: CreateRoomInput;
}>;
export declare type CreateRoomMutation = {
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
export declare type DeleteFilesMutationVariables = Exact<{
    filenames: Array<Scalars['String']> | Scalars['String'];
}>;
export declare type DeleteFilesMutation = {
    __typename?: 'Mutation';
    result: Array<string>;
};
export declare type DeleteFileTagMutationVariables = Exact<{
    tagId: Scalars['String'];
}>;
export declare type DeleteFileTagMutation = {
    __typename?: 'Mutation';
    result: boolean;
};
export declare type DeleteRoomMutationVariables = Exact<{
    id: Scalars['String'];
}>;
export declare type DeleteRoomMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'DeleteRoomResult';
        failureType?: DeleteRoomFailureType | null;
    };
};
export declare type DeleteRoomAsAdminMutationVariables = Exact<{
    id: Scalars['String'];
}>;
export declare type DeleteRoomAsAdminMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'DeleteRoomAsAdminResult';
        failureType?: DeleteRoomAsAdminFailureType | null;
    };
};
export declare type EditFileTagsMutationVariables = Exact<{
    input: EditFileTagsInput;
}>;
export declare type EditFileTagsMutation = {
    __typename?: 'Mutation';
    result: boolean;
};
export declare type JoinRoomAsPlayerMutationVariables = Exact<{
    id: Scalars['String'];
    name: Scalars['String'];
    password?: InputMaybe<Scalars['String']>;
}>;
export declare type JoinRoomAsPlayerMutation = {
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
export declare type JoinRoomAsSpectatorMutationVariables = Exact<{
    id: Scalars['String'];
    name: Scalars['String'];
    password?: InputMaybe<Scalars['String']>;
}>;
export declare type JoinRoomAsSpectatorMutation = {
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
export declare type EntryToServerMutationVariables = Exact<{
    password: Scalars['String'];
}>;
export declare type EntryToServerMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'EntryToServerResult';
        type: EntryToServerResultType;
    };
};
export declare type LeaveRoomMutationVariables = Exact<{
    id: Scalars['String'];
}>;
export declare type LeaveRoomMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'LeaveRoomResult';
        failureType?: LeaveRoomFailureType | null;
    };
};
export declare type OperateMutationVariables = Exact<{
    id: Scalars['String'];
    revisionFrom: Scalars['Int'];
    operation: RoomOperationInput;
    requestId: Scalars['String'];
}>;
export declare type OperateMutation = {
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
export declare type PingMutationVariables = Exact<{
    value: Scalars['Float'];
}>;
export declare type PingMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'Pong';
        createdBy?: string | null;
        value: number;
    };
};
export declare type PromoteToPlayerMutationVariables = Exact<{
    roomId: Scalars['String'];
    password?: InputMaybe<Scalars['String']>;
}>;
export declare type PromoteToPlayerMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'PromoteResult';
        failureType?: PromoteFailureType | null;
    };
};
export declare type ResetMessagesMutationVariables = Exact<{
    roomId: Scalars['String'];
}>;
export declare type ResetMessagesMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'ResetRoomMessagesResult';
        failureType?: ResetRoomMessagesFailureType | null;
    };
};
export declare type UpdateBookmarkMutationVariables = Exact<{
    roomId: Scalars['String'];
    newValue: Scalars['Boolean'];
}>;
export declare type UpdateBookmarkMutation = {
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
export declare type WritePublicMessageMutationVariables = Exact<{
    roomId: Scalars['String'];
    text: Scalars['String'];
    textColor?: InputMaybe<Scalars['String']>;
    channelKey: Scalars['String'];
    characterId?: InputMaybe<Scalars['String']>;
    customName?: InputMaybe<Scalars['String']>;
    gameType?: InputMaybe<Scalars['String']>;
}>;
export declare type WritePublicMessageMutation = {
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
export declare type WritePrivateMessageMutationVariables = Exact<{
    roomId: Scalars['String'];
    visibleTo: Array<Scalars['String']> | Scalars['String'];
    text: Scalars['String'];
    textColor?: InputMaybe<Scalars['String']>;
    characterId?: InputMaybe<Scalars['String']>;
    customName?: InputMaybe<Scalars['String']>;
    gameType?: InputMaybe<Scalars['String']>;
}>;
export declare type WritePrivateMessageMutation = {
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
export declare type WriteRoomSoundEffectMutationVariables = Exact<{
    roomId: Scalars['String'];
    file: FilePathInput;
    volume: Scalars['Float'];
}>;
export declare type WriteRoomSoundEffectMutation = {
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
export declare type EditMessageMutationVariables = Exact<{
    roomId: Scalars['String'];
    messageId: Scalars['String'];
    text: Scalars['String'];
}>;
export declare type EditMessageMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'EditMessageResult';
        failureType?: EditMessageFailureType | null;
    };
};
export declare type DeleteMessageMutationVariables = Exact<{
    roomId: Scalars['String'];
    messageId: Scalars['String'];
}>;
export declare type DeleteMessageMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'DeleteMessageResult';
        failureType?: DeleteMessageFailureType | null;
    };
};
export declare type MakeMessageNotSecretMutationVariables = Exact<{
    roomId: Scalars['String'];
    messageId: Scalars['String'];
}>;
export declare type MakeMessageNotSecretMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'MakeMessageNotSecretResult';
        failureType?: MakeMessageNotSecretFailureType | null;
    };
};
export declare type UpdateWritingMessageStatusMutationVariables = Exact<{
    roomId: Scalars['String'];
    newStatus: WritingMessageStatusInputType;
}>;
export declare type UpdateWritingMessageStatusMutation = {
    __typename?: 'Mutation';
    result: boolean;
};
export declare type RoomEventSubscriptionVariables = Exact<{
    id: Scalars['String'];
}>;
export declare type RoomEventSubscription = {
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
export declare type PongSubscriptionVariables = Exact<{
    [key: string]: never;
}>;
export declare type PongSubscription = {
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
export declare const CreateFileTagDocument: DocumentNode<CreateFileTagMutation, Exact<{
    tagName: Scalars['String'];
}>>;
export declare const ChangeParticipantNameDocument: DocumentNode<ChangeParticipantNameMutation, Exact<{
    roomId: Scalars['String'];
    newName: Scalars['String'];
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
export declare const PingDocument: DocumentNode<PingMutation, Exact<{
    value: Scalars['Float'];
}>>;
export declare const PromoteToPlayerDocument: DocumentNode<PromoteToPlayerMutation, Exact<{
    roomId: Scalars['String'];
    password?: InputMaybe<string> | undefined;
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