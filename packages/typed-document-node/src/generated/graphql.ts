import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
};

export type AvailableGameSystem = {
    __typename?: 'AvailableGameSystem';
    id: Scalars['String'];
    name: Scalars['String'];
    sortKey: Scalars['String'];
};

export enum ChangeParticipantNameFailureType {
    NotFound = 'NotFound',
    NotParticipant = 'NotParticipant',
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

export enum CreateRoomFailureType {
    UnknownError = 'UnknownError',
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

export enum DeleteMessageFailureType {
    MessageDeleted = 'MessageDeleted',
    MessageNotFound = 'MessageNotFound',
    NotParticipant = 'NotParticipant',
    NotYourMessage = 'NotYourMessage',
    RoomNotFound = 'RoomNotFound',
}

export type DeleteMessageResult = {
    __typename?: 'DeleteMessageResult';
    failureType?: Maybe<DeleteMessageFailureType>;
};

export enum DeleteRoomAsAdminFailureType {
    NotFound = 'NotFound',
}

export type DeleteRoomAsAdminResult = {
    __typename?: 'DeleteRoomAsAdminResult';
    failureType?: Maybe<DeleteRoomAsAdminFailureType>;
};

export enum DeleteRoomFailureType {
    NotCreatedByYou = 'NotCreatedByYou',
    NotFound = 'NotFound',
}

export type DeleteRoomOperation = {
    __typename?: 'DeleteRoomOperation';
    deletedBy: Scalars['String'];
    /** since v0.8.0 */
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

export enum EditMessageFailureType {
    MessageDeleted = 'MessageDeleted',
    MessageNotFound = 'MessageNotFound',
    NotParticipant = 'NotParticipant',
    NotYourMessage = 'NotYourMessage',
    RoomNotFound = 'RoomNotFound',
}

export type EditMessageResult = {
    __typename?: 'EditMessageResult';
    failureType?: Maybe<EditMessageFailureType>;
};

export type EntryToServerResult = {
    __typename?: 'EntryToServerResult';
    type: EntryToServerResultType;
};

export enum EntryToServerResultType {
    AlreadyEntried = 'AlreadyEntried',
    NoPasswordRequired = 'NoPasswordRequired',
    NotSignIn = 'NotSignIn',
    Success = 'Success',
    WrongPassword = 'WrongPassword',
}

export type FileItem = {
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

export type FilePath = {
    __typename?: 'FilePath';
    path: Scalars['String'];
    sourceType: FileSourceType;
};

export type FilePathInput = {
    path: Scalars['String'];
    sourceType: FileSourceType;
};

export enum FileSourceType {
    Default = 'Default',
    FirebaseStorage = 'FirebaseStorage',
    Uploader = 'Uploader',
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
    /** 自分の現在のParticipantRole。 */
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

export type GetRoomAsListItemResult =
    | GetRoomAsListItemFailureResult
    | GetRoomAsListItemSuccessResult;

export type GetRoomAsListItemSuccessResult = {
    __typename?: 'GetRoomAsListItemSuccessResult';
    room: RoomAsListItem;
};

export enum GetRoomConnectionFailureType {
    NotParticipant = 'NotParticipant',
    RoomNotFound = 'RoomNotFound',
}

export type GetRoomConnectionsFailureResult = {
    __typename?: 'GetRoomConnectionsFailureResult';
    failureType: GetRoomConnectionFailureType;
};

export type GetRoomConnectionsResult =
    | GetRoomConnectionsFailureResult
    | GetRoomConnectionsSuccessResult;

export type GetRoomConnectionsSuccessResult = {
    __typename?: 'GetRoomConnectionsSuccessResult';
    connectedUserUids: Array<Scalars['String']>;
    fetchedAt: Scalars['Float'];
};

export type GetRoomFailureResult = {
    __typename?: 'GetRoomFailureResult';
    failureType: GetRoomFailureType;
};

export enum GetRoomFailureType {
    NotFound = 'NotFound',
}

export type GetRoomLogFailureResult = {
    __typename?: 'GetRoomLogFailureResult';
    failureType: GetRoomLogFailureType;
};

export enum GetRoomLogFailureType {
    NotAuthorized = 'NotAuthorized',
    NotParticipant = 'NotParticipant',
    RoomNotFound = 'RoomNotFound',
    UnknownError = 'UnknownError',
}

export type GetRoomLogResult = GetRoomLogFailureResult | RoomMessages;

export type GetRoomMessagesFailureResult = {
    __typename?: 'GetRoomMessagesFailureResult';
    failureType: GetRoomMessagesFailureType;
};

export enum GetRoomMessagesFailureType {
    NotParticipant = 'NotParticipant',
    RoomNotFound = 'RoomNotFound',
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

export enum JoinRoomFailureType {
    AlreadyParticipant = 'AlreadyParticipant',
    NotFound = 'NotFound',
    TransformError = 'TransformError',
    WrongPassword = 'WrongPassword',
}

export type JoinRoomResult = JoinRoomFailureResult | JoinRoomSuccessResult;

export type JoinRoomSuccessResult = {
    __typename?: 'JoinRoomSuccessResult';
    operation?: Maybe<RoomOperation>;
};

export enum LeaveRoomFailureType {
    NotFound = 'NotFound',
    NotParticipant = 'NotParticipant',
}

export type LeaveRoomResult = {
    __typename?: 'LeaveRoomResult';
    failureType?: Maybe<LeaveRoomFailureType>;
};

export enum MakeMessageNotSecretFailureType {
    MessageNotFound = 'MessageNotFound',
    NotParticipant = 'NotParticipant',
    NotSecret = 'NotSecret',
    NotYourMessage = 'NotYourMessage',
    RoomNotFound = 'RoomNotFound',
}

export type MakeMessageNotSecretResult = {
    __typename?: 'MakeMessageNotSecretResult';
    failureType?: Maybe<MakeMessageNotSecretFailureType>;
};

export type Mutation = {
    __typename?: 'Mutation';
    changeParticipantName: ChangeParticipantNameResult;
    createFileTag?: Maybe<FileTag>;
    createRoom: CreateRoomResult;
    deleteFileTag: Scalars['Boolean'];
    deleteFiles: Array<Scalars['String']>;
    deleteMessage: DeleteMessageResult;
    deleteRoom: DeleteRoomResult;
    /** since v0.8.0 */
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
    updateWritingMessageStatus: Scalars['Boolean'];
    writePrivateMessage: WriteRoomPrivateMessageResult;
    writePublicMessage: WriteRoomPublicMessageResult;
    writeRoomSoundEffect: WriteRoomSoundEffectResult;
};

export type MutationChangeParticipantNameArgs = {
    newName: Scalars['String'];
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

export type MutationPingArgs = {
    value: Scalars['Float'];
};

export type MutationPromoteToPlayerArgs = {
    password?: InputMaybe<Scalars['String']>;
    roomId: Scalars['String'];
};

export type MutationResetMessagesArgs = {
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

export enum OperateRoomFailureType {
    NotFound = 'NotFound',
}

export type OperateRoomIdResult = {
    __typename?: 'OperateRoomIdResult';
    requestId: Scalars['String'];
};

export type OperateRoomNonJoinedResult = {
    __typename?: 'OperateRoomNonJoinedResult';
    roomAsListItem: RoomAsListItem;
};

export type OperateRoomResult =
    | OperateRoomFailureResult
    | OperateRoomIdResult
    | OperateRoomNonJoinedResult
    | OperateRoomSuccessResult;

export type OperateRoomSuccessResult = {
    __typename?: 'OperateRoomSuccessResult';
    operation: RoomOperation;
};

export type OperatedBy = {
    __typename?: 'OperatedBy';
    clientId: Scalars['String'];
    userUid: Scalars['String'];
};

export enum ParticipantRole {
    Master = 'Master',
    Player = 'Player',
    Spectator = 'Spectator',
    OfNullishString = 'ofNullishString',
    OfString = 'ofString',
}

export type PieceLog = {
    __typename?: 'PieceLog';
    createdAt: Scalars['Float'];
    logType: PieceLogType;
    messageId: Scalars['String'];
    stateId: Scalars['String'];
    valueJson: Scalars['String'];
};

export enum PieceLogType {
    Dice = 'Dice',
    String = 'String',
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

export enum PrereleaseType {
    Alpha = 'Alpha',
    Beta = 'Beta',
    Rc = 'Rc',
}

export enum PromoteFailureType {
    NoNeedToPromote = 'NoNeedToPromote',
    NotFound = 'NotFound',
    NotParticipant = 'NotParticipant',
    WrongPassword = 'WrongPassword',
}

export type PromoteResult = {
    __typename?: 'PromoteResult';
    failureType?: Maybe<PromoteFailureType>;
};

export type Query = {
    __typename?: 'Query';
    /**
     * 自分がadminかどうかを確認します。このQueryの実行ユーザーがadminであれば成功し、adminでなければエラーを返します。
     * since v0.8.0
     */
    amIAdmin: Scalars['String'];
    getAvailableGameSystems: GetAvailableGameSystemsResult;
    getDiceHelpMessage?: Maybe<Scalars['String']>;
    getFiles: GetFilesResult;
    getLog: GetRoomLogResult;
    getMessages: GetRoomMessagesResult;
    getRoom: GetRoomResult;
    getRoomAsListItem: GetRoomAsListItemResult;
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

export enum ResetRoomMessagesFailureType {
    NotAuthorized = 'NotAuthorized',
    NotParticipant = 'NotParticipant',
    RoomNotFound = 'RoomNotFound',
}

export type ResetRoomMessagesResult = {
    __typename?: 'ResetRoomMessagesResult';
    failureType?: Maybe<ResetRoomMessagesFailureType>;
};

export type RoomAsListItem = {
    __typename?: 'RoomAsListItem';
    /** この部屋の作成者。Firebase AuthenticationのUserUidで表現される。 */
    createdBy: Scalars['String'];
    id: Scalars['ID'];
    name: Scalars['String'];
    requiresPlayerPassword: Scalars['Boolean'];
    requiresSpectatorPassword: Scalars['Boolean'];
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
    /** この部屋の作成者。Firebase AuthenticationのUserUidで表現される。 */
    createdBy: Scalars['String'];
    /** Current revision of Room. Whenever Room is updated, this value is incremented by 1. This value is required when you apply RoomOperation. / Roomの現在のリビジョン。Roomが更新されるたび、この値は1増加する。RoomOperationを適用する際に必要となる。 */
    revision: Scalars['Float'];
    /** room.state をJSON化したもの */
    stateJson: Scalars['String'];
};

export type RoomMessageEvent =
    | PieceLog
    | RoomMessagesReset
    | RoomPrivateMessage
    | RoomPrivateMessageUpdate
    | RoomPublicChannel
    | RoomPublicChannelUpdate
    | RoomPublicMessage
    | RoomPublicMessageUpdate
    | RoomSoundEffect;

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
    /** for test */
    pong: Pong;
    roomEvent?: Maybe<RoomEvent>;
};

export type SubscriptionRoomEventArgs = {
    id: Scalars['String'];
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

export enum WriteRoomPrivateMessageFailureType {
    NotParticipant = 'NotParticipant',
    RoomNotFound = 'RoomNotFound',
    SyntaxError = 'SyntaxError',
    VisibleToIsInvalid = 'VisibleToIsInvalid',
}

export type WriteRoomPrivateMessageResult =
    | RoomMessageSyntaxError
    | RoomPrivateMessage
    | WriteRoomPrivateMessageFailureResult;

export type WriteRoomPublicMessageFailureResult = {
    __typename?: 'WriteRoomPublicMessageFailureResult';
    failureType: WriteRoomPublicMessageFailureType;
};

export enum WriteRoomPublicMessageFailureType {
    NotAllowedChannelKey = 'NotAllowedChannelKey',
    NotAuthorized = 'NotAuthorized',
    NotParticipant = 'NotParticipant',
    RoomNotFound = 'RoomNotFound',
    SyntaxError = 'SyntaxError',
}

export type WriteRoomPublicMessageResult =
    | RoomMessageSyntaxError
    | RoomPublicMessage
    | WriteRoomPublicMessageFailureResult;

export type WriteRoomSoundEffectFailureResult = {
    __typename?: 'WriteRoomSoundEffectFailureResult';
    failureType: WriteRoomSoundEffectFailureType;
};

export enum WriteRoomSoundEffectFailureType {
    NotAuthorized = 'NotAuthorized',
    NotParticipant = 'NotParticipant',
    RoomNotFound = 'RoomNotFound',
}

export type WriteRoomSoundEffectResult = RoomSoundEffect | WriteRoomSoundEffectFailureResult;

export type WritingMessageStatus = {
    __typename?: 'WritingMessageStatus';
    status: WritingMessageStatusType;
    updatedAt: Scalars['Float'];
    userUid: Scalars['String'];
};

export enum WritingMessageStatusInputType {
    Cleared = 'Cleared',
    KeepWriting = 'KeepWriting',
    StartWriting = 'StartWriting',
}

export enum WritingMessageStatusType {
    Cleared = 'Cleared',
    Disconnected = 'Disconnected',
    Submit = 'Submit',
    Writing = 'Writing',
}

export type CharacterValueForMessageFragment = {
    __typename?: 'CharacterValueForMessage';
    stateId: string;
    isPrivate: boolean;
    name: string;
    image?: { __typename?: 'FilePath'; sourceType: FileSourceType; path: string } | null;
    portraitImage?: { __typename?: 'FilePath'; sourceType: FileSourceType; path: string } | null;
};

type CreateRoomResult_CreateRoomFailureResult_Fragment = {
    __typename: 'CreateRoomFailureResult';
    failureType: CreateRoomFailureType;
};

type CreateRoomResult_CreateRoomSuccessResult_Fragment = {
    __typename: 'CreateRoomSuccessResult';
    id: string;
    room: { __typename?: 'RoomGetState'; revision: number; createdBy: string; stateJson: string };
};

export type CreateRoomResultFragment =
    | CreateRoomResult_CreateRoomFailureResult_Fragment
    | CreateRoomResult_CreateRoomSuccessResult_Fragment;

export type FileItemFragment = {
    __typename?: 'FileItem';
    filename: string;
    thumbFilename?: string | null;
    screenname: string;
    createdBy: string;
    createdAt?: number | null;
};

export type FilePathFragment = {
    __typename?: 'FilePath';
    sourceType: FileSourceType;
    path: string;
};

export type FileTagFragment = { __typename?: 'FileTag'; id: string; name: string };

export type GetNonJoinedRoomResultFragment = {
    __typename?: 'GetNonJoinedRoomResult';
    roomAsListItem: {
        __typename?: 'RoomAsListItem';
        id: string;
        name: string;
        createdBy: string;
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
        requiresPlayerPassword: boolean;
        requiresSpectatorPassword: boolean;
    }>;
};

export type GetRoomListResultFragment =
    | GetRoomListResult_GetRoomsListFailureResult_Fragment
    | GetRoomListResult_GetRoomsListSuccessResult_Fragment;

type GetRoomResult_GetJoinedRoomResult_Fragment = {
    __typename: 'GetJoinedRoomResult';
    role: ParticipantRole;
    room: { __typename?: 'RoomGetState'; revision: number; createdBy: string; stateJson: string };
};

type GetRoomResult_GetNonJoinedRoomResult_Fragment = {
    __typename: 'GetNonJoinedRoomResult';
    roomAsListItem: {
        __typename?: 'RoomAsListItem';
        id: string;
        name: string;
        createdBy: string;
        requiresPlayerPassword: boolean;
        requiresSpectatorPassword: boolean;
    };
};

type GetRoomResult_GetRoomFailureResult_Fragment = {
    __typename: 'GetRoomFailureResult';
    failureType: GetRoomFailureType;
};

export type GetRoomResultFragment =
    | GetRoomResult_GetJoinedRoomResult_Fragment
    | GetRoomResult_GetNonJoinedRoomResult_Fragment
    | GetRoomResult_GetRoomFailureResult_Fragment;

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
        operatedBy?: { __typename?: 'OperatedBy'; userUid: string; clientId: string } | null;
    } | null;
};

export type JoinRoomResultFragment =
    | JoinRoomResult_JoinRoomFailureResult_Fragment
    | JoinRoomResult_JoinRoomSuccessResult_Fragment;

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
    requiresPlayerPassword: boolean;
    requiresSpectatorPassword: boolean;
};

export type RoomGetStateFragment = {
    __typename?: 'RoomGetState';
    revision: number;
    createdBy: string;
    stateJson: string;
};

export type RoomOperationFragment = {
    __typename?: 'RoomOperation';
    revisionTo: number;
    valueJson: string;
    operatedBy?: { __typename?: 'OperatedBy'; userUid: string; clientId: string } | null;
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
        image?: { __typename?: 'FilePath'; sourceType: FileSourceType; path: string } | null;
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
        image?: { __typename?: 'FilePath'; sourceType: FileSourceType; path: string } | null;
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
    file: { __typename?: 'FilePath'; sourceType: FileSourceType; path: string };
};

type RoomMessageEvent_PieceLog_Fragment = {
    __typename: 'PieceLog';
    messageId: string;
    stateId: string;
    createdAt: number;
    logType: PieceLogType;
    valueJson: string;
};

type RoomMessageEvent_RoomMessagesReset_Fragment = { __typename: 'RoomMessagesReset' };

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
        image?: { __typename?: 'FilePath'; sourceType: FileSourceType; path: string } | null;
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
        image?: { __typename?: 'FilePath'; sourceType: FileSourceType; path: string } | null;
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
    file: { __typename?: 'FilePath'; sourceType: FileSourceType; path: string };
};

export type RoomMessageEventFragment =
    | RoomMessageEvent_PieceLog_Fragment
    | RoomMessageEvent_RoomMessagesReset_Fragment
    | RoomMessageEvent_RoomPrivateMessage_Fragment
    | RoomMessageEvent_RoomPrivateMessageUpdate_Fragment
    | RoomMessageEvent_RoomPublicChannel_Fragment
    | RoomMessageEvent_RoomPublicChannelUpdate_Fragment
    | RoomMessageEvent_RoomPublicMessage_Fragment
    | RoomMessageEvent_RoomPublicMessageUpdate_Fragment
    | RoomMessageEvent_RoomSoundEffect_Fragment;

export type SemVerFragment = {
    __typename?: 'SemVer';
    major: number;
    minor: number;
    patch: number;
    prerelease?: { __typename?: 'Prerelease'; type: PrereleaseType; version: number } | null;
};

export type AmIAdminQueryVariables = Exact<{ [key: string]: never }>;

export type AmIAdminQuery = { __typename?: 'Query'; result: string };

export type GetAvailableGameSystemsQueryVariables = Exact<{ [key: string]: never }>;

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

export type GetDiceHelpMessagesQuery = { __typename?: 'Query'; result?: string | null };

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
        }>;
    };
};

export type GetRoomQueryVariables = Exact<{
    id: Scalars['String'];
}>;

export type GetRoomQuery = {
    __typename?: 'Query';
    result:
        | {
              __typename: 'GetJoinedRoomResult';
              role: ParticipantRole;
              room: {
                  __typename?: 'RoomGetState';
                  revision: number;
                  createdBy: string;
                  stateJson: string;
              };
          }
        | {
              __typename: 'GetNonJoinedRoomResult';
              roomAsListItem: {
                  __typename?: 'RoomAsListItem';
                  id: string;
                  name: string;
                  createdBy: string;
                  requiresPlayerPassword: boolean;
                  requiresSpectatorPassword: boolean;
              };
          }
        | { __typename: 'GetRoomFailureResult'; failureType: GetRoomFailureType };
};

export type GetRoomsListQueryVariables = Exact<{ [key: string]: never }>;

export type GetRoomsListQuery = {
    __typename?: 'Query';
    result:
        | { __typename: 'GetRoomsListFailureResult'; failureType: GetRoomFailureType }
        | {
              __typename: 'GetRoomsListSuccessResult';
              rooms: Array<{
                  __typename?: 'RoomAsListItem';
                  id: string;
                  name: string;
                  createdBy: string;
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
    result:
        | { __typename: 'GetRoomMessagesFailureResult'; failureType: GetRoomMessagesFailureType }
        | {
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
                  file: { __typename?: 'FilePath'; sourceType: FileSourceType; path: string };
              }>;
          };
};

export type GetLogQueryVariables = Exact<{
    roomId: Scalars['String'];
}>;

export type GetLogQuery = {
    __typename?: 'Query';
    result:
        | { __typename: 'GetRoomLogFailureResult'; failureType: GetRoomLogFailureType }
        | {
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
                  file: { __typename?: 'FilePath'; sourceType: FileSourceType; path: string };
              }>;
          };
};

export type GetRoomConnectionsQueryVariables = Exact<{
    roomId: Scalars['String'];
}>;

export type GetRoomConnectionsQuery = {
    __typename?: 'Query';
    result:
        | {
              __typename: 'GetRoomConnectionsFailureResult';
              failureType: GetRoomConnectionFailureType;
          }
        | {
              __typename: 'GetRoomConnectionsSuccessResult';
              fetchedAt: number;
              connectedUserUids: Array<string>;
          };
};

export type GetServerInfoQueryVariables = Exact<{ [key: string]: never }>;

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

export type IsEntryQueryVariables = Exact<{ [key: string]: never }>;

export type IsEntryQuery = { __typename?: 'Query'; result: boolean };

export type GetRoomAsListItemQueryVariables = Exact<{
    roomId: Scalars['String'];
}>;

export type GetRoomAsListItemQuery = {
    __typename?: 'Query';
    result:
        | { __typename: 'GetRoomAsListItemFailureResult'; failureType: GetRoomFailureType }
        | {
              __typename: 'GetRoomAsListItemSuccessResult';
              room: {
                  __typename?: 'RoomAsListItem';
                  id: string;
                  name: string;
                  createdBy: string;
                  requiresPlayerPassword: boolean;
                  requiresSpectatorPassword: boolean;
              };
          };
};

export type CreateFileTagMutationVariables = Exact<{
    tagName: Scalars['String'];
}>;

export type CreateFileTagMutation = {
    __typename?: 'Mutation';
    result?: { __typename?: 'FileTag'; id: string; name: string } | null;
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

export type CreateRoomMutationVariables = Exact<{
    input: CreateRoomInput;
}>;

export type CreateRoomMutation = {
    __typename?: 'Mutation';
    result:
        | { __typename: 'CreateRoomFailureResult'; failureType: CreateRoomFailureType }
        | {
              __typename: 'CreateRoomSuccessResult';
              id: string;
              room: {
                  __typename?: 'RoomGetState';
                  revision: number;
                  createdBy: string;
                  stateJson: string;
              };
          };
};

export type DeleteFilesMutationVariables = Exact<{
    filenames: Array<Scalars['String']> | Scalars['String'];
}>;

export type DeleteFilesMutation = { __typename?: 'Mutation'; result: Array<string> };

export type DeleteFileTagMutationVariables = Exact<{
    tagId: Scalars['String'];
}>;

export type DeleteFileTagMutation = { __typename?: 'Mutation'; result: boolean };

export type DeleteRoomMutationVariables = Exact<{
    id: Scalars['String'];
}>;

export type DeleteRoomMutation = {
    __typename?: 'Mutation';
    result: { __typename?: 'DeleteRoomResult'; failureType?: DeleteRoomFailureType | null };
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

export type EditFileTagsMutation = { __typename?: 'Mutation'; result: boolean };

export type JoinRoomAsPlayerMutationVariables = Exact<{
    id: Scalars['String'];
    name: Scalars['String'];
    password?: InputMaybe<Scalars['String']>;
}>;

export type JoinRoomAsPlayerMutation = {
    __typename?: 'Mutation';
    result:
        | { __typename: 'JoinRoomFailureResult'; failureType: JoinRoomFailureType }
        | {
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
    result:
        | { __typename: 'JoinRoomFailureResult'; failureType: JoinRoomFailureType }
        | {
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
    result: { __typename?: 'EntryToServerResult'; type: EntryToServerResultType };
};

export type LeaveRoomMutationVariables = Exact<{
    id: Scalars['String'];
}>;

export type LeaveRoomMutation = {
    __typename?: 'Mutation';
    result: { __typename?: 'LeaveRoomResult'; failureType?: LeaveRoomFailureType | null };
};

export type OperateMutationVariables = Exact<{
    id: Scalars['String'];
    revisionFrom: Scalars['Int'];
    operation: RoomOperationInput;
    requestId: Scalars['String'];
}>;

export type OperateMutation = {
    __typename?: 'Mutation';
    result:
        | { __typename: 'OperateRoomFailureResult'; failureType: OperateRoomFailureType }
        | { __typename: 'OperateRoomIdResult'; requestId: string }
        | {
              __typename: 'OperateRoomNonJoinedResult';
              roomAsListItem: {
                  __typename?: 'RoomAsListItem';
                  id: string;
                  name: string;
                  createdBy: string;
                  requiresPlayerPassword: boolean;
                  requiresSpectatorPassword: boolean;
              };
          }
        | {
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

export type PingMutationVariables = Exact<{
    value: Scalars['Float'];
}>;

export type PingMutation = {
    __typename?: 'Mutation';
    result: { __typename?: 'Pong'; createdBy?: string | null; value: number };
};

export type PromoteToPlayerMutationVariables = Exact<{
    roomId: Scalars['String'];
    password?: InputMaybe<Scalars['String']>;
}>;

export type PromoteToPlayerMutation = {
    __typename?: 'Mutation';
    result: { __typename?: 'PromoteResult'; failureType?: PromoteFailureType | null };
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
    result:
        | { __typename: 'RoomMessageSyntaxError'; errorMessage: string }
        | {
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
          }
        | {
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
    result:
        | { __typename: 'RoomMessageSyntaxError'; errorMessage: string }
        | {
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
          }
        | {
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
    result:
        | {
              __typename: 'RoomSoundEffect';
              messageId: string;
              createdBy?: string | null;
              createdAt: number;
              volume: number;
              file: { __typename?: 'FilePath'; sourceType: FileSourceType; path: string };
          }
        | {
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
    result: { __typename?: 'EditMessageResult'; failureType?: EditMessageFailureType | null };
};

export type DeleteMessageMutationVariables = Exact<{
    roomId: Scalars['String'];
    messageId: Scalars['String'];
}>;

export type DeleteMessageMutation = {
    __typename?: 'Mutation';
    result: { __typename?: 'DeleteMessageResult'; failureType?: DeleteMessageFailureType | null };
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

export type UpdateWritingMessageStatusMutation = { __typename?: 'Mutation'; result: boolean };

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
            operatedBy?: { __typename?: 'OperatedBy'; userUid: string; clientId: string } | null;
        } | null;
        deleteRoomOperation?: { __typename?: 'DeleteRoomOperation'; deletedBy: string } | null;
        roomMessageEvent?:
            | {
                  __typename: 'PieceLog';
                  messageId: string;
                  stateId: string;
                  createdAt: number;
                  logType: PieceLogType;
                  valueJson: string;
              }
            | { __typename: 'RoomMessagesReset' }
            | {
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
              }
            | {
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
              }
            | { __typename: 'RoomPublicChannel'; key: string; name?: string | null }
            | { __typename: 'RoomPublicChannelUpdate'; key: string; name?: string | null }
            | {
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
              }
            | {
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
              }
            | {
                  __typename: 'RoomSoundEffect';
                  messageId: string;
                  createdBy?: string | null;
                  createdAt: number;
                  volume: number;
                  file: { __typename?: 'FilePath'; sourceType: FileSourceType; path: string };
              }
            | null;
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

export type PongSubscriptionVariables = Exact<{ [key: string]: never }>;

export type PongSubscription = {
    __typename?: 'Subscription';
    pong: { __typename?: 'Pong'; createdBy?: string | null; value: number };
};

export const RoomGetStateFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'RoomGetState' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'RoomGetState' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'revision' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'stateJson' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<RoomGetStateFragment, unknown>;
export const CreateRoomResultFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'CreateRoomResult' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'CreateRoomResult' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                    {
                        kind: 'InlineFragment',
                        typeCondition: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'CreateRoomSuccessResult' },
                        },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'room' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'FragmentSpread',
                                                name: { kind: 'Name', value: 'RoomGetState' },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'CreateRoomFailureResult' },
                        },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'failureType' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<CreateRoomResultFragment, unknown>;
export const FileItemFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'FileItem' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'FileItem' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'filename' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'thumbFilename' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'screenname' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<FileItemFragment, unknown>;
export const FileTagFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'FileTag' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'FileTag' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<FileTagFragment, unknown>;
export const RoomAsListItemFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'RoomAsListItem' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'RoomAsListItem' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'requiresPlayerPassword' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'requiresSpectatorPassword' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<RoomAsListItemFragment, unknown>;
export const GetRoomListResultFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'GetRoomListResult' },
            typeCondition: {
                kind: 'NamedType',
                name: { kind: 'Name', value: 'GetRoomsListResult' },
            },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                    {
                        kind: 'InlineFragment',
                        typeCondition: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'GetRoomsListSuccessResult' },
                        },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'rooms' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'FragmentSpread',
                                                name: { kind: 'Name', value: 'RoomAsListItem' },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'GetRoomsListFailureResult' },
                        },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'failureType' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GetRoomListResultFragment, unknown>;
export const GetNonJoinedRoomResultFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'GetNonJoinedRoomResult' },
            typeCondition: {
                kind: 'NamedType',
                name: { kind: 'Name', value: 'GetNonJoinedRoomResult' },
            },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'roomAsListItem' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'FragmentSpread',
                                    name: { kind: 'Name', value: 'RoomAsListItem' },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GetNonJoinedRoomResultFragment, unknown>;
export const GetRoomResultFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'GetRoomResult' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'GetRoomResult' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                    {
                        kind: 'InlineFragment',
                        typeCondition: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'GetJoinedRoomResult' },
                        },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'room' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'FragmentSpread',
                                                name: { kind: 'Name', value: 'RoomGetState' },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'GetNonJoinedRoomResult' },
                        },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'FragmentSpread',
                                    name: { kind: 'Name', value: 'GetNonJoinedRoomResult' },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'GetRoomFailureResult' },
                        },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'failureType' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GetRoomResultFragment, unknown>;
export const RoomOperationFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'RoomOperation' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'RoomOperation' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'revisionTo' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'operatedBy' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'userUid' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'clientId' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'valueJson' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<RoomOperationFragment, unknown>;
export const JoinRoomResultFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'JoinRoomResult' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'JoinRoomResult' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                    {
                        kind: 'InlineFragment',
                        typeCondition: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'JoinRoomSuccessResult' },
                        },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'operation' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'FragmentSpread',
                                                name: { kind: 'Name', value: 'RoomOperation' },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'JoinRoomFailureResult' },
                        },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'failureType' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<JoinRoomResultFragment, unknown>;
export const FilePathFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'FilePath' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'FilePath' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'path' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<FilePathFragment, unknown>;
export const RoomSoundEffectFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'RoomSoundEffect' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'RoomSoundEffect' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'messageId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'file' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'FragmentSpread',
                                    name: { kind: 'Name', value: 'FilePath' },
                                },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'volume' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<RoomSoundEffectFragment, unknown>;
export const CharacterValueForMessageFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'CharacterValueForMessage' },
            typeCondition: {
                kind: 'NamedType',
                name: { kind: 'Name', value: 'CharacterValueForMessage' },
            },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'stateId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'isPrivate' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'image' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'FragmentSpread',
                                    name: { kind: 'Name', value: 'FilePath' },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'portraitImage' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'FragmentSpread',
                                    name: { kind: 'Name', value: 'FilePath' },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<CharacterValueForMessageFragment, unknown>;
export const RoomPublicMessageFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'RoomPublicMessage' },
            typeCondition: {
                kind: 'NamedType',
                name: { kind: 'Name', value: 'RoomPublicMessage' },
            },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'messageId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'channelKey' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'initText' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'initTextSource' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'updatedText' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'currentText' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'textColor' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'commandResult' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'isSuccess' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'altTextToSecret' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'isSecret' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'character' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'FragmentSpread',
                                    name: { kind: 'Name', value: 'CharacterValueForMessage' },
                                },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'customName' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<RoomPublicMessageFragment, unknown>;
export const RoomPublicChannelFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'RoomPublicChannel' },
            typeCondition: {
                kind: 'NamedType',
                name: { kind: 'Name', value: 'RoomPublicChannel' },
            },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'key' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<RoomPublicChannelFragment, unknown>;
export const RoomPrivateMessageFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'RoomPrivateMessage' },
            typeCondition: {
                kind: 'NamedType',
                name: { kind: 'Name', value: 'RoomPrivateMessage' },
            },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'messageId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'visibleTo' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'initText' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'initTextSource' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'updatedText' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'currentText' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'textColor' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'commandResult' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'isSuccess' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'altTextToSecret' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'isSecret' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'character' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'FragmentSpread',
                                    name: { kind: 'Name', value: 'CharacterValueForMessage' },
                                },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'customName' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<RoomPrivateMessageFragment, unknown>;
export const PieceLogFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'PieceLog' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'PieceLog' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'messageId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'stateId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'logType' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'valueJson' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<PieceLogFragment, unknown>;
export const RoomMessageEventFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'RoomMessageEvent' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'RoomMessageEvent' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                    {
                        kind: 'InlineFragment',
                        typeCondition: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'RoomSoundEffect' },
                        },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'FragmentSpread',
                                    name: { kind: 'Name', value: 'RoomSoundEffect' },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'RoomPublicMessage' },
                        },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'FragmentSpread',
                                    name: { kind: 'Name', value: 'RoomPublicMessage' },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'RoomPublicChannel' },
                        },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'FragmentSpread',
                                    name: { kind: 'Name', value: 'RoomPublicChannel' },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'RoomPrivateMessage' },
                        },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'FragmentSpread',
                                    name: { kind: 'Name', value: 'RoomPrivateMessage' },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'PieceLog' },
                        },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'FragmentSpread',
                                    name: { kind: 'Name', value: 'PieceLog' },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'RoomPublicChannelUpdate' },
                        },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'key' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'RoomPublicMessageUpdate' },
                        },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'messageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'initText' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'initTextSource' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'updatedText' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'currentText' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'updatedAt' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'commandResult' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'text' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'isSuccess' },
                                            },
                                        ],
                                    },
                                },
                                { kind: 'Field', name: { kind: 'Name', value: 'altTextToSecret' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'isSecret' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'RoomPrivateMessageUpdate' },
                        },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'messageId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'initText' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'initTextSource' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'updatedText' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'currentText' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'updatedAt' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'commandResult' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'text' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'isSuccess' },
                                            },
                                        ],
                                    },
                                },
                                { kind: 'Field', name: { kind: 'Name', value: 'altTextToSecret' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'isSecret' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<RoomMessageEventFragment, unknown>;
export const SemVerFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'SemVer' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SemVer' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'major' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'minor' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'patch' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'prerelease' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'version' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<SemVerFragment, unknown>;
export const AmIAdminDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'AmIAdmin' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'amIAdmin' },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<AmIAdminQuery, AmIAdminQueryVariables>;
export const GetAvailableGameSystemsDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'GetAvailableGameSystems' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'getAvailableGameSystems' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'value' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'name' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'sortKey' },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GetAvailableGameSystemsQuery, GetAvailableGameSystemsQueryVariables>;
export const GetDiceHelpMessagesDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'GetDiceHelpMessages' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'getDiceHelpMessage' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'id' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                            },
                        ],
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GetDiceHelpMessagesQuery, GetDiceHelpMessagesQueryVariables>;
export const GetFilesDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'GetFiles' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'GetFilesInput' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'getFiles' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'input' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'files' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'FragmentSpread',
                                                name: { kind: 'Name', value: 'FileItem' },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        ...FileItemFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<GetFilesQuery, GetFilesQueryVariables>;
export const GetRoomDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'GetRoom' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'getRoom' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'id' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'GetJoinedRoomResult' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'role' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'room' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'FragmentSpread',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'RoomGetState',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'GetNonJoinedRoomResult' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'roomAsListItem' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'FragmentSpread',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'RoomAsListItem',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'GetRoomFailureResult' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'failureType' },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        ...RoomGetStateFragmentDoc.definitions,
        ...RoomAsListItemFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<GetRoomQuery, GetRoomQueryVariables>;
export const GetRoomsListDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'GetRoomsList' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'getRoomsList' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'GetRoomsListSuccessResult' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'rooms' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'FragmentSpread',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'RoomAsListItem',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'GetRoomsListFailureResult' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'failureType' },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        ...RoomAsListItemFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<GetRoomsListQuery, GetRoomsListQueryVariables>;
export const GetMessagesDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'GetMessages' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'roomId' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'getMessages' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'roomId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'roomId' },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'RoomMessages' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'publicMessages' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'FragmentSpread',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'RoomPublicMessage',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'privateMessages' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'FragmentSpread',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'RoomPrivateMessage',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'pieceLogs' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'FragmentSpread',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'PieceLog',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'publicChannels' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'FragmentSpread',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'RoomPublicChannel',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'soundEffects' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'FragmentSpread',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'RoomSoundEffect',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: {
                                            kind: 'Name',
                                            value: 'GetRoomMessagesFailureResult',
                                        },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'failureType' },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        ...RoomPublicMessageFragmentDoc.definitions,
        ...CharacterValueForMessageFragmentDoc.definitions,
        ...FilePathFragmentDoc.definitions,
        ...RoomPrivateMessageFragmentDoc.definitions,
        ...PieceLogFragmentDoc.definitions,
        ...RoomPublicChannelFragmentDoc.definitions,
        ...RoomSoundEffectFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<GetMessagesQuery, GetMessagesQueryVariables>;
export const GetLogDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'GetLog' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'roomId' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'getLog' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'roomId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'roomId' },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'RoomMessages' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'publicMessages' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'FragmentSpread',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'RoomPublicMessage',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'privateMessages' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'FragmentSpread',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'RoomPrivateMessage',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'pieceLogs' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'FragmentSpread',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'PieceLog',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'publicChannels' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'FragmentSpread',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'RoomPublicChannel',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'soundEffects' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'FragmentSpread',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'RoomSoundEffect',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'GetRoomLogFailureResult' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'failureType' },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        ...RoomPublicMessageFragmentDoc.definitions,
        ...CharacterValueForMessageFragmentDoc.definitions,
        ...FilePathFragmentDoc.definitions,
        ...RoomPrivateMessageFragmentDoc.definitions,
        ...PieceLogFragmentDoc.definitions,
        ...RoomPublicChannelFragmentDoc.definitions,
        ...RoomSoundEffectFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<GetLogQuery, GetLogQueryVariables>;
export const GetRoomConnectionsDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'GetRoomConnections' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'roomId' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'getRoomConnections' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'roomId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'roomId' },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: {
                                            kind: 'Name',
                                            value: 'GetRoomConnectionsSuccessResult',
                                        },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'fetchedAt' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'connectedUserUids' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: {
                                            kind: 'Name',
                                            value: 'GetRoomConnectionsFailureResult',
                                        },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'failureType' },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GetRoomConnectionsQuery, GetRoomConnectionsQueryVariables>;
export const GetServerInfoDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'GetServerInfo' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'getServerInfo' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'version' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'FragmentSpread',
                                                name: { kind: 'Name', value: 'SemVer' },
                                            },
                                        ],
                                    },
                                },
                                { kind: 'Field', name: { kind: 'Name', value: 'uploaderEnabled' } },
                            ],
                        },
                    },
                ],
            },
        },
        ...SemVerFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<GetServerInfoQuery, GetServerInfoQueryVariables>;
export const IsEntryDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'IsEntry' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'isEntry' },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<IsEntryQuery, IsEntryQueryVariables>;
export const GetRoomAsListItemDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'GetRoomAsListItem' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'roomId' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'getRoomAsListItem' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'roomId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'roomId' },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: {
                                            kind: 'Name',
                                            value: 'GetRoomAsListItemSuccessResult',
                                        },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'room' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'FragmentSpread',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'RoomAsListItem',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: {
                                            kind: 'Name',
                                            value: 'GetRoomAsListItemFailureResult',
                                        },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'failureType' },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        ...RoomAsListItemFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<GetRoomAsListItemQuery, GetRoomAsListItemQueryVariables>;
export const CreateFileTagDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'CreateFileTag' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'tagName' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'createFileTag' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'tagName' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'tagName' },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'FragmentSpread',
                                    name: { kind: 'Name', value: 'FileTag' },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        ...FileTagFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<CreateFileTagMutation, CreateFileTagMutationVariables>;
export const ChangeParticipantNameDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'ChangeParticipantName' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'roomId' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'newName' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'changeParticipantName' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'roomId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'roomId' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'newName' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'newName' },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'failureType' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<ChangeParticipantNameMutation, ChangeParticipantNameMutationVariables>;
export const CreateRoomDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'CreateRoom' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'CreateRoomInput' },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'createRoom' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'input' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'CreateRoomSuccessResult' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'FragmentSpread',
                                                name: { kind: 'Name', value: 'CreateRoomResult' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'CreateRoomFailureResult' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'failureType' },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        ...CreateRoomResultFragmentDoc.definitions,
        ...RoomGetStateFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<CreateRoomMutation, CreateRoomMutationVariables>;
export const DeleteFilesDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'DeleteFiles' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'filenames' } },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'ListType',
                            type: {
                                kind: 'NonNullType',
                                type: {
                                    kind: 'NamedType',
                                    name: { kind: 'Name', value: 'String' },
                                },
                            },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'deleteFiles' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'filenames' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'filenames' },
                                },
                            },
                        ],
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<DeleteFilesMutation, DeleteFilesMutationVariables>;
export const DeleteFileTagDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'DeleteFileTag' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'tagId' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'deleteFileTag' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'tagId' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'tagId' } },
                            },
                        ],
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<DeleteFileTagMutation, DeleteFileTagMutationVariables>;
export const DeleteRoomDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'DeleteRoom' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'deleteRoom' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'id' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'failureType' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<DeleteRoomMutation, DeleteRoomMutationVariables>;
export const DeleteRoomAsAdminDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'DeleteRoomAsAdmin' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'deleteRoomAsAdmin' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'id' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'failureType' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<DeleteRoomAsAdminMutation, DeleteRoomAsAdminMutationVariables>;
export const EditFileTagsDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'EditFileTags' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'EditFileTagsInput' },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'editFileTags' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'input' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
                            },
                        ],
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<EditFileTagsMutation, EditFileTagsMutationVariables>;
export const JoinRoomAsPlayerDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'JoinRoomAsPlayer' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'password' } },
                    type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'joinRoomAsPlayer' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'id' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'name' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'password' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'password' },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'FragmentSpread',
                                    name: { kind: 'Name', value: 'JoinRoomResult' },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        ...JoinRoomResultFragmentDoc.definitions,
        ...RoomOperationFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<JoinRoomAsPlayerMutation, JoinRoomAsPlayerMutationVariables>;
export const JoinRoomAsSpectatorDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'JoinRoomAsSpectator' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'password' } },
                    type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'joinRoomAsSpectator' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'id' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'name' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'password' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'password' },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'FragmentSpread',
                                    name: { kind: 'Name', value: 'JoinRoomResult' },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        ...JoinRoomResultFragmentDoc.definitions,
        ...RoomOperationFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<JoinRoomAsSpectatorMutation, JoinRoomAsSpectatorMutationVariables>;
export const EntryToServerDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'EntryToServer' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'password' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'entryToServer' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'password' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'password' },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'Field', name: { kind: 'Name', value: 'type' } }],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<EntryToServerMutation, EntryToServerMutationVariables>;
export const LeaveRoomDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'LeaveRoom' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'leaveRoom' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'id' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'failureType' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<LeaveRoomMutation, LeaveRoomMutationVariables>;
export const OperateDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'Operate' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'revisionFrom' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'operation' } },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'RoomOperationInput' },
                        },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'requestId' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'operate' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'id' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'prevRevision' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'revisionFrom' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'operation' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'operation' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'requestId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'requestId' },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'OperateRoomSuccessResult' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'operation' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'FragmentSpread',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'RoomOperation',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'OperateRoomIdResult' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'requestId' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'OperateRoomFailureResult' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'failureType' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'OperateRoomNonJoinedResult' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'roomAsListItem' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'FragmentSpread',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'RoomAsListItem',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        ...RoomOperationFragmentDoc.definitions,
        ...RoomAsListItemFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<OperateMutation, OperateMutationVariables>;
export const PingDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'Ping' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'value' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'Float' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'ping' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'value' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'value' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<PingMutation, PingMutationVariables>;
export const PromoteToPlayerDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'PromoteToPlayer' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'roomId' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'password' } },
                    type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'promoteToPlayer' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'roomId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'roomId' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'password' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'password' },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'failureType' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<PromoteToPlayerMutation, PromoteToPlayerMutationVariables>;
export const ResetMessagesDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'ResetMessages' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'roomId' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'resetMessages' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'roomId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'roomId' },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'failureType' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<ResetMessagesMutation, ResetMessagesMutationVariables>;
export const WritePublicMessageDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'WritePublicMessage' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'roomId' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'text' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'textColor' } },
                    type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'channelKey' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'characterId' } },
                    type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'customName' } },
                    type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'gameType' } },
                    type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'writePublicMessage' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'roomId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'roomId' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'text' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'text' } },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'textColor' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'textColor' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'channelKey' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'channelKey' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'characterId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'characterId' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'customName' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'customName' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'gameType' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'gameType' },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'RoomPublicMessage' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'FragmentSpread',
                                                name: { kind: 'Name', value: 'RoomPublicMessage' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: {
                                            kind: 'Name',
                                            value: 'WriteRoomPublicMessageFailureResult',
                                        },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'failureType' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'RoomMessageSyntaxError' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'errorMessage' },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        ...RoomPublicMessageFragmentDoc.definitions,
        ...CharacterValueForMessageFragmentDoc.definitions,
        ...FilePathFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<WritePublicMessageMutation, WritePublicMessageMutationVariables>;
export const WritePrivateMessageDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'WritePrivateMessage' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'roomId' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'visibleTo' } },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'ListType',
                            type: {
                                kind: 'NonNullType',
                                type: {
                                    kind: 'NamedType',
                                    name: { kind: 'Name', value: 'String' },
                                },
                            },
                        },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'text' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'textColor' } },
                    type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'characterId' } },
                    type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'customName' } },
                    type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'gameType' } },
                    type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'writePrivateMessage' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'roomId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'roomId' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'visibleTo' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'visibleTo' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'text' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'text' } },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'textColor' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'textColor' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'characterId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'characterId' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'customName' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'customName' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'gameType' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'gameType' },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'RoomPrivateMessage' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'FragmentSpread',
                                                name: { kind: 'Name', value: 'RoomPrivateMessage' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: {
                                            kind: 'Name',
                                            value: 'WriteRoomPrivateMessageFailureResult',
                                        },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'failureType' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'RoomMessageSyntaxError' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'errorMessage' },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        ...RoomPrivateMessageFragmentDoc.definitions,
        ...CharacterValueForMessageFragmentDoc.definitions,
        ...FilePathFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<WritePrivateMessageMutation, WritePrivateMessageMutationVariables>;
export const WriteRoomSoundEffectDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'WriteRoomSoundEffect' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'roomId' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'file' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'FilePathInput' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'volume' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'Float' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'writeRoomSoundEffect' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'roomId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'roomId' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'file' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'file' } },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'volume' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'volume' },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'RoomSoundEffect' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'FragmentSpread',
                                                name: { kind: 'Name', value: 'RoomSoundEffect' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: {
                                            kind: 'Name',
                                            value: 'WriteRoomSoundEffectFailureResult',
                                        },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'failureType' },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        ...RoomSoundEffectFragmentDoc.definitions,
        ...FilePathFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<WriteRoomSoundEffectMutation, WriteRoomSoundEffectMutationVariables>;
export const EditMessageDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'EditMessage' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'roomId' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'messageId' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'text' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'editMessage' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'roomId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'roomId' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'messageId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'messageId' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'text' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'text' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'failureType' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<EditMessageMutation, EditMessageMutationVariables>;
export const DeleteMessageDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'DeleteMessage' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'roomId' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'messageId' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'deleteMessage' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'roomId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'roomId' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'messageId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'messageId' },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'failureType' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<DeleteMessageMutation, DeleteMessageMutationVariables>;
export const MakeMessageNotSecretDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'MakeMessageNotSecret' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'roomId' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'messageId' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'makeMessageNotSecret' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'roomId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'roomId' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'messageId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'messageId' },
                                },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'failureType' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<MakeMessageNotSecretMutation, MakeMessageNotSecretMutationVariables>;
export const UpdateWritingMessageStatusDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'UpdateWritingMessageStatus' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'roomId' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'newStatus' } },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'WritingMessageStatusInputType' },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'updateWritingMessageStatus' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'roomId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'roomId' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'newStatus' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'newStatus' },
                                },
                            },
                        ],
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<
    UpdateWritingMessageStatusMutation,
    UpdateWritingMessageStatusMutationVariables
>;
export const RoomEventDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'subscription',
            name: { kind: 'Name', value: 'RoomEvent' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'roomEvent' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'id' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'isRoomMessagesResetEvent' },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'roomOperation' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'FragmentSpread',
                                                name: { kind: 'Name', value: 'RoomOperation' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'deleteRoomOperation' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'deletedBy' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'roomMessageEvent' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'FragmentSpread',
                                                name: { kind: 'Name', value: 'RoomMessageEvent' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'roomConnectionEvent' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'userUid' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'isConnected' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'updatedAt' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'writingMessageStatus' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'userUid' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'status' },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        ...RoomOperationFragmentDoc.definitions,
        ...RoomMessageEventFragmentDoc.definitions,
        ...RoomSoundEffectFragmentDoc.definitions,
        ...FilePathFragmentDoc.definitions,
        ...RoomPublicMessageFragmentDoc.definitions,
        ...CharacterValueForMessageFragmentDoc.definitions,
        ...RoomPublicChannelFragmentDoc.definitions,
        ...RoomPrivateMessageFragmentDoc.definitions,
        ...PieceLogFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<RoomEventSubscription, RoomEventSubscriptionVariables>;
export const PongDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'subscription',
            name: { kind: 'Name', value: 'Pong' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pong' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<PongSubscription, PongSubscriptionVariables>;
