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
    answerRollCall: AnswerRollCallResult;
    changeParticipantName: ChangeParticipantNameResult;
    closeRollCall: CloseRollCallResult;
    /** @deprecated Use screenname to group files by folders instead. */
    createFileTag?: Maybe<FileTag>;
    createRoom: CreateRoomResult;
    /** @deprecated Use screenname to group files by folders instead. */
    deleteFileTag: Scalars['Boolean']['output'];
    deleteFiles: Array<Scalars['String']['output']>;
    deleteMessage: DeleteMessageResult;
    deleteRoom: DeleteRoomResult;
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
    createdAt?: Maybe<Scalars['Float']['output']>;
    /** この部屋の作成者。Firebase AuthenticationのUserUidで表現される。 */
    createdBy: Scalars['String']['output'];
    isBookmarked: Scalars['Boolean']['output'];
    name: Scalars['String']['output'];
    requiresPlayerPassword: Scalars['Boolean']['output'];
    requiresSpectatorPassword: Scalars['Boolean']['output'];
    role?: Maybe<ParticipantRole>;
    roomId: Scalars['ID']['output'];
    /** データベースのRoomエンティティが最後に更新された日時。Roomエンティティのみが対象であるため、例えばメッセージの投稿などは反映されないことに注意。 */
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
    createdAt?: Maybe<Scalars['Float']['output']>;
    /** この部屋の作成者。Firebase AuthenticationのUserUidで表現される。 */
    createdBy: Scalars['String']['output'];
    isBookmarked: Scalars['Boolean']['output'];
    /** Current revision of Room. Whenever Room is updated, this value is incremented by 1. This value is required when you apply RoomOperation. / Roomの現在のリビジョン。Roomが更新されるたび、この値は1増加する。RoomOperationを適用する際に必要となる。 */
    revision: Scalars['Float']['output'];
    role?: Maybe<ParticipantRole>;
    /** room.state をJSON化したもの */
    stateJson: Scalars['String']['output'];
    /** データベースのRoomエンティティが最後に更新された日時。Roomエンティティのみが対象であるため、例えばメッセージの投稿などは反映されないことに注意。 */
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
export type AnswerRollCallMutationVariables = Exact<{
    roomId: Scalars['String']['input'];
    rollCallId: Scalars['String']['input'];
    answer: Scalars['Boolean']['input'];
}>;

export type AnswerRollCallMutation = {
    __typename?: 'Mutation';
    result: { __typename?: 'AnswerRollCallResult'; failureType?: AnswerRollCallFailureType | null };
};

export type ChangeParticipantNameMutationVariables = Exact<{
    roomId: Scalars['String']['input'];
    newName: Scalars['String']['input'];
}>;

export type ChangeParticipantNameMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'ChangeParticipantNameResult';
        failureType?: ChangeParticipantNameFailureType | null;
    };
};

export type CloseRollCallMutationVariables = Exact<{
    roomId: Scalars['String']['input'];
    rollCallId: Scalars['String']['input'];
}>;

export type CloseRollCallMutation = {
    __typename?: 'Mutation';
    result: { __typename?: 'CloseRollCallResult'; failureType?: CloseRollCallFailureType | null };
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
              roomId: string;
              room: {
                  __typename?: 'RoomGetState';
                  createdAt?: number | null;
                  createdBy: string;
                  isBookmarked: boolean;
                  revision: number;
                  role?: ParticipantRole | null;
                  stateJson: string;
                  updatedAt?: number | null;
              };
          };
};

export type DeleteFilesMutationVariables = Exact<{
    filenames: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;

export type DeleteFilesMutation = { __typename?: 'Mutation'; result: Array<string> };

export type DeleteMessageMutationVariables = Exact<{
    roomId: Scalars['String']['input'];
    messageId: Scalars['String']['input'];
}>;

export type DeleteMessageMutation = {
    __typename?: 'Mutation';
    result: { __typename?: 'DeleteMessageResult'; failureType?: DeleteMessageFailureType | null };
};

export type DeleteRoomAsAdminMutationVariables = Exact<{
    roomId: Scalars['String']['input'];
}>;

export type DeleteRoomAsAdminMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'DeleteRoomAsAdminResult';
        failureType?: DeleteRoomAsAdminFailureType | null;
    };
};

export type DeleteRoomMutationVariables = Exact<{
    roomId: Scalars['String']['input'];
}>;

export type DeleteRoomMutation = {
    __typename?: 'Mutation';
    result: { __typename?: 'DeleteRoomResult'; failureType?: DeleteRoomFailureType | null };
};

export type EditMessageMutationVariables = Exact<{
    roomId: Scalars['String']['input'];
    messageId: Scalars['String']['input'];
    text: Scalars['String']['input'];
}>;

export type EditMessageMutation = {
    __typename?: 'Mutation';
    result: { __typename?: 'EditMessageResult'; failureType?: EditMessageFailureType | null };
};

export type EntryToServerMutationVariables = Exact<{
    password?: InputMaybe<Scalars['String']['input']>;
}>;

export type EntryToServerMutation = {
    __typename?: 'Mutation';
    result: { __typename?: 'EntryToServerResult'; type: EntryWithPasswordResultType };
};

export type FilePathFragment = {
    __typename?: 'FilePath';
    sourceType: FileSourceType;
    path: string;
};

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
    gameSystemId: Scalars['String']['input'];
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
            createdAt?: number | null;
            createdBy: string;
            filename: string;
            listType: FileListType;
            screenname: string;
            thumbFilename?: string | null;
        }>;
    };
};

export type GetLogQueryVariables = Exact<{
    roomId: Scalars['String']['input'];
}>;

export type GetLogQuery = {
    __typename?: 'Query';
    result:
        | { __typename: 'GetRoomLogFailureResult'; failureType: GetRoomLogFailureType }
        | {
              __typename: 'RoomMessages';
              publicMessages: Array<{
                  __typename?: 'RoomPublicMessage';
                  altTextToSecret?: string | null;
                  messageId: string;
                  textColor?: string | null;
                  updatedAt?: number | null;
                  isSecret: boolean;
                  channelKey: string;
                  createdAt: number;
                  createdBy?: string | null;
                  customName?: string | null;
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
                      text: string;
                      isSuccess?: boolean | null;
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
                  createdAt: number;
                  createdBy?: string | null;
                  messageId: string;
                  volume: number;
                  file: { __typename?: 'FilePath'; path: string; sourceType: FileSourceType };
              }>;
          };
};

export type GetMyRolesQueryVariables = Exact<{ [key: string]: never }>;

export type GetMyRolesQuery = {
    __typename?: 'Query';
    result: { __typename?: 'Roles'; admin: boolean };
};

export type GetRoomAsListItemQueryVariables = Exact<{
    roomId: Scalars['String']['input'];
}>;

export type GetRoomAsListItemQuery = {
    __typename?: 'Query';
    result:
        | { __typename: 'GetRoomAsListItemFailureResult'; failureType: GetRoomFailureType }
        | {
              __typename: 'GetRoomAsListItemSuccessResult';
              room: {
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
          };
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
                  roomId: string;
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

export type JoinRoomAsPlayerMutationVariables = Exact<{
    roomId: Scalars['String']['input'];
    name: Scalars['String']['input'];
    password?: InputMaybe<Scalars['String']['input']>;
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
    roomId: Scalars['String']['input'];
    name: Scalars['String']['input'];
    password?: InputMaybe<Scalars['String']['input']>;
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

export type LeaveRoomMutationVariables = Exact<{
    roomId: Scalars['String']['input'];
}>;

export type LeaveRoomMutation = {
    __typename?: 'Mutation';
    result: { __typename?: 'LeaveRoomResult'; failureType?: LeaveRoomFailureType | null };
};

export type MakeMessageNotSecretMutationVariables = Exact<{
    roomId: Scalars['String']['input'];
    messageId: Scalars['String']['input'];
}>;

export type MakeMessageNotSecretMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'MakeMessageNotSecretResult';
        failureType?: MakeMessageNotSecretFailureType | null;
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

export type PromoteToPlayerMutationVariables = Exact<{
    roomId: Scalars['String']['input'];
    password?: InputMaybe<Scalars['String']['input']>;
}>;

export type PromoteToPlayerMutation = {
    __typename?: 'Mutation';
    result: { __typename?: 'PromoteResult'; failureType?: PromoteFailureType | null };
};

export type RenameFilesMutationVariables = Exact<{
    input: Array<RenameFileInput> | RenameFileInput;
}>;

export type RenameFilesMutation = { __typename?: 'Mutation'; result: Array<string> };

export type ResetMessagesMutationVariables = Exact<{
    roomId: Scalars['String']['input'];
}>;

export type ResetMessagesMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'ResetRoomMessagesResult';
        failureType?: ResetRoomMessagesFailureType | null;
    };
};

export type UpdateBookmarkMutationVariables = Exact<{
    roomId: Scalars['String']['input'];
    newValue: Scalars['Boolean']['input'];
}>;

export type UpdateBookmarkMutation = {
    __typename?: 'Mutation';
    result:
        | { __typename: 'UpdateBookmarkFailureResult'; failureType: UpdateBookmarkFailureType }
        | { __typename: 'UpdateBookmarkSuccessResult'; prevValue: boolean; currentValue: boolean };
};

export type WriteRoomSoundEffectMutationVariables = Exact<{
    roomId: Scalars['String']['input'];
    file: FilePathInput;
    volume: Scalars['Float']['input'];
}>;

export type WriteRoomSoundEffectMutation = {
    __typename?: 'Mutation';
    result:
        | {
              __typename: 'RoomSoundEffect';
              createdAt: number;
              createdBy?: string | null;
              messageId: string;
              volume: number;
              file: { __typename?: 'FilePath'; path: string; sourceType: FileSourceType };
          }
        | {
              __typename: 'WriteRoomSoundEffectFailureResult';
              failureType: WriteRoomSoundEffectFailureType;
          };
};

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
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'revisionTo' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'operatedBy' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'userUid',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'clientId',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'valueJson' },
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
export const AnswerRollCallDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'AnswerRollCall' },
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
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'rollCallId' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'answer' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'Boolean' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'answerRollCall' },
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
                                name: { kind: 'Name', value: 'rollCallId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'rollCallId' },
                                },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'answer' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'answer' },
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
} as unknown as DocumentNode<AnswerRollCallMutation, AnswerRollCallMutationVariables>;
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
export const CloseRollCallDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'CloseRollCall' },
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
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'rollCallId' } },
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
                        name: { kind: 'Name', value: 'closeRollCall' },
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
                                name: { kind: 'Name', value: 'rollCallId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'rollCallId' },
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
} as unknown as DocumentNode<CloseRollCallMutation, CloseRollCallMutationVariables>;
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
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'roomId' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'room' },
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
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'isBookmarked',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'revision',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'role' },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'stateJson',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'updatedAt',
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
                        name: { kind: 'Name', value: 'deleteRoomAsAdmin' },
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
} as unknown as DocumentNode<DeleteRoomAsAdminMutation, DeleteRoomAsAdminMutationVariables>;
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
                        name: { kind: 'Name', value: 'deleteRoom' },
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
} as unknown as DocumentNode<DeleteRoomMutation, DeleteRoomMutationVariables>;
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
                    type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
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
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'gameSystemId' } },
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
                                name: { kind: 'Name', value: 'gameSystemId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'gameSystemId' },
                                },
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
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'createdAt' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'createdBy' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'filename' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'listType' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'screenname' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'thumbFilename' },
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
} as unknown as DocumentNode<GetFilesQuery, GetFilesQueryVariables>;
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
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'altTextToSecret',
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
                                                                value: 'textColor',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'updatedAt',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'isSecret',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'updatedText',
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [
                                                                    {
                                                                        kind: 'Field',
                                                                        name: {
                                                                            kind: 'Name',
                                                                            value: 'currentText',
                                                                        },
                                                                    },
                                                                    {
                                                                        kind: 'Field',
                                                                        name: {
                                                                            kind: 'Name',
                                                                            value: 'updatedAt',
                                                                        },
                                                                    },
                                                                ],
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'channelKey',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'character',
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [
                                                                    {
                                                                        kind: 'Field',
                                                                        name: {
                                                                            kind: 'Name',
                                                                            value: 'image',
                                                                        },
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
                                                                            value: 'image',
                                                                        },
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
                                                                            value: 'isPrivate',
                                                                        },
                                                                    },
                                                                    {
                                                                        kind: 'Field',
                                                                        name: {
                                                                            kind: 'Name',
                                                                            value: 'name',
                                                                        },
                                                                    },
                                                                    {
                                                                        kind: 'Field',
                                                                        name: {
                                                                            kind: 'Name',
                                                                            value: 'portraitImage',
                                                                        },
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
                                                                            value: 'stateId',
                                                                        },
                                                                    },
                                                                ],
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'commandResult',
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [
                                                                    {
                                                                        kind: 'Field',
                                                                        name: {
                                                                            kind: 'Name',
                                                                            value: 'text',
                                                                        },
                                                                    },
                                                                    {
                                                                        kind: 'Field',
                                                                        name: {
                                                                            kind: 'Name',
                                                                            value: 'isSuccess',
                                                                        },
                                                                    },
                                                                ],
                                                            },
                                                        },
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
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'customName',
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
                                                                value: 'visibleTo',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'initText',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'initTextSource',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'updatedText',
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [
                                                                    {
                                                                        kind: 'Field',
                                                                        name: {
                                                                            kind: 'Name',
                                                                            value: 'currentText',
                                                                        },
                                                                    },
                                                                    {
                                                                        kind: 'Field',
                                                                        name: {
                                                                            kind: 'Name',
                                                                            value: 'updatedAt',
                                                                        },
                                                                    },
                                                                ],
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'textColor',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'commandResult',
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [
                                                                    {
                                                                        kind: 'Field',
                                                                        name: {
                                                                            kind: 'Name',
                                                                            value: 'text',
                                                                        },
                                                                    },
                                                                    {
                                                                        kind: 'Field',
                                                                        name: {
                                                                            kind: 'Name',
                                                                            value: 'isSuccess',
                                                                        },
                                                                    },
                                                                ],
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'altTextToSecret',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'isSecret',
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
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'character',
                                                            },
                                                            selectionSet: {
                                                                kind: 'SelectionSet',
                                                                selections: [
                                                                    {
                                                                        kind: 'Field',
                                                                        name: {
                                                                            kind: 'Name',
                                                                            value: 'image',
                                                                        },
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
                                                                            value: 'image',
                                                                        },
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
                                                                            value: 'isPrivate',
                                                                        },
                                                                    },
                                                                    {
                                                                        kind: 'Field',
                                                                        name: {
                                                                            kind: 'Name',
                                                                            value: 'name',
                                                                        },
                                                                    },
                                                                    {
                                                                        kind: 'Field',
                                                                        name: {
                                                                            kind: 'Name',
                                                                            value: 'portraitImage',
                                                                        },
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
                                                                            value: 'stateId',
                                                                        },
                                                                    },
                                                                ],
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'customName',
                                                            },
                                                        },
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
                                                                value: 'updatedAt',
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
                                                                value: 'valueJson',
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
    ],
} as unknown as DocumentNode<GetLogQuery, GetLogQueryVariables>;
export const GetMyRolesDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'GetMyRoles' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'getMyRoles' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'Field', name: { kind: 'Name', value: 'admin' } }],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GetMyRolesQuery, GetMyRolesQueryVariables>;
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
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'roomId' },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'name' },
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
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'createdAt',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'updatedAt',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'role' },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'isBookmarked',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'requiresPlayerPassword',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'requiresSpectatorPassword',
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
    ],
} as unknown as DocumentNode<GetRoomAsListItemQuery, GetRoomAsListItemQueryVariables>;
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
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'roomId' },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'name' },
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
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'createdAt',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'updatedAt',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'role' },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'isBookmarked',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'requiresPlayerPassword',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'requiresSpectatorPassword',
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
    ],
} as unknown as DocumentNode<GetRoomsListQuery, GetRoomsListQueryVariables>;
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
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'major' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'minor' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'patch' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'prerelease' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'type' },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'version',
                                                            },
                                                        },
                                                    ],
                                                },
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
    ],
} as unknown as DocumentNode<GetServerInfoQuery, GetServerInfoQueryVariables>;
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
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'roomId' } },
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
                                name: { kind: 'Name', value: 'roomId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'roomId' },
                                },
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
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'revisionTo' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'operatedBy' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'userUid',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'clientId',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'valueJson' },
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
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'roomId' } },
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
                                name: { kind: 'Name', value: 'roomId' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'roomId' },
                                },
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
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'revisionTo' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'operatedBy' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'userUid',
                                                            },
                                                        },
                                                        {
                                                            kind: 'Field',
                                                            name: {
                                                                kind: 'Name',
                                                                value: 'clientId',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'valueJson' },
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
} as unknown as DocumentNode<JoinRoomAsSpectatorMutation, JoinRoomAsSpectatorMutationVariables>;
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
                        name: { kind: 'Name', value: 'leaveRoom' },
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
} as unknown as DocumentNode<LeaveRoomMutation, LeaveRoomMutationVariables>;
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
export const PerformRollCallDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'PerformRollCall' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'PerformRollCallInput' },
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
                        name: { kind: 'Name', value: 'performRollCall' },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'failureType' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<PerformRollCallMutation, PerformRollCallMutationVariables>;
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
export const RenameFilesDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'RenameFiles' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'ListType',
                            type: {
                                kind: 'NonNullType',
                                type: {
                                    kind: 'NamedType',
                                    name: { kind: 'Name', value: 'RenameFileInput' },
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
                        name: { kind: 'Name', value: 'renameFiles' },
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
} as unknown as DocumentNode<RenameFilesMutation, RenameFilesMutationVariables>;
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
export const UpdateBookmarkDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'UpdateBookmark' },
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
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'newValue' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'Boolean' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'result' },
                        name: { kind: 'Name', value: 'updateBookmark' },
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
                                name: { kind: 'Name', value: 'newValue' },
                                value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'newValue' },
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
                                            value: 'UpdateBookmarkSuccessResult',
                                        },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'prevValue' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'currentValue' },
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
                                            value: 'UpdateBookmarkFailureResult',
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
} as unknown as DocumentNode<UpdateBookmarkMutation, UpdateBookmarkMutationVariables>;
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
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'createdAt' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'createdBy' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'file' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'path' },
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
                                                name: { kind: 'Name', value: 'messageId' },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'volume' },
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
    ],
} as unknown as DocumentNode<WriteRoomSoundEffectMutation, WriteRoomSoundEffectMutationVariables>;
