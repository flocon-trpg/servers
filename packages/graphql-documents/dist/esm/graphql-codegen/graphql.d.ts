import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
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
export type MakeEmpty<T extends {
    [key: string]: unknown;
}, K extends keyof T> = {
    [_ in K]?: never;
};
export type Incremental<T> = T | {
    [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: {
        input: string;
        output: string;
    };
    String: {
        input: string;
        output: string;
    };
    Boolean: {
        input: boolean;
        output: boolean;
    };
    Int: {
        input: number;
        output: number;
    };
    Float: {
        input: number;
        output: number;
    };
};
export declare const AnswerRollCallFailureType: {
    readonly NotAuthorizedParticipant: "NotAuthorizedParticipant";
    readonly RollCallNotFound: "RollCallNotFound";
    readonly RoomNotFound: "RoomNotFound";
    readonly TooManyRequests: "TooManyRequests";
};
export type AnswerRollCallFailureType = (typeof AnswerRollCallFailureType)[keyof typeof AnswerRollCallFailureType];
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
export declare const ChangeParticipantNameFailureType: {
    readonly NotFound: "NotFound";
    readonly NotParticipant: "NotParticipant";
};
export type ChangeParticipantNameFailureType = (typeof ChangeParticipantNameFailureType)[keyof typeof ChangeParticipantNameFailureType];
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
export declare const CloseRollCallFailureType: {
    readonly AlreadyClosed: "AlreadyClosed";
    readonly NotAuthorizedParticipant: "NotAuthorizedParticipant";
    readonly RollCallNotFound: "RollCallNotFound";
    readonly RoomNotFound: "RoomNotFound";
    readonly TooManyRequests: "TooManyRequests";
};
export type CloseRollCallFailureType = (typeof CloseRollCallFailureType)[keyof typeof CloseRollCallFailureType];
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
export declare const CreateRoomFailureType: {
    readonly UnknownError: "UnknownError";
};
export type CreateRoomFailureType = (typeof CreateRoomFailureType)[keyof typeof CreateRoomFailureType];
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
export declare const DeleteMessageFailureType: {
    readonly MessageDeleted: "MessageDeleted";
    readonly MessageNotFound: "MessageNotFound";
    readonly NotParticipant: "NotParticipant";
    readonly NotYourMessage: "NotYourMessage";
    readonly RoomNotFound: "RoomNotFound";
};
export type DeleteMessageFailureType = (typeof DeleteMessageFailureType)[keyof typeof DeleteMessageFailureType];
export type DeleteMessageResult = {
    __typename?: 'DeleteMessageResult';
    failureType?: Maybe<DeleteMessageFailureType>;
};
export declare const DeleteRoomAsAdminFailureType: {
    readonly NotFound: "NotFound";
};
export type DeleteRoomAsAdminFailureType = (typeof DeleteRoomAsAdminFailureType)[keyof typeof DeleteRoomAsAdminFailureType];
export type DeleteRoomAsAdminResult = {
    __typename?: 'DeleteRoomAsAdminResult';
    failureType?: Maybe<DeleteRoomAsAdminFailureType>;
};
export declare const DeleteRoomFailureType: {
    readonly NotCreatedByYou: "NotCreatedByYou";
    readonly NotFound: "NotFound";
};
export type DeleteRoomFailureType = (typeof DeleteRoomFailureType)[keyof typeof DeleteRoomFailureType];
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
export declare const EditMessageFailureType: {
    readonly MessageDeleted: "MessageDeleted";
    readonly MessageNotFound: "MessageNotFound";
    readonly NotParticipant: "NotParticipant";
    readonly NotYourMessage: "NotYourMessage";
    readonly RoomNotFound: "RoomNotFound";
};
export type EditMessageFailureType = (typeof EditMessageFailureType)[keyof typeof EditMessageFailureType];
export type EditMessageResult = {
    __typename?: 'EditMessageResult';
    failureType?: Maybe<EditMessageFailureType>;
};
export type EntryToServerResult = {
    __typename?: 'EntryToServerResult';
    type: EntryWithPasswordResultType;
};
export declare const EntryWithPasswordResultType: {
    readonly AlreadyEntried: "AlreadyEntried";
    readonly NotSignIn: "NotSignIn";
    readonly PasswordRequired: "PasswordRequired";
    readonly Success: "Success";
    readonly WrongPassword: "WrongPassword";
};
export type EntryWithPasswordResultType = (typeof EntryWithPasswordResultType)[keyof typeof EntryWithPasswordResultType];
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
export declare const FileListType: {
    readonly Public: "Public";
    readonly Unlisted: "Unlisted";
};
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
export declare const FileSourceType: {
    readonly Default: "Default";
    readonly FirebaseStorage: "FirebaseStorage";
    readonly Uploader: "Uploader";
};
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
export type GetRoomAsListItemResult = GetRoomAsListItemFailureResult | GetRoomAsListItemSuccessResult;
export type GetRoomAsListItemSuccessResult = {
    __typename?: 'GetRoomAsListItemSuccessResult';
    room: RoomAsListItem;
};
export declare const GetRoomConnectionFailureType: {
    readonly NotParticipant: "NotParticipant";
    readonly RoomNotFound: "RoomNotFound";
};
export type GetRoomConnectionFailureType = (typeof GetRoomConnectionFailureType)[keyof typeof GetRoomConnectionFailureType];
export type GetRoomConnectionsFailureResult = {
    __typename?: 'GetRoomConnectionsFailureResult';
    failureType: GetRoomConnectionFailureType;
};
export type GetRoomConnectionsResult = GetRoomConnectionsFailureResult | GetRoomConnectionsSuccessResult;
export type GetRoomConnectionsSuccessResult = {
    __typename?: 'GetRoomConnectionsSuccessResult';
    connectedUserUids: Array<Scalars['String']['output']>;
    fetchedAt: Scalars['Float']['output'];
};
export type GetRoomFailureResult = {
    __typename?: 'GetRoomFailureResult';
    failureType: GetRoomFailureType;
};
export declare const GetRoomFailureType: {
    readonly NotFound: "NotFound";
};
export type GetRoomFailureType = (typeof GetRoomFailureType)[keyof typeof GetRoomFailureType];
export type GetRoomLogFailureResult = {
    __typename?: 'GetRoomLogFailureResult';
    failureType: GetRoomLogFailureType;
};
export declare const GetRoomLogFailureType: {
    readonly NotAuthorized: "NotAuthorized";
    readonly NotParticipant: "NotParticipant";
    readonly RoomNotFound: "RoomNotFound";
    readonly UnknownError: "UnknownError";
};
export type GetRoomLogFailureType = (typeof GetRoomLogFailureType)[keyof typeof GetRoomLogFailureType];
export type GetRoomLogResult = GetRoomLogFailureResult | RoomMessages;
export type GetRoomMessagesFailureResult = {
    __typename?: 'GetRoomMessagesFailureResult';
    failureType: GetRoomMessagesFailureType;
};
export declare const GetRoomMessagesFailureType: {
    readonly NotParticipant: "NotParticipant";
    readonly RoomNotFound: "RoomNotFound";
};
export type GetRoomMessagesFailureType = (typeof GetRoomMessagesFailureType)[keyof typeof GetRoomMessagesFailureType];
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
export declare const JoinRoomFailureType: {
    readonly AlreadyParticipant: "AlreadyParticipant";
    readonly NotFound: "NotFound";
    readonly TransformError: "TransformError";
    readonly WrongPassword: "WrongPassword";
};
export type JoinRoomFailureType = (typeof JoinRoomFailureType)[keyof typeof JoinRoomFailureType];
export type JoinRoomResult = JoinRoomFailureResult | JoinRoomSuccessResult;
export type JoinRoomSuccessResult = {
    __typename?: 'JoinRoomSuccessResult';
    operation?: Maybe<RoomOperation>;
};
export declare const LeaveRoomFailureType: {
    readonly NotFound: "NotFound";
    readonly NotParticipant: "NotParticipant";
};
export type LeaveRoomFailureType = (typeof LeaveRoomFailureType)[keyof typeof LeaveRoomFailureType];
export type LeaveRoomResult = {
    __typename?: 'LeaveRoomResult';
    failureType?: Maybe<LeaveRoomFailureType>;
};
export declare const MakeMessageNotSecretFailureType: {
    readonly MessageNotFound: "MessageNotFound";
    readonly NotParticipant: "NotParticipant";
    readonly NotSecret: "NotSecret";
    readonly NotYourMessage: "NotYourMessage";
    readonly RoomNotFound: "RoomNotFound";
};
export type MakeMessageNotSecretFailureType = (typeof MakeMessageNotSecretFailureType)[keyof typeof MakeMessageNotSecretFailureType];
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
    operateRoom: OperateRoomResult;
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
export type MutationOperateRoomArgs = {
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
export declare const OperateRoomFailureType: {
    readonly NotFound: "NotFound";
};
export type OperateRoomFailureType = (typeof OperateRoomFailureType)[keyof typeof OperateRoomFailureType];
export type OperateRoomIdResult = {
    __typename?: 'OperateRoomIdResult';
    requestId: Scalars['String']['output'];
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
    clientId: Scalars['String']['output'];
    userUid: Scalars['String']['output'];
};
export declare const ParticipantRole: {
    readonly Master: "Master";
    readonly Player: "Player";
    readonly Spectator: "Spectator";
};
export type ParticipantRole = (typeof ParticipantRole)[keyof typeof ParticipantRole];
export declare const PerformRollCallFailureType: {
    readonly HasOpenRollCall: "HasOpenRollCall";
    readonly NotAuthorizedParticipant: "NotAuthorizedParticipant";
    readonly NotFound: "NotFound";
    readonly TooManyRequests: "TooManyRequests";
};
export type PerformRollCallFailureType = (typeof PerformRollCallFailureType)[keyof typeof PerformRollCallFailureType];
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
export declare const PieceLogType: {
    readonly Dice: "Dice";
    readonly String: "String";
};
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
export declare const PrereleaseType: {
    readonly Alpha: "Alpha";
    readonly Beta: "Beta";
    readonly Rc: "Rc";
};
export type PrereleaseType = (typeof PrereleaseType)[keyof typeof PrereleaseType];
export declare const PromoteFailureType: {
    readonly NoNeedToPromote: "NoNeedToPromote";
    readonly NotFound: "NotFound";
    readonly NotParticipant: "NotParticipant";
    readonly WrongPassword: "WrongPassword";
};
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
export declare const ResetRoomMessagesFailureType: {
    readonly NotAuthorized: "NotAuthorized";
    readonly NotParticipant: "NotParticipant";
    readonly RoomNotFound: "RoomNotFound";
};
export type ResetRoomMessagesFailureType = (typeof ResetRoomMessagesFailureType)[keyof typeof ResetRoomMessagesFailureType];
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
export type RoomMessageEvent = PieceLog | RoomMessagesReset | RoomPrivateMessage | RoomPrivateMessageUpdate | RoomPublicChannel | RoomPublicChannelUpdate | RoomPublicMessage | RoomPublicMessageUpdate | RoomSoundEffect;
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
export declare const UpdateBookmarkFailureType: {
    readonly NotFound: "NotFound";
};
export type UpdateBookmarkFailureType = (typeof UpdateBookmarkFailureType)[keyof typeof UpdateBookmarkFailureType];
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
export declare const WriteRoomPrivateMessageFailureType: {
    readonly NotParticipant: "NotParticipant";
    readonly RoomNotFound: "RoomNotFound";
    readonly SyntaxError: "SyntaxError";
    readonly VisibleToIsInvalid: "VisibleToIsInvalid";
};
export type WriteRoomPrivateMessageFailureType = (typeof WriteRoomPrivateMessageFailureType)[keyof typeof WriteRoomPrivateMessageFailureType];
export type WriteRoomPrivateMessageResult = RoomMessageSyntaxError | RoomPrivateMessage | WriteRoomPrivateMessageFailureResult;
export type WriteRoomPublicMessageFailureResult = {
    __typename?: 'WriteRoomPublicMessageFailureResult';
    failureType: WriteRoomPublicMessageFailureType;
};
export declare const WriteRoomPublicMessageFailureType: {
    readonly NotAllowedChannelKey: "NotAllowedChannelKey";
    readonly NotAuthorized: "NotAuthorized";
    readonly NotParticipant: "NotParticipant";
    readonly RoomNotFound: "RoomNotFound";
    readonly SyntaxError: "SyntaxError";
};
export type WriteRoomPublicMessageFailureType = (typeof WriteRoomPublicMessageFailureType)[keyof typeof WriteRoomPublicMessageFailureType];
export type WriteRoomPublicMessageResult = RoomMessageSyntaxError | RoomPublicMessage | WriteRoomPublicMessageFailureResult;
export type WriteRoomSoundEffectFailureResult = {
    __typename?: 'WriteRoomSoundEffectFailureResult';
    failureType: WriteRoomSoundEffectFailureType;
};
export declare const WriteRoomSoundEffectFailureType: {
    readonly NotAuthorized: "NotAuthorized";
    readonly NotParticipant: "NotParticipant";
    readonly RoomNotFound: "RoomNotFound";
};
export type WriteRoomSoundEffectFailureType = (typeof WriteRoomSoundEffectFailureType)[keyof typeof WriteRoomSoundEffectFailureType];
export type WriteRoomSoundEffectResult = RoomSoundEffect | WriteRoomSoundEffectFailureResult;
export type WritingMessageStatus = {
    __typename?: 'WritingMessageStatus';
    status: WritingMessageStatusType;
    updatedAt: Scalars['Float']['output'];
    userUid: Scalars['String']['output'];
};
export declare const WritingMessageStatusInputType: {
    readonly Cleared: "Cleared";
    readonly KeepWriting: "KeepWriting";
    readonly StartWriting: "StartWriting";
};
export type WritingMessageStatusInputType = (typeof WritingMessageStatusInputType)[keyof typeof WritingMessageStatusInputType];
export declare const WritingMessageStatusType: {
    readonly Cleared: "Cleared";
    readonly Disconnected: "Disconnected";
    readonly Submit: "Submit";
    readonly Writing: "Writing";
};
export type WritingMessageStatusType = (typeof WritingMessageStatusType)[keyof typeof WritingMessageStatusType];
export type CharacterValueForMessageFragment = {
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
    file: {
        __typename?: 'FilePath';
        path: string;
        sourceType: FileSourceType;
    };
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
    operatedBy?: {
        __typename?: 'OperatedBy';
        userUid: string;
        clientId: string;
    } | null;
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
            publicMessagesDeleted: boolean;
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
        } | {
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
        } | {
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
        } | {
            __typename: 'RoomSoundEffect';
            createdAt: number;
            createdBy?: string | null;
            messageId: string;
            volume: number;
            file: {
                __typename?: 'FilePath';
                path: string;
                sourceType: FileSourceType;
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
    };
};
export type GetMessagesQueryVariables = Exact<{
    roomId: Scalars['String']['input'];
}>;
export type GetMessagesQuery = {
    __typename?: 'Query';
    result: {
        __typename: 'GetRoomMessagesFailureResult';
        failureType: GetRoomMessagesFailureType;
    } | {
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
            file: {
                __typename?: 'FilePath';
                path: string;
                sourceType: FileSourceType;
            };
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
    result: {
        __typename: 'RoomMessageSyntaxError';
        errorMessage: string;
    } | {
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
    } | {
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
    } | {
        __typename: 'WriteRoomPrivateMessageFailureResult';
        failureType: WriteRoomPrivateMessageFailureType;
    };
};
export type OperateRoomMutationVariables = Exact<{
    roomId: Scalars['String']['input'];
    revisionFrom: Scalars['Int']['input'];
    operation: RoomOperationInput;
    requestId: Scalars['String']['input'];
}>;
export type OperateRoomMutation = {
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
export type GetRoomQueryVariables = Exact<{
    roomId: Scalars['String']['input'];
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
    } | {
        __typename: 'GetRoomFailureResult';
        failureType: GetRoomFailureType;
    };
};
export type UpdateWritingMessageStatusMutationVariables = Exact<{
    roomId: Scalars['String']['input'];
    newStatus: WritingMessageStatusInputType;
}>;
export type UpdateWritingMessageStatusMutation = {
    __typename?: 'Mutation';
    result: boolean;
};
export type GetRoomConnectionsQueryVariables = Exact<{
    roomId: Scalars['String']['input'];
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
export declare const CharacterValueForMessageFragmentDoc: DocumentNode<CharacterValueForMessageFragment, unknown>;
export declare const RoomPublicMessageFragmentDoc: DocumentNode<RoomPublicMessageFragment, unknown>;
export declare const RoomPrivateMessageFragmentDoc: DocumentNode<RoomPrivateMessageFragment, unknown>;
export declare const PieceLogFragmentDoc: DocumentNode<PieceLogFragment, unknown>;
export declare const RoomPrivateMessageUpdateFragmentDoc: DocumentNode<RoomPrivateMessageUpdateFragment, unknown>;
export declare const RoomPublicMessageUpdateFragmentDoc: DocumentNode<RoomPublicMessageUpdateFragment, unknown>;
export declare const RoomSoundEffectFragmentDoc: DocumentNode<RoomSoundEffectFragment, unknown>;
export declare const RoomPublicChannelFragmentDoc: DocumentNode<RoomPublicChannelFragment, unknown>;
export declare const RoomPublicChannelUpdateFragmentDoc: DocumentNode<RoomPublicChannelUpdateFragment, unknown>;
export declare const RoomGetStateFragmentDoc: DocumentNode<RoomGetStateFragment, unknown>;
export declare const RoomAsListItemFragmentDoc: DocumentNode<RoomAsListItemFragment, unknown>;
export declare const RoomOperationFragmentDoc: DocumentNode<RoomOperationFragment, unknown>;
export declare const RoomEventDocument: DocumentNode<RoomEventSubscription, RoomEventSubscriptionVariables>;
export declare const GetMessagesDocument: DocumentNode<GetMessagesQuery, GetMessagesQueryVariables>;
export declare const WritePublicMessageDocument: DocumentNode<WritePublicMessageMutation, WritePublicMessageMutationVariables>;
export declare const WritePrivateMessageDocument: DocumentNode<WritePrivateMessageMutation, WritePrivateMessageMutationVariables>;
export declare const OperateRoomDocument: DocumentNode<OperateRoomMutation, OperateRoomMutationVariables>;
export declare const GetRoomDocument: DocumentNode<GetRoomQuery, GetRoomQueryVariables>;
export declare const UpdateWritingMessageStatusDocument: DocumentNode<UpdateWritingMessageStatusMutation, UpdateWritingMessageStatusMutationVariables>;
export declare const GetRoomConnectionsDocument: DocumentNode<GetRoomConnectionsQuery, GetRoomConnectionsQueryVariables>;
//# sourceMappingURL=graphql.d.ts.map