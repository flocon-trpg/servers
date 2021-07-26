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
    NotEntry = 'NotEntry',
    NotFound = 'NotFound',
    NotParticipant = 'NotParticipant',
    NotSignIn = 'NotSignIn',
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
    NotEntry = 'NotEntry',
    NotSignIn = 'NotSignIn',
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
    NotEntry = 'NotEntry',
    NotParticipant = 'NotParticipant',
    NotSignIn = 'NotSignIn',
    NotYourMessage = 'NotYourMessage',
    RoomNotFound = 'RoomNotFound',
}

export type DeleteMessageResult = {
    __typename?: 'DeleteMessageResult';
    failureType?: Maybe<DeleteMessageFailureType>;
};

export enum DeleteRoomFailureType {
    NotCreatedByYou = 'NotCreatedByYou',
    NotEntry = 'NotEntry',
    NotFound = 'NotFound',
    NotSignIn = 'NotSignIn',
}

export type DeleteRoomOperation = {
    __typename?: 'DeleteRoomOperation';
    deletedBy: Scalars['String'];
};

export type DeleteRoomResult = {
    __typename?: 'DeleteRoomResult';
    failureType?: Maybe<DeleteRoomFailureType>;
};

export enum EditMessageFailureType {
    MessageDeleted = 'MessageDeleted',
    MessageNotFound = 'MessageNotFound',
    NotEntry = 'NotEntry',
    NotParticipant = 'NotParticipant',
    NotSignIn = 'NotSignIn',
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
}

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
    NotEntry = 'NotEntry',
    NotParticipant = 'NotParticipant',
    NotSignIn = 'NotSignIn',
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
    NotEntry = 'NotEntry',
    NotFound = 'NotFound',
    NotSignIn = 'NotSignIn',
}

export type GetRoomLogFailureResult = {
    __typename?: 'GetRoomLogFailureResult';
    failureType: GetRoomLogFailureType;
};

export enum GetRoomLogFailureType {
    NotAuthorized = 'NotAuthorized',
    NotEntry = 'NotEntry',
    NotParticipant = 'NotParticipant',
    NotSignIn = 'NotSignIn',
    RoomNotFound = 'RoomNotFound',
    UnknownError = 'UnknownError',
}

export type GetRoomLogResult = GetRoomLogFailureResult | RoomMessages;

export type GetRoomMessagesFailureResult = {
    __typename?: 'GetRoomMessagesFailureResult';
    failureType: GetRoomMessagesFailureType;
};

export enum GetRoomMessagesFailureType {
    NotEntry = 'NotEntry',
    NotParticipant = 'NotParticipant',
    NotSignIn = 'NotSignIn',
    RoomNotFound = 'RoomNotFound',
}

export type GetRoomMessagesResult = GetRoomMessagesFailureResult | RoomMessages;

export type GetRoomResult = GetJoinedRoomResult | GetNonJoinedRoomResult | GetRoomFailureResult;

export type GetRoomsListFailureResult = {
    __typename?: 'GetRoomsListFailureResult';
    failureType: GetRoomsListFailureType;
};

export enum GetRoomsListFailureType {
    NotEntry = 'NotEntry',
    NotSignIn = 'NotSignIn',
}

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
    NotEntry = 'NotEntry',
    NotFound = 'NotFound',
    NotSignIn = 'NotSignIn',
    TransformError = 'TransformError',
    WrongPhrase = 'WrongPhrase',
}

export type JoinRoomResult = JoinRoomFailureResult | JoinRoomSuccessResult;

export type JoinRoomSuccessResult = {
    __typename?: 'JoinRoomSuccessResult';
    operation?: Maybe<RoomOperation>;
};

export enum LeaveRoomFailureType {
    NotEntry = 'NotEntry',
    NotFound = 'NotFound',
    NotSignIn = 'NotSignIn',
}

export type LeaveRoomResult = {
    __typename?: 'LeaveRoomResult';
    failureType?: Maybe<LeaveRoomFailureType>;
};

export type ListAvailableGameSystemsResult = {
    __typename?: 'ListAvailableGameSystemsResult';
    value: Array<AvailableGameSystem>;
};

export enum MakeMessageNotSecretFailureType {
    MessageNotFound = 'MessageNotFound',
    NotEntry = 'NotEntry',
    NotParticipant = 'NotParticipant',
    NotSecret = 'NotSecret',
    NotSignIn = 'NotSignIn',
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
    createRoom: CreateRoomResult;
    deleteMessage: DeleteMessageResult;
    deleteRoom: DeleteRoomResult;
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
    writePrivateMessage: WritePrivateRoomMessageResult;
    writePublicMessage: WritePublicRoomMessageResult;
    writeRoomSoundEffect: WriteRoomSoundEffectResult;
};

export type MutationChangeParticipantNameArgs = {
    newName: Scalars['String'];
    roomId: Scalars['String'];
};

export type MutationCreateRoomArgs = {
    input: CreateRoomInput;
};

export type MutationDeleteMessageArgs = {
    messageId: Scalars['String'];
    roomId: Scalars['String'];
};

export type MutationDeleteRoomArgs = {
    id: Scalars['String'];
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
    NotEntry = 'NotEntry',
    NotFound = 'NotFound',
    NotParticipated = 'NotParticipated',
    NotSignIn = 'NotSignIn',
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
    NotEntry = 'NotEntry',
    NotFound = 'NotFound',
    NotParticipant = 'NotParticipant',
    NotSignIn = 'NotSignIn',
    WrongPhrase = 'WrongPhrase',
}

export type PromoteResult = {
    __typename?: 'PromoteResult';
    failureType?: Maybe<PromoteFailureType>;
};

export type Query = {
    __typename?: 'Query';
    getLog: GetRoomLogResult;
    getMessages: GetRoomMessagesResult;
    getRoom: GetRoomResult;
    getRoomConnections: GetRoomConnectionsResult;
    getRoomsList: GetRoomsListResult;
    getServerInfo: ServerInfo;
    listAvailableGameSystems: ListAvailableGameSystemsResult;
    requiresPhraseToJoinAsPlayer: RequiresPhraseResult;
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
    NotEntry = 'NotEntry',
    NotFound = 'NotFound',
    NotSignIn = 'NotSignIn',
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

export type WritePrivateRoomMessageFailureResult = {
    __typename?: 'WritePrivateRoomMessageFailureResult';
    failureType: WritePrivateRoomMessageFailureType;
};

export enum WritePrivateRoomMessageFailureType {
    NotEntry = 'NotEntry',
    NotParticipant = 'NotParticipant',
    NotSignIn = 'NotSignIn',
    RoomNotFound = 'RoomNotFound',
    VisibleToIsInvalid = 'VisibleToIsInvalid',
}

export type WritePrivateRoomMessageResult =
    | RoomPrivateMessage
    | WritePrivateRoomMessageFailureResult;

export type WritePublicRoomMessageFailureResult = {
    __typename?: 'WritePublicRoomMessageFailureResult';
    failureType: WritePublicRoomMessageFailureType;
};

export enum WritePublicRoomMessageFailureType {
    NotAllowedChannelKey = 'NotAllowedChannelKey',
    NotAuthorized = 'NotAuthorized',
    NotEntry = 'NotEntry',
    NotParticipant = 'NotParticipant',
    NotSignIn = 'NotSignIn',
    RoomNotFound = 'RoomNotFound',
}

export type WritePublicRoomMessageResult = RoomPublicMessage | WritePublicRoomMessageFailureResult;

export type WriteRoomSoundEffectFailureResult = {
    __typename?: 'WriteRoomSoundEffectFailureResult';
    failureType: WriteRoomSoundEffectFailureType;
};

export enum WriteRoomSoundEffectFailureType {
    NotAuthorized = 'NotAuthorized',
    NotEntry = 'NotEntry',
    NotParticipant = 'NotParticipant',
    NotSignIn = 'NotSignIn',
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

export type CharacterValueForMessageFragment = { __typename?: 'CharacterValueForMessage' } & Pick<
    CharacterValueForMessage,
    'stateId' | 'isPrivate' | 'name'
> & {
        image?: Maybe<{ __typename?: 'FilePath' } & FilePathFragment>;
        tachieImage?: Maybe<{ __typename?: 'FilePath' } & FilePathFragment>;
    };

type CreateRoomResult_CreateRoomFailureResult_Fragment = {
    __typename?: 'CreateRoomFailureResult';
} & Pick<CreateRoomFailureResult, 'failureType'>;

type CreateRoomResult_CreateRoomSuccessResult_Fragment = {
    __typename?: 'CreateRoomSuccessResult';
} & Pick<CreateRoomSuccessResult, 'id'> & {
        room: { __typename?: 'RoomGetState' } & RoomGetStateFragment;
    };

export type CreateRoomResultFragment =
    | CreateRoomResult_CreateRoomFailureResult_Fragment
    | CreateRoomResult_CreateRoomSuccessResult_Fragment;

export type FilePathFragment = { __typename?: 'FilePath' } & Pick<FilePath, 'sourceType' | 'path'>;

export type GetNonJoinedRoomResultFragment = { __typename?: 'GetNonJoinedRoomResult' } & {
    roomAsListItem: { __typename?: 'RoomAsListItem' } & RoomAsListItemFragment;
};

type GetRoomListResult_GetRoomsListFailureResult_Fragment = {
    __typename?: 'GetRoomsListFailureResult';
} & Pick<GetRoomsListFailureResult, 'failureType'>;

type GetRoomListResult_GetRoomsListSuccessResult_Fragment = {
    __typename?: 'GetRoomsListSuccessResult';
} & { rooms: Array<{ __typename?: 'RoomAsListItem' } & RoomAsListItemFragment> };

export type GetRoomListResultFragment =
    | GetRoomListResult_GetRoomsListFailureResult_Fragment
    | GetRoomListResult_GetRoomsListSuccessResult_Fragment;

type GetRoomResult_GetJoinedRoomResult_Fragment = { __typename?: 'GetJoinedRoomResult' } & Pick<
    GetJoinedRoomResult,
    'role'
> & { room: { __typename?: 'RoomGetState' } & RoomGetStateFragment };

type GetRoomResult_GetNonJoinedRoomResult_Fragment = {
    __typename?: 'GetNonJoinedRoomResult';
} & GetNonJoinedRoomResultFragment;

type GetRoomResult_GetRoomFailureResult_Fragment = { __typename?: 'GetRoomFailureResult' } & Pick<
    GetRoomFailureResult,
    'failureType'
>;

export type GetRoomResultFragment =
    | GetRoomResult_GetJoinedRoomResult_Fragment
    | GetRoomResult_GetNonJoinedRoomResult_Fragment
    | GetRoomResult_GetRoomFailureResult_Fragment;

type JoinRoomResult_JoinRoomFailureResult_Fragment = {
    __typename?: 'JoinRoomFailureResult';
} & Pick<JoinRoomFailureResult, 'failureType'>;

type JoinRoomResult_JoinRoomSuccessResult_Fragment = { __typename?: 'JoinRoomSuccessResult' } & {
    operation?: Maybe<{ __typename?: 'RoomOperation' } & RoomOperationFragment>;
};

export type JoinRoomResultFragment =
    | JoinRoomResult_JoinRoomFailureResult_Fragment
    | JoinRoomResult_JoinRoomSuccessResult_Fragment;

export type PieceValueLogFragment = { __typename?: 'PieceValueLog' } & Pick<
    PieceValueLog,
    | 'messageId'
    | 'characterCreatedBy'
    | 'characterId'
    | 'stateId'
    | 'createdAt'
    | 'logType'
    | 'valueJson'
>;

export type RoomAsListItemFragment = { __typename?: 'RoomAsListItem' } & Pick<
    RoomAsListItem,
    'id' | 'name' | 'createdBy' | 'requiresPhraseToJoinAsPlayer' | 'requiresPhraseToJoinAsSpectator'
>;

export type RoomGetStateFragment = { __typename?: 'RoomGetState' } & Pick<
    RoomGetState,
    'revision' | 'createdBy' | 'stateJson'
>;

export type RoomOperationFragment = { __typename?: 'RoomOperation' } & Pick<
    RoomOperation,
    'revisionTo' | 'valueJson'
> & {
        operatedBy?: Maybe<
            { __typename?: 'OperatedBy' } & Pick<OperatedBy, 'userUid' | 'clientId'>
        >;
    };

export type RoomPublicChannelFragment = { __typename?: 'RoomPublicChannel' } & Pick<
    RoomPublicChannel,
    'key' | 'name'
>;

export type RoomPublicMessageFragment = { __typename?: 'RoomPublicMessage' } & Pick<
    RoomPublicMessage,
    | 'messageId'
    | 'channelKey'
    | 'initText'
    | 'initTextSource'
    | 'textColor'
    | 'altTextToSecret'
    | 'isSecret'
    | 'createdBy'
    | 'customName'
    | 'createdAt'
    | 'updatedAt'
> & {
        updatedText?: Maybe<
            { __typename?: 'UpdatedText' } & Pick<UpdatedText, 'currentText' | 'updatedAt'>
        >;
        commandResult?: Maybe<
            { __typename?: 'CommandResult' } & Pick<CommandResult, 'text' | 'isSuccess'>
        >;
        character?: Maybe<
            { __typename?: 'CharacterValueForMessage' } & CharacterValueForMessageFragment
        >;
    };

export type RoomPrivateMessageFragment = { __typename?: 'RoomPrivateMessage' } & Pick<
    RoomPrivateMessage,
    | 'messageId'
    | 'visibleTo'
    | 'initText'
    | 'initTextSource'
    | 'textColor'
    | 'altTextToSecret'
    | 'isSecret'
    | 'createdBy'
    | 'customName'
    | 'createdAt'
    | 'updatedAt'
> & {
        updatedText?: Maybe<
            { __typename?: 'UpdatedText' } & Pick<UpdatedText, 'currentText' | 'updatedAt'>
        >;
        commandResult?: Maybe<
            { __typename?: 'CommandResult' } & Pick<CommandResult, 'text' | 'isSuccess'>
        >;
        character?: Maybe<
            { __typename?: 'CharacterValueForMessage' } & CharacterValueForMessageFragment
        >;
    };

export type RoomSoundEffectFragment = { __typename?: 'RoomSoundEffect' } & Pick<
    RoomSoundEffect,
    'messageId' | 'createdBy' | 'createdAt' | 'volume'
> & { file: { __typename?: 'FilePath' } & FilePathFragment };

type RoomMessageEvent_PieceValueLog_Fragment = {
    __typename?: 'PieceValueLog';
} & PieceValueLogFragment;

type RoomMessageEvent_RoomPrivateMessage_Fragment = {
    __typename?: 'RoomPrivateMessage';
} & RoomPrivateMessageFragment;

type RoomMessageEvent_RoomPrivateMessageUpdate_Fragment = {
    __typename?: 'RoomPrivateMessageUpdate';
} & Pick<
    RoomPrivateMessageUpdate,
    'messageId' | 'initText' | 'initTextSource' | 'altTextToSecret' | 'isSecret' | 'updatedAt'
> & {
        updatedText?: Maybe<
            { __typename?: 'UpdatedText' } & Pick<UpdatedText, 'currentText' | 'updatedAt'>
        >;
        commandResult?: Maybe<
            { __typename?: 'CommandResult' } & Pick<CommandResult, 'text' | 'isSuccess'>
        >;
    };

type RoomMessageEvent_RoomPublicChannel_Fragment = {
    __typename?: 'RoomPublicChannel';
} & RoomPublicChannelFragment;

type RoomMessageEvent_RoomPublicChannelUpdate_Fragment = {
    __typename?: 'RoomPublicChannelUpdate';
} & Pick<RoomPublicChannelUpdate, 'key' | 'name'>;

type RoomMessageEvent_RoomPublicMessage_Fragment = {
    __typename?: 'RoomPublicMessage';
} & RoomPublicMessageFragment;

type RoomMessageEvent_RoomPublicMessageUpdate_Fragment = {
    __typename?: 'RoomPublicMessageUpdate';
} & Pick<
    RoomPublicMessageUpdate,
    'messageId' | 'initText' | 'initTextSource' | 'altTextToSecret' | 'isSecret' | 'updatedAt'
> & {
        updatedText?: Maybe<
            { __typename?: 'UpdatedText' } & Pick<UpdatedText, 'currentText' | 'updatedAt'>
        >;
        commandResult?: Maybe<
            { __typename?: 'CommandResult' } & Pick<CommandResult, 'text' | 'isSuccess'>
        >;
    };

type RoomMessageEvent_RoomSoundEffect_Fragment = {
    __typename?: 'RoomSoundEffect';
} & RoomSoundEffectFragment;

export type RoomMessageEventFragment =
    | RoomMessageEvent_PieceValueLog_Fragment
    | RoomMessageEvent_RoomPrivateMessage_Fragment
    | RoomMessageEvent_RoomPrivateMessageUpdate_Fragment
    | RoomMessageEvent_RoomPublicChannel_Fragment
    | RoomMessageEvent_RoomPublicChannelUpdate_Fragment
    | RoomMessageEvent_RoomPublicMessage_Fragment
    | RoomMessageEvent_RoomPublicMessageUpdate_Fragment
    | RoomMessageEvent_RoomSoundEffect_Fragment;

export type SemVerFragment = { __typename?: 'SemVer' } & Pick<
    SemVer,
    'major' | 'minor' | 'patch'
> & { prerelease?: Maybe<{ __typename?: 'Prerelease' } & Pick<Prerelease, 'type' | 'version'>> };

export type GetRoomQueryVariables = Exact<{
    id: Scalars['String'];
}>;

export type GetRoomQuery = { __typename?: 'Query' } & {
    result:
        | ({ __typename?: 'GetJoinedRoomResult' } & Pick<GetJoinedRoomResult, 'role'> & {
                  room: { __typename?: 'RoomGetState' } & RoomGetStateFragment;
              })
        | ({ __typename?: 'GetNonJoinedRoomResult' } & {
              roomAsListItem: { __typename?: 'RoomAsListItem' } & RoomAsListItemFragment;
          })
        | ({ __typename?: 'GetRoomFailureResult' } & Pick<GetRoomFailureResult, 'failureType'>);
};

export type GetRoomsListQueryVariables = Exact<{ [key: string]: never }>;

export type GetRoomsListQuery = { __typename?: 'Query' } & {
    result:
        | ({ __typename?: 'GetRoomsListFailureResult' } & Pick<
              GetRoomsListFailureResult,
              'failureType'
          >)
        | ({ __typename?: 'GetRoomsListSuccessResult' } & {
              rooms: Array<{ __typename?: 'RoomAsListItem' } & RoomAsListItemFragment>;
          });
};

export type GetMessagesQueryVariables = Exact<{
    roomId: Scalars['String'];
}>;

export type GetMessagesQuery = { __typename?: 'Query' } & {
    result:
        | ({ __typename?: 'GetRoomMessagesFailureResult' } & Pick<
              GetRoomMessagesFailureResult,
              'failureType'
          >)
        | ({ __typename?: 'RoomMessages' } & {
              publicMessages: Array<
                  { __typename?: 'RoomPublicMessage' } & RoomPublicMessageFragment
              >;
              privateMessages: Array<
                  { __typename?: 'RoomPrivateMessage' } & RoomPrivateMessageFragment
              >;
              pieceValueLogs: Array<{ __typename?: 'PieceValueLog' } & PieceValueLogFragment>;
              publicChannels: Array<
                  { __typename?: 'RoomPublicChannel' } & RoomPublicChannelFragment
              >;
              soundEffects: Array<{ __typename?: 'RoomSoundEffect' } & RoomSoundEffectFragment>;
          });
};

export type GetLogQueryVariables = Exact<{
    roomId: Scalars['String'];
}>;

export type GetLogQuery = { __typename?: 'Query' } & {
    result:
        | ({ __typename?: 'GetRoomLogFailureResult' } & Pick<
              GetRoomLogFailureResult,
              'failureType'
          >)
        | ({ __typename?: 'RoomMessages' } & {
              publicMessages: Array<
                  { __typename?: 'RoomPublicMessage' } & RoomPublicMessageFragment
              >;
              privateMessages: Array<
                  { __typename?: 'RoomPrivateMessage' } & RoomPrivateMessageFragment
              >;
              pieceValueLogs: Array<{ __typename?: 'PieceValueLog' } & PieceValueLogFragment>;
              publicChannels: Array<
                  { __typename?: 'RoomPublicChannel' } & RoomPublicChannelFragment
              >;
              soundEffects: Array<{ __typename?: 'RoomSoundEffect' } & RoomSoundEffectFragment>;
          });
};

export type GetRoomConnectionsQueryVariables = Exact<{
    roomId: Scalars['String'];
}>;

export type GetRoomConnectionsQuery = { __typename?: 'Query' } & {
    result:
        | ({ __typename?: 'GetRoomConnectionsFailureResult' } & Pick<
              GetRoomConnectionsFailureResult,
              'failureType'
          >)
        | ({ __typename?: 'GetRoomConnectionsSuccessResult' } & Pick<
              GetRoomConnectionsSuccessResult,
              'fetchedAt' | 'connectedUserUids'
          >);
};

export type GetServerInfoQueryVariables = Exact<{ [key: string]: never }>;

export type GetServerInfoQuery = { __typename?: 'Query' } & {
    result: { __typename?: 'ServerInfo' } & { version: { __typename?: 'SemVer' } & SemVerFragment };
};

export type ListAvailableGameSystemsQueryVariables = Exact<{ [key: string]: never }>;

export type ListAvailableGameSystemsQuery = { __typename?: 'Query' } & {
    result: { __typename?: 'ListAvailableGameSystemsResult' } & {
        value: Array<
            { __typename?: 'AvailableGameSystem' } & Pick<
                AvailableGameSystem,
                'id' | 'name' | 'sortKey'
            >
        >;
    };
};

export type RequiresPhraseToJoinAsPlayerQueryVariables = Exact<{
    roomId: Scalars['String'];
}>;

export type RequiresPhraseToJoinAsPlayerQuery = { __typename?: 'Query' } & {
    result:
        | ({ __typename?: 'RequiresPhraseFailureResult' } & Pick<
              RequiresPhraseFailureResult,
              'failureType'
          >)
        | ({ __typename?: 'RequiresPhraseSuccessResult' } & Pick<
              RequiresPhraseSuccessResult,
              'value'
          >);
};

export type ChangeParticipantNameMutationVariables = Exact<{
    roomId: Scalars['String'];
    newName: Scalars['String'];
}>;

export type ChangeParticipantNameMutation = { __typename?: 'Mutation' } & {
    result: { __typename?: 'ChangeParticipantNameResult' } & Pick<
        ChangeParticipantNameResult,
        'failureType'
    >;
};

export type CreateRoomMutationVariables = Exact<{
    input: CreateRoomInput;
}>;

export type CreateRoomMutation = { __typename?: 'Mutation' } & {
    result:
        | ({ __typename?: 'CreateRoomFailureResult' } & Pick<
              CreateRoomFailureResult,
              'failureType'
          >)
        | ({
              __typename?: 'CreateRoomSuccessResult';
          } & CreateRoomResult_CreateRoomSuccessResult_Fragment);
};

export type DeleteRoomMutationVariables = Exact<{
    id: Scalars['String'];
}>;

export type DeleteRoomMutation = { __typename?: 'Mutation' } & {
    result: { __typename?: 'DeleteRoomResult' } & Pick<DeleteRoomResult, 'failureType'>;
};

export type JoinRoomAsPlayerMutationVariables = Exact<{
    id: Scalars['String'];
    name: Scalars['String'];
    phrase?: Maybe<Scalars['String']>;
}>;

export type JoinRoomAsPlayerMutation = { __typename?: 'Mutation' } & {
    result:
        | ({ __typename?: 'JoinRoomFailureResult' } & JoinRoomResult_JoinRoomFailureResult_Fragment)
        | ({
              __typename?: 'JoinRoomSuccessResult';
          } & JoinRoomResult_JoinRoomSuccessResult_Fragment);
};

export type JoinRoomAsSpectatorMutationVariables = Exact<{
    id: Scalars['String'];
    name: Scalars['String'];
    phrase?: Maybe<Scalars['String']>;
}>;

export type JoinRoomAsSpectatorMutation = { __typename?: 'Mutation' } & {
    result:
        | ({ __typename?: 'JoinRoomFailureResult' } & JoinRoomResult_JoinRoomFailureResult_Fragment)
        | ({
              __typename?: 'JoinRoomSuccessResult';
          } & JoinRoomResult_JoinRoomSuccessResult_Fragment);
};

export type EntryToServerMutationVariables = Exact<{
    phrase: Scalars['String'];
}>;

export type EntryToServerMutation = { __typename?: 'Mutation' } & {
    result: { __typename?: 'EntryToServerResult' } & Pick<EntryToServerResult, 'type'>;
};

export type LeaveRoomMutationVariables = Exact<{
    id: Scalars['String'];
}>;

export type LeaveRoomMutation = { __typename?: 'Mutation' } & {
    result: { __typename?: 'LeaveRoomResult' } & Pick<LeaveRoomResult, 'failureType'>;
};

export type OperateMutationVariables = Exact<{
    id: Scalars['String'];
    revisionFrom: Scalars['Int'];
    operation: RoomOperationInput;
    requestId: Scalars['String'];
}>;

export type OperateMutation = { __typename?: 'Mutation' } & {
    result:
        | ({ __typename?: 'OperateRoomFailureResult' } & Pick<
              OperateRoomFailureResult,
              'failureType'
          >)
        | ({ __typename?: 'OperateRoomIdResult' } & Pick<OperateRoomIdResult, 'requestId'>)
        | ({ __typename?: 'OperateRoomNonJoinedResult' } & {
              roomAsListItem: { __typename?: 'RoomAsListItem' } & RoomAsListItemFragment;
          })
        | ({ __typename?: 'OperateRoomSuccessResult' } & {
              operation: { __typename?: 'RoomOperation' } & RoomOperationFragment;
          });
};

export type PingMutationVariables = Exact<{
    value: Scalars['Float'];
}>;

export type PingMutation = { __typename?: 'Mutation' } & {
    result: { __typename?: 'Pong' } & Pick<Pong, 'createdBy' | 'value'>;
};

export type PromoteToPlayerMutationVariables = Exact<{
    roomId: Scalars['String'];
    phrase?: Maybe<Scalars['String']>;
}>;

export type PromoteToPlayerMutation = { __typename?: 'Mutation' } & {
    result: { __typename?: 'PromoteResult' } & Pick<PromoteResult, 'failureType'>;
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

export type WritePublicMessageMutation = { __typename?: 'Mutation' } & {
    result:
        | ({ __typename?: 'RoomPublicMessage' } & RoomPublicMessageFragment)
        | ({ __typename?: 'WritePublicRoomMessageFailureResult' } & Pick<
              WritePublicRoomMessageFailureResult,
              'failureType'
          >);
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

export type WritePrivateMessageMutation = { __typename?: 'Mutation' } & {
    result:
        | ({ __typename?: 'RoomPrivateMessage' } & RoomPrivateMessageFragment)
        | ({ __typename?: 'WritePrivateRoomMessageFailureResult' } & Pick<
              WritePrivateRoomMessageFailureResult,
              'failureType'
          >);
};

export type WriteRoomSoundEffectMutationVariables = Exact<{
    roomId: Scalars['String'];
    file: FilePathInput;
    volume: Scalars['Float'];
}>;

export type WriteRoomSoundEffectMutation = { __typename?: 'Mutation' } & {
    result:
        | ({ __typename?: 'RoomSoundEffect' } & RoomSoundEffectFragment)
        | ({ __typename?: 'WriteRoomSoundEffectFailureResult' } & Pick<
              WriteRoomSoundEffectFailureResult,
              'failureType'
          >);
};

export type EditMessageMutationVariables = Exact<{
    roomId: Scalars['String'];
    messageId: Scalars['String'];
    text: Scalars['String'];
}>;

export type EditMessageMutation = { __typename?: 'Mutation' } & {
    result: { __typename?: 'EditMessageResult' } & Pick<EditMessageResult, 'failureType'>;
};

export type DeleteMessageMutationVariables = Exact<{
    roomId: Scalars['String'];
    messageId: Scalars['String'];
}>;

export type DeleteMessageMutation = { __typename?: 'Mutation' } & {
    result: { __typename?: 'DeleteMessageResult' } & Pick<DeleteMessageResult, 'failureType'>;
};

export type MakeMessageNotSecretMutationVariables = Exact<{
    roomId: Scalars['String'];
    messageId: Scalars['String'];
}>;

export type MakeMessageNotSecretMutation = { __typename?: 'Mutation' } & {
    result: { __typename?: 'MakeMessageNotSecretResult' } & Pick<
        MakeMessageNotSecretResult,
        'failureType'
    >;
};

export type UpdateWritingMessageStatusMutationVariables = Exact<{
    roomId: Scalars['String'];
    newStatus: WritingMessageStatusInputType;
}>;

export type UpdateWritingMessageStatusMutation = { __typename?: 'Mutation' } & {
    result: Mutation['updateWritingMessageStatus'];
};

export type RoomEventSubscriptionVariables = Exact<{
    id: Scalars['String'];
}>;

export type RoomEventSubscription = { __typename?: 'Subscription' } & {
    roomEvent?: Maybe<
        { __typename?: 'RoomEvent' } & {
            roomOperation?: Maybe<{ __typename?: 'RoomOperation' } & RoomOperationFragment>;
            deleteRoomOperation?: Maybe<
                { __typename?: 'DeleteRoomOperation' } & Pick<DeleteRoomOperation, 'deletedBy'>
            >;
            roomMessageEvent?: Maybe<
                | ({ __typename?: 'PieceValueLog' } & RoomMessageEvent_PieceValueLog_Fragment)
                | ({
                      __typename?: 'RoomPrivateMessage';
                  } & RoomMessageEvent_RoomPrivateMessage_Fragment)
                | ({
                      __typename?: 'RoomPrivateMessageUpdate';
                  } & RoomMessageEvent_RoomPrivateMessageUpdate_Fragment)
                | ({
                      __typename?: 'RoomPublicChannel';
                  } & RoomMessageEvent_RoomPublicChannel_Fragment)
                | ({
                      __typename?: 'RoomPublicChannelUpdate';
                  } & RoomMessageEvent_RoomPublicChannelUpdate_Fragment)
                | ({
                      __typename?: 'RoomPublicMessage';
                  } & RoomMessageEvent_RoomPublicMessage_Fragment)
                | ({
                      __typename?: 'RoomPublicMessageUpdate';
                  } & RoomMessageEvent_RoomPublicMessageUpdate_Fragment)
                | ({ __typename?: 'RoomSoundEffect' } & RoomMessageEvent_RoomSoundEffect_Fragment)
            >;
            roomConnectionEvent?: Maybe<
                { __typename?: 'RoomConnectionEvent' } & Pick<
                    RoomConnectionEvent,
                    'userUid' | 'isConnected' | 'updatedAt'
                >
            >;
            writingMessageStatus?: Maybe<
                { __typename?: 'WritingMessageStatus' } & Pick<
                    WritingMessageStatus,
                    'userUid' | 'status'
                >
            >;
        }
    >;
};

export type PongSubscriptionVariables = Exact<{ [key: string]: never }>;

export type PongSubscription = { __typename?: 'Subscription' } & {
    pong: { __typename?: 'Pong' } & Pick<Pong, 'createdBy' | 'value'>;
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
export const ListAvailableGameSystemsDocument = gql`
    query ListAvailableGameSystems {
        result: listAvailableGameSystems {
            value {
                id
                name
                sortKey
            }
        }
    }
`;

/**
 * __useListAvailableGameSystemsQuery__
 *
 * To run a query within a React component, call `useListAvailableGameSystemsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListAvailableGameSystemsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListAvailableGameSystemsQuery({
 *   variables: {
 *   },
 * });
 */
export function useListAvailableGameSystemsQuery(
    baseOptions?: Apollo.QueryHookOptions<
        ListAvailableGameSystemsQuery,
        ListAvailableGameSystemsQueryVariables
    >
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useQuery<ListAvailableGameSystemsQuery, ListAvailableGameSystemsQueryVariables>(
        ListAvailableGameSystemsDocument,
        options
    );
}
export function useListAvailableGameSystemsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        ListAvailableGameSystemsQuery,
        ListAvailableGameSystemsQueryVariables
    >
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useLazyQuery<
        ListAvailableGameSystemsQuery,
        ListAvailableGameSystemsQueryVariables
    >(ListAvailableGameSystemsDocument, options);
}
export type ListAvailableGameSystemsQueryHookResult = ReturnType<
    typeof useListAvailableGameSystemsQuery
>;
export type ListAvailableGameSystemsLazyQueryHookResult = ReturnType<
    typeof useListAvailableGameSystemsLazyQuery
>;
export type ListAvailableGameSystemsQueryResult = Apollo.QueryResult<
    ListAvailableGameSystemsQuery,
    ListAvailableGameSystemsQueryVariables
>;
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
            ... on WritePublicRoomMessageFailureResult {
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
            ... on WritePrivateRoomMessageFailureResult {
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
