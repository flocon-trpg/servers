import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {};
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
    stateId: Scalars['String'];
    tachieImage?: Maybe<FilePath>;
};

export type CommandResult = {
    __typename?: 'CommandResult';
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
    joinAsPlayerPhrase?: Maybe<Scalars['String']>;
    joinAsSpectatorPhrase?: Maybe<Scalars['String']>;
    participantName: Scalars['String'];
    roomName: Scalars['String'];
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

export enum DeleteRoomFailureType {
    NotCreatedByYou = 'NotCreatedByYou',
    NotFound = 'NotFound',
}

export type DeleteRoomOperation = {
    __typename?: 'DeleteRoomOperation';
    deletedBy: Scalars['String'];
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
    NoPhraseRequired = 'NoPhraseRequired',
    NotSignIn = 'NotSignIn',
    Success = 'Success',
    WrongPhrase = 'WrongPhrase',
}

export type FileItem = {
    __typename?: 'FileItem';
    createdAt?: Maybe<Scalars['Float']>;
    createdBy: Scalars['String'];
    filename: Scalars['ID'];
    screenname: Scalars['String'];
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
    fileTagIds: Array<Scalars['String']>;
};

export type GetFilesResult = {
    __typename?: 'GetFilesResult';
    files: Array<FileItem>;
};

export type GetJoinedRoomResult = {
    __typename?: 'GetJoinedRoomResult';
    role: ParticipantRole;
    room: RoomGetState;
};

export type GetNonJoinedRoomResult = {
    __typename?: 'GetNonJoinedRoomResult';
    roomAsListItem: RoomAsListItem;
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
    WrongPhrase = 'WrongPhrase',
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
    editFileTags: Scalars['Boolean'];
    editMessage: EditMessageResult;
    entryToServer: EntryToServerResult;
    joinRoomAsPlayer: JoinRoomResult;
    joinRoomAsSpectator: JoinRoomResult;
    leaveRoom: LeaveRoomResult;
    makeMessageNotSecret: MakeMessageNotSecretResult;
    operate: OperateRoomResult;
    ping: Pong;
    promoteToPlayer: PromoteResult;
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

export type MutationEditFileTagsArgs = {
    input: EditFileTagsInput;
};

export type MutationEditMessageArgs = {
    messageId: Scalars['String'];
    roomId: Scalars['String'];
    text: Scalars['String'];
};

export type MutationEntryToServerArgs = {
    phrase?: Maybe<Scalars['String']>;
};

export type MutationJoinRoomAsPlayerArgs = {
    id: Scalars['String'];
    name: Scalars['String'];
    phrase?: Maybe<Scalars['String']>;
};

export type MutationJoinRoomAsSpectatorArgs = {
    id: Scalars['String'];
    name: Scalars['String'];
    phrase?: Maybe<Scalars['String']>;
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
    phrase?: Maybe<Scalars['String']>;
    roomId: Scalars['String'];
};

export type MutationUpdateWritingMessageStatusArgs = {
    newStatus: WritingMessageStatusInputType;
    roomId: Scalars['String'];
};

export type MutationWritePrivateMessageArgs = {
    characterStateId?: Maybe<Scalars['String']>;
    customName?: Maybe<Scalars['String']>;
    gameType?: Maybe<Scalars['String']>;
    roomId: Scalars['String'];
    text: Scalars['String'];
    textColor?: Maybe<Scalars['String']>;
    visibleTo: Array<Scalars['String']>;
};

export type MutationWritePublicMessageArgs = {
    channelKey: Scalars['String'];
    characterStateId?: Maybe<Scalars['String']>;
    customName?: Maybe<Scalars['String']>;
    gameType?: Maybe<Scalars['String']>;
    roomId: Scalars['String'];
    text: Scalars['String'];
    textColor?: Maybe<Scalars['String']>;
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
    InvalidId = 'InvalidId',
    NotFound = 'NotFound',
    NotParticipant = 'NotParticipant',
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

export type PieceValueLog = {
    __typename?: 'PieceValueLog';
    characterCreatedBy: Scalars['String'];
    characterId: Scalars['String'];
    createdAt: Scalars['Float'];
    logType: PieceValueLogType;
    messageId: Scalars['String'];
    stateId: Scalars['String'];
    valueJson: Scalars['String'];
};

export enum PieceValueLogType {
    Dice = 'Dice',
    Number = 'Number',
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
    WrongPhrase = 'WrongPhrase',
}

export type PromoteResult = {
    __typename?: 'PromoteResult';
    failureType?: Maybe<PromoteFailureType>;
};

export type Query = {
    __typename?: 'Query';
    getAvailableGameSystems: GetAvailableGameSystemsResult;
    getFiles: GetFilesResult;
    getLog: GetRoomLogResult;
    getMessages: GetRoomMessagesResult;
    getRoom: GetRoomResult;
    getRoomConnections: GetRoomConnectionsResult;
    getRoomsList: GetRoomsListResult;
    getServerInfo: ServerInfo;
    isEntry: Scalars['Boolean'];
    requiresPhraseToJoinAsPlayer: RequiresPhraseResult;
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

export type QueryGetRoomConnectionsArgs = {
    roomId: Scalars['String'];
};

export type QueryRequiresPhraseToJoinAsPlayerArgs = {
    roomId: Scalars['String'];
};

export type RequiresPhraseFailureResult = {
    __typename?: 'RequiresPhraseFailureResult';
    failureType: RequiresPhraseFailureType;
};

export enum RequiresPhraseFailureType {
    NotFound = 'NotFound',
}

export type RequiresPhraseResult = RequiresPhraseFailureResult | RequiresPhraseSuccessResult;

export type RequiresPhraseSuccessResult = {
    __typename?: 'RequiresPhraseSuccessResult';
    value: Scalars['Boolean'];
};

export type RoomAsListItem = {
    __typename?: 'RoomAsListItem';
    createdBy: Scalars['String'];
    id: Scalars['ID'];
    name: Scalars['String'];
    requiresPhraseToJoinAsPlayer: Scalars['Boolean'];
    requiresPhraseToJoinAsSpectator: Scalars['Boolean'];
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
    roomConnectionEvent?: Maybe<RoomConnectionEvent>;
    roomMessageEvent?: Maybe<RoomMessageEvent>;
    roomOperation?: Maybe<RoomOperation>;
    writingMessageStatus?: Maybe<WritingMessageStatus>;
};

export type RoomGetState = {
    __typename?: 'RoomGetState';
    createdBy: Scalars['String'];
    revision: Scalars['Float'];
    stateJson: Scalars['String'];
};

export type RoomMessageEvent =
    | PieceValueLog
    | RoomPrivateMessage
    | RoomPrivateMessageUpdate
    | RoomPublicChannel
    | RoomPublicChannelUpdate
    | RoomPublicMessage
    | RoomPublicMessageUpdate
    | RoomSoundEffect;

export type RoomMessages = {
    __typename?: 'RoomMessages';
    pieceValueLogs: Array<PieceValueLog>;
    privateMessages: Array<RoomPrivateMessage>;
    publicChannels: Array<RoomPublicChannel>;
    publicMessages: Array<RoomPublicMessage>;
    soundEffects: Array<RoomSoundEffect>;
};

export type RoomOperation = {
    __typename?: 'RoomOperation';
    operatedBy?: Maybe<OperatedBy>;
    revisionTo: Scalars['Float'];
    valueJson: Scalars['String'];
};

export type RoomOperationInput = {
    clientId: Scalars['String'];
    valueJson: Scalars['String'];
};

export type RoomPrivateMessage = {
    __typename?: 'RoomPrivateMessage';
    altTextToSecret?: Maybe<Scalars['String']>;
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
    VisibleToIsInvalid = 'VisibleToIsInvalid',
}

export type WriteRoomPrivateMessageResult =
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
}

export type WriteRoomPublicMessageResult = RoomPublicMessage | WriteRoomPublicMessageFailureResult;

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
    image?: Maybe<{ __typename?: 'FilePath'; sourceType: FileSourceType; path: string }>;
    tachieImage?: Maybe<{ __typename?: 'FilePath'; sourceType: FileSourceType; path: string }>;
};

type CreateRoomResult_CreateRoomFailureResult_Fragment = {
    __typename?: 'CreateRoomFailureResult';
    failureType: CreateRoomFailureType;
};

type CreateRoomResult_CreateRoomSuccessResult_Fragment = {
    __typename?: 'CreateRoomSuccessResult';
    id: string;
    room: { __typename?: 'RoomGetState'; revision: number; createdBy: string; stateJson: string };
};

export type CreateRoomResultFragment =
    | CreateRoomResult_CreateRoomFailureResult_Fragment
    | CreateRoomResult_CreateRoomSuccessResult_Fragment;

export type FileItemFragment = {
    __typename?: 'FileItem';
    filename: string;
    thumbFilename?: Maybe<string>;
    screenname: string;
    createdBy: string;
    createdAt?: Maybe<number>;
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
        requiresPhraseToJoinAsPlayer: boolean;
        requiresPhraseToJoinAsSpectator: boolean;
    };
};

type GetRoomListResult_GetRoomsListFailureResult_Fragment = {
    __typename?: 'GetRoomsListFailureResult';
    failureType: GetRoomFailureType;
};

type GetRoomListResult_GetRoomsListSuccessResult_Fragment = {
    __typename?: 'GetRoomsListSuccessResult';
    rooms: Array<{
        __typename?: 'RoomAsListItem';
        id: string;
        name: string;
        createdBy: string;
        requiresPhraseToJoinAsPlayer: boolean;
        requiresPhraseToJoinAsSpectator: boolean;
    }>;
};

export type GetRoomListResultFragment =
    | GetRoomListResult_GetRoomsListFailureResult_Fragment
    | GetRoomListResult_GetRoomsListSuccessResult_Fragment;

type GetRoomResult_GetJoinedRoomResult_Fragment = {
    __typename?: 'GetJoinedRoomResult';
    role: ParticipantRole;
    room: { __typename?: 'RoomGetState'; revision: number; createdBy: string; stateJson: string };
};

type GetRoomResult_GetNonJoinedRoomResult_Fragment = {
    __typename?: 'GetNonJoinedRoomResult';
    roomAsListItem: {
        __typename?: 'RoomAsListItem';
        id: string;
        name: string;
        createdBy: string;
        requiresPhraseToJoinAsPlayer: boolean;
        requiresPhraseToJoinAsSpectator: boolean;
    };
};

type GetRoomResult_GetRoomFailureResult_Fragment = {
    __typename?: 'GetRoomFailureResult';
    failureType: GetRoomFailureType;
};

export type GetRoomResultFragment =
    | GetRoomResult_GetJoinedRoomResult_Fragment
    | GetRoomResult_GetNonJoinedRoomResult_Fragment
    | GetRoomResult_GetRoomFailureResult_Fragment;

type JoinRoomResult_JoinRoomFailureResult_Fragment = {
    __typename?: 'JoinRoomFailureResult';
    failureType: JoinRoomFailureType;
};

type JoinRoomResult_JoinRoomSuccessResult_Fragment = {
    __typename?: 'JoinRoomSuccessResult';
    operation?: Maybe<{
        __typename?: 'RoomOperation';
        revisionTo: number;
        valueJson: string;
        operatedBy?: Maybe<{ __typename?: 'OperatedBy'; userUid: string; clientId: string }>;
    }>;
};

export type JoinRoomResultFragment =
    | JoinRoomResult_JoinRoomFailureResult_Fragment
    | JoinRoomResult_JoinRoomSuccessResult_Fragment;

export type PieceValueLogFragment = {
    __typename?: 'PieceValueLog';
    messageId: string;
    characterCreatedBy: string;
    characterId: string;
    stateId: string;
    createdAt: number;
    logType: PieceValueLogType;
    valueJson: string;
};

export type RoomAsListItemFragment = {
    __typename?: 'RoomAsListItem';
    id: string;
    name: string;
    createdBy: string;
    requiresPhraseToJoinAsPlayer: boolean;
    requiresPhraseToJoinAsSpectator: boolean;
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
    operatedBy?: Maybe<{ __typename?: 'OperatedBy'; userUid: string; clientId: string }>;
};

export type RoomPublicChannelFragment = {
    __typename?: 'RoomPublicChannel';
    key: string;
    name?: Maybe<string>;
};

export type RoomPublicMessageFragment = {
    __typename?: 'RoomPublicMessage';
    messageId: string;
    channelKey: string;
    initText?: Maybe<string>;
    initTextSource?: Maybe<string>;
    textColor?: Maybe<string>;
    altTextToSecret?: Maybe<string>;
    isSecret: boolean;
    createdBy?: Maybe<string>;
    customName?: Maybe<string>;
    createdAt: number;
    updatedAt?: Maybe<number>;
    updatedText?: Maybe<{
        __typename?: 'UpdatedText';
        currentText?: Maybe<string>;
        updatedAt: number;
    }>;
    commandResult?: Maybe<{
        __typename?: 'CommandResult';
        text: string;
        isSuccess?: Maybe<boolean>;
    }>;
    character?: Maybe<{
        __typename?: 'CharacterValueForMessage';
        stateId: string;
        isPrivate: boolean;
        name: string;
        image?: Maybe<{ __typename?: 'FilePath'; sourceType: FileSourceType; path: string }>;
        tachieImage?: Maybe<{ __typename?: 'FilePath'; sourceType: FileSourceType; path: string }>;
    }>;
};

export type RoomPrivateMessageFragment = {
    __typename?: 'RoomPrivateMessage';
    messageId: string;
    visibleTo: Array<string>;
    initText?: Maybe<string>;
    initTextSource?: Maybe<string>;
    textColor?: Maybe<string>;
    altTextToSecret?: Maybe<string>;
    isSecret: boolean;
    createdBy?: Maybe<string>;
    customName?: Maybe<string>;
    createdAt: number;
    updatedAt?: Maybe<number>;
    updatedText?: Maybe<{
        __typename?: 'UpdatedText';
        currentText?: Maybe<string>;
        updatedAt: number;
    }>;
    commandResult?: Maybe<{
        __typename?: 'CommandResult';
        text: string;
        isSuccess?: Maybe<boolean>;
    }>;
    character?: Maybe<{
        __typename?: 'CharacterValueForMessage';
        stateId: string;
        isPrivate: boolean;
        name: string;
        image?: Maybe<{ __typename?: 'FilePath'; sourceType: FileSourceType; path: string }>;
        tachieImage?: Maybe<{ __typename?: 'FilePath'; sourceType: FileSourceType; path: string }>;
    }>;
};

export type RoomSoundEffectFragment = {
    __typename?: 'RoomSoundEffect';
    messageId: string;
    createdBy?: Maybe<string>;
    createdAt: number;
    volume: number;
    file: { __typename?: 'FilePath'; sourceType: FileSourceType; path: string };
};

type RoomMessageEvent_PieceValueLog_Fragment = {
    __typename?: 'PieceValueLog';
    messageId: string;
    characterCreatedBy: string;
    characterId: string;
    stateId: string;
    createdAt: number;
    logType: PieceValueLogType;
    valueJson: string;
};

type RoomMessageEvent_RoomPrivateMessage_Fragment = {
    __typename?: 'RoomPrivateMessage';
    messageId: string;
    visibleTo: Array<string>;
    initText?: Maybe<string>;
    initTextSource?: Maybe<string>;
    textColor?: Maybe<string>;
    altTextToSecret?: Maybe<string>;
    isSecret: boolean;
    createdBy?: Maybe<string>;
    customName?: Maybe<string>;
    createdAt: number;
    updatedAt?: Maybe<number>;
    updatedText?: Maybe<{
        __typename?: 'UpdatedText';
        currentText?: Maybe<string>;
        updatedAt: number;
    }>;
    commandResult?: Maybe<{
        __typename?: 'CommandResult';
        text: string;
        isSuccess?: Maybe<boolean>;
    }>;
    character?: Maybe<{
        __typename?: 'CharacterValueForMessage';
        stateId: string;
        isPrivate: boolean;
        name: string;
        image?: Maybe<{ __typename?: 'FilePath'; sourceType: FileSourceType; path: string }>;
        tachieImage?: Maybe<{ __typename?: 'FilePath'; sourceType: FileSourceType; path: string }>;
    }>;
};

type RoomMessageEvent_RoomPrivateMessageUpdate_Fragment = {
    __typename?: 'RoomPrivateMessageUpdate';
    messageId: string;
    initText?: Maybe<string>;
    initTextSource?: Maybe<string>;
    altTextToSecret?: Maybe<string>;
    isSecret: boolean;
    updatedAt?: Maybe<number>;
    updatedText?: Maybe<{
        __typename?: 'UpdatedText';
        currentText?: Maybe<string>;
        updatedAt: number;
    }>;
    commandResult?: Maybe<{
        __typename?: 'CommandResult';
        text: string;
        isSuccess?: Maybe<boolean>;
    }>;
};

type RoomMessageEvent_RoomPublicChannel_Fragment = {
    __typename?: 'RoomPublicChannel';
    key: string;
    name?: Maybe<string>;
};

type RoomMessageEvent_RoomPublicChannelUpdate_Fragment = {
    __typename?: 'RoomPublicChannelUpdate';
    key: string;
    name?: Maybe<string>;
};

type RoomMessageEvent_RoomPublicMessage_Fragment = {
    __typename?: 'RoomPublicMessage';
    messageId: string;
    channelKey: string;
    initText?: Maybe<string>;
    initTextSource?: Maybe<string>;
    textColor?: Maybe<string>;
    altTextToSecret?: Maybe<string>;
    isSecret: boolean;
    createdBy?: Maybe<string>;
    customName?: Maybe<string>;
    createdAt: number;
    updatedAt?: Maybe<number>;
    updatedText?: Maybe<{
        __typename?: 'UpdatedText';
        currentText?: Maybe<string>;
        updatedAt: number;
    }>;
    commandResult?: Maybe<{
        __typename?: 'CommandResult';
        text: string;
        isSuccess?: Maybe<boolean>;
    }>;
    character?: Maybe<{
        __typename?: 'CharacterValueForMessage';
        stateId: string;
        isPrivate: boolean;
        name: string;
        image?: Maybe<{ __typename?: 'FilePath'; sourceType: FileSourceType; path: string }>;
        tachieImage?: Maybe<{ __typename?: 'FilePath'; sourceType: FileSourceType; path: string }>;
    }>;
};

type RoomMessageEvent_RoomPublicMessageUpdate_Fragment = {
    __typename?: 'RoomPublicMessageUpdate';
    messageId: string;
    initText?: Maybe<string>;
    initTextSource?: Maybe<string>;
    altTextToSecret?: Maybe<string>;
    isSecret: boolean;
    updatedAt?: Maybe<number>;
    updatedText?: Maybe<{
        __typename?: 'UpdatedText';
        currentText?: Maybe<string>;
        updatedAt: number;
    }>;
    commandResult?: Maybe<{
        __typename?: 'CommandResult';
        text: string;
        isSuccess?: Maybe<boolean>;
    }>;
};

type RoomMessageEvent_RoomSoundEffect_Fragment = {
    __typename?: 'RoomSoundEffect';
    messageId: string;
    createdBy?: Maybe<string>;
    createdAt: number;
    volume: number;
    file: { __typename?: 'FilePath'; sourceType: FileSourceType; path: string };
};

export type RoomMessageEventFragment =
    | RoomMessageEvent_PieceValueLog_Fragment
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
    prerelease?: Maybe<{ __typename?: 'Prerelease'; type: PrereleaseType; version: number }>;
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
            thumbFilename?: Maybe<string>;
            screenname: string;
            createdBy: string;
            createdAt?: Maybe<number>;
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
              __typename?: 'GetJoinedRoomResult';
              role: ParticipantRole;
              room: {
                  __typename?: 'RoomGetState';
                  revision: number;
                  createdBy: string;
                  stateJson: string;
              };
          }
        | {
              __typename?: 'GetNonJoinedRoomResult';
              roomAsListItem: {
                  __typename?: 'RoomAsListItem';
                  id: string;
                  name: string;
                  createdBy: string;
                  requiresPhraseToJoinAsPlayer: boolean;
                  requiresPhraseToJoinAsSpectator: boolean;
              };
          }
        | { __typename?: 'GetRoomFailureResult'; failureType: GetRoomFailureType };
};

export type GetRoomsListQueryVariables = Exact<{ [key: string]: never }>;

export type GetRoomsListQuery = {
    __typename?: 'Query';
    result:
        | { __typename?: 'GetRoomsListFailureResult'; failureType: GetRoomFailureType }
        | {
              __typename?: 'GetRoomsListSuccessResult';
              rooms: Array<{
                  __typename?: 'RoomAsListItem';
                  id: string;
                  name: string;
                  createdBy: string;
                  requiresPhraseToJoinAsPlayer: boolean;
                  requiresPhraseToJoinAsSpectator: boolean;
              }>;
          };
};

export type GetMessagesQueryVariables = Exact<{
    roomId: Scalars['String'];
}>;

export type GetMessagesQuery = {
    __typename?: 'Query';
    result:
        | { __typename?: 'GetRoomMessagesFailureResult'; failureType: GetRoomMessagesFailureType }
        | {
              __typename?: 'RoomMessages';
              publicMessages: Array<{
                  __typename?: 'RoomPublicMessage';
                  messageId: string;
                  channelKey: string;
                  initText?: Maybe<string>;
                  initTextSource?: Maybe<string>;
                  textColor?: Maybe<string>;
                  altTextToSecret?: Maybe<string>;
                  isSecret: boolean;
                  createdBy?: Maybe<string>;
                  customName?: Maybe<string>;
                  createdAt: number;
                  updatedAt?: Maybe<number>;
                  updatedText?: Maybe<{
                      __typename?: 'UpdatedText';
                      currentText?: Maybe<string>;
                      updatedAt: number;
                  }>;
                  commandResult?: Maybe<{
                      __typename?: 'CommandResult';
                      text: string;
                      isSuccess?: Maybe<boolean>;
                  }>;
                  character?: Maybe<{
                      __typename?: 'CharacterValueForMessage';
                      stateId: string;
                      isPrivate: boolean;
                      name: string;
                      image?: Maybe<{
                          __typename?: 'FilePath';
                          sourceType: FileSourceType;
                          path: string;
                      }>;
                      tachieImage?: Maybe<{
                          __typename?: 'FilePath';
                          sourceType: FileSourceType;
                          path: string;
                      }>;
                  }>;
              }>;
              privateMessages: Array<{
                  __typename?: 'RoomPrivateMessage';
                  messageId: string;
                  visibleTo: Array<string>;
                  initText?: Maybe<string>;
                  initTextSource?: Maybe<string>;
                  textColor?: Maybe<string>;
                  altTextToSecret?: Maybe<string>;
                  isSecret: boolean;
                  createdBy?: Maybe<string>;
                  customName?: Maybe<string>;
                  createdAt: number;
                  updatedAt?: Maybe<number>;
                  updatedText?: Maybe<{
                      __typename?: 'UpdatedText';
                      currentText?: Maybe<string>;
                      updatedAt: number;
                  }>;
                  commandResult?: Maybe<{
                      __typename?: 'CommandResult';
                      text: string;
                      isSuccess?: Maybe<boolean>;
                  }>;
                  character?: Maybe<{
                      __typename?: 'CharacterValueForMessage';
                      stateId: string;
                      isPrivate: boolean;
                      name: string;
                      image?: Maybe<{
                          __typename?: 'FilePath';
                          sourceType: FileSourceType;
                          path: string;
                      }>;
                      tachieImage?: Maybe<{
                          __typename?: 'FilePath';
                          sourceType: FileSourceType;
                          path: string;
                      }>;
                  }>;
              }>;
              pieceValueLogs: Array<{
                  __typename?: 'PieceValueLog';
                  messageId: string;
                  characterCreatedBy: string;
                  characterId: string;
                  stateId: string;
                  createdAt: number;
                  logType: PieceValueLogType;
                  valueJson: string;
              }>;
              publicChannels: Array<{
                  __typename?: 'RoomPublicChannel';
                  key: string;
                  name?: Maybe<string>;
              }>;
              soundEffects: Array<{
                  __typename?: 'RoomSoundEffect';
                  messageId: string;
                  createdBy?: Maybe<string>;
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
        | { __typename?: 'GetRoomLogFailureResult'; failureType: GetRoomLogFailureType }
        | {
              __typename?: 'RoomMessages';
              publicMessages: Array<{
                  __typename?: 'RoomPublicMessage';
                  messageId: string;
                  channelKey: string;
                  initText?: Maybe<string>;
                  initTextSource?: Maybe<string>;
                  textColor?: Maybe<string>;
                  altTextToSecret?: Maybe<string>;
                  isSecret: boolean;
                  createdBy?: Maybe<string>;
                  customName?: Maybe<string>;
                  createdAt: number;
                  updatedAt?: Maybe<number>;
                  updatedText?: Maybe<{
                      __typename?: 'UpdatedText';
                      currentText?: Maybe<string>;
                      updatedAt: number;
                  }>;
                  commandResult?: Maybe<{
                      __typename?: 'CommandResult';
                      text: string;
                      isSuccess?: Maybe<boolean>;
                  }>;
                  character?: Maybe<{
                      __typename?: 'CharacterValueForMessage';
                      stateId: string;
                      isPrivate: boolean;
                      name: string;
                      image?: Maybe<{
                          __typename?: 'FilePath';
                          sourceType: FileSourceType;
                          path: string;
                      }>;
                      tachieImage?: Maybe<{
                          __typename?: 'FilePath';
                          sourceType: FileSourceType;
                          path: string;
                      }>;
                  }>;
              }>;
              privateMessages: Array<{
                  __typename?: 'RoomPrivateMessage';
                  messageId: string;
                  visibleTo: Array<string>;
                  initText?: Maybe<string>;
                  initTextSource?: Maybe<string>;
                  textColor?: Maybe<string>;
                  altTextToSecret?: Maybe<string>;
                  isSecret: boolean;
                  createdBy?: Maybe<string>;
                  customName?: Maybe<string>;
                  createdAt: number;
                  updatedAt?: Maybe<number>;
                  updatedText?: Maybe<{
                      __typename?: 'UpdatedText';
                      currentText?: Maybe<string>;
                      updatedAt: number;
                  }>;
                  commandResult?: Maybe<{
                      __typename?: 'CommandResult';
                      text: string;
                      isSuccess?: Maybe<boolean>;
                  }>;
                  character?: Maybe<{
                      __typename?: 'CharacterValueForMessage';
                      stateId: string;
                      isPrivate: boolean;
                      name: string;
                      image?: Maybe<{
                          __typename?: 'FilePath';
                          sourceType: FileSourceType;
                          path: string;
                      }>;
                      tachieImage?: Maybe<{
                          __typename?: 'FilePath';
                          sourceType: FileSourceType;
                          path: string;
                      }>;
                  }>;
              }>;
              pieceValueLogs: Array<{
                  __typename?: 'PieceValueLog';
                  messageId: string;
                  characterCreatedBy: string;
                  characterId: string;
                  stateId: string;
                  createdAt: number;
                  logType: PieceValueLogType;
                  valueJson: string;
              }>;
              publicChannels: Array<{
                  __typename?: 'RoomPublicChannel';
                  key: string;
                  name?: Maybe<string>;
              }>;
              soundEffects: Array<{
                  __typename?: 'RoomSoundEffect';
                  messageId: string;
                  createdBy?: Maybe<string>;
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
              __typename?: 'GetRoomConnectionsFailureResult';
              failureType: GetRoomConnectionFailureType;
          }
        | {
              __typename?: 'GetRoomConnectionsSuccessResult';
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
            prerelease?: Maybe<{
                __typename?: 'Prerelease';
                type: PrereleaseType;
                version: number;
            }>;
        };
    };
};

export type IsEntryQueryVariables = Exact<{ [key: string]: never }>;

export type IsEntryQuery = { __typename?: 'Query'; result: boolean };

export type RequiresPhraseToJoinAsPlayerQueryVariables = Exact<{
    roomId: Scalars['String'];
}>;

export type RequiresPhraseToJoinAsPlayerQuery = {
    __typename?: 'Query';
    result:
        | { __typename?: 'RequiresPhraseFailureResult'; failureType: RequiresPhraseFailureType }
        | { __typename?: 'RequiresPhraseSuccessResult'; value: boolean };
};

export type CreateFileTagMutationVariables = Exact<{
    tagName: Scalars['String'];
}>;

export type CreateFileTagMutation = {
    __typename?: 'Mutation';
    result?: Maybe<{ __typename?: 'FileTag'; id: string; name: string }>;
};

export type ChangeParticipantNameMutationVariables = Exact<{
    roomId: Scalars['String'];
    newName: Scalars['String'];
}>;

export type ChangeParticipantNameMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'ChangeParticipantNameResult';
        failureType?: Maybe<ChangeParticipantNameFailureType>;
    };
};

export type CreateRoomMutationVariables = Exact<{
    input: CreateRoomInput;
}>;

export type CreateRoomMutation = {
    __typename?: 'Mutation';
    result:
        | { __typename?: 'CreateRoomFailureResult'; failureType: CreateRoomFailureType }
        | {
              __typename?: 'CreateRoomSuccessResult';
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
    result: { __typename?: 'DeleteRoomResult'; failureType?: Maybe<DeleteRoomFailureType> };
};

export type EditFileTagsMutationVariables = Exact<{
    input: EditFileTagsInput;
}>;

export type EditFileTagsMutation = { __typename?: 'Mutation'; result: boolean };

export type JoinRoomAsPlayerMutationVariables = Exact<{
    id: Scalars['String'];
    name: Scalars['String'];
    phrase?: Maybe<Scalars['String']>;
}>;

export type JoinRoomAsPlayerMutation = {
    __typename?: 'Mutation';
    result:
        | { __typename?: 'JoinRoomFailureResult'; failureType: JoinRoomFailureType }
        | {
              __typename?: 'JoinRoomSuccessResult';
              operation?: Maybe<{
                  __typename?: 'RoomOperation';
                  revisionTo: number;
                  valueJson: string;
                  operatedBy?: Maybe<{
                      __typename?: 'OperatedBy';
                      userUid: string;
                      clientId: string;
                  }>;
              }>;
          };
};

export type JoinRoomAsSpectatorMutationVariables = Exact<{
    id: Scalars['String'];
    name: Scalars['String'];
    phrase?: Maybe<Scalars['String']>;
}>;

export type JoinRoomAsSpectatorMutation = {
    __typename?: 'Mutation';
    result:
        | { __typename?: 'JoinRoomFailureResult'; failureType: JoinRoomFailureType }
        | {
              __typename?: 'JoinRoomSuccessResult';
              operation?: Maybe<{
                  __typename?: 'RoomOperation';
                  revisionTo: number;
                  valueJson: string;
                  operatedBy?: Maybe<{
                      __typename?: 'OperatedBy';
                      userUid: string;
                      clientId: string;
                  }>;
              }>;
          };
};

export type EntryToServerMutationVariables = Exact<{
    phrase: Scalars['String'];
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
    result: { __typename?: 'LeaveRoomResult'; failureType?: Maybe<LeaveRoomFailureType> };
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
        | { __typename?: 'OperateRoomFailureResult'; failureType: OperateRoomFailureType }
        | { __typename?: 'OperateRoomIdResult'; requestId: string }
        | {
              __typename?: 'OperateRoomNonJoinedResult';
              roomAsListItem: {
                  __typename?: 'RoomAsListItem';
                  id: string;
                  name: string;
                  createdBy: string;
                  requiresPhraseToJoinAsPlayer: boolean;
                  requiresPhraseToJoinAsSpectator: boolean;
              };
          }
        | {
              __typename?: 'OperateRoomSuccessResult';
              operation: {
                  __typename?: 'RoomOperation';
                  revisionTo: number;
                  valueJson: string;
                  operatedBy?: Maybe<{
                      __typename?: 'OperatedBy';
                      userUid: string;
                      clientId: string;
                  }>;
              };
          };
};

export type PingMutationVariables = Exact<{
    value: Scalars['Float'];
}>;

export type PingMutation = {
    __typename?: 'Mutation';
    result: { __typename?: 'Pong'; createdBy?: Maybe<string>; value: number };
};

export type PromoteToPlayerMutationVariables = Exact<{
    roomId: Scalars['String'];
    phrase?: Maybe<Scalars['String']>;
}>;

export type PromoteToPlayerMutation = {
    __typename?: 'Mutation';
    result: { __typename?: 'PromoteResult'; failureType?: Maybe<PromoteFailureType> };
};

export type WritePublicMessageMutationVariables = Exact<{
    roomId: Scalars['String'];
    text: Scalars['String'];
    textColor?: Maybe<Scalars['String']>;
    channelKey: Scalars['String'];
    characterStateId?: Maybe<Scalars['String']>;
    customName?: Maybe<Scalars['String']>;
    gameType?: Maybe<Scalars['String']>;
}>;

export type WritePublicMessageMutation = {
    __typename?: 'Mutation';
    result:
        | {
              __typename?: 'RoomPublicMessage';
              messageId: string;
              channelKey: string;
              initText?: Maybe<string>;
              initTextSource?: Maybe<string>;
              textColor?: Maybe<string>;
              altTextToSecret?: Maybe<string>;
              isSecret: boolean;
              createdBy?: Maybe<string>;
              customName?: Maybe<string>;
              createdAt: number;
              updatedAt?: Maybe<number>;
              updatedText?: Maybe<{
                  __typename?: 'UpdatedText';
                  currentText?: Maybe<string>;
                  updatedAt: number;
              }>;
              commandResult?: Maybe<{
                  __typename?: 'CommandResult';
                  text: string;
                  isSuccess?: Maybe<boolean>;
              }>;
              character?: Maybe<{
                  __typename?: 'CharacterValueForMessage';
                  stateId: string;
                  isPrivate: boolean;
                  name: string;
                  image?: Maybe<{
                      __typename?: 'FilePath';
                      sourceType: FileSourceType;
                      path: string;
                  }>;
                  tachieImage?: Maybe<{
                      __typename?: 'FilePath';
                      sourceType: FileSourceType;
                      path: string;
                  }>;
              }>;
          }
        | {
              __typename?: 'WriteRoomPublicMessageFailureResult';
              failureType: WriteRoomPublicMessageFailureType;
          };
};

export type WritePrivateMessageMutationVariables = Exact<{
    roomId: Scalars['String'];
    visibleTo: Array<Scalars['String']> | Scalars['String'];
    text: Scalars['String'];
    textColor?: Maybe<Scalars['String']>;
    characterStateId?: Maybe<Scalars['String']>;
    customName?: Maybe<Scalars['String']>;
    gameType?: Maybe<Scalars['String']>;
}>;

export type WritePrivateMessageMutation = {
    __typename?: 'Mutation';
    result:
        | {
              __typename?: 'RoomPrivateMessage';
              messageId: string;
              visibleTo: Array<string>;
              initText?: Maybe<string>;
              initTextSource?: Maybe<string>;
              textColor?: Maybe<string>;
              altTextToSecret?: Maybe<string>;
              isSecret: boolean;
              createdBy?: Maybe<string>;
              customName?: Maybe<string>;
              createdAt: number;
              updatedAt?: Maybe<number>;
              updatedText?: Maybe<{
                  __typename?: 'UpdatedText';
                  currentText?: Maybe<string>;
                  updatedAt: number;
              }>;
              commandResult?: Maybe<{
                  __typename?: 'CommandResult';
                  text: string;
                  isSuccess?: Maybe<boolean>;
              }>;
              character?: Maybe<{
                  __typename?: 'CharacterValueForMessage';
                  stateId: string;
                  isPrivate: boolean;
                  name: string;
                  image?: Maybe<{
                      __typename?: 'FilePath';
                      sourceType: FileSourceType;
                      path: string;
                  }>;
                  tachieImage?: Maybe<{
                      __typename?: 'FilePath';
                      sourceType: FileSourceType;
                      path: string;
                  }>;
              }>;
          }
        | {
              __typename?: 'WriteRoomPrivateMessageFailureResult';
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
              __typename?: 'RoomSoundEffect';
              messageId: string;
              createdBy?: Maybe<string>;
              createdAt: number;
              volume: number;
              file: { __typename?: 'FilePath'; sourceType: FileSourceType; path: string };
          }
        | {
              __typename?: 'WriteRoomSoundEffectFailureResult';
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
    result: { __typename?: 'EditMessageResult'; failureType?: Maybe<EditMessageFailureType> };
};

export type DeleteMessageMutationVariables = Exact<{
    roomId: Scalars['String'];
    messageId: Scalars['String'];
}>;

export type DeleteMessageMutation = {
    __typename?: 'Mutation';
    result: { __typename?: 'DeleteMessageResult'; failureType?: Maybe<DeleteMessageFailureType> };
};

export type MakeMessageNotSecretMutationVariables = Exact<{
    roomId: Scalars['String'];
    messageId: Scalars['String'];
}>;

export type MakeMessageNotSecretMutation = {
    __typename?: 'Mutation';
    result: {
        __typename?: 'MakeMessageNotSecretResult';
        failureType?: Maybe<MakeMessageNotSecretFailureType>;
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
    roomEvent?: Maybe<{
        __typename?: 'RoomEvent';
        roomOperation?: Maybe<{
            __typename?: 'RoomOperation';
            revisionTo: number;
            valueJson: string;
            operatedBy?: Maybe<{ __typename?: 'OperatedBy'; userUid: string; clientId: string }>;
        }>;
        deleteRoomOperation?: Maybe<{ __typename?: 'DeleteRoomOperation'; deletedBy: string }>;
        roomMessageEvent?: Maybe<
            | {
                  __typename?: 'PieceValueLog';
                  messageId: string;
                  characterCreatedBy: string;
                  characterId: string;
                  stateId: string;
                  createdAt: number;
                  logType: PieceValueLogType;
                  valueJson: string;
              }
            | {
                  __typename?: 'RoomPrivateMessage';
                  messageId: string;
                  visibleTo: Array<string>;
                  initText?: Maybe<string>;
                  initTextSource?: Maybe<string>;
                  textColor?: Maybe<string>;
                  altTextToSecret?: Maybe<string>;
                  isSecret: boolean;
                  createdBy?: Maybe<string>;
                  customName?: Maybe<string>;
                  createdAt: number;
                  updatedAt?: Maybe<number>;
                  updatedText?: Maybe<{
                      __typename?: 'UpdatedText';
                      currentText?: Maybe<string>;
                      updatedAt: number;
                  }>;
                  commandResult?: Maybe<{
                      __typename?: 'CommandResult';
                      text: string;
                      isSuccess?: Maybe<boolean>;
                  }>;
                  character?: Maybe<{
                      __typename?: 'CharacterValueForMessage';
                      stateId: string;
                      isPrivate: boolean;
                      name: string;
                      image?: Maybe<{
                          __typename?: 'FilePath';
                          sourceType: FileSourceType;
                          path: string;
                      }>;
                      tachieImage?: Maybe<{
                          __typename?: 'FilePath';
                          sourceType: FileSourceType;
                          path: string;
                      }>;
                  }>;
              }
            | {
                  __typename?: 'RoomPrivateMessageUpdate';
                  messageId: string;
                  initText?: Maybe<string>;
                  initTextSource?: Maybe<string>;
                  altTextToSecret?: Maybe<string>;
                  isSecret: boolean;
                  updatedAt?: Maybe<number>;
                  updatedText?: Maybe<{
                      __typename?: 'UpdatedText';
                      currentText?: Maybe<string>;
                      updatedAt: number;
                  }>;
                  commandResult?: Maybe<{
                      __typename?: 'CommandResult';
                      text: string;
                      isSuccess?: Maybe<boolean>;
                  }>;
              }
            | { __typename?: 'RoomPublicChannel'; key: string; name?: Maybe<string> }
            | { __typename?: 'RoomPublicChannelUpdate'; key: string; name?: Maybe<string> }
            | {
                  __typename?: 'RoomPublicMessage';
                  messageId: string;
                  channelKey: string;
                  initText?: Maybe<string>;
                  initTextSource?: Maybe<string>;
                  textColor?: Maybe<string>;
                  altTextToSecret?: Maybe<string>;
                  isSecret: boolean;
                  createdBy?: Maybe<string>;
                  customName?: Maybe<string>;
                  createdAt: number;
                  updatedAt?: Maybe<number>;
                  updatedText?: Maybe<{
                      __typename?: 'UpdatedText';
                      currentText?: Maybe<string>;
                      updatedAt: number;
                  }>;
                  commandResult?: Maybe<{
                      __typename?: 'CommandResult';
                      text: string;
                      isSuccess?: Maybe<boolean>;
                  }>;
                  character?: Maybe<{
                      __typename?: 'CharacterValueForMessage';
                      stateId: string;
                      isPrivate: boolean;
                      name: string;
                      image?: Maybe<{
                          __typename?: 'FilePath';
                          sourceType: FileSourceType;
                          path: string;
                      }>;
                      tachieImage?: Maybe<{
                          __typename?: 'FilePath';
                          sourceType: FileSourceType;
                          path: string;
                      }>;
                  }>;
              }
            | {
                  __typename?: 'RoomPublicMessageUpdate';
                  messageId: string;
                  initText?: Maybe<string>;
                  initTextSource?: Maybe<string>;
                  altTextToSecret?: Maybe<string>;
                  isSecret: boolean;
                  updatedAt?: Maybe<number>;
                  updatedText?: Maybe<{
                      __typename?: 'UpdatedText';
                      currentText?: Maybe<string>;
                      updatedAt: number;
                  }>;
                  commandResult?: Maybe<{
                      __typename?: 'CommandResult';
                      text: string;
                      isSuccess?: Maybe<boolean>;
                  }>;
              }
            | {
                  __typename?: 'RoomSoundEffect';
                  messageId: string;
                  createdBy?: Maybe<string>;
                  createdAt: number;
                  volume: number;
                  file: { __typename?: 'FilePath'; sourceType: FileSourceType; path: string };
              }
        >;
        roomConnectionEvent?: Maybe<{
            __typename?: 'RoomConnectionEvent';
            userUid: string;
            isConnected: boolean;
            updatedAt: number;
        }>;
        writingMessageStatus?: Maybe<{
            __typename?: 'WritingMessageStatus';
            userUid: string;
            status: WritingMessageStatusType;
        }>;
    }>;
};

export type PongSubscriptionVariables = Exact<{ [key: string]: never }>;

export type PongSubscription = {
    __typename?: 'Subscription';
    pong: { __typename?: 'Pong'; createdBy?: Maybe<string>; value: number };
};

export const RoomGetStateFragmentDoc = gql`
    fragment RoomGetState on RoomGetState {
        revision
        createdBy
        stateJson
    }
`;
export const CreateRoomResultFragmentDoc = gql`
    fragment CreateRoomResult on CreateRoomResult {
        ... on CreateRoomSuccessResult {
            id
            room {
                ...RoomGetState
            }
        }
        ... on CreateRoomFailureResult {
            failureType
        }
    }
    ${RoomGetStateFragmentDoc}
`;
export const FileItemFragmentDoc = gql`
    fragment FileItem on FileItem {
        filename
        thumbFilename
        screenname
        createdBy
        createdAt
    }
`;
export const FileTagFragmentDoc = gql`
    fragment FileTag on FileTag {
        id
        name
    }
`;
export const RoomAsListItemFragmentDoc = gql`
    fragment RoomAsListItem on RoomAsListItem {
        id
        name
        createdBy
        requiresPhraseToJoinAsPlayer
        requiresPhraseToJoinAsSpectator
    }
`;
export const GetRoomListResultFragmentDoc = gql`
    fragment GetRoomListResult on GetRoomsListResult {
        ... on GetRoomsListSuccessResult {
            rooms {
                ...RoomAsListItem
            }
        }
        ... on GetRoomsListFailureResult {
            failureType
        }
    }
    ${RoomAsListItemFragmentDoc}
`;
export const GetNonJoinedRoomResultFragmentDoc = gql`
    fragment GetNonJoinedRoomResult on GetNonJoinedRoomResult {
        roomAsListItem {
            ...RoomAsListItem
        }
    }
    ${RoomAsListItemFragmentDoc}
`;
export const GetRoomResultFragmentDoc = gql`
    fragment GetRoomResult on GetRoomResult {
        ... on GetJoinedRoomResult {
            role
            room {
                ...RoomGetState
            }
        }
        ... on GetNonJoinedRoomResult {
            ...GetNonJoinedRoomResult
        }
        ... on GetRoomFailureResult {
            failureType
        }
    }
    ${RoomGetStateFragmentDoc}
    ${GetNonJoinedRoomResultFragmentDoc}
`;
export const RoomOperationFragmentDoc = gql`
    fragment RoomOperation on RoomOperation {
        revisionTo
        operatedBy {
            userUid
            clientId
        }
        valueJson
    }
`;
export const JoinRoomResultFragmentDoc = gql`
    fragment JoinRoomResult on JoinRoomResult {
        ... on JoinRoomSuccessResult {
            operation {
                ...RoomOperation
            }
        }
        ... on JoinRoomFailureResult {
            failureType
        }
    }
    ${RoomOperationFragmentDoc}
`;
export const FilePathFragmentDoc = gql`
    fragment FilePath on FilePath {
        sourceType
        path
    }
`;
export const RoomSoundEffectFragmentDoc = gql`
    fragment RoomSoundEffect on RoomSoundEffect {
        messageId
        file {
            ...FilePath
        }
        createdBy
        createdAt
        volume
    }
    ${FilePathFragmentDoc}
`;
export const CharacterValueForMessageFragmentDoc = gql`
    fragment CharacterValueForMessage on CharacterValueForMessage {
        stateId
        isPrivate
        name
        image {
            ...FilePath
        }
        tachieImage {
            ...FilePath
        }
    }
    ${FilePathFragmentDoc}
`;
export const RoomPublicMessageFragmentDoc = gql`
    fragment RoomPublicMessage on RoomPublicMessage {
        messageId
        channelKey
        initText
        initTextSource
        updatedText {
            currentText
            updatedAt
        }
        textColor
        commandResult {
            text
            isSuccess
        }
        altTextToSecret
        isSecret
        createdBy
        character {
            ...CharacterValueForMessage
        }
        customName
        createdAt
        updatedAt
    }
    ${CharacterValueForMessageFragmentDoc}
`;
export const RoomPublicChannelFragmentDoc = gql`
    fragment RoomPublicChannel on RoomPublicChannel {
        key
        name
    }
`;
export const RoomPrivateMessageFragmentDoc = gql`
    fragment RoomPrivateMessage on RoomPrivateMessage {
        messageId
        visibleTo
        initText
        initTextSource
        updatedText {
            currentText
            updatedAt
        }
        textColor
        commandResult {
            text
            isSuccess
        }
        altTextToSecret
        isSecret
        createdBy
        character {
            ...CharacterValueForMessage
        }
        customName
        createdAt
        updatedAt
    }
    ${CharacterValueForMessageFragmentDoc}
`;
export const PieceValueLogFragmentDoc = gql`
    fragment PieceValueLog on PieceValueLog {
        messageId
        characterCreatedBy
        characterId
        stateId
        createdAt
        logType
        valueJson
    }
`;
export const RoomMessageEventFragmentDoc = gql`
    fragment RoomMessageEvent on RoomMessageEvent {
        ... on RoomSoundEffect {
            ...RoomSoundEffect
        }
        ... on RoomPublicMessage {
            ...RoomPublicMessage
        }
        ... on RoomPublicChannel {
            ...RoomPublicChannel
        }
        ... on RoomPrivateMessage {
            ...RoomPrivateMessage
        }
        ... on PieceValueLog {
            ...PieceValueLog
        }
        ... on RoomPublicChannelUpdate {
            key
            name
        }
        ... on RoomPublicMessageUpdate {
            messageId
            initText
            initTextSource
            updatedText {
                currentText
                updatedAt
            }
            commandResult {
                text
                isSuccess
            }
            altTextToSecret
            isSecret
            updatedAt
        }
        ... on RoomPrivateMessageUpdate {
            messageId
            initText
            initTextSource
            updatedText {
                currentText
                updatedAt
            }
            commandResult {
                text
                isSuccess
            }
            altTextToSecret
            isSecret
            updatedAt
        }
    }
    ${RoomSoundEffectFragmentDoc}
    ${RoomPublicMessageFragmentDoc}
    ${RoomPublicChannelFragmentDoc}
    ${RoomPrivateMessageFragmentDoc}
    ${PieceValueLogFragmentDoc}
`;
export const SemVerFragmentDoc = gql`
    fragment SemVer on SemVer {
        major
        minor
        patch
        prerelease {
            type
            version
        }
    }
`;
export const GetAvailableGameSystemsDocument = gql`
    query GetAvailableGameSystems {
        result: getAvailableGameSystems {
            value {
                id
                name
                sortKey
            }
        }
    }
`;

/**
 * __useGetAvailableGameSystemsQuery__
 *
 * To run a query within a React component, call `useGetAvailableGameSystemsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAvailableGameSystemsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAvailableGameSystemsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAvailableGameSystemsQuery(
    baseOptions?: Apollo.QueryHookOptions<
        GetAvailableGameSystemsQuery,
        GetAvailableGameSystemsQueryVariables
    >
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useQuery<GetAvailableGameSystemsQuery, GetAvailableGameSystemsQueryVariables>(
        GetAvailableGameSystemsDocument,
        options
    );
}
export function useGetAvailableGameSystemsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        GetAvailableGameSystemsQuery,
        GetAvailableGameSystemsQueryVariables
    >
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useLazyQuery<GetAvailableGameSystemsQuery, GetAvailableGameSystemsQueryVariables>(
        GetAvailableGameSystemsDocument,
        options
    );
}
export type GetAvailableGameSystemsQueryHookResult = ReturnType<
    typeof useGetAvailableGameSystemsQuery
>;
export type GetAvailableGameSystemsLazyQueryHookResult = ReturnType<
    typeof useGetAvailableGameSystemsLazyQuery
>;
export type GetAvailableGameSystemsQueryResult = Apollo.QueryResult<
    GetAvailableGameSystemsQuery,
    GetAvailableGameSystemsQueryVariables
>;
export const GetFilesDocument = gql`
    query GetFiles($input: GetFilesInput!) {
        result: getFiles(input: $input) {
            files {
                ...FileItem
            }
        }
    }
    ${FileItemFragmentDoc}
`;

/**
 * __useGetFilesQuery__
 *
 * To run a query within a React component, call `useGetFilesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFilesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFilesQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGetFilesQuery(
    baseOptions: Apollo.QueryHookOptions<GetFilesQuery, GetFilesQueryVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useQuery<GetFilesQuery, GetFilesQueryVariables>(GetFilesDocument, options);
}
export function useGetFilesLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetFilesQuery, GetFilesQueryVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useLazyQuery<GetFilesQuery, GetFilesQueryVariables>(GetFilesDocument, options);
}
export type GetFilesQueryHookResult = ReturnType<typeof useGetFilesQuery>;
export type GetFilesLazyQueryHookResult = ReturnType<typeof useGetFilesLazyQuery>;
export type GetFilesQueryResult = Apollo.QueryResult<GetFilesQuery, GetFilesQueryVariables>;
export const GetRoomDocument = gql`
    query GetRoom($id: String!) {
        result: getRoom(id: $id) {
            ... on GetJoinedRoomResult {
                role
                room {
                    ...RoomGetState
                }
            }
            ... on GetNonJoinedRoomResult {
                roomAsListItem {
                    ...RoomAsListItem
                }
            }
            ... on GetRoomFailureResult {
                failureType
            }
        }
    }
    ${RoomGetStateFragmentDoc}
    ${RoomAsListItemFragmentDoc}
`;

/**
 * __useGetRoomQuery__
 *
 * To run a query within a React component, call `useGetRoomQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRoomQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRoomQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetRoomQuery(
    baseOptions: Apollo.QueryHookOptions<GetRoomQuery, GetRoomQueryVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useQuery<GetRoomQuery, GetRoomQueryVariables>(GetRoomDocument, options);
}
export function useGetRoomLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetRoomQuery, GetRoomQueryVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useLazyQuery<GetRoomQuery, GetRoomQueryVariables>(GetRoomDocument, options);
}
export type GetRoomQueryHookResult = ReturnType<typeof useGetRoomQuery>;
export type GetRoomLazyQueryHookResult = ReturnType<typeof useGetRoomLazyQuery>;
export type GetRoomQueryResult = Apollo.QueryResult<GetRoomQuery, GetRoomQueryVariables>;
export const GetRoomsListDocument = gql`
    query GetRoomsList {
        result: getRoomsList {
            ... on GetRoomsListSuccessResult {
                rooms {
                    ...RoomAsListItem
                }
            }
            ... on GetRoomsListFailureResult {
                failureType
            }
        }
    }
    ${RoomAsListItemFragmentDoc}
`;

/**
 * __useGetRoomsListQuery__
 *
 * To run a query within a React component, call `useGetRoomsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRoomsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRoomsListQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetRoomsListQuery(
    baseOptions?: Apollo.QueryHookOptions<GetRoomsListQuery, GetRoomsListQueryVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useQuery<GetRoomsListQuery, GetRoomsListQueryVariables>(
        GetRoomsListDocument,
        options
    );
}
export function useGetRoomsListLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetRoomsListQuery, GetRoomsListQueryVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useLazyQuery<GetRoomsListQuery, GetRoomsListQueryVariables>(
        GetRoomsListDocument,
        options
    );
}
export type GetRoomsListQueryHookResult = ReturnType<typeof useGetRoomsListQuery>;
export type GetRoomsListLazyQueryHookResult = ReturnType<typeof useGetRoomsListLazyQuery>;
export type GetRoomsListQueryResult = Apollo.QueryResult<
    GetRoomsListQuery,
    GetRoomsListQueryVariables
>;
export const GetMessagesDocument = gql`
    query GetMessages($roomId: String!) {
        result: getMessages(roomId: $roomId) {
            ... on RoomMessages {
                publicMessages {
                    ...RoomPublicMessage
                }
                privateMessages {
                    ...RoomPrivateMessage
                }
                pieceValueLogs {
                    ...PieceValueLog
                }
                publicChannels {
                    ...RoomPublicChannel
                }
                soundEffects {
                    ...RoomSoundEffect
                }
            }
            ... on GetRoomMessagesFailureResult {
                failureType
            }
        }
    }
    ${RoomPublicMessageFragmentDoc}
    ${RoomPrivateMessageFragmentDoc}
    ${PieceValueLogFragmentDoc}
    ${RoomPublicChannelFragmentDoc}
    ${RoomSoundEffectFragmentDoc}
`;

/**
 * __useGetMessagesQuery__
 *
 * To run a query within a React component, call `useGetMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMessagesQuery({
 *   variables: {
 *      roomId: // value for 'roomId'
 *   },
 * });
 */
export function useGetMessagesQuery(
    baseOptions: Apollo.QueryHookOptions<GetMessagesQuery, GetMessagesQueryVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useQuery<GetMessagesQuery, GetMessagesQueryVariables>(
        GetMessagesDocument,
        options
    );
}
export function useGetMessagesLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetMessagesQuery, GetMessagesQueryVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useLazyQuery<GetMessagesQuery, GetMessagesQueryVariables>(
        GetMessagesDocument,
        options
    );
}
export type GetMessagesQueryHookResult = ReturnType<typeof useGetMessagesQuery>;
export type GetMessagesLazyQueryHookResult = ReturnType<typeof useGetMessagesLazyQuery>;
export type GetMessagesQueryResult = Apollo.QueryResult<
    GetMessagesQuery,
    GetMessagesQueryVariables
>;
export const GetLogDocument = gql`
    query GetLog($roomId: String!) {
        result: getLog(roomId: $roomId) {
            ... on RoomMessages {
                publicMessages {
                    ...RoomPublicMessage
                }
                privateMessages {
                    ...RoomPrivateMessage
                }
                pieceValueLogs {
                    ...PieceValueLog
                }
                publicChannels {
                    ...RoomPublicChannel
                }
                soundEffects {
                    ...RoomSoundEffect
                }
            }
            ... on GetRoomLogFailureResult {
                failureType
            }
        }
    }
    ${RoomPublicMessageFragmentDoc}
    ${RoomPrivateMessageFragmentDoc}
    ${PieceValueLogFragmentDoc}
    ${RoomPublicChannelFragmentDoc}
    ${RoomSoundEffectFragmentDoc}
`;

/**
 * __useGetLogQuery__
 *
 * To run a query within a React component, call `useGetLogQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLogQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLogQuery({
 *   variables: {
 *      roomId: // value for 'roomId'
 *   },
 * });
 */
export function useGetLogQuery(
    baseOptions: Apollo.QueryHookOptions<GetLogQuery, GetLogQueryVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useQuery<GetLogQuery, GetLogQueryVariables>(GetLogDocument, options);
}
export function useGetLogLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetLogQuery, GetLogQueryVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useLazyQuery<GetLogQuery, GetLogQueryVariables>(GetLogDocument, options);
}
export type GetLogQueryHookResult = ReturnType<typeof useGetLogQuery>;
export type GetLogLazyQueryHookResult = ReturnType<typeof useGetLogLazyQuery>;
export type GetLogQueryResult = Apollo.QueryResult<GetLogQuery, GetLogQueryVariables>;
export const GetRoomConnectionsDocument = gql`
    query GetRoomConnections($roomId: String!) {
        result: getRoomConnections(roomId: $roomId) {
            ... on GetRoomConnectionsSuccessResult {
                fetchedAt
                connectedUserUids
            }
            ... on GetRoomConnectionsFailureResult {
                failureType
            }
        }
    }
`;

/**
 * __useGetRoomConnectionsQuery__
 *
 * To run a query within a React component, call `useGetRoomConnectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRoomConnectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRoomConnectionsQuery({
 *   variables: {
 *      roomId: // value for 'roomId'
 *   },
 * });
 */
export function useGetRoomConnectionsQuery(
    baseOptions: Apollo.QueryHookOptions<GetRoomConnectionsQuery, GetRoomConnectionsQueryVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useQuery<GetRoomConnectionsQuery, GetRoomConnectionsQueryVariables>(
        GetRoomConnectionsDocument,
        options
    );
}
export function useGetRoomConnectionsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        GetRoomConnectionsQuery,
        GetRoomConnectionsQueryVariables
    >
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useLazyQuery<GetRoomConnectionsQuery, GetRoomConnectionsQueryVariables>(
        GetRoomConnectionsDocument,
        options
    );
}
export type GetRoomConnectionsQueryHookResult = ReturnType<typeof useGetRoomConnectionsQuery>;
export type GetRoomConnectionsLazyQueryHookResult = ReturnType<
    typeof useGetRoomConnectionsLazyQuery
>;
export type GetRoomConnectionsQueryResult = Apollo.QueryResult<
    GetRoomConnectionsQuery,
    GetRoomConnectionsQueryVariables
>;
export const GetServerInfoDocument = gql`
    query GetServerInfo {
        result: getServerInfo {
            version {
                ...SemVer
            }
            uploaderEnabled
        }
    }
    ${SemVerFragmentDoc}
`;

/**
 * __useGetServerInfoQuery__
 *
 * To run a query within a React component, call `useGetServerInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetServerInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetServerInfoQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetServerInfoQuery(
    baseOptions?: Apollo.QueryHookOptions<GetServerInfoQuery, GetServerInfoQueryVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useQuery<GetServerInfoQuery, GetServerInfoQueryVariables>(
        GetServerInfoDocument,
        options
    );
}
export function useGetServerInfoLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetServerInfoQuery, GetServerInfoQueryVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useLazyQuery<GetServerInfoQuery, GetServerInfoQueryVariables>(
        GetServerInfoDocument,
        options
    );
}
export type GetServerInfoQueryHookResult = ReturnType<typeof useGetServerInfoQuery>;
export type GetServerInfoLazyQueryHookResult = ReturnType<typeof useGetServerInfoLazyQuery>;
export type GetServerInfoQueryResult = Apollo.QueryResult<
    GetServerInfoQuery,
    GetServerInfoQueryVariables
>;
export const IsEntryDocument = gql`
    query IsEntry {
        result: isEntry
    }
`;

/**
 * __useIsEntryQuery__
 *
 * To run a query within a React component, call `useIsEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useIsEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIsEntryQuery({
 *   variables: {
 *   },
 * });
 */
export function useIsEntryQuery(
    baseOptions?: Apollo.QueryHookOptions<IsEntryQuery, IsEntryQueryVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useQuery<IsEntryQuery, IsEntryQueryVariables>(IsEntryDocument, options);
}
export function useIsEntryLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<IsEntryQuery, IsEntryQueryVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useLazyQuery<IsEntryQuery, IsEntryQueryVariables>(IsEntryDocument, options);
}
export type IsEntryQueryHookResult = ReturnType<typeof useIsEntryQuery>;
export type IsEntryLazyQueryHookResult = ReturnType<typeof useIsEntryLazyQuery>;
export type IsEntryQueryResult = Apollo.QueryResult<IsEntryQuery, IsEntryQueryVariables>;
export const RequiresPhraseToJoinAsPlayerDocument = gql`
    query RequiresPhraseToJoinAsPlayer($roomId: String!) {
        result: requiresPhraseToJoinAsPlayer(roomId: $roomId) {
            ... on RequiresPhraseSuccessResult {
                value
            }
            ... on RequiresPhraseFailureResult {
                failureType
            }
        }
    }
`;

/**
 * __useRequiresPhraseToJoinAsPlayerQuery__
 *
 * To run a query within a React component, call `useRequiresPhraseToJoinAsPlayerQuery` and pass it any options that fit your needs.
 * When your component renders, `useRequiresPhraseToJoinAsPlayerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRequiresPhraseToJoinAsPlayerQuery({
 *   variables: {
 *      roomId: // value for 'roomId'
 *   },
 * });
 */
export function useRequiresPhraseToJoinAsPlayerQuery(
    baseOptions: Apollo.QueryHookOptions<
        RequiresPhraseToJoinAsPlayerQuery,
        RequiresPhraseToJoinAsPlayerQueryVariables
    >
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useQuery<
        RequiresPhraseToJoinAsPlayerQuery,
        RequiresPhraseToJoinAsPlayerQueryVariables
    >(RequiresPhraseToJoinAsPlayerDocument, options);
}
export function useRequiresPhraseToJoinAsPlayerLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        RequiresPhraseToJoinAsPlayerQuery,
        RequiresPhraseToJoinAsPlayerQueryVariables
    >
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useLazyQuery<
        RequiresPhraseToJoinAsPlayerQuery,
        RequiresPhraseToJoinAsPlayerQueryVariables
    >(RequiresPhraseToJoinAsPlayerDocument, options);
}
export type RequiresPhraseToJoinAsPlayerQueryHookResult = ReturnType<
    typeof useRequiresPhraseToJoinAsPlayerQuery
>;
export type RequiresPhraseToJoinAsPlayerLazyQueryHookResult = ReturnType<
    typeof useRequiresPhraseToJoinAsPlayerLazyQuery
>;
export type RequiresPhraseToJoinAsPlayerQueryResult = Apollo.QueryResult<
    RequiresPhraseToJoinAsPlayerQuery,
    RequiresPhraseToJoinAsPlayerQueryVariables
>;
export const CreateFileTagDocument = gql`
    mutation CreateFileTag($tagName: String!) {
        result: createFileTag(tagName: $tagName) {
            ...FileTag
        }
    }
    ${FileTagFragmentDoc}
`;
export type CreateFileTagMutationFn = Apollo.MutationFunction<
    CreateFileTagMutation,
    CreateFileTagMutationVariables
>;

/**
 * __useCreateFileTagMutation__
 *
 * To run a mutation, you first call `useCreateFileTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateFileTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createFileTagMutation, { data, loading, error }] = useCreateFileTagMutation({
 *   variables: {
 *      tagName: // value for 'tagName'
 *   },
 * });
 */
export function useCreateFileTagMutation(
    baseOptions?: Apollo.MutationHookOptions<CreateFileTagMutation, CreateFileTagMutationVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<CreateFileTagMutation, CreateFileTagMutationVariables>(
        CreateFileTagDocument,
        options
    );
}
export type CreateFileTagMutationHookResult = ReturnType<typeof useCreateFileTagMutation>;
export type CreateFileTagMutationResult = Apollo.MutationResult<CreateFileTagMutation>;
export type CreateFileTagMutationOptions = Apollo.BaseMutationOptions<
    CreateFileTagMutation,
    CreateFileTagMutationVariables
>;
export const ChangeParticipantNameDocument = gql`
    mutation ChangeParticipantName($roomId: String!, $newName: String!) {
        result: changeParticipantName(roomId: $roomId, newName: $newName) {
            failureType
        }
    }
`;
export type ChangeParticipantNameMutationFn = Apollo.MutationFunction<
    ChangeParticipantNameMutation,
    ChangeParticipantNameMutationVariables
>;

/**
 * __useChangeParticipantNameMutation__
 *
 * To run a mutation, you first call `useChangeParticipantNameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangeParticipantNameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changeParticipantNameMutation, { data, loading, error }] = useChangeParticipantNameMutation({
 *   variables: {
 *      roomId: // value for 'roomId'
 *      newName: // value for 'newName'
 *   },
 * });
 */
export function useChangeParticipantNameMutation(
    baseOptions?: Apollo.MutationHookOptions<
        ChangeParticipantNameMutation,
        ChangeParticipantNameMutationVariables
    >
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<
        ChangeParticipantNameMutation,
        ChangeParticipantNameMutationVariables
    >(ChangeParticipantNameDocument, options);
}
export type ChangeParticipantNameMutationHookResult = ReturnType<
    typeof useChangeParticipantNameMutation
>;
export type ChangeParticipantNameMutationResult =
    Apollo.MutationResult<ChangeParticipantNameMutation>;
export type ChangeParticipantNameMutationOptions = Apollo.BaseMutationOptions<
    ChangeParticipantNameMutation,
    ChangeParticipantNameMutationVariables
>;
export const CreateRoomDocument = gql`
    mutation CreateRoom($input: CreateRoomInput!) {
        result: createRoom(input: $input) {
            ... on CreateRoomSuccessResult {
                ...CreateRoomResult
            }
            ... on CreateRoomFailureResult {
                failureType
            }
        }
    }
    ${CreateRoomResultFragmentDoc}
`;
export type CreateRoomMutationFn = Apollo.MutationFunction<
    CreateRoomMutation,
    CreateRoomMutationVariables
>;

/**
 * __useCreateRoomMutation__
 *
 * To run a mutation, you first call `useCreateRoomMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRoomMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRoomMutation, { data, loading, error }] = useCreateRoomMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateRoomMutation(
    baseOptions?: Apollo.MutationHookOptions<CreateRoomMutation, CreateRoomMutationVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<CreateRoomMutation, CreateRoomMutationVariables>(
        CreateRoomDocument,
        options
    );
}
export type CreateRoomMutationHookResult = ReturnType<typeof useCreateRoomMutation>;
export type CreateRoomMutationResult = Apollo.MutationResult<CreateRoomMutation>;
export type CreateRoomMutationOptions = Apollo.BaseMutationOptions<
    CreateRoomMutation,
    CreateRoomMutationVariables
>;
export const DeleteFilesDocument = gql`
    mutation DeleteFiles($filenames: [String!]!) {
        result: deleteFiles(filenames: $filenames)
    }
`;
export type DeleteFilesMutationFn = Apollo.MutationFunction<
    DeleteFilesMutation,
    DeleteFilesMutationVariables
>;

/**
 * __useDeleteFilesMutation__
 *
 * To run a mutation, you first call `useDeleteFilesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFilesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteFilesMutation, { data, loading, error }] = useDeleteFilesMutation({
 *   variables: {
 *      filenames: // value for 'filenames'
 *   },
 * });
 */
export function useDeleteFilesMutation(
    baseOptions?: Apollo.MutationHookOptions<DeleteFilesMutation, DeleteFilesMutationVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<DeleteFilesMutation, DeleteFilesMutationVariables>(
        DeleteFilesDocument,
        options
    );
}
export type DeleteFilesMutationHookResult = ReturnType<typeof useDeleteFilesMutation>;
export type DeleteFilesMutationResult = Apollo.MutationResult<DeleteFilesMutation>;
export type DeleteFilesMutationOptions = Apollo.BaseMutationOptions<
    DeleteFilesMutation,
    DeleteFilesMutationVariables
>;
export const DeleteFileTagDocument = gql`
    mutation DeleteFileTag($tagId: String!) {
        result: deleteFileTag(tagId: $tagId)
    }
`;
export type DeleteFileTagMutationFn = Apollo.MutationFunction<
    DeleteFileTagMutation,
    DeleteFileTagMutationVariables
>;

/**
 * __useDeleteFileTagMutation__
 *
 * To run a mutation, you first call `useDeleteFileTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFileTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteFileTagMutation, { data, loading, error }] = useDeleteFileTagMutation({
 *   variables: {
 *      tagId: // value for 'tagId'
 *   },
 * });
 */
export function useDeleteFileTagMutation(
    baseOptions?: Apollo.MutationHookOptions<DeleteFileTagMutation, DeleteFileTagMutationVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<DeleteFileTagMutation, DeleteFileTagMutationVariables>(
        DeleteFileTagDocument,
        options
    );
}
export type DeleteFileTagMutationHookResult = ReturnType<typeof useDeleteFileTagMutation>;
export type DeleteFileTagMutationResult = Apollo.MutationResult<DeleteFileTagMutation>;
export type DeleteFileTagMutationOptions = Apollo.BaseMutationOptions<
    DeleteFileTagMutation,
    DeleteFileTagMutationVariables
>;
export const DeleteRoomDocument = gql`
    mutation DeleteRoom($id: String!) {
        result: deleteRoom(id: $id) {
            failureType
        }
    }
`;
export type DeleteRoomMutationFn = Apollo.MutationFunction<
    DeleteRoomMutation,
    DeleteRoomMutationVariables
>;

/**
 * __useDeleteRoomMutation__
 *
 * To run a mutation, you first call `useDeleteRoomMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteRoomMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteRoomMutation, { data, loading, error }] = useDeleteRoomMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteRoomMutation(
    baseOptions?: Apollo.MutationHookOptions<DeleteRoomMutation, DeleteRoomMutationVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<DeleteRoomMutation, DeleteRoomMutationVariables>(
        DeleteRoomDocument,
        options
    );
}
export type DeleteRoomMutationHookResult = ReturnType<typeof useDeleteRoomMutation>;
export type DeleteRoomMutationResult = Apollo.MutationResult<DeleteRoomMutation>;
export type DeleteRoomMutationOptions = Apollo.BaseMutationOptions<
    DeleteRoomMutation,
    DeleteRoomMutationVariables
>;
export const EditFileTagsDocument = gql`
    mutation EditFileTags($input: EditFileTagsInput!) {
        result: editFileTags(input: $input)
    }
`;
export type EditFileTagsMutationFn = Apollo.MutationFunction<
    EditFileTagsMutation,
    EditFileTagsMutationVariables
>;

/**
 * __useEditFileTagsMutation__
 *
 * To run a mutation, you first call `useEditFileTagsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditFileTagsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editFileTagsMutation, { data, loading, error }] = useEditFileTagsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useEditFileTagsMutation(
    baseOptions?: Apollo.MutationHookOptions<EditFileTagsMutation, EditFileTagsMutationVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<EditFileTagsMutation, EditFileTagsMutationVariables>(
        EditFileTagsDocument,
        options
    );
}
export type EditFileTagsMutationHookResult = ReturnType<typeof useEditFileTagsMutation>;
export type EditFileTagsMutationResult = Apollo.MutationResult<EditFileTagsMutation>;
export type EditFileTagsMutationOptions = Apollo.BaseMutationOptions<
    EditFileTagsMutation,
    EditFileTagsMutationVariables
>;
export const JoinRoomAsPlayerDocument = gql`
    mutation JoinRoomAsPlayer($id: String!, $name: String!, $phrase: String) {
        result: joinRoomAsPlayer(id: $id, name: $name, phrase: $phrase) {
            ...JoinRoomResult
        }
    }
    ${JoinRoomResultFragmentDoc}
`;
export type JoinRoomAsPlayerMutationFn = Apollo.MutationFunction<
    JoinRoomAsPlayerMutation,
    JoinRoomAsPlayerMutationVariables
>;

/**
 * __useJoinRoomAsPlayerMutation__
 *
 * To run a mutation, you first call `useJoinRoomAsPlayerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useJoinRoomAsPlayerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [joinRoomAsPlayerMutation, { data, loading, error }] = useJoinRoomAsPlayerMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      phrase: // value for 'phrase'
 *   },
 * });
 */
export function useJoinRoomAsPlayerMutation(
    baseOptions?: Apollo.MutationHookOptions<
        JoinRoomAsPlayerMutation,
        JoinRoomAsPlayerMutationVariables
    >
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<JoinRoomAsPlayerMutation, JoinRoomAsPlayerMutationVariables>(
        JoinRoomAsPlayerDocument,
        options
    );
}
export type JoinRoomAsPlayerMutationHookResult = ReturnType<typeof useJoinRoomAsPlayerMutation>;
export type JoinRoomAsPlayerMutationResult = Apollo.MutationResult<JoinRoomAsPlayerMutation>;
export type JoinRoomAsPlayerMutationOptions = Apollo.BaseMutationOptions<
    JoinRoomAsPlayerMutation,
    JoinRoomAsPlayerMutationVariables
>;
export const JoinRoomAsSpectatorDocument = gql`
    mutation JoinRoomAsSpectator($id: String!, $name: String!, $phrase: String) {
        result: joinRoomAsSpectator(id: $id, name: $name, phrase: $phrase) {
            ...JoinRoomResult
        }
    }
    ${JoinRoomResultFragmentDoc}
`;
export type JoinRoomAsSpectatorMutationFn = Apollo.MutationFunction<
    JoinRoomAsSpectatorMutation,
    JoinRoomAsSpectatorMutationVariables
>;

/**
 * __useJoinRoomAsSpectatorMutation__
 *
 * To run a mutation, you first call `useJoinRoomAsSpectatorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useJoinRoomAsSpectatorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [joinRoomAsSpectatorMutation, { data, loading, error }] = useJoinRoomAsSpectatorMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      phrase: // value for 'phrase'
 *   },
 * });
 */
export function useJoinRoomAsSpectatorMutation(
    baseOptions?: Apollo.MutationHookOptions<
        JoinRoomAsSpectatorMutation,
        JoinRoomAsSpectatorMutationVariables
    >
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<JoinRoomAsSpectatorMutation, JoinRoomAsSpectatorMutationVariables>(
        JoinRoomAsSpectatorDocument,
        options
    );
}
export type JoinRoomAsSpectatorMutationHookResult = ReturnType<
    typeof useJoinRoomAsSpectatorMutation
>;
export type JoinRoomAsSpectatorMutationResult = Apollo.MutationResult<JoinRoomAsSpectatorMutation>;
export type JoinRoomAsSpectatorMutationOptions = Apollo.BaseMutationOptions<
    JoinRoomAsSpectatorMutation,
    JoinRoomAsSpectatorMutationVariables
>;
export const EntryToServerDocument = gql`
    mutation EntryToServer($phrase: String!) {
        result: entryToServer(phrase: $phrase) {
            type
        }
    }
`;
export type EntryToServerMutationFn = Apollo.MutationFunction<
    EntryToServerMutation,
    EntryToServerMutationVariables
>;

/**
 * __useEntryToServerMutation__
 *
 * To run a mutation, you first call `useEntryToServerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEntryToServerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [entryToServerMutation, { data, loading, error }] = useEntryToServerMutation({
 *   variables: {
 *      phrase: // value for 'phrase'
 *   },
 * });
 */
export function useEntryToServerMutation(
    baseOptions?: Apollo.MutationHookOptions<EntryToServerMutation, EntryToServerMutationVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<EntryToServerMutation, EntryToServerMutationVariables>(
        EntryToServerDocument,
        options
    );
}
export type EntryToServerMutationHookResult = ReturnType<typeof useEntryToServerMutation>;
export type EntryToServerMutationResult = Apollo.MutationResult<EntryToServerMutation>;
export type EntryToServerMutationOptions = Apollo.BaseMutationOptions<
    EntryToServerMutation,
    EntryToServerMutationVariables
>;
export const LeaveRoomDocument = gql`
    mutation LeaveRoom($id: String!) {
        result: leaveRoom(id: $id) {
            failureType
        }
    }
`;
export type LeaveRoomMutationFn = Apollo.MutationFunction<
    LeaveRoomMutation,
    LeaveRoomMutationVariables
>;

/**
 * __useLeaveRoomMutation__
 *
 * To run a mutation, you first call `useLeaveRoomMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLeaveRoomMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [leaveRoomMutation, { data, loading, error }] = useLeaveRoomMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useLeaveRoomMutation(
    baseOptions?: Apollo.MutationHookOptions<LeaveRoomMutation, LeaveRoomMutationVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<LeaveRoomMutation, LeaveRoomMutationVariables>(
        LeaveRoomDocument,
        options
    );
}
export type LeaveRoomMutationHookResult = ReturnType<typeof useLeaveRoomMutation>;
export type LeaveRoomMutationResult = Apollo.MutationResult<LeaveRoomMutation>;
export type LeaveRoomMutationOptions = Apollo.BaseMutationOptions<
    LeaveRoomMutation,
    LeaveRoomMutationVariables
>;
export const OperateDocument = gql`
    mutation Operate(
        $id: String!
        $revisionFrom: Int!
        $operation: RoomOperationInput!
        $requestId: String!
    ) {
        result: operate(
            id: $id
            prevRevision: $revisionFrom
            operation: $operation
            requestId: $requestId
        ) {
            ... on OperateRoomSuccessResult {
                operation {
                    ...RoomOperation
                }
            }
            ... on OperateRoomIdResult {
                requestId
            }
            ... on OperateRoomFailureResult {
                failureType
            }
            ... on OperateRoomNonJoinedResult {
                roomAsListItem {
                    ...RoomAsListItem
                }
            }
        }
    }
    ${RoomOperationFragmentDoc}
    ${RoomAsListItemFragmentDoc}
`;
export type OperateMutationFn = Apollo.MutationFunction<OperateMutation, OperateMutationVariables>;

/**
 * __useOperateMutation__
 *
 * To run a mutation, you first call `useOperateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useOperateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [operateMutation, { data, loading, error }] = useOperateMutation({
 *   variables: {
 *      id: // value for 'id'
 *      revisionFrom: // value for 'revisionFrom'
 *      operation: // value for 'operation'
 *      requestId: // value for 'requestId'
 *   },
 * });
 */
export function useOperateMutation(
    baseOptions?: Apollo.MutationHookOptions<OperateMutation, OperateMutationVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<OperateMutation, OperateMutationVariables>(OperateDocument, options);
}
export type OperateMutationHookResult = ReturnType<typeof useOperateMutation>;
export type OperateMutationResult = Apollo.MutationResult<OperateMutation>;
export type OperateMutationOptions = Apollo.BaseMutationOptions<
    OperateMutation,
    OperateMutationVariables
>;
export const PingDocument = gql`
    mutation Ping($value: Float!) {
        result: ping(value: $value) {
            createdBy
            value
        }
    }
`;
export type PingMutationFn = Apollo.MutationFunction<PingMutation, PingMutationVariables>;

/**
 * __usePingMutation__
 *
 * To run a mutation, you first call `usePingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [pingMutation, { data, loading, error }] = usePingMutation({
 *   variables: {
 *      value: // value for 'value'
 *   },
 * });
 */
export function usePingMutation(
    baseOptions?: Apollo.MutationHookOptions<PingMutation, PingMutationVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<PingMutation, PingMutationVariables>(PingDocument, options);
}
export type PingMutationHookResult = ReturnType<typeof usePingMutation>;
export type PingMutationResult = Apollo.MutationResult<PingMutation>;
export type PingMutationOptions = Apollo.BaseMutationOptions<PingMutation, PingMutationVariables>;
export const PromoteToPlayerDocument = gql`
    mutation PromoteToPlayer($roomId: String!, $phrase: String) {
        result: promoteToPlayer(roomId: $roomId, phrase: $phrase) {
            failureType
        }
    }
`;
export type PromoteToPlayerMutationFn = Apollo.MutationFunction<
    PromoteToPlayerMutation,
    PromoteToPlayerMutationVariables
>;

/**
 * __usePromoteToPlayerMutation__
 *
 * To run a mutation, you first call `usePromoteToPlayerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePromoteToPlayerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [promoteToPlayerMutation, { data, loading, error }] = usePromoteToPlayerMutation({
 *   variables: {
 *      roomId: // value for 'roomId'
 *      phrase: // value for 'phrase'
 *   },
 * });
 */
export function usePromoteToPlayerMutation(
    baseOptions?: Apollo.MutationHookOptions<
        PromoteToPlayerMutation,
        PromoteToPlayerMutationVariables
    >
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<PromoteToPlayerMutation, PromoteToPlayerMutationVariables>(
        PromoteToPlayerDocument,
        options
    );
}
export type PromoteToPlayerMutationHookResult = ReturnType<typeof usePromoteToPlayerMutation>;
export type PromoteToPlayerMutationResult = Apollo.MutationResult<PromoteToPlayerMutation>;
export type PromoteToPlayerMutationOptions = Apollo.BaseMutationOptions<
    PromoteToPlayerMutation,
    PromoteToPlayerMutationVariables
>;
export const WritePublicMessageDocument = gql`
    mutation WritePublicMessage(
        $roomId: String!
        $text: String!
        $textColor: String
        $channelKey: String!
        $characterStateId: String
        $customName: String
        $gameType: String
    ) {
        result: writePublicMessage(
            roomId: $roomId
            text: $text
            textColor: $textColor
            channelKey: $channelKey
            characterStateId: $characterStateId
            customName: $customName
            gameType: $gameType
        ) {
            ... on RoomPublicMessage {
                ...RoomPublicMessage
            }
            ... on WriteRoomPublicMessageFailureResult {
                failureType
            }
        }
    }
    ${RoomPublicMessageFragmentDoc}
`;
export type WritePublicMessageMutationFn = Apollo.MutationFunction<
    WritePublicMessageMutation,
    WritePublicMessageMutationVariables
>;

/**
 * __useWritePublicMessageMutation__
 *
 * To run a mutation, you first call `useWritePublicMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useWritePublicMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [writePublicMessageMutation, { data, loading, error }] = useWritePublicMessageMutation({
 *   variables: {
 *      roomId: // value for 'roomId'
 *      text: // value for 'text'
 *      textColor: // value for 'textColor'
 *      channelKey: // value for 'channelKey'
 *      characterStateId: // value for 'characterStateId'
 *      customName: // value for 'customName'
 *      gameType: // value for 'gameType'
 *   },
 * });
 */
export function useWritePublicMessageMutation(
    baseOptions?: Apollo.MutationHookOptions<
        WritePublicMessageMutation,
        WritePublicMessageMutationVariables
    >
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<WritePublicMessageMutation, WritePublicMessageMutationVariables>(
        WritePublicMessageDocument,
        options
    );
}
export type WritePublicMessageMutationHookResult = ReturnType<typeof useWritePublicMessageMutation>;
export type WritePublicMessageMutationResult = Apollo.MutationResult<WritePublicMessageMutation>;
export type WritePublicMessageMutationOptions = Apollo.BaseMutationOptions<
    WritePublicMessageMutation,
    WritePublicMessageMutationVariables
>;
export const WritePrivateMessageDocument = gql`
    mutation WritePrivateMessage(
        $roomId: String!
        $visibleTo: [String!]!
        $text: String!
        $textColor: String
        $characterStateId: String
        $customName: String
        $gameType: String
    ) {
        result: writePrivateMessage(
            roomId: $roomId
            visibleTo: $visibleTo
            text: $text
            textColor: $textColor
            characterStateId: $characterStateId
            customName: $customName
            gameType: $gameType
        ) {
            ... on RoomPrivateMessage {
                ...RoomPrivateMessage
            }
            ... on WriteRoomPrivateMessageFailureResult {
                failureType
            }
        }
    }
    ${RoomPrivateMessageFragmentDoc}
`;
export type WritePrivateMessageMutationFn = Apollo.MutationFunction<
    WritePrivateMessageMutation,
    WritePrivateMessageMutationVariables
>;

/**
 * __useWritePrivateMessageMutation__
 *
 * To run a mutation, you first call `useWritePrivateMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useWritePrivateMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [writePrivateMessageMutation, { data, loading, error }] = useWritePrivateMessageMutation({
 *   variables: {
 *      roomId: // value for 'roomId'
 *      visibleTo: // value for 'visibleTo'
 *      text: // value for 'text'
 *      textColor: // value for 'textColor'
 *      characterStateId: // value for 'characterStateId'
 *      customName: // value for 'customName'
 *      gameType: // value for 'gameType'
 *   },
 * });
 */
export function useWritePrivateMessageMutation(
    baseOptions?: Apollo.MutationHookOptions<
        WritePrivateMessageMutation,
        WritePrivateMessageMutationVariables
    >
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<WritePrivateMessageMutation, WritePrivateMessageMutationVariables>(
        WritePrivateMessageDocument,
        options
    );
}
export type WritePrivateMessageMutationHookResult = ReturnType<
    typeof useWritePrivateMessageMutation
>;
export type WritePrivateMessageMutationResult = Apollo.MutationResult<WritePrivateMessageMutation>;
export type WritePrivateMessageMutationOptions = Apollo.BaseMutationOptions<
    WritePrivateMessageMutation,
    WritePrivateMessageMutationVariables
>;
export const WriteRoomSoundEffectDocument = gql`
    mutation WriteRoomSoundEffect($roomId: String!, $file: FilePathInput!, $volume: Float!) {
        result: writeRoomSoundEffect(roomId: $roomId, file: $file, volume: $volume) {
            ... on RoomSoundEffect {
                ...RoomSoundEffect
            }
            ... on WriteRoomSoundEffectFailureResult {
                failureType
            }
        }
    }
    ${RoomSoundEffectFragmentDoc}
`;
export type WriteRoomSoundEffectMutationFn = Apollo.MutationFunction<
    WriteRoomSoundEffectMutation,
    WriteRoomSoundEffectMutationVariables
>;

/**
 * __useWriteRoomSoundEffectMutation__
 *
 * To run a mutation, you first call `useWriteRoomSoundEffectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useWriteRoomSoundEffectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [writeRoomSoundEffectMutation, { data, loading, error }] = useWriteRoomSoundEffectMutation({
 *   variables: {
 *      roomId: // value for 'roomId'
 *      file: // value for 'file'
 *      volume: // value for 'volume'
 *   },
 * });
 */
export function useWriteRoomSoundEffectMutation(
    baseOptions?: Apollo.MutationHookOptions<
        WriteRoomSoundEffectMutation,
        WriteRoomSoundEffectMutationVariables
    >
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<WriteRoomSoundEffectMutation, WriteRoomSoundEffectMutationVariables>(
        WriteRoomSoundEffectDocument,
        options
    );
}
export type WriteRoomSoundEffectMutationHookResult = ReturnType<
    typeof useWriteRoomSoundEffectMutation
>;
export type WriteRoomSoundEffectMutationResult =
    Apollo.MutationResult<WriteRoomSoundEffectMutation>;
export type WriteRoomSoundEffectMutationOptions = Apollo.BaseMutationOptions<
    WriteRoomSoundEffectMutation,
    WriteRoomSoundEffectMutationVariables
>;
export const EditMessageDocument = gql`
    mutation EditMessage($roomId: String!, $messageId: String!, $text: String!) {
        result: editMessage(roomId: $roomId, messageId: $messageId, text: $text) {
            failureType
        }
    }
`;
export type EditMessageMutationFn = Apollo.MutationFunction<
    EditMessageMutation,
    EditMessageMutationVariables
>;

/**
 * __useEditMessageMutation__
 *
 * To run a mutation, you first call `useEditMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editMessageMutation, { data, loading, error }] = useEditMessageMutation({
 *   variables: {
 *      roomId: // value for 'roomId'
 *      messageId: // value for 'messageId'
 *      text: // value for 'text'
 *   },
 * });
 */
export function useEditMessageMutation(
    baseOptions?: Apollo.MutationHookOptions<EditMessageMutation, EditMessageMutationVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<EditMessageMutation, EditMessageMutationVariables>(
        EditMessageDocument,
        options
    );
}
export type EditMessageMutationHookResult = ReturnType<typeof useEditMessageMutation>;
export type EditMessageMutationResult = Apollo.MutationResult<EditMessageMutation>;
export type EditMessageMutationOptions = Apollo.BaseMutationOptions<
    EditMessageMutation,
    EditMessageMutationVariables
>;
export const DeleteMessageDocument = gql`
    mutation DeleteMessage($roomId: String!, $messageId: String!) {
        result: deleteMessage(roomId: $roomId, messageId: $messageId) {
            failureType
        }
    }
`;
export type DeleteMessageMutationFn = Apollo.MutationFunction<
    DeleteMessageMutation,
    DeleteMessageMutationVariables
>;

/**
 * __useDeleteMessageMutation__
 *
 * To run a mutation, you first call `useDeleteMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteMessageMutation, { data, loading, error }] = useDeleteMessageMutation({
 *   variables: {
 *      roomId: // value for 'roomId'
 *      messageId: // value for 'messageId'
 *   },
 * });
 */
export function useDeleteMessageMutation(
    baseOptions?: Apollo.MutationHookOptions<DeleteMessageMutation, DeleteMessageMutationVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<DeleteMessageMutation, DeleteMessageMutationVariables>(
        DeleteMessageDocument,
        options
    );
}
export type DeleteMessageMutationHookResult = ReturnType<typeof useDeleteMessageMutation>;
export type DeleteMessageMutationResult = Apollo.MutationResult<DeleteMessageMutation>;
export type DeleteMessageMutationOptions = Apollo.BaseMutationOptions<
    DeleteMessageMutation,
    DeleteMessageMutationVariables
>;
export const MakeMessageNotSecretDocument = gql`
    mutation MakeMessageNotSecret($roomId: String!, $messageId: String!) {
        result: makeMessageNotSecret(roomId: $roomId, messageId: $messageId) {
            failureType
        }
    }
`;
export type MakeMessageNotSecretMutationFn = Apollo.MutationFunction<
    MakeMessageNotSecretMutation,
    MakeMessageNotSecretMutationVariables
>;

/**
 * __useMakeMessageNotSecretMutation__
 *
 * To run a mutation, you first call `useMakeMessageNotSecretMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMakeMessageNotSecretMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [makeMessageNotSecretMutation, { data, loading, error }] = useMakeMessageNotSecretMutation({
 *   variables: {
 *      roomId: // value for 'roomId'
 *      messageId: // value for 'messageId'
 *   },
 * });
 */
export function useMakeMessageNotSecretMutation(
    baseOptions?: Apollo.MutationHookOptions<
        MakeMessageNotSecretMutation,
        MakeMessageNotSecretMutationVariables
    >
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<MakeMessageNotSecretMutation, MakeMessageNotSecretMutationVariables>(
        MakeMessageNotSecretDocument,
        options
    );
}
export type MakeMessageNotSecretMutationHookResult = ReturnType<
    typeof useMakeMessageNotSecretMutation
>;
export type MakeMessageNotSecretMutationResult =
    Apollo.MutationResult<MakeMessageNotSecretMutation>;
export type MakeMessageNotSecretMutationOptions = Apollo.BaseMutationOptions<
    MakeMessageNotSecretMutation,
    MakeMessageNotSecretMutationVariables
>;
export const UpdateWritingMessageStatusDocument = gql`
    mutation UpdateWritingMessageStatus(
        $roomId: String!
        $newStatus: WritingMessageStatusInputType!
    ) {
        result: updateWritingMessageStatus(roomId: $roomId, newStatus: $newStatus)
    }
`;
export type UpdateWritingMessageStatusMutationFn = Apollo.MutationFunction<
    UpdateWritingMessageStatusMutation,
    UpdateWritingMessageStatusMutationVariables
>;

/**
 * __useUpdateWritingMessageStatusMutation__
 *
 * To run a mutation, you first call `useUpdateWritingMessageStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWritingMessageStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWritingMessageStatusMutation, { data, loading, error }] = useUpdateWritingMessageStatusMutation({
 *   variables: {
 *      roomId: // value for 'roomId'
 *      newStatus: // value for 'newStatus'
 *   },
 * });
 */
export function useUpdateWritingMessageStatusMutation(
    baseOptions?: Apollo.MutationHookOptions<
        UpdateWritingMessageStatusMutation,
        UpdateWritingMessageStatusMutationVariables
    >
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<
        UpdateWritingMessageStatusMutation,
        UpdateWritingMessageStatusMutationVariables
    >(UpdateWritingMessageStatusDocument, options);
}
export type UpdateWritingMessageStatusMutationHookResult = ReturnType<
    typeof useUpdateWritingMessageStatusMutation
>;
export type UpdateWritingMessageStatusMutationResult =
    Apollo.MutationResult<UpdateWritingMessageStatusMutation>;
export type UpdateWritingMessageStatusMutationOptions = Apollo.BaseMutationOptions<
    UpdateWritingMessageStatusMutation,
    UpdateWritingMessageStatusMutationVariables
>;
export const RoomEventDocument = gql`
    subscription RoomEvent($id: String!) {
        roomEvent(id: $id) {
            roomOperation {
                ...RoomOperation
            }
            deleteRoomOperation {
                deletedBy
            }
            roomMessageEvent {
                ...RoomMessageEvent
            }
            roomConnectionEvent {
                userUid
                isConnected
                updatedAt
            }
            writingMessageStatus {
                userUid
                status
            }
        }
    }
    ${RoomOperationFragmentDoc}
    ${RoomMessageEventFragmentDoc}
`;

/**
 * __useRoomEventSubscription__
 *
 * To run a query within a React component, call `useRoomEventSubscription` and pass it any options that fit your needs.
 * When your component renders, `useRoomEventSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRoomEventSubscription({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRoomEventSubscription(
    baseOptions: Apollo.SubscriptionHookOptions<
        RoomEventSubscription,
        RoomEventSubscriptionVariables
    >
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useSubscription<RoomEventSubscription, RoomEventSubscriptionVariables>(
        RoomEventDocument,
        options
    );
}
export type RoomEventSubscriptionHookResult = ReturnType<typeof useRoomEventSubscription>;
export type RoomEventSubscriptionResult = Apollo.SubscriptionResult<RoomEventSubscription>;
export const PongDocument = gql`
    subscription Pong {
        pong {
            createdBy
            value
        }
    }
`;

/**
 * __usePongSubscription__
 *
 * To run a query within a React component, call `usePongSubscription` and pass it any options that fit your needs.
 * When your component renders, `usePongSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePongSubscription({
 *   variables: {
 *   },
 * });
 */
export function usePongSubscription(
    baseOptions?: Apollo.SubscriptionHookOptions<PongSubscription, PongSubscriptionVariables>
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useSubscription<PongSubscription, PongSubscriptionVariables>(
        PongDocument,
        options
    );
}
export type PongSubscriptionHookResult = ReturnType<typeof usePongSubscription>;
export type PongSubscriptionResult = Apollo.SubscriptionResult<PongSubscription>;
