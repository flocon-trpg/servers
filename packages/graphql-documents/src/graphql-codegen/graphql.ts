import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
    [_ in K]?: never;
};
export type Incremental<T> =
    | T
    | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: { input: string; output: string };
    String: { input: string; output: string };
    Boolean: { input: boolean; output: boolean };
    Int: { input: number; output: number };
    Float: { input: number; output: number };
};

export const AnswerRollCallFailureType = {
    NotAuthorizedParticipant: 'NotAuthorizedParticipant',
    RollCallNotFound: 'RollCallNotFound',
    RoomNotFound: 'RoomNotFound',
    TooManyRequests: 'TooManyRequests',
} as const;

export type AnswerRollCallFailureType =
    (typeof AnswerRollCallFailureType)[keyof typeof AnswerRollCallFailureType];
export type AnswerRollCallResult = {
    __typename?: 'AnswerRollCallResult';
    failureType?: Maybe<AnswerRollCallFailureType>;
};

export type AvailableGameSystem = {
    __typename?: 'AvailableGameSystem';
    id: Scalars['String']['output'];
    name: Scalars['String']['output'];
    sortKey: Scalars['String']['output'];
};

export const ChangeParticipantNameFailureType = {
    NotFound: 'NotFound',
    NotParticipant: 'NotParticipant',
} as const;

export type ChangeParticipantNameFailureType =
    (typeof ChangeParticipantNameFailureType)[keyof typeof ChangeParticipantNameFailureType];
export type ChangeParticipantNameResult = {
    __typename?: 'ChangeParticipantNameResult';
    failureType?: Maybe<ChangeParticipantNameFailureType>;
};

export type CharacterValueForMessage = {
    __typename?: 'CharacterValueForMessage';
    image?: Maybe<FilePath>;
    isPrivate: Scalars['Boolean']['output'];
    name: Scalars['String']['output'];
    portraitImage?: Maybe<FilePath>;
    stateId: Scalars['String']['output'];
};

export const CloseRollCallFailureType = {
    AlreadyClosed: 'AlreadyClosed',
    NotAuthorizedParticipant: 'NotAuthorizedParticipant',
    RollCallNotFound: 'RollCallNotFound',
    RoomNotFound: 'RoomNotFound',
    TooManyRequests: 'TooManyRequests',
} as const;

export type CloseRollCallFailureType =
    (typeof CloseRollCallFailureType)[keyof typeof CloseRollCallFailureType];
export type CloseRollCallResult = {
    __typename?: 'CloseRollCallResult';
    failureType?: Maybe<CloseRollCallFailureType>;
};

export type CommandResult = {
    __typename?: 'CommandResult';
    /** 成功判定のないコマンドの場合はnullish。成功判定のあるコマンドの場合はその結果。 */
    isSuccess?: Maybe<Scalars['Boolean']['output']>;
    text: Scalars['String']['output'];
};

export type CreateRoomFailureResult = {
    __typename?: 'CreateRoomFailureResult';
    failureType: CreateRoomFailureType;
};

export const CreateRoomFailureType = {
    UnknownError: 'UnknownError',
} as const;

export type CreateRoomFailureType =
    (typeof CreateRoomFailureType)[keyof typeof CreateRoomFailureType];
export type CreateRoomInput = {
    participantName: Scalars['String']['input'];
    playerPassword?: InputMaybe<Scalars['String']['input']>;
    roomName: Scalars['String']['input'];
    spectatorPassword?: InputMaybe<Scalars['String']['input']>;
};

export type CreateRoomResult = CreateRoomFailureResult | CreateRoomSuccessResult;

export type CreateRoomSuccessResult = {
    __typename?: 'CreateRoomSuccessResult';
    room: RoomGetState;
    roomId: Scalars['String']['output'];
};

export const DeleteMessageFailureType = {
    MessageDeleted: 'MessageDeleted',
    MessageNotFound: 'MessageNotFound',
    NotParticipant: 'NotParticipant',
    NotYourMessage: 'NotYourMessage',
    RoomNotFound: 'RoomNotFound',
} as const;

export type DeleteMessageFailureType =
    (typeof DeleteMessageFailureType)[keyof typeof DeleteMessageFailureType];
export type DeleteMessageResult = {
    __typename?: 'DeleteMessageResult';
    failureType?: Maybe<DeleteMessageFailureType>;
};

export const DeleteRoomAsAdminFailureType = {
    NotFound: 'NotFound',
} as const;

export type DeleteRoomAsAdminFailureType =
    (typeof DeleteRoomAsAdminFailureType)[keyof typeof DeleteRoomAsAdminFailureType];
export type DeleteRoomAsAdminResult = {
    __typename?: 'DeleteRoomAsAdminResult';
    failureType?: Maybe<DeleteRoomAsAdminFailureType>;
};

export const DeleteRoomFailureType = {
    NotCreatedByYou: 'NotCreatedByYou',
    NotFound: 'NotFound',
} as const;

export type DeleteRoomFailureType =
    (typeof DeleteRoomFailureType)[keyof typeof DeleteRoomFailureType];
export type DeleteRoomOperation = {
    __typename?: 'DeleteRoomOperation';
    deletedBy: Scalars['String']['output'];
    /** since v0.7.2 */
    deletedByAdmin: Scalars['Boolean']['output'];
};

export type DeleteRoomResult = {
    __typename?: 'DeleteRoomResult';
    failureType?: Maybe<DeleteRoomFailureType>;
};

export type EditFileTagActionInput = {
    add: Array<Scalars['String']['input']>;
    filename: Scalars['String']['input'];
    remove: Array<Scalars['String']['input']>;
};

export type EditFileTagsInput = {
    actions: Array<EditFileTagActionInput>;
};

export const EditMessageFailureType = {
    MessageDeleted: 'MessageDeleted',
    MessageNotFound: 'MessageNotFound',
    NotParticipant: 'NotParticipant',
    NotYourMessage: 'NotYourMessage',
    RoomNotFound: 'RoomNotFound',
} as const;

export type EditMessageFailureType =
    (typeof EditMessageFailureType)[keyof typeof EditMessageFailureType];
export type EditMessageResult = {
    __typename?: 'EditMessageResult';
    failureType?: Maybe<EditMessageFailureType>;
};

export type EntryToServerResult = {
    __typename?: 'EntryToServerResult';
    type: EntryWithPasswordResultType;
};

export const EntryWithPasswordResultType = {
    AlreadyEntried: 'AlreadyEntried',
    NotSignIn: 'NotSignIn',
    PasswordRequired: 'PasswordRequired',
    Success: 'Success',
    WrongPassword: 'WrongPassword',
} as const;

export type EntryWithPasswordResultType =
    (typeof EntryWithPasswordResultType)[keyof typeof EntryWithPasswordResultType];
export type FileItem = {
    __typename?: 'FileItem';
    createdAt?: Maybe<Scalars['Float']['output']>;
    /** ファイルをアップロードしたユーザー。Firebase AuthenticationのUserUidで表現される。 */
    createdBy: Scalars['String']['output'];
    /** サーバーで管理されているファイル名。axiosなどでファイルを取得する際はこれを用いる。ソートするとアップロードした時系列順になる。 */
    filename: Scalars['ID']['output'];
    listType: FileListType;
    /** ユーザーが名付けたファイル名。 */
    screenname: Scalars['String']['output'];
    /** サムネイル画像のファイル名。axiosなどを用いてファイルを取得する。 */
    thumbFilename?: Maybe<Scalars['String']['output']>;
};

export const FileListType = {
    Public: 'Public',
    Unlisted: 'Unlisted',
} as const;

export type FileListType = (typeof FileListType)[keyof typeof FileListType];
export type FilePath = {
    __typename?: 'FilePath';
    path: Scalars['String']['output'];
    sourceType: FileSourceType;
};

export type FilePathInput = {
    path: Scalars['String']['input'];
    sourceType: FileSourceType;
};

export const FileSourceType = {
    Default: 'Default',
    FirebaseStorage: 'FirebaseStorage',
    Uploader: 'Uploader',
} as const;

export type FileSourceType = (typeof FileSourceType)[keyof typeof FileSourceType];
export type FileTag = {
    __typename?: 'FileTag';
    id: Scalars['String']['output'];
    name: Scalars['String']['output'];
};

export type GetAvailableGameSystemsResult = {
    __typename?: 'GetAvailableGameSystemsResult';
    value: Array<AvailableGameSystem>;
};

export type GetFilesInput = {
    /** FileTagのidを指定することで、指定したタグが付いているファイルのみを抽出して表示する。例えばidがx,yの3つのタグが付いているファイルは、[]や[x]や[x,y]と指定した場合にマッチするが、[x,y,z]と指定された場合は除外される。 */
    fileTagIds: Array<Scalars['String']['input']>;
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

export type GetRoomAsListItemResult =
    | GetRoomAsListItemFailureResult
    | GetRoomAsListItemSuccessResult;

export type GetRoomAsListItemSuccessResult = {
    __typename?: 'GetRoomAsListItemSuccessResult';
    room: RoomAsListItem;
};

export const GetRoomConnectionFailureType = {
    NotParticipant: 'NotParticipant',
    RoomNotFound: 'RoomNotFound',
} as const;

export type GetRoomConnectionFailureType =
    (typeof GetRoomConnectionFailureType)[keyof typeof GetRoomConnectionFailureType];
export type GetRoomConnectionsFailureResult = {
    __typename?: 'GetRoomConnectionsFailureResult';
    failureType: GetRoomConnectionFailureType;
};

export type GetRoomConnectionsResult =
    | GetRoomConnectionsFailureResult
    | GetRoomConnectionsSuccessResult;

export type GetRoomConnectionsSuccessResult = {
    __typename?: 'GetRoomConnectionsSuccessResult';
    connectedUserUids: Array<Scalars['String']['output']>;
    fetchedAt: Scalars['Float']['output'];
};

export type GetRoomFailureResult = {
    __typename?: 'GetRoomFailureResult';
    failureType: GetRoomFailureType;
};

export const GetRoomFailureType = {
    NotFound: 'NotFound',
} as const;

export type GetRoomFailureType = (typeof GetRoomFailureType)[keyof typeof GetRoomFailureType];
export type GetRoomLogFailureResult = {
    __typename?: 'GetRoomLogFailureResult';
    failureType: GetRoomLogFailureType;
};

export const GetRoomLogFailureType = {
    NotAuthorized: 'NotAuthorized',
    NotParticipant: 'NotParticipant',
    RoomNotFound: 'RoomNotFound',
    UnknownError: 'UnknownError',
} as const;

export type GetRoomLogFailureType =
    (typeof GetRoomLogFailureType)[keyof typeof GetRoomLogFailureType];
export type GetRoomLogResult = GetRoomLogFailureResult | RoomMessages;

export type GetRoomMessagesFailureResult = {
    __typename?: 'GetRoomMessagesFailureResult';
    failureType: GetRoomMessagesFailureType;
};

export const GetRoomMessagesFailureType = {
    NotParticipant: 'NotParticipant',
    RoomNotFound: 'RoomNotFound',
} as const;

export type GetRoomMessagesFailureType =
    (typeof GetRoomMessagesFailureType)[keyof typeof GetRoomMessagesFailureType];
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

export const JoinRoomFailureType = {
    AlreadyParticipant: 'AlreadyParticipant',
    NotFound: 'NotFound',
    TransformError: 'TransformError',
    WrongPassword: 'WrongPassword',
} as const;

export type JoinRoomFailureType = (typeof JoinRoomFailureType)[keyof typeof JoinRoomFailureType];
export type JoinRoomResult = JoinRoomFailureResult | JoinRoomSuccessResult;

export type JoinRoomSuccessResult = {
    __typename?: 'JoinRoomSuccessResult';
    operation?: Maybe<RoomOperation>;
};

export const LeaveRoomFailureType = {
    NotFound: 'NotFound',
    NotParticipant: 'NotParticipant',
} as const;

export type LeaveRoomFailureType = (typeof LeaveRoomFailureType)[keyof typeof LeaveRoomFailureType];
export type LeaveRoomResult = {
    __typename?: 'LeaveRoomResult';
    failureType?: Maybe<LeaveRoomFailureType>;
};

export const MakeMessageNotSecretFailureType = {
    MessageNotFound: 'MessageNotFound',
    NotParticipant: 'NotParticipant',
    NotSecret: 'NotSecret',
    NotYourMessage: 'NotYourMessage',
    RoomNotFound: 'RoomNotFound',
} as const;

export type MakeMessageNotSecretFailureType =
    (typeof MakeMessageNotSecretFailureType)[keyof typeof MakeMessageNotSecretFailureType];
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
    deleteFileTag: Scalars['Boolean']['output'];
    /** since v0.7.8 */
    deleteFiles: Array<Scalars['String']['output']>;
    deleteMessage: DeleteMessageResult;
    deleteRoom: DeleteRoomResult;
    /** since v0.7.2 */
    deleteRoomAsAdmin: DeleteRoomAsAdminResult;
    /** @deprecated Use screenname to group files by folders instead. */
    editFileTags: Scalars['Boolean']['output'];
    editMessage: EditMessageResult;
    /** エントリーを試みます。エントリーパスワードが設定されている場合は password を渡す必要があります。エントリーしているかどうかの確認にも用いることができ、その際は password は渡す必要はありません。 */
    entryToServer: EntryToServerResult;
    joinRoomAsPlayer: JoinRoomResult;
    joinRoomAsSpectator: JoinRoomResult;
    leaveRoom: LeaveRoomResult;
    makeMessageNotSecret: MakeMessageNotSecretResult;
    /** この Mutation を直接実行することは非推奨です。代わりに @flocon-trpg/sdk を用いてください。 */
    operate: OperateRoomResult;
    /** since v0.7.13 */
    performRollCall: PerformRollCallResult;
    promoteToPlayer: PromoteResult;
    renameFiles: Array<Scalars['String']['output']>;
    resetMessages: ResetRoomMessagesResult;
    updateBookmark: UpdateBookmarkResult;
    /** この Mutation を直接実行することは非推奨です。代わりに @flocon-trpg/sdk を用いてください。 */
    updateWritingMessageStatus: Scalars['Boolean']['output'];
    writePrivateMessage: WriteRoomPrivateMessageResult;
    writePublicMessage: WriteRoomPublicMessageResult;
    writeRoomSoundEffect: WriteRoomSoundEffectResult;
};

export type MutationAnswerRollCallArgs = {
    answer: Scalars['Boolean']['input'];
    rollCallId: Scalars['String']['input'];
    roomId: Scalars['String']['input'];
};

export type MutationChangeParticipantNameArgs = {
    newName: Scalars['String']['input'];
    roomId: Scalars['String']['input'];
};

export type MutationCloseRollCallArgs = {
    rollCallId: Scalars['String']['input'];
    roomId: Scalars['String']['input'];
};

export type MutationCreateFileTagArgs = {
    tagName: Scalars['String']['input'];
};

export type MutationCreateRoomArgs = {
    input: CreateRoomInput;
};

export type MutationDeleteFileTagArgs = {
    tagId: Scalars['String']['input'];
};

export type MutationDeleteFilesArgs = {
    filenames: Array<Scalars['String']['input']>;
};

export type MutationDeleteMessageArgs = {
    messageId: Scalars['String']['input'];
    roomId: Scalars['String']['input'];
};

export type MutationDeleteRoomArgs = {
    roomId: Scalars['String']['input'];
};

export type MutationDeleteRoomAsAdminArgs = {
    roomId: Scalars['String']['input'];
};

export type MutationEditFileTagsArgs = {
    input: EditFileTagsInput;
};

export type MutationEditMessageArgs = {
    messageId: Scalars['String']['input'];
    roomId: Scalars['String']['input'];
    text: Scalars['String']['input'];
};

export type MutationEntryToServerArgs = {
    password?: InputMaybe<Scalars['String']['input']>;
};

export type MutationJoinRoomAsPlayerArgs = {
    name: Scalars['String']['input'];
    password?: InputMaybe<Scalars['String']['input']>;
    roomId: Scalars['String']['input'];
};

export type MutationJoinRoomAsSpectatorArgs = {
    name: Scalars['String']['input'];
    password?: InputMaybe<Scalars['String']['input']>;
    roomId: Scalars['String']['input'];
};

export type MutationLeaveRoomArgs = {
    roomId: Scalars['String']['input'];
};

export type MutationMakeMessageNotSecretArgs = {
    messageId: Scalars['String']['input'];
    roomId: Scalars['String']['input'];
};

export type MutationOperateArgs = {
    operation: RoomOperationInput;
    prevRevision: Scalars['Int']['input'];
    requestId: Scalars['String']['input'];
    roomId: Scalars['String']['input'];
};

export type MutationPerformRollCallArgs = {
    input: PerformRollCallInput;
};

export type MutationPromoteToPlayerArgs = {
    password?: InputMaybe<Scalars['String']['input']>;
    roomId: Scalars['String']['input'];
};

export type MutationRenameFilesArgs = {
    input: Array<RenameFileInput>;
};

export type MutationResetMessagesArgs = {
    roomId: Scalars['String']['input'];
};

export type MutationUpdateBookmarkArgs = {
    newValue: Scalars['Boolean']['input'];
    roomId: Scalars['String']['input'];
};

export type MutationUpdateWritingMessageStatusArgs = {
    newStatus: WritingMessageStatusInputType;
    roomId: Scalars['String']['input'];
};

export type MutationWritePrivateMessageArgs = {
    characterId?: InputMaybe<Scalars['String']['input']>;
    customName?: InputMaybe<Scalars['String']['input']>;
    gameType?: InputMaybe<Scalars['String']['input']>;
    roomId: Scalars['String']['input'];
    text: Scalars['String']['input'];
    textColor?: InputMaybe<Scalars['String']['input']>;
    visibleTo: Array<Scalars['String']['input']>;
};

export type MutationWritePublicMessageArgs = {
    channelKey: Scalars['String']['input'];
    characterId?: InputMaybe<Scalars['String']['input']>;
    customName?: InputMaybe<Scalars['String']['input']>;
    gameType?: InputMaybe<Scalars['String']['input']>;
    roomId: Scalars['String']['input'];
    text: Scalars['String']['input'];
    textColor?: InputMaybe<Scalars['String']['input']>;
};

export type MutationWriteRoomSoundEffectArgs = {
    file: FilePathInput;
    roomId: Scalars['String']['input'];
    volume: Scalars['Float']['input'];
};

export type OperateRoomFailureResult = {
    __typename?: 'OperateRoomFailureResult';
    failureType: OperateRoomFailureType;
};

export const OperateRoomFailureType = {
    NotFound: 'NotFound',
} as const;

export type OperateRoomFailureType =
    (typeof OperateRoomFailureType)[keyof typeof OperateRoomFailureType];
export type OperateRoomIdResult = {
    __typename?: 'OperateRoomIdResult';
    requestId: Scalars['String']['output'];
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
    clientId: Scalars['String']['output'];
    userUid: Scalars['String']['output'];
};

export const ParticipantRole = {
    Master: 'Master',
    Player: 'Player',
    Spectator: 'Spectator',
} as const;

export type ParticipantRole = (typeof ParticipantRole)[keyof typeof ParticipantRole];
export const PerformRollCallFailureType = {
    HasOpenRollCall: 'HasOpenRollCall',
    NotAuthorizedParticipant: 'NotAuthorizedParticipant',
    NotFound: 'NotFound',
    TooManyRequests: 'TooManyRequests',
} as const;

export type PerformRollCallFailureType =
    (typeof PerformRollCallFailureType)[keyof typeof PerformRollCallFailureType];
export type PerformRollCallInput = {
    roomId: Scalars['String']['input'];
    /** SE を設定する場合、これと併せて soundEffectVolume もセットする必要があります。 */
    soundEffectFile?: InputMaybe<FilePathInput>;
    /** SE を設定する場合、これと併せて soundEffectFile もセットする必要があります。 */
    soundEffectVolume?: InputMaybe<Scalars['Float']['input']>;
};

export type PerformRollCallResult = {
    __typename?: 'PerformRollCallResult';
    failureType?: Maybe<PerformRollCallFailureType>;
};

export type PieceLog = {
    __typename?: 'PieceLog';
    createdAt: Scalars['Float']['output'];
    logType: PieceLogType;
    messageId: Scalars['String']['output'];
    stateId: Scalars['String']['output'];
    valueJson: Scalars['String']['output'];
};

export const PieceLogType = {
    Dice: 'Dice',
    String: 'String',
} as const;

export type PieceLogType = (typeof PieceLogType)[keyof typeof PieceLogType];
export type Prerelease = {
    __typename?: 'Prerelease';
    type: PrereleaseType;
    version: Scalars['Float']['output'];
};

export type PrereleaseInput = {
    type: PrereleaseType;
    version: Scalars['Float']['input'];
};

export const PrereleaseType = {
    Alpha: 'Alpha',
    Beta: 'Beta',
    Rc: 'Rc',
} as const;

export type PrereleaseType = (typeof PrereleaseType)[keyof typeof PrereleaseType];
export const PromoteFailureType = {
    NoNeedToPromote: 'NoNeedToPromote',
    NotFound: 'NotFound',
    NotParticipant: 'NotParticipant',
    WrongPassword: 'WrongPassword',
} as const;

export type PromoteFailureType = (typeof PromoteFailureType)[keyof typeof PromoteFailureType];
export type PromoteResult = {
    __typename?: 'PromoteResult';
    failureType?: Maybe<PromoteFailureType>;
};

export type Query = {
    __typename?: 'Query';
    getAvailableGameSystems: GetAvailableGameSystemsResult;
    getDiceHelpMessage?: Maybe<Scalars['String']['output']>;
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
};

export type QueryGetDiceHelpMessageArgs = {
    gameSystemId: Scalars['String']['input'];
};

export type QueryGetFilesArgs = {
    input: GetFilesInput;
};

export type QueryGetLogArgs = {
    roomId: Scalars['String']['input'];
};

export type QueryGetMessagesArgs = {
    roomId: Scalars['String']['input'];
};

export type QueryGetRoomArgs = {
    roomId: Scalars['String']['input'];
};

export type QueryGetRoomAsListItemArgs = {
    roomId: Scalars['String']['input'];
};

export type QueryGetRoomConnectionsArgs = {
    roomId: Scalars['String']['input'];
};

export type RenameFileInput = {
    filename: Scalars['String']['input'];
    newScreenname: Scalars['String']['input'];
};

export const ResetRoomMessagesFailureType = {
    NotAuthorized: 'NotAuthorized',
    NotParticipant: 'NotParticipant',
    RoomNotFound: 'RoomNotFound',
} as const;

export type ResetRoomMessagesFailureType =
    (typeof ResetRoomMessagesFailureType)[keyof typeof ResetRoomMessagesFailureType];
export type ResetRoomMessagesResult = {
    __typename?: 'ResetRoomMessagesResult';
    failureType?: Maybe<ResetRoomMessagesFailureType>;
};

export type Roles = {
    __typename?: 'Roles';
    admin: Scalars['Boolean']['output'];
};

export type RoomAsListItem = {
    __typename?: 'RoomAsListItem';
    /** since v0.7.2 */
    createdAt?: Maybe<Scalars['Float']['output']>;
    /** この部屋の作成者。Firebase AuthenticationのUserUidで表現される。 */
    createdBy: Scalars['String']['output'];
    /** since v0.7.2 */
    isBookmarked: Scalars['Boolean']['output'];
    name: Scalars['String']['output'];
    requiresPlayerPassword: Scalars['Boolean']['output'];
    requiresSpectatorPassword: Scalars['Boolean']['output'];
    /** since v0.7.2 */
    role?: Maybe<ParticipantRole>;
    roomId: Scalars['ID']['output'];
    /**
     * データベースのRoomエンティティが最後に更新された日時。Roomエンティティのみが対象であるため、例えばメッセージの投稿などは反映されないことに注意。
     * since v0.7.2
     */
    updatedAt?: Maybe<Scalars['Float']['output']>;
};

export type RoomConnectionEvent = {
    __typename?: 'RoomConnectionEvent';
    isConnected: Scalars['Boolean']['output'];
    updatedAt: Scalars['Float']['output'];
    userUid: Scalars['String']['output'];
};

export type RoomEvent = {
    __typename?: 'RoomEvent';
    deleteRoomOperation?: Maybe<DeleteRoomOperation>;
    isRoomMessagesResetEvent: Scalars['Boolean']['output'];
    roomConnectionEvent?: Maybe<RoomConnectionEvent>;
    roomMessageEvent?: Maybe<RoomMessageEvent>;
    roomOperation?: Maybe<RoomOperation>;
    writingMessageStatus?: Maybe<WritingMessageStatus>;
};

export type RoomGetState = {
    __typename?: 'RoomGetState';
    /** since v0.7.2 */
    createdAt?: Maybe<Scalars['Float']['output']>;
    /** この部屋の作成者。Firebase AuthenticationのUserUidで表現される。 */
    createdBy: Scalars['String']['output'];
    /** since v0.7.2 */
    isBookmarked: Scalars['Boolean']['output'];
    /** Current revision of Room. Whenever Room is updated, this value is incremented by 1. This value is required when you apply RoomOperation. / Roomの現在のリビジョン。Roomが更新されるたび、この値は1増加する。RoomOperationを適用する際に必要となる。 */
    revision: Scalars['Float']['output'];
    /** since v0.7.2 */
    role?: Maybe<ParticipantRole>;
    /** room.state をJSON化したもの */
    stateJson: Scalars['String']['output'];
    /**
     * データベースのRoomエンティティが最後に更新された日時。Roomエンティティのみが対象であるため、例えばメッセージの投稿などは反映されないことに注意。
     * since v0.7.2
     */
    updatedAt?: Maybe<Scalars['Float']['output']>;
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
    errorMessage: Scalars['String']['output'];
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
    publicMessagesDeleted: Scalars['Boolean']['output'];
};

export type RoomOperation = {
    __typename?: 'RoomOperation';
    /** operateRoomを呼んだ人物。promoteなどの結果の場合はnullishになる。 */
    operatedBy?: Maybe<OperatedBy>;
    revisionTo: Scalars['Float']['output'];
    /** room.upOperationをJSONにしたもの。idならばnullish。 */
    valueJson: Scalars['String']['output'];
};

export type RoomOperationInput = {
    /** クライアントを識別するID。適当なIDをクライアント側で生成して渡す。Operationごとに変える必要はない */
    clientId: Scalars['String']['input'];
    /** room.upOperationをJSONにしたもの */
    valueJson: Scalars['String']['input'];
};

export type RoomPrivateMessage = {
    __typename?: 'RoomPrivateMessage';
    altTextToSecret?: Maybe<Scalars['String']['output']>;
    /** 発言がCharacterと紐付いているときはnon-nullish。PLとしての発言、もしくはcreatedByがnullishのときはnullish。後からCharacterの値が更新されても、この値が更新されることはない。 */
    character?: Maybe<CharacterValueForMessage>;
    commandResult?: Maybe<CommandResult>;
    createdAt: Scalars['Float']['output'];
    createdBy?: Maybe<Scalars['String']['output']>;
    customName?: Maybe<Scalars['String']['output']>;
    initText?: Maybe<Scalars['String']['output']>;
    initTextSource?: Maybe<Scalars['String']['output']>;
    isSecret: Scalars['Boolean']['output'];
    messageId: Scalars['String']['output'];
    textColor?: Maybe<Scalars['String']['output']>;
    updatedAt?: Maybe<Scalars['Float']['output']>;
    updatedText?: Maybe<UpdatedText>;
    visibleTo: Array<Scalars['String']['output']>;
};

export type RoomPrivateMessageUpdate = {
    __typename?: 'RoomPrivateMessageUpdate';
    altTextToSecret?: Maybe<Scalars['String']['output']>;
    commandResult?: Maybe<CommandResult>;
    initText?: Maybe<Scalars['String']['output']>;
    initTextSource?: Maybe<Scalars['String']['output']>;
    isSecret: Scalars['Boolean']['output'];
    messageId: Scalars['String']['output'];
    updatedAt?: Maybe<Scalars['Float']['output']>;
    updatedText?: Maybe<UpdatedText>;
};

export type RoomPublicChannel = {
    __typename?: 'RoomPublicChannel';
    /** 現在の仕様では、$system, $free, '1', … , '10' の12個のみをサポートしている。このうち、$systemはシステムメッセージ専用チャンネルであるため誰も書き込むことができない。'1', …, '10'はSpectatorが書き込むことはできないが、$freeはSpectatorも書き込むことができる。 */
    key: Scalars['String']['output'];
    name?: Maybe<Scalars['String']['output']>;
};

export type RoomPublicChannelUpdate = {
    __typename?: 'RoomPublicChannelUpdate';
    key: Scalars['String']['output'];
    name?: Maybe<Scalars['String']['output']>;
};

export type RoomPublicMessage = {
    __typename?: 'RoomPublicMessage';
    altTextToSecret?: Maybe<Scalars['String']['output']>;
    channelKey: Scalars['String']['output'];
    /** 発言がCharacterと紐付いているときはnon-nullish。PLとしての発言、もしくはcreatedByがnullishのときはnullish。 */
    character?: Maybe<CharacterValueForMessage>;
    commandResult?: Maybe<CommandResult>;
    createdAt: Scalars['Float']['output'];
    /** channelKeyが$system以外のときは、システムメッセージならばnullishで、そうでないならばnullishではない。$systemのとき、原則として全てシステムメッセージであるため常にnullishになる。 */
    createdBy?: Maybe<Scalars['String']['output']>;
    customName?: Maybe<Scalars['String']['output']>;
    initText?: Maybe<Scalars['String']['output']>;
    initTextSource?: Maybe<Scalars['String']['output']>;
    isSecret: Scalars['Boolean']['output'];
    messageId: Scalars['String']['output'];
    textColor?: Maybe<Scalars['String']['output']>;
    updatedAt?: Maybe<Scalars['Float']['output']>;
    updatedText?: Maybe<UpdatedText>;
};

export type RoomPublicMessageUpdate = {
    __typename?: 'RoomPublicMessageUpdate';
    altTextToSecret?: Maybe<Scalars['String']['output']>;
    commandResult?: Maybe<CommandResult>;
    initText?: Maybe<Scalars['String']['output']>;
    initTextSource?: Maybe<Scalars['String']['output']>;
    isSecret: Scalars['Boolean']['output'];
    messageId: Scalars['String']['output'];
    updatedAt?: Maybe<Scalars['Float']['output']>;
    updatedText?: Maybe<UpdatedText>;
};

export type RoomSoundEffect = {
    __typename?: 'RoomSoundEffect';
    createdAt: Scalars['Float']['output'];
    createdBy?: Maybe<Scalars['String']['output']>;
    file: FilePath;
    messageId: Scalars['String']['output'];
    volume: Scalars['Float']['output'];
};

export type SemVer = {
    __typename?: 'SemVer';
    major: Scalars['Float']['output'];
    minor: Scalars['Float']['output'];
    patch: Scalars['Float']['output'];
    prerelease?: Maybe<Prerelease>;
};

export type SemVerInput = {
    major: Scalars['Float']['input'];
    minor: Scalars['Float']['input'];
    patch: Scalars['Float']['input'];
    prerelease?: InputMaybe<PrereleaseInput>;
};

export type ServerInfo = {
    __typename?: 'ServerInfo';
    uploaderEnabled: Scalars['Boolean']['output'];
    version: SemVer;
};

export type Subscription = {
    __typename?: 'Subscription';
    /** この Subscription を直接実行することは非推奨です。代わりに @flocon-trpg/sdk を用いてください。 */
    roomEvent: RoomEvent;
};

export type SubscriptionRoomEventArgs = {
    roomId: Scalars['String']['input'];
};

export type UpdateBookmarkFailureResult = {
    __typename?: 'UpdateBookmarkFailureResult';
    failureType: UpdateBookmarkFailureType;
};

export const UpdateBookmarkFailureType = {
    NotFound: 'NotFound',
} as const;

export type UpdateBookmarkFailureType =
    (typeof UpdateBookmarkFailureType)[keyof typeof UpdateBookmarkFailureType];
export type UpdateBookmarkResult = UpdateBookmarkFailureResult | UpdateBookmarkSuccessResult;

export type UpdateBookmarkSuccessResult = {
    __typename?: 'UpdateBookmarkSuccessResult';
    currentValue: Scalars['Boolean']['output'];
    prevValue: Scalars['Boolean']['output'];
};

export type UpdatedText = {
    __typename?: 'UpdatedText';
    currentText?: Maybe<Scalars['String']['output']>;
    updatedAt: Scalars['Float']['output'];
};

export type WriteRoomPrivateMessageFailureResult = {
    __typename?: 'WriteRoomPrivateMessageFailureResult';
    failureType: WriteRoomPrivateMessageFailureType;
};

export const WriteRoomPrivateMessageFailureType = {
    NotParticipant: 'NotParticipant',
    RoomNotFound: 'RoomNotFound',
    SyntaxError: 'SyntaxError',
    VisibleToIsInvalid: 'VisibleToIsInvalid',
} as const;

export type WriteRoomPrivateMessageFailureType =
    (typeof WriteRoomPrivateMessageFailureType)[keyof typeof WriteRoomPrivateMessageFailureType];
export type WriteRoomPrivateMessageResult =
    | RoomMessageSyntaxError
    | RoomPrivateMessage
    | WriteRoomPrivateMessageFailureResult;

export type WriteRoomPublicMessageFailureResult = {
    __typename?: 'WriteRoomPublicMessageFailureResult';
    failureType: WriteRoomPublicMessageFailureType;
};

export const WriteRoomPublicMessageFailureType = {
    NotAllowedChannelKey: 'NotAllowedChannelKey',
    NotAuthorized: 'NotAuthorized',
    NotParticipant: 'NotParticipant',
    RoomNotFound: 'RoomNotFound',
    SyntaxError: 'SyntaxError',
} as const;

export type WriteRoomPublicMessageFailureType =
    (typeof WriteRoomPublicMessageFailureType)[keyof typeof WriteRoomPublicMessageFailureType];
export type WriteRoomPublicMessageResult =
    | RoomMessageSyntaxError
    | RoomPublicMessage
    | WriteRoomPublicMessageFailureResult;

export type WriteRoomSoundEffectFailureResult = {
    __typename?: 'WriteRoomSoundEffectFailureResult';
    failureType: WriteRoomSoundEffectFailureType;
};

export const WriteRoomSoundEffectFailureType = {
    NotAuthorized: 'NotAuthorized',
    NotParticipant: 'NotParticipant',
    RoomNotFound: 'RoomNotFound',
} as const;

export type WriteRoomSoundEffectFailureType =
    (typeof WriteRoomSoundEffectFailureType)[keyof typeof WriteRoomSoundEffectFailureType];
export type WriteRoomSoundEffectResult = RoomSoundEffect | WriteRoomSoundEffectFailureResult;

export type WritingMessageStatus = {
    __typename?: 'WritingMessageStatus';
    status: WritingMessageStatusType;
    updatedAt: Scalars['Float']['output'];
    userUid: Scalars['String']['output'];
};

export const WritingMessageStatusInputType = {
    Cleared: 'Cleared',
    KeepWriting: 'KeepWriting',
    StartWriting: 'StartWriting',
} as const;

export type WritingMessageStatusInputType =
    (typeof WritingMessageStatusInputType)[keyof typeof WritingMessageStatusInputType];
export const WritingMessageStatusType = {
    Cleared: 'Cleared',
    Disconnected: 'Disconnected',
    Submit: 'Submit',
    Writing: 'Writing',
} as const;

export type WritingMessageStatusType =
    (typeof WritingMessageStatusType)[keyof typeof WritingMessageStatusType];
export type CharacterValueForMessageFragment = {
    __typename?: 'CharacterValueForMessage';
    isPrivate: boolean;
    name: string;
    stateId: string;
    image?: { __typename?: 'FilePath'; path: string; sourceType: FileSourceType } | null;
    portraitImage?: { __typename?: 'FilePath'; path: string; sourceType: FileSourceType } | null;
};

export type RoomPublicMessageFragment = {
    __typename?: 'RoomPublicMessage';
    messageId: string;
    altTextToSecret?: string | null;
    textColor?: string | null;
    updatedAt?: number | null;
    channelKey: string;
    createdAt: number;
    createdBy?: string | null;
    customName?: string | null;
    initText?: string | null;
    initTextSource?: string | null;
    isSecret: boolean;
    updatedText?: {
        __typename?: 'UpdatedText';
        currentText?: string | null;
        updatedAt: number;
    } | null;
    character?: {
        __typename?: 'CharacterValueForMessage';
        isPrivate: boolean;
        name: string;
        stateId: string;
        image?: { __typename?: 'FilePath'; path: string; sourceType: FileSourceType } | null;
        portraitImage?: {
            __typename?: 'FilePath';
            path: string;
            sourceType: FileSourceType;
        } | null;
    } | null;
    commandResult?: {
        __typename?: 'CommandResult';
        isSuccess?: boolean | null;
        text: string;
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
        isPrivate: boolean;
        name: string;
        stateId: string;
        image?: { __typename?: 'FilePath'; path: string; sourceType: FileSourceType } | null;
        portraitImage?: {
            __typename?: 'FilePath';
            path: string;
            sourceType: FileSourceType;
        } | null;
    } | null;
};

export type PieceLogFragment = {
    __typename?: 'PieceLog';
    messageId: string;
    stateId: string;
    createdAt: number;
    logType: PieceLogType;
    valueJson: string;
};

export type RoomPrivateMessageUpdateFragment = {
    __typename?: 'RoomPrivateMessageUpdate';
    messageId: string;
    altTextToSecret?: string | null;
    initText?: string | null;
    initTextSource?: string | null;
    isSecret: boolean;
    updatedAt?: number | null;
    commandResult?: {
        __typename?: 'CommandResult';
        isSuccess?: boolean | null;
        text: string;
    } | null;
    updatedText?: {
        __typename?: 'UpdatedText';
        currentText?: string | null;
        updatedAt: number;
    } | null;
};

export type RoomPublicMessageUpdateFragment = {
    __typename?: 'RoomPublicMessageUpdate';
    altTextToSecret?: string | null;
    initText?: string | null;
    initTextSource?: string | null;
    isSecret: boolean;
    messageId: string;
    updatedAt?: number | null;
    commandResult?: {
        __typename?: 'CommandResult';
        isSuccess?: boolean | null;
        text: string;
    } | null;
    updatedText?: {
        __typename?: 'UpdatedText';
        currentText?: string | null;
        updatedAt: number;
    } | null;
};

export type RoomSoundEffectFragment = {
    __typename?: 'RoomSoundEffect';
    createdAt: number;
    createdBy?: string | null;
    messageId: string;
    volume: number;
    file: { __typename?: 'FilePath'; path: string; sourceType: FileSourceType };
};

export type RoomPublicChannelFragment = {
    __typename?: 'RoomPublicChannel';
    key: string;
    name?: string | null;
};

export type RoomPublicChannelUpdateFragment = {
    __typename?: 'RoomPublicChannelUpdate';
    key: string;
    name?: string | null;
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

export type RoomAsListItemFragment = {
    __typename?: 'RoomAsListItem';
    roomId: string;
    name: string;
    createdBy: string;
    createdAt?: number | null;
    updatedAt?: number | null;
    role?: ParticipantRole | null;
    isBookmarked: boolean;
    requiresPlayerPassword: boolean;
    requiresSpectatorPassword: boolean;
};

export type RoomOperationFragment = {
    __typename?: 'RoomOperation';
    revisionTo: number;
    valueJson: string;
    operatedBy?: { __typename?: 'OperatedBy'; userUid: string; clientId: string } | null;
};

export type RoomEventSubscriptionVariables = Exact<{
    roomId: Scalars['String']['input'];
}>;

export type RoomEventSubscription = {
    __typename?: 'Subscription';
    result: {
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
            | { __typename: 'RoomMessagesReset'; publicMessagesDeleted: boolean }
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
                      isPrivate: boolean;
                      name: string;
                      stateId: string;
                      image?: {
                          __typename?: 'FilePath';
                          path: string;
                          sourceType: FileSourceType;
                      } | null;
                      portraitImage?: {
                          __typename?: 'FilePath';
                          path: string;
                          sourceType: FileSourceType;
                      } | null;
                  } | null;
              }
            | {
                  __typename: 'RoomPrivateMessageUpdate';
                  messageId: string;
                  altTextToSecret?: string | null;
                  initText?: string | null;
                  initTextSource?: string | null;
                  isSecret: boolean;
                  updatedAt?: number | null;
                  commandResult?: {
                      __typename?: 'CommandResult';
                      isSuccess?: boolean | null;
                      text: string;
                  } | null;
                  updatedText?: {
                      __typename?: 'UpdatedText';
                      currentText?: string | null;
                      updatedAt: number;
                  } | null;
              }
            | { __typename: 'RoomPublicChannel'; key: string; name?: string | null }
            | { __typename: 'RoomPublicChannelUpdate'; key: string; name?: string | null }
            | {
                  __typename: 'RoomPublicMessage';
                  messageId: string;
                  altTextToSecret?: string | null;
                  textColor?: string | null;
                  updatedAt?: number | null;
                  channelKey: string;
                  createdAt: number;
                  createdBy?: string | null;
                  customName?: string | null;
                  initText?: string | null;
                  initTextSource?: string | null;
                  isSecret: boolean;
                  updatedText?: {
                      __typename?: 'UpdatedText';
                      currentText?: string | null;
                      updatedAt: number;
                  } | null;
                  character?: {
                      __typename?: 'CharacterValueForMessage';
                      isPrivate: boolean;
                      name: string;
                      stateId: string;
                      image?: {
                          __typename?: 'FilePath';
                          path: string;
                          sourceType: FileSourceType;
                      } | null;
                      portraitImage?: {
                          __typename?: 'FilePath';
                          path: string;
                          sourceType: FileSourceType;
                      } | null;
                  } | null;
                  commandResult?: {
                      __typename?: 'CommandResult';
                      isSuccess?: boolean | null;
                      text: string;
                  } | null;
              }
            | {
                  __typename: 'RoomPublicMessageUpdate';
                  altTextToSecret?: string | null;
                  initText?: string | null;
                  initTextSource?: string | null;
                  isSecret: boolean;
                  messageId: string;
                  updatedAt?: number | null;
                  commandResult?: {
                      __typename?: 'CommandResult';
                      isSuccess?: boolean | null;
                      text: string;
                  } | null;
                  updatedText?: {
                      __typename?: 'UpdatedText';
                      currentText?: string | null;
                      updatedAt: number;
                  } | null;
              }
            | {
                  __typename: 'RoomSoundEffect';
                  createdAt: number;
                  createdBy?: string | null;
                  messageId: string;
                  volume: number;
                  file: { __typename?: 'FilePath'; path: string; sourceType: FileSourceType };
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
    };
};

export type GetMessagesQueryVariables = Exact<{
    roomId: Scalars['String']['input'];
}>;

export type GetMessagesQuery = {
    __typename?: 'Query';
    result:
        | { __typename: 'GetRoomMessagesFailureResult'; failureType: GetRoomMessagesFailureType }
        | {
              __typename: 'RoomMessages';
              pieceLogs: Array<{
                  __typename?: 'PieceLog';
                  createdAt: number;
                  logType: PieceLogType;
                  messageId: string;
                  stateId: string;
                  valueJson: string;
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
                      isPrivate: boolean;
                      name: string;
                      stateId: string;
                      image?: {
                          __typename?: 'FilePath';
                          path: string;
                          sourceType: FileSourceType;
                      } | null;
                      portraitImage?: {
                          __typename?: 'FilePath';
                          path: string;
                          sourceType: FileSourceType;
                      } | null;
                  } | null;
              }>;
              publicChannels: Array<{
                  __typename?: 'RoomPublicChannel';
                  key: string;
                  name?: string | null;
              }>;
              publicMessages: Array<{
                  __typename?: 'RoomPublicMessage';
                  messageId: string;
                  altTextToSecret?: string | null;
                  textColor?: string | null;
                  updatedAt?: number | null;
                  channelKey: string;
                  createdAt: number;
                  createdBy?: string | null;
                  customName?: string | null;
                  initText?: string | null;
                  initTextSource?: string | null;
                  isSecret: boolean;
                  updatedText?: {
                      __typename?: 'UpdatedText';
                      currentText?: string | null;
                      updatedAt: number;
                  } | null;
                  character?: {
                      __typename?: 'CharacterValueForMessage';
                      isPrivate: boolean;
                      name: string;
                      stateId: string;
                      image?: {
                          __typename?: 'FilePath';
                          path: string;
                          sourceType: FileSourceType;
                      } | null;
                      portraitImage?: {
                          __typename?: 'FilePath';
                          path: string;
                          sourceType: FileSourceType;
                      } | null;
                  } | null;
                  commandResult?: {
                      __typename?: 'CommandResult';
                      isSuccess?: boolean | null;
                      text: string;
                  } | null;
              }>;
              soundEffects: Array<{
                  __typename?: 'RoomSoundEffect';
                  createdAt: number;
                  createdBy?: string | null;
                  messageId: string;
                  volume: number;
                  file: { __typename?: 'FilePath'; path: string; sourceType: FileSourceType };
              }>;
          };
};

export type WritePublicMessageMutationVariables = Exact<{
    roomId: Scalars['String']['input'];
    text: Scalars['String']['input'];
    textColor?: InputMaybe<Scalars['String']['input']>;
    channelKey: Scalars['String']['input'];
    characterId?: InputMaybe<Scalars['String']['input']>;
    customName?: InputMaybe<Scalars['String']['input']>;
    gameType?: InputMaybe<Scalars['String']['input']>;
}>;

export type WritePublicMessageMutation = {
    __typename?: 'Mutation';
    result:
        | { __typename: 'RoomMessageSyntaxError'; errorMessage: string }
        | {
              __typename: 'RoomPublicMessage';
              messageId: string;
              altTextToSecret?: string | null;
              textColor?: string | null;
              updatedAt?: number | null;
              channelKey: string;
              createdAt: number;
              createdBy?: string | null;
              customName?: string | null;
              initText?: string | null;
              initTextSource?: string | null;
              isSecret: boolean;
              updatedText?: {
                  __typename?: 'UpdatedText';
                  currentText?: string | null;
                  updatedAt: number;
              } | null;
              character?: {
                  __typename?: 'CharacterValueForMessage';
                  isPrivate: boolean;
                  name: string;
                  stateId: string;
                  image?: {
                      __typename?: 'FilePath';
                      path: string;
                      sourceType: FileSourceType;
                  } | null;
                  portraitImage?: {
                      __typename?: 'FilePath';
                      path: string;
                      sourceType: FileSourceType;
                  } | null;
              } | null;
              commandResult?: {
                  __typename?: 'CommandResult';
                  isSuccess?: boolean | null;
                  text: string;
              } | null;
          }
        | {
              __typename: 'WriteRoomPublicMessageFailureResult';
              failureType: WriteRoomPublicMessageFailureType;
          };
};

export type WritePrivateMessageMutationVariables = Exact<{
    roomId: Scalars['String']['input'];
    visibleTo: Array<Scalars['String']['input']> | Scalars['String']['input'];
    text: Scalars['String']['input'];
    textColor?: InputMaybe<Scalars['String']['input']>;
    characterId?: InputMaybe<Scalars['String']['input']>;
    customName?: InputMaybe<Scalars['String']['input']>;
    gameType?: InputMaybe<Scalars['String']['input']>;
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
                  isPrivate: boolean;
                  name: string;
                  stateId: string;
                  image?: {
                      __typename?: 'FilePath';
                      path: string;
                      sourceType: FileSourceType;
                  } | null;
                  portraitImage?: {
                      __typename?: 'FilePath';
                      path: string;
                      sourceType: FileSourceType;
                  } | null;
              } | null;
          }
        | {
              __typename: 'WriteRoomPrivateMessageFailureResult';
              failureType: WriteRoomPrivateMessageFailureType;
          };
};

export type OperateMutationVariables = Exact<{
    roomId: Scalars['String']['input'];
    revisionFrom: Scalars['Int']['input'];
    operation: RoomOperationInput;
    requestId: Scalars['String']['input'];
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
                  roomId: string;
                  name: string;
                  createdBy: string;
                  createdAt?: number | null;
                  updatedAt?: number | null;
                  role?: ParticipantRole | null;
                  isBookmarked: boolean;
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

export type GetRoomQueryVariables = Exact<{
    roomId: Scalars['String']['input'];
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
                  createdAt?: number | null;
                  updatedAt?: number | null;
                  role?: ParticipantRole | null;
                  isBookmarked: boolean;
                  stateJson: string;
              };
          }
        | {
              __typename: 'GetNonJoinedRoomResult';
              roomAsListItem: {
                  __typename?: 'RoomAsListItem';
                  roomId: string;
                  name: string;
                  createdBy: string;
                  createdAt?: number | null;
                  updatedAt?: number | null;
                  role?: ParticipantRole | null;
                  isBookmarked: boolean;
                  requiresPlayerPassword: boolean;
                  requiresSpectatorPassword: boolean;
              };
          }
        | { __typename: 'GetRoomFailureResult'; failureType: GetRoomFailureType };
};

export type UpdateWritingMessageStatusMutationVariables = Exact<{
    roomId: Scalars['String']['input'];
    newStatus: WritingMessageStatusInputType;
}>;

export type UpdateWritingMessageStatusMutation = { __typename?: 'Mutation'; result: boolean };

export type GetRoomConnectionsQueryVariables = Exact<{
    roomId: Scalars['String']['input'];
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
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'image' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'path' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'isPrivate' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'portraitImage' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'path' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'stateId' } },
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
                    { kind: 'Field', name: { kind: 'Name', value: 'altTextToSecret' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'textColor' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
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
                    { kind: 'Field', name: { kind: 'Name', value: 'channelKey' } },
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
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'commandResult' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'isSuccess' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'customName' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'initText' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'initTextSource' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'isSecret' } },
                ],
            },
        },
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
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'image' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'path' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'isPrivate' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'portraitImage' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'path' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'stateId' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<RoomPublicMessageFragment, unknown>;
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
                    { kind: 'Field', name: { kind: 'Name', value: 'initText' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'initTextSource' } },
                ],
            },
        },
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
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'image' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'path' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'isPrivate' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'portraitImage' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'path' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'stateId' } },
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
export const RoomPrivateMessageUpdateFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'RoomPrivateMessageUpdate' },
            typeCondition: {
                kind: 'NamedType',
                name: { kind: 'Name', value: 'RoomPrivateMessageUpdate' },
            },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'messageId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'altTextToSecret' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'commandResult' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'isSuccess' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'initText' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'initTextSource' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'isSecret' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
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
                ],
            },
        },
    ],
} as unknown as DocumentNode<RoomPrivateMessageUpdateFragment, unknown>;
export const RoomPublicMessageUpdateFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'RoomPublicMessageUpdate' },
            typeCondition: {
                kind: 'NamedType',
                name: { kind: 'Name', value: 'RoomPublicMessageUpdate' },
            },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'altTextToSecret' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'commandResult' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'isSuccess' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'initText' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'initTextSource' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'isSecret' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'messageId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
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
                ],
            },
        },
    ],
} as unknown as DocumentNode<RoomPublicMessageUpdateFragment, unknown>;
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
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'file' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'path' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'messageId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'volume' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<RoomSoundEffectFragment, unknown>;
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
export const RoomPublicChannelUpdateFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'RoomPublicChannelUpdate' },
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
    ],
} as unknown as DocumentNode<RoomPublicChannelUpdateFragment, unknown>;
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
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'isBookmarked' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'stateJson' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<RoomGetStateFragment, unknown>;
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
                    { kind: 'Field', name: { kind: 'Name', value: 'roomId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'isBookmarked' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'requiresPlayerPassword' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'requiresSpectatorPassword' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<RoomAsListItemFragment, unknown>;
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
                        name: { kind: 'Name', value: 'roomEvent' },
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
                                                kind: 'Field',
                                                name: { kind: 'Name', value: '__typename' },
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
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'PieceLog',
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
                                                        value: 'RoomMessagesReset',
                                                    },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'publicMessagesDeleted',
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
                                                        value: 'RoomPrivateMessage',
                                                    },
                                                },
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
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: {
                                                        kind: 'Name',
                                                        value: 'RoomPrivateMessageUpdate',
                                                    },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'FragmentSpread',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'RoomPrivateMessageUpdate',
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
                                                        value: 'RoomPublicChannel',
                                                    },
                                                },
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
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: {
                                                        kind: 'Name',
                                                        value: 'RoomPublicChannelUpdate',
                                                    },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'FragmentSpread',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'RoomPublicChannelUpdate',
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
                                                        value: 'RoomPublicMessage',
                                                    },
                                                },
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
                                                kind: 'InlineFragment',
                                                typeCondition: {
                                                    kind: 'NamedType',
                                                    name: {
                                                        kind: 'Name',
                                                        value: 'RoomPublicMessageUpdate',
                                                    },
                                                },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'FragmentSpread',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'RoomPublicMessageUpdate',
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
                                                        value: 'RoomSoundEffect',
                                                    },
                                                },
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
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'image' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'path' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'isPrivate' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'portraitImage' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'path' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'stateId' } },
                ],
            },
        },
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
                    { kind: 'Field', name: { kind: 'Name', value: 'initText' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'initTextSource' } },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'RoomPrivateMessageUpdate' },
            typeCondition: {
                kind: 'NamedType',
                name: { kind: 'Name', value: 'RoomPrivateMessageUpdate' },
            },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'messageId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'altTextToSecret' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'commandResult' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'isSuccess' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'initText' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'initTextSource' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'isSecret' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
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
                ],
            },
        },
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
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'RoomPublicChannelUpdate' },
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
                    { kind: 'Field', name: { kind: 'Name', value: 'altTextToSecret' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'textColor' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
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
                    { kind: 'Field', name: { kind: 'Name', value: 'channelKey' } },
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
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'commandResult' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'isSuccess' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'customName' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'initText' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'initTextSource' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'isSecret' } },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'RoomPublicMessageUpdate' },
            typeCondition: {
                kind: 'NamedType',
                name: { kind: 'Name', value: 'RoomPublicMessageUpdate' },
            },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'altTextToSecret' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'commandResult' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'isSuccess' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'initText' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'initTextSource' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'isSecret' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'messageId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
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
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'RoomSoundEffect' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'RoomSoundEffect' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'file' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'path' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'messageId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'volume' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<RoomEventSubscription, RoomEventSubscriptionVariables>;
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
                                                name: { kind: 'Name', value: 'pieceLogs' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'createdAt',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'logType',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'messageId',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'stateId',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'valueJson',
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
                                                name: { kind: 'Name', value: 'publicChannels' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'key' },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'name' },
                                                        },
                                                    ],
                                                },
                                            },
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
                                                name: { kind: 'Name', value: 'soundEffects' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'createdAt',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'createdBy',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'file' },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [
                                                                    {
                                                                        kind: 'Field',
                                                                        name: {
                                                                            kind: 'Name',
                                                                            value: 'path',
                                                                        },
                                                                    },
                                                                    {
                                                                        kind: 'Field',
                                                                        name: {
                                                                            kind: 'Name',
                                                                            value: 'sourceType',
                                                                        },
                                                                    },
                                                                ],
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'messageId',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'volume' },
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
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'image' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'path' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'isPrivate' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'portraitImage' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'path' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'stateId' } },
                ],
            },
        },
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
                    { kind: 'Field', name: { kind: 'Name', value: 'initText' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'initTextSource' } },
                ],
            },
        },
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
                    { kind: 'Field', name: { kind: 'Name', value: 'altTextToSecret' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'textColor' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
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
                    { kind: 'Field', name: { kind: 'Name', value: 'channelKey' } },
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
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'commandResult' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'isSuccess' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'customName' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'initText' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'initTextSource' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'isSecret' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GetMessagesQuery, GetMessagesQueryVariables>;
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
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'image' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'path' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'isPrivate' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'portraitImage' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'path' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'stateId' } },
                ],
            },
        },
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
                    { kind: 'Field', name: { kind: 'Name', value: 'altTextToSecret' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'textColor' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
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
                    { kind: 'Field', name: { kind: 'Name', value: 'channelKey' } },
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
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'commandResult' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'isSuccess' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'customName' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'initText' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'initTextSource' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'isSecret' } },
                ],
            },
        },
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
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'image' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'path' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'isPrivate' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'portraitImage' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'path' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'stateId' } },
                ],
            },
        },
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
                    { kind: 'Field', name: { kind: 'Name', value: 'initText' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'initTextSource' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<WritePrivateMessageMutation, WritePrivateMessageMutationVariables>;
export const OperateDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'operate' },
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
                                name: { kind: 'Name', value: 'roomId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'roomId' },
                                },
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
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'RoomAsListItem' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'RoomAsListItem' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'roomId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'isBookmarked' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'requiresPlayerPassword' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'requiresSpectatorPassword' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<OperateMutation, OperateMutationVariables>;
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
                        name: { kind: 'Name', value: 'getRoom' },
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
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'RoomGetState' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'RoomGetState' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'revision' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'isBookmarked' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'stateJson' } },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'RoomAsListItem' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'RoomAsListItem' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'roomId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'isBookmarked' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'requiresPlayerPassword' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'requiresSpectatorPassword' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GetRoomQuery, GetRoomQueryVariables>;
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
