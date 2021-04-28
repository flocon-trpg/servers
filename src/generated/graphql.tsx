import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
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

export type BoardId = {
  __typename?: 'BoardId';
  createdBy: Scalars['String'];
  stateId: Scalars['String'];
};

export type BoardLocationOperation = {
  __typename?: 'BoardLocationOperation';
  h?: Maybe<ReplaceNumberUpOperation>;
  isPrivate?: Maybe<ReplaceBooleanUpOperation>;
  w?: Maybe<ReplaceNumberUpOperation>;
  x?: Maybe<ReplaceNumberUpOperation>;
  y?: Maybe<ReplaceNumberUpOperation>;
};

export type BoardLocationOperationInput = {
  h?: Maybe<ReplaceNumberUpOperationInput>;
  isPrivate?: Maybe<ReplaceBooleanUpOperationInput>;
  w?: Maybe<ReplaceNumberUpOperationInput>;
  x?: Maybe<ReplaceNumberUpOperationInput>;
  y?: Maybe<ReplaceNumberUpOperationInput>;
};

export type BoardLocationState = {
  __typename?: 'BoardLocationState';
  boardCreatedBy: Scalars['String'];
  boardId: Scalars['String'];
  value: BoardLocationValueState;
};

export type BoardLocationStateInput = {
  boardCreatedBy: Scalars['String'];
  boardId: Scalars['String'];
  value: BoardLocationValueStateInput;
};

export type BoardLocationValueState = {
  __typename?: 'BoardLocationValueState';
  h: Scalars['Float'];
  isPrivate: Scalars['Boolean'];
  w: Scalars['Float'];
  x: Scalars['Float'];
  y: Scalars['Float'];
};

export type BoardLocationValueStateInput = {
  h: Scalars['Float'];
  isPrivate: Scalars['Boolean'];
  w: Scalars['Float'];
  x: Scalars['Float'];
  y: Scalars['Float'];
};

export type BoardLocationsOperation = {
  __typename?: 'BoardLocationsOperation';
  replace: Array<ReplaceBoardLocationOperation>;
  update: Array<UpdateBoardLocationOperation>;
};

export type BoardLocationsOperationInput = {
  replace: Array<ReplaceBoardLocationOperationInput>;
  update: Array<UpdateBoardLocationOperationInput>;
};

export type BoardOperation = {
  __typename?: 'BoardOperation';
  backgroundImage?: Maybe<ReplaceNullableFilePathUpOperation>;
  backgroundImageZoom?: Maybe<ReplaceNumberUpOperation>;
  cellColumnCount?: Maybe<ReplaceNumberUpOperation>;
  cellHeight?: Maybe<ReplaceNumberUpOperation>;
  cellOffsetX?: Maybe<ReplaceNumberUpOperation>;
  cellOffsetY?: Maybe<ReplaceNumberUpOperation>;
  cellRowCount?: Maybe<ReplaceNumberUpOperation>;
  cellWidth?: Maybe<ReplaceNumberUpOperation>;
  name?: Maybe<ReplaceStringUpOperation>;
};

export type BoardOperationInput = {
  backgroundImage?: Maybe<ReplaceNullableFilePathUpOperationInput>;
  backgroundImageZoom?: Maybe<ReplaceNumberUpOperationInput>;
  cellColumnCount?: Maybe<ReplaceNumberUpOperationInput>;
  cellHeight?: Maybe<ReplaceNumberUpOperationInput>;
  cellOffsetX?: Maybe<ReplaceNumberUpOperationInput>;
  cellOffsetY?: Maybe<ReplaceNumberUpOperationInput>;
  cellRowCount?: Maybe<ReplaceNumberUpOperationInput>;
  cellWidth?: Maybe<ReplaceNumberUpOperationInput>;
  name?: Maybe<ReplaceStringUpOperationInput>;
};

export type BoardState = {
  __typename?: 'BoardState';
  createdBy: Scalars['String'];
  id: Scalars['String'];
  value: BoardValueState;
};

export type BoardValueState = {
  __typename?: 'BoardValueState';
  backgroundImage?: Maybe<FilePath>;
  backgroundImageZoom: Scalars['Float'];
  cellColumnCount: Scalars['Float'];
  cellHeight: Scalars['Float'];
  cellOffsetX: Scalars['Float'];
  cellOffsetY: Scalars['Float'];
  cellRowCount: Scalars['Float'];
  cellWidth: Scalars['Float'];
  name: Scalars['String'];
};

export type BoardValueStateInput = {
  backgroundImage?: Maybe<FilePathInput>;
  backgroundImageZoom: Scalars['Float'];
  cellColumnCount: Scalars['Float'];
  cellHeight: Scalars['Float'];
  cellOffsetX: Scalars['Float'];
  cellOffsetY: Scalars['Float'];
  cellRowCount: Scalars['Float'];
  cellWidth: Scalars['Float'];
  name: Scalars['String'];
};

export type BoardsOperation = {
  __typename?: 'BoardsOperation';
  replace: Array<ReplaceBoardOperation>;
  update: Array<UpdateBoardOperation>;
};

export type BoardsOperationInput = {
  replace: Array<ReplaceBoardOperationInput>;
  update: Array<UpdateBoardOperationInput>;
};

export type BoolParamOperation = {
  __typename?: 'BoolParamOperation';
  isValuePrivate?: Maybe<ReplaceBooleanUpOperation>;
  value?: Maybe<ReplaceNullableBooleanUpOperation>;
};

export type BoolParamOperationInput = {
  isValuePrivate?: Maybe<ReplaceBooleanUpOperationInput>;
  value?: Maybe<ReplaceNullableBooleanUpOperationInput>;
};

export type BoolParamState = {
  __typename?: 'BoolParamState';
  key: Scalars['String'];
  value: BoolParamValueState;
};

export type BoolParamStateInput = {
  key: Scalars['String'];
  value: BoolParamValueStateInput;
};

export type BoolParamValueState = {
  __typename?: 'BoolParamValueState';
  isValuePrivate: Scalars['Boolean'];
  value?: Maybe<Scalars['Boolean']>;
};

export type BoolParamValueStateInput = {
  isValuePrivate: Scalars['Boolean'];
  value?: Maybe<Scalars['Boolean']>;
};

export type BoolParamsOperation = {
  __typename?: 'BoolParamsOperation';
  update: Array<UpdateBoolParamOperation>;
};

export type BoolParamsOperationInput = {
  update: Array<UpdateBoolParamOperationInput>;
};

export enum ChangeParticipantNameFailureType {
  NotEntry = 'NotEntry',
  NotFound = 'NotFound',
  NotParticipant = 'NotParticipant',
  NotSignIn = 'NotSignIn'
}

export type ChangeParticipantNameResult = {
  __typename?: 'ChangeParticipantNameResult';
  failureType?: Maybe<ChangeParticipantNameFailureType>;
};

export type CharacterOperation = {
  __typename?: 'CharacterOperation';
  boolParams: BoolParamsOperation;
  image?: Maybe<ReplaceNullableFilePathUpOperation>;
  isPrivate?: Maybe<ReplaceBooleanUpOperation>;
  name?: Maybe<ReplaceStringUpOperation>;
  numMaxParams: NumParamsOperation;
  numParams: NumParamsOperation;
  pieces: PiecesOperation;
  strParams: StrParamsOperation;
  tachieImage?: Maybe<ReplaceNullableFilePathUpOperation>;
  tachieLocations: BoardLocationsOperation;
};

export type CharacterOperationInput = {
  boolParams: BoolParamsOperationInput;
  image?: Maybe<ReplaceNullableFilePathUpOperationInput>;
  isPrivate?: Maybe<ReplaceBooleanUpOperationInput>;
  name?: Maybe<ReplaceStringUpOperationInput>;
  numMaxParams: NumParamsOperationInput;
  numParams: NumParamsOperationInput;
  pieces: PiecesOperationInput;
  strParams: StrParamsOperationInput;
  tachieImage?: Maybe<ReplaceNullableFilePathUpOperationInput>;
  tachieLocations: BoardLocationsOperationInput;
};

export type CharacterState = {
  __typename?: 'CharacterState';
  createdBy: Scalars['String'];
  id: Scalars['String'];
  value: CharacterValueState;
};

export type CharacterValueForMessage = {
  __typename?: 'CharacterValueForMessage';
  image?: Maybe<FilePath>;
  isPrivate: Scalars['Boolean'];
  name: Scalars['String'];
  stateId: Scalars['String'];
  tachieImage?: Maybe<FilePath>;
};

export type CharacterValueState = {
  __typename?: 'CharacterValueState';
  boolParams: Array<BoolParamState>;
  image?: Maybe<FilePath>;
  isPrivate: Scalars['Boolean'];
  name: Scalars['String'];
  numMaxParams: Array<NumParamState>;
  numParams: Array<NumParamState>;
  pieces: Array<PieceState>;
  strParams: Array<StrParamState>;
  tachieImage?: Maybe<FilePath>;
  tachieLocations: Array<BoardLocationState>;
};

export type CharacterValueStateInput = {
  boolParams: Array<BoolParamStateInput>;
  image?: Maybe<FilePathInput>;
  isPrivate: Scalars['Boolean'];
  name: Scalars['String'];
  numMaxParams: Array<NumParamStateInput>;
  numParams: Array<NumParamStateInput>;
  pieces: Array<PieceStateInput>;
  strParams: Array<StrParamStateInput>;
  tachieImage?: Maybe<FilePathInput>;
  tachieLocations: Array<BoardLocationStateInput>;
};

export type CharactersOperation = {
  __typename?: 'CharactersOperation';
  replace: Array<ReplaceCharacterOperation>;
  update: Array<UpdateCharacterOperation>;
};

export type CharactersOperationInput = {
  replace: Array<ReplaceCharacterOperationInput>;
  update: Array<UpdateCharacterOperationInput>;
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
  NotSignIn = 'NotSignIn'
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
  RoomNotFound = 'RoomNotFound'
}

export type DeleteMessageResult = {
  __typename?: 'DeleteMessageResult';
  failureType?: Maybe<DeleteMessageFailureType>;
};

export enum DeleteRoomFailureType {
  NotCreatedByYou = 'NotCreatedByYou',
  NotEntry = 'NotEntry',
  NotFound = 'NotFound',
  NotSignIn = 'NotSignIn'
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
  RoomNotFound = 'RoomNotFound'
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
  WrongPhrase = 'WrongPhrase'
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
  FirebaseStorage = 'FirebaseStorage'
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

export type GetRoomFailureResult = {
  __typename?: 'GetRoomFailureResult';
  failureType: GetRoomFailureType;
};

export enum GetRoomFailureType {
  NotEntry = 'NotEntry',
  NotFound = 'NotFound',
  NotSignIn = 'NotSignIn'
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
  UnknownError = 'UnknownError'
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
  RoomNotFound = 'RoomNotFound'
}

export type GetRoomMessagesResult = GetRoomMessagesFailureResult | RoomMessages;

export type GetRoomResult = GetJoinedRoomResult | GetNonJoinedRoomResult | GetRoomFailureResult;

export type GetRoomsListFailureResult = {
  __typename?: 'GetRoomsListFailureResult';
  failureType: GetRoomsListFailureType;
};

export enum GetRoomsListFailureType {
  NotEntry = 'NotEntry',
  NotSignIn = 'NotSignIn'
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
  WrongPhrase = 'WrongPhrase'
}

export type JoinRoomResult = JoinRoomFailureResult | JoinRoomSuccessResult;

export type JoinRoomSuccessResult = {
  __typename?: 'JoinRoomSuccessResult';
  operation?: Maybe<RoomOperation>;
};

export enum LeaveRoomFailureType {
  NotEntry = 'NotEntry',
  NotFound = 'NotFound',
  NotSignIn = 'NotSignIn'
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
  RoomNotFound = 'RoomNotFound'
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


export type MutationWritePrivateMessageArgs = {
  characterStateId?: Maybe<Scalars['String']>;
  customName?: Maybe<Scalars['String']>;
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

export type MyNumberValueOperation = {
  __typename?: 'MyNumberValueOperation';
  isValuePrivate?: Maybe<ReplaceBooleanUpOperation>;
  pieces: PiecesOperation;
  value?: Maybe<ReplaceNumberUpOperation>;
  valueRangeMax?: Maybe<ReplaceNullableNumberUpOperation>;
  valueRangeMin?: Maybe<ReplaceNullableNumberUpOperation>;
};

export type MyNumberValueOperationInput = {
  isValuePrivate?: Maybe<ReplaceBooleanUpOperationInput>;
  pieces: PiecesOperationInput;
  value?: Maybe<ReplaceNumberUpOperationInput>;
  valueRangeMax?: Maybe<ReplaceNullableNumberUpOperationInput>;
  valueRangeMin?: Maybe<ReplaceNullableNumberUpOperationInput>;
};

export type MyNumberValueState = {
  __typename?: 'MyNumberValueState';
  stateId: Scalars['String'];
  value: MyNumberValueStateValue;
};

export type MyNumberValueStateValue = {
  __typename?: 'MyNumberValueStateValue';
  isValuePrivate: Scalars['Boolean'];
  pieces: Array<PieceState>;
  value: Scalars['Float'];
  valueRangeMax?: Maybe<Scalars['Float']>;
  valueRangeMin?: Maybe<Scalars['Float']>;
};

export type MyNumberValueStateValueInput = {
  isValuePrivate: Scalars['Boolean'];
  pieces: Array<PieceStateInput>;
  value: Scalars['Float'];
  valueRangeMax?: Maybe<Scalars['Float']>;
  valueRangeMin?: Maybe<Scalars['Float']>;
};

export type MyNumberValuesOperation = {
  __typename?: 'MyNumberValuesOperation';
  replace: Array<ReplaceMyNumberValueOperation>;
  update: Array<UpdateMyNumberValueOperation>;
};

export type MyNumberValuesOperationInput = {
  replace: Array<ReplaceMyNumberValueOperationInput>;
  update: Array<UpdateMyNumberValueOperationInput>;
};

export type MyValueLog = {
  __typename?: 'MyValueLog';
  createdAt: Scalars['Float'];
  createdPieces: Array<BoardId>;
  deletedPieces: Array<BoardId>;
  isValuePrivateChanged: Scalars['Boolean'];
  messageId: Scalars['String'];
  movedPieces: Array<BoardId>;
  myValueType: MyValueLogType;
  replaceType?: Maybe<Scalars['Boolean']>;
  resizedPieces: Array<BoardId>;
  stateId: Scalars['String'];
  stateUserUid: Scalars['String'];
  valueChanged: Scalars['Boolean'];
};

export enum MyValueLogType {
  Num = 'Num'
}

export type NumParamOperation = {
  __typename?: 'NumParamOperation';
  isValuePrivate?: Maybe<ReplaceBooleanUpOperation>;
  value?: Maybe<ReplaceNullableNumberUpOperation>;
};

export type NumParamOperationInput = {
  isValuePrivate?: Maybe<ReplaceBooleanUpOperationInput>;
  value?: Maybe<ReplaceNullableNumberUpOperationInput>;
};

export type NumParamState = {
  __typename?: 'NumParamState';
  key: Scalars['String'];
  value: NumParamValueState;
};

export type NumParamStateInput = {
  key: Scalars['String'];
  value: NumParamValueStateInput;
};

export type NumParamValueState = {
  __typename?: 'NumParamValueState';
  isValuePrivate: Scalars['Boolean'];
  value?: Maybe<Scalars['Float']>;
};

export type NumParamValueStateInput = {
  isValuePrivate: Scalars['Boolean'];
  value?: Maybe<Scalars['Float']>;
};

export type NumParamsOperation = {
  __typename?: 'NumParamsOperation';
  update: Array<UpdateNumParamOperation>;
};

export type NumParamsOperationInput = {
  update: Array<UpdateNumParamOperationInput>;
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
  NotSignIn = 'NotSignIn'
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

export type ParamNameOperation = {
  __typename?: 'ParamNameOperation';
  name?: Maybe<ReplaceStringUpOperation>;
};

export type ParamNameOperationInput = {
  name?: Maybe<ReplaceStringUpOperationInput>;
};

export type ParamNameState = {
  __typename?: 'ParamNameState';
  key: Scalars['String'];
  type: RoomParameterNameType;
  value: ParamNameValueState;
};

export type ParamNameValueState = {
  __typename?: 'ParamNameValueState';
  name: Scalars['String'];
};

export type ParamNameValueStateInput = {
  name: Scalars['String'];
};

export type ParamNamesOperation = {
  __typename?: 'ParamNamesOperation';
  replace: Array<ReplaceParamNameOperation>;
  update: Array<UpdateParamNameOperation>;
};

export type ParamNamesOperationInput = {
  replace: Array<ReplaceParamNameOperationInput>;
  update: Array<UpdateParamNameOperationInput>;
};

export type ParticipantOperation = {
  __typename?: 'ParticipantOperation';
  myNumberValues: MyNumberValuesOperation;
  name?: Maybe<ReplaceStringUpOperation>;
  role?: Maybe<ReplaceNullableParticipantRoleUpOperation>;
};

export type ParticipantOperationInput = {
  myNumberValues: MyNumberValuesOperationInput;
};

export enum ParticipantRole {
  Master = 'Master',
  Player = 'Player',
  Spectator = 'Spectator'
}

export type ParticipantState = {
  __typename?: 'ParticipantState';
  userUid: Scalars['String'];
  value: ParticipantValueState;
};

export type ParticipantValueState = {
  __typename?: 'ParticipantValueState';
  myNumberValues: Array<MyNumberValueState>;
  name: Scalars['String'];
  role?: Maybe<ParticipantRole>;
};

export type ParticipantsOperation = {
  __typename?: 'ParticipantsOperation';
  replace: Array<ReplaceParticipantOperation>;
  update: Array<UpdateParticipantOperation>;
};

export type ParticipantsOperationInput = {
  update: Array<UpdateParticipantOperationInput>;
};

export type PieceOperation = {
  __typename?: 'PieceOperation';
  cellH?: Maybe<ReplaceNumberUpOperation>;
  cellW?: Maybe<ReplaceNumberUpOperation>;
  cellX?: Maybe<ReplaceNumberUpOperation>;
  cellY?: Maybe<ReplaceNumberUpOperation>;
  h?: Maybe<ReplaceNumberUpOperation>;
  isCellMode?: Maybe<ReplaceBooleanUpOperation>;
  isPrivate?: Maybe<ReplaceBooleanUpOperation>;
  w?: Maybe<ReplaceNumberUpOperation>;
  x?: Maybe<ReplaceNumberUpOperation>;
  y?: Maybe<ReplaceNumberUpOperation>;
};

export type PieceOperationInput = {
  cellH?: Maybe<ReplaceNumberUpOperationInput>;
  cellW?: Maybe<ReplaceNumberUpOperationInput>;
  cellX?: Maybe<ReplaceNumberUpOperationInput>;
  cellY?: Maybe<ReplaceNumberUpOperationInput>;
  h?: Maybe<ReplaceNumberUpOperationInput>;
  isCellMode?: Maybe<ReplaceBooleanUpOperationInput>;
  isPrivate?: Maybe<ReplaceBooleanUpOperationInput>;
  w?: Maybe<ReplaceNumberUpOperationInput>;
  x?: Maybe<ReplaceNumberUpOperationInput>;
  y?: Maybe<ReplaceNumberUpOperationInput>;
};

export type PieceState = {
  __typename?: 'PieceState';
  boardCreatedBy: Scalars['String'];
  boardId: Scalars['String'];
  value: PieceValueState;
};

export type PieceStateInput = {
  boardCreatedBy: Scalars['String'];
  boardId: Scalars['String'];
  value: PieceValueStateInput;
};

export type PieceValueState = {
  __typename?: 'PieceValueState';
  cellH: Scalars['Float'];
  cellW: Scalars['Float'];
  cellX: Scalars['Float'];
  cellY: Scalars['Float'];
  h: Scalars['Float'];
  isCellMode: Scalars['Boolean'];
  isPrivate: Scalars['Boolean'];
  w: Scalars['Float'];
  x: Scalars['Float'];
  y: Scalars['Float'];
};

export type PieceValueStateInput = {
  cellH: Scalars['Float'];
  cellW: Scalars['Float'];
  cellX: Scalars['Float'];
  cellY: Scalars['Float'];
  h: Scalars['Float'];
  isCellMode: Scalars['Boolean'];
  isPrivate: Scalars['Boolean'];
  w: Scalars['Float'];
  x: Scalars['Float'];
  y: Scalars['Float'];
};

export type PiecesOperation = {
  __typename?: 'PiecesOperation';
  replace: Array<ReplacePieceOperation>;
  update: Array<UpdatePieceOperation>;
};

export type PiecesOperationInput = {
  replace: Array<ReplacePieceOperationInput>;
  update: Array<UpdatePieceOperationInput>;
};

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
  Rc = 'Rc'
}

export enum PromoteFailureType {
  NoNeedToPromote = 'NoNeedToPromote',
  NotEntry = 'NotEntry',
  NotFound = 'NotFound',
  NotParticipant = 'NotParticipant',
  NotSignIn = 'NotSignIn',
  WrongPhrase = 'WrongPhrase'
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


export type QueryRequiresPhraseToJoinAsPlayerArgs = {
  roomId: Scalars['String'];
};

export type ReplaceBoardLocationOperation = {
  __typename?: 'ReplaceBoardLocationOperation';
  boardCreatedBy: Scalars['String'];
  boardId: Scalars['String'];
  newValue?: Maybe<BoardLocationValueState>;
};

export type ReplaceBoardLocationOperationInput = {
  boardCreatedBy: Scalars['String'];
  boardId: Scalars['String'];
  newValue?: Maybe<BoardLocationValueStateInput>;
};

export type ReplaceBoardOperation = {
  __typename?: 'ReplaceBoardOperation';
  createdBy: Scalars['String'];
  id: Scalars['String'];
  newValue?: Maybe<BoardValueState>;
};

export type ReplaceBoardOperationInput = {
  createdBy: Scalars['String'];
  id: Scalars['String'];
  newValue?: Maybe<BoardValueStateInput>;
};

export type ReplaceBooleanUpOperation = {
  __typename?: 'ReplaceBooleanUpOperation';
  newValue: Scalars['Boolean'];
};

export type ReplaceBooleanUpOperationInput = {
  newValue: Scalars['Boolean'];
};

export type ReplaceCharacterOperation = {
  __typename?: 'ReplaceCharacterOperation';
  createdBy: Scalars['String'];
  id: Scalars['String'];
  newValue?: Maybe<CharacterValueState>;
};

export type ReplaceCharacterOperationInput = {
  createdBy: Scalars['String'];
  id: Scalars['String'];
  newValue?: Maybe<CharacterValueStateInput>;
};

export type ReplaceFilePathArrayUpOperation = {
  __typename?: 'ReplaceFilePathArrayUpOperation';
  newValue: Array<FilePath>;
};

export type ReplaceFilePathArrayUpOperationInput = {
  newValue: Array<FilePathInput>;
};

export type ReplaceMyNumberValueOperation = {
  __typename?: 'ReplaceMyNumberValueOperation';
  newValue?: Maybe<MyNumberValueStateValue>;
  stateId: Scalars['String'];
};

export type ReplaceMyNumberValueOperationInput = {
  newValue?: Maybe<MyNumberValueStateValueInput>;
  stateId: Scalars['String'];
};

export type ReplaceNullableBooleanUpOperation = {
  __typename?: 'ReplaceNullableBooleanUpOperation';
  newValue?: Maybe<Scalars['Boolean']>;
};

export type ReplaceNullableBooleanUpOperationInput = {
  newValue?: Maybe<Scalars['Boolean']>;
};

export type ReplaceNullableFilePathUpOperation = {
  __typename?: 'ReplaceNullableFilePathUpOperation';
  newValue?: Maybe<FilePath>;
};

export type ReplaceNullableFilePathUpOperationInput = {
  newValue?: Maybe<FilePathInput>;
};

export type ReplaceNullableNumberUpOperation = {
  __typename?: 'ReplaceNullableNumberUpOperation';
  newValue?: Maybe<Scalars['Float']>;
};

export type ReplaceNullableNumberUpOperationInput = {
  newValue?: Maybe<Scalars['Float']>;
};

export type ReplaceNullableParticipantRoleUpOperation = {
  __typename?: 'ReplaceNullableParticipantRoleUpOperation';
  newValue?: Maybe<ParticipantRole>;
};

export type ReplaceNumberUpOperation = {
  __typename?: 'ReplaceNumberUpOperation';
  newValue: Scalars['Float'];
};

export type ReplaceNumberUpOperationInput = {
  newValue: Scalars['Float'];
};

export type ReplaceParamNameOperation = {
  __typename?: 'ReplaceParamNameOperation';
  key: Scalars['String'];
  newValue?: Maybe<ParamNameValueState>;
  type: RoomParameterNameType;
};

export type ReplaceParamNameOperationInput = {
  key: Scalars['String'];
  newValue?: Maybe<ParamNameValueStateInput>;
  type: RoomParameterNameType;
};

export type ReplaceParticipantOperation = {
  __typename?: 'ReplaceParticipantOperation';
  newValue?: Maybe<ParticipantValueState>;
  userUid: Scalars['String'];
};

export type ReplacePieceOperation = {
  __typename?: 'ReplacePieceOperation';
  boardCreatedBy: Scalars['String'];
  boardId: Scalars['String'];
  newValue?: Maybe<PieceValueState>;
};

export type ReplacePieceOperationInput = {
  boardCreatedBy: Scalars['String'];
  boardId: Scalars['String'];
  newValue?: Maybe<PieceValueStateInput>;
};

export type ReplaceRoomBgmOperation = {
  __typename?: 'ReplaceRoomBgmOperation';
  channelKey: Scalars['String'];
  newValue?: Maybe<RoomBgmValueState>;
};

export type ReplaceRoomBgmOperationInput = {
  channelKey: Scalars['String'];
  newValue?: Maybe<RoomBgmValueStateInput>;
};

export type ReplaceStringUpOperation = {
  __typename?: 'ReplaceStringUpOperation';
  newValue: Scalars['String'];
};

export type ReplaceStringUpOperationInput = {
  newValue: Scalars['String'];
};

export type RequiresPhraseFailureResult = {
  __typename?: 'RequiresPhraseFailureResult';
  failureType: RequiresPhraseFailureType;
};

export enum RequiresPhraseFailureType {
  NotEntry = 'NotEntry',
  NotFound = 'NotFound',
  NotSignIn = 'NotSignIn'
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

export type RoomBgmOperation = {
  __typename?: 'RoomBgmOperation';
  files?: Maybe<ReplaceFilePathArrayUpOperation>;
  volume?: Maybe<ReplaceNumberUpOperation>;
};

export type RoomBgmOperationInput = {
  files?: Maybe<ReplaceFilePathArrayUpOperationInput>;
  volume?: Maybe<ReplaceNumberUpOperationInput>;
};

export type RoomBgmState = {
  __typename?: 'RoomBgmState';
  channelKey: Scalars['String'];
  value: RoomBgmValueState;
};

export type RoomBgmValueState = {
  __typename?: 'RoomBgmValueState';
  files: Array<FilePath>;
  volume: Scalars['Float'];
};

export type RoomBgmValueStateInput = {
  files: Array<FilePathInput>;
  volume: Scalars['Float'];
};

export type RoomBgmsOperation = {
  __typename?: 'RoomBgmsOperation';
  replace: Array<ReplaceRoomBgmOperation>;
  update: Array<UpdateRoomBgmOperation>;
};

export type RoomBgmsOperationInput = {
  replace: Array<ReplaceRoomBgmOperationInput>;
  update: Array<UpdateRoomBgmOperationInput>;
};

export type RoomGetState = {
  __typename?: 'RoomGetState';
  bgms: Array<RoomBgmState>;
  boards: Array<BoardState>;
  characters: Array<CharacterState>;
  createdBy: Scalars['String'];
  name: Scalars['String'];
  paramNames: Array<ParamNameState>;
  participants: Array<ParticipantState>;
  publicChannel1Name: Scalars['String'];
  publicChannel2Name: Scalars['String'];
  publicChannel3Name: Scalars['String'];
  publicChannel4Name: Scalars['String'];
  publicChannel5Name: Scalars['String'];
  publicChannel6Name: Scalars['String'];
  publicChannel7Name: Scalars['String'];
  publicChannel8Name: Scalars['String'];
  publicChannel9Name: Scalars['String'];
  publicChannel10Name: Scalars['String'];
  revision: Scalars['Float'];
};

export type RoomMessageEvent = MyValueLog | RoomPrivateMessage | RoomPrivateMessageUpdate | RoomPublicChannel | RoomPublicChannelUpdate | RoomPublicMessage | RoomPublicMessageUpdate | RoomSoundEffect;

export type RoomMessages = {
  __typename?: 'RoomMessages';
  myValueLogs: Array<MyValueLog>;
  privateMessages: Array<RoomPrivateMessage>;
  publicChannels: Array<RoomPublicChannel>;
  publicMessages: Array<RoomPublicMessage>;
  soundEffects: Array<RoomSoundEffect>;
};

export type RoomOperated = DeleteRoomOperation | RoomOperation;

export type RoomOperation = {
  __typename?: 'RoomOperation';
  operatedBy?: Maybe<OperatedBy>;
  revisionTo: Scalars['Float'];
  value: RoomOperationValue;
};

export type RoomOperationInput = {
  clientId: Scalars['String'];
  value: RoomOperationValueInput;
};

export type RoomOperationValue = {
  __typename?: 'RoomOperationValue';
  bgms: RoomBgmsOperation;
  boards: BoardsOperation;
  characters: CharactersOperation;
  name?: Maybe<ReplaceStringUpOperation>;
  paramNames: ParamNamesOperation;
  participants: ParticipantsOperation;
  publicChannel1Name?: Maybe<ReplaceStringUpOperation>;
  publicChannel2Name?: Maybe<ReplaceStringUpOperation>;
  publicChannel3Name?: Maybe<ReplaceStringUpOperation>;
  publicChannel4Name?: Maybe<ReplaceStringUpOperation>;
  publicChannel5Name?: Maybe<ReplaceStringUpOperation>;
  publicChannel6Name?: Maybe<ReplaceStringUpOperation>;
  publicChannel7Name?: Maybe<ReplaceStringUpOperation>;
  publicChannel8Name?: Maybe<ReplaceStringUpOperation>;
  publicChannel9Name?: Maybe<ReplaceStringUpOperation>;
  publicChannel10Name?: Maybe<ReplaceStringUpOperation>;
};

export type RoomOperationValueInput = {
  bgms: RoomBgmsOperationInput;
  boards: BoardsOperationInput;
  characters: CharactersOperationInput;
  name?: Maybe<ReplaceStringUpOperationInput>;
  paramNames: ParamNamesOperationInput;
  participants: ParticipantsOperationInput;
  publicChannel1Name?: Maybe<ReplaceStringUpOperationInput>;
  publicChannel2Name?: Maybe<ReplaceStringUpOperationInput>;
  publicChannel3Name?: Maybe<ReplaceStringUpOperationInput>;
  publicChannel4Name?: Maybe<ReplaceStringUpOperationInput>;
  publicChannel5Name?: Maybe<ReplaceStringUpOperationInput>;
  publicChannel6Name?: Maybe<ReplaceStringUpOperationInput>;
  publicChannel7Name?: Maybe<ReplaceStringUpOperationInput>;
  publicChannel8Name?: Maybe<ReplaceStringUpOperationInput>;
  publicChannel9Name?: Maybe<ReplaceStringUpOperationInput>;
  publicChannel10Name?: Maybe<ReplaceStringUpOperationInput>;
};

export enum RoomParameterNameType {
  Bool = 'Bool',
  Num = 'Num',
  Str = 'Str'
}

export type RoomPrivateMessage = {
  __typename?: 'RoomPrivateMessage';
  altTextToSecret?: Maybe<Scalars['String']>;
  character?: Maybe<CharacterValueForMessage>;
  commandResult?: Maybe<CommandResult>;
  createdAt: Scalars['Float'];
  createdBy?: Maybe<Scalars['String']>;
  customName?: Maybe<Scalars['String']>;
  isSecret: Scalars['Boolean'];
  messageId: Scalars['String'];
  text?: Maybe<Scalars['String']>;
  textColor?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['Float']>;
  visibleTo: Array<Scalars['String']>;
};

export type RoomPrivateMessageUpdate = {
  __typename?: 'RoomPrivateMessageUpdate';
  altTextToSecret?: Maybe<Scalars['String']>;
  commandResult?: Maybe<CommandResult>;
  isSecret: Scalars['Boolean'];
  messageId: Scalars['String'];
  text?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['Float']>;
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
  isSecret: Scalars['Boolean'];
  messageId: Scalars['String'];
  text?: Maybe<Scalars['String']>;
  textColor?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['Float']>;
};

export type RoomPublicMessageUpdate = {
  __typename?: 'RoomPublicMessageUpdate';
  altTextToSecret?: Maybe<Scalars['String']>;
  commandResult?: Maybe<CommandResult>;
  isSecret: Scalars['Boolean'];
  messageId: Scalars['String'];
  text?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['Float']>;
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

export type StrParamOperation = {
  __typename?: 'StrParamOperation';
  isValuePrivate?: Maybe<ReplaceBooleanUpOperation>;
  value?: Maybe<Array<TextUpOperationUnit>>;
};

export type StrParamOperationInput = {
  isValuePrivate?: Maybe<ReplaceBooleanUpOperationInput>;
  value?: Maybe<Array<TextUpOperationUnitInput>>;
};

export type StrParamState = {
  __typename?: 'StrParamState';
  key: Scalars['String'];
  value: StrParamValueState;
};

export type StrParamStateInput = {
  key: Scalars['String'];
  value: StrParamValueStateInput;
};

export type StrParamValueState = {
  __typename?: 'StrParamValueState';
  isValuePrivate: Scalars['Boolean'];
  value: Scalars['String'];
};

export type StrParamValueStateInput = {
  isValuePrivate: Scalars['Boolean'];
  value: Scalars['String'];
};

export type StrParamsOperation = {
  __typename?: 'StrParamsOperation';
  update: Array<UpdateStrParamOperation>;
};

export type StrParamsOperationInput = {
  update: Array<UpdateStrParamOperationInput>;
};

export type Subscription = {
  __typename?: 'Subscription';
  messageEvent?: Maybe<RoomMessageEvent>;
  pong: Pong;
  roomOperated?: Maybe<RoomOperated>;
};


export type SubscriptionMessageEventArgs = {
  roomId: Scalars['String'];
};


export type SubscriptionRoomOperatedArgs = {
  id: Scalars['String'];
};

export type TextUpOperationUnit = {
  __typename?: 'TextUpOperationUnit';
  delete?: Maybe<Scalars['Float']>;
  insert?: Maybe<Scalars['String']>;
  retain?: Maybe<Scalars['Float']>;
};

export type TextUpOperationUnitInput = {
  delete?: Maybe<Scalars['Float']>;
  insert?: Maybe<Scalars['String']>;
  retain?: Maybe<Scalars['Float']>;
};

export type UpdateBoardLocationOperation = {
  __typename?: 'UpdateBoardLocationOperation';
  boardCreatedBy: Scalars['String'];
  boardId: Scalars['String'];
  operation: BoardLocationOperation;
};

export type UpdateBoardLocationOperationInput = {
  boardCreatedBy: Scalars['String'];
  boardId: Scalars['String'];
  operation: BoardLocationOperationInput;
};

export type UpdateBoardOperation = {
  __typename?: 'UpdateBoardOperation';
  createdBy: Scalars['String'];
  id: Scalars['String'];
  operation: BoardOperation;
};

export type UpdateBoardOperationInput = {
  createdBy: Scalars['String'];
  id: Scalars['String'];
  operation: BoardOperationInput;
};

export type UpdateBoolParamOperation = {
  __typename?: 'UpdateBoolParamOperation';
  key: Scalars['String'];
  operation: BoolParamOperation;
};

export type UpdateBoolParamOperationInput = {
  key: Scalars['String'];
  operation: BoolParamOperationInput;
};

export type UpdateCharacterOperation = {
  __typename?: 'UpdateCharacterOperation';
  createdBy: Scalars['String'];
  id: Scalars['String'];
  operation: CharacterOperation;
};

export type UpdateCharacterOperationInput = {
  createdBy: Scalars['String'];
  id: Scalars['String'];
  operation: CharacterOperationInput;
};

export type UpdateMyNumberValueOperation = {
  __typename?: 'UpdateMyNumberValueOperation';
  operation: MyNumberValueOperation;
  stateId: Scalars['String'];
};

export type UpdateMyNumberValueOperationInput = {
  operation: MyNumberValueOperationInput;
  stateId: Scalars['String'];
};

export type UpdateNumParamOperation = {
  __typename?: 'UpdateNumParamOperation';
  key: Scalars['String'];
  operation: NumParamOperation;
};

export type UpdateNumParamOperationInput = {
  key: Scalars['String'];
  operation: NumParamOperationInput;
};

export type UpdateParamNameOperation = {
  __typename?: 'UpdateParamNameOperation';
  key: Scalars['String'];
  operation: ParamNameOperation;
  type: RoomParameterNameType;
};

export type UpdateParamNameOperationInput = {
  key: Scalars['String'];
  operation: ParamNameOperationInput;
  type: RoomParameterNameType;
};

export type UpdateParticipantOperation = {
  __typename?: 'UpdateParticipantOperation';
  operation: ParticipantOperation;
  userUid: Scalars['String'];
};

export type UpdateParticipantOperationInput = {
  operation: ParticipantOperationInput;
  userUid: Scalars['String'];
};

export type UpdatePieceOperation = {
  __typename?: 'UpdatePieceOperation';
  boardCreatedBy: Scalars['String'];
  boardId: Scalars['String'];
  operation: PieceOperation;
};

export type UpdatePieceOperationInput = {
  boardCreatedBy: Scalars['String'];
  boardId: Scalars['String'];
  operation: PieceOperationInput;
};

export type UpdateRoomBgmOperation = {
  __typename?: 'UpdateRoomBgmOperation';
  channelKey: Scalars['String'];
  operation: RoomBgmOperation;
};

export type UpdateRoomBgmOperationInput = {
  channelKey: Scalars['String'];
  operation: RoomBgmOperationInput;
};

export type UpdateStrParamOperation = {
  __typename?: 'UpdateStrParamOperation';
  key: Scalars['String'];
  operation: StrParamOperation;
};

export type UpdateStrParamOperationInput = {
  key: Scalars['String'];
  operation: StrParamOperationInput;
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
  VisibleToIsInvalid = 'VisibleToIsInvalid'
}

export type WritePrivateRoomMessageResult = RoomPrivateMessage | WritePrivateRoomMessageFailureResult;

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
  RoomNotFound = 'RoomNotFound'
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
  RoomNotFound = 'RoomNotFound'
}

export type WriteRoomSoundEffectResult = RoomSoundEffect | WriteRoomSoundEffectFailureResult;

export type BoardStateFragment = (
  { __typename?: 'BoardState' }
  & Pick<BoardState, 'id' | 'createdBy'>
  & { value: (
    { __typename?: 'BoardValueState' }
    & BoardValueStateFragment
  ) }
);

export type BoardValueStateFragment = (
  { __typename?: 'BoardValueState' }
  & Pick<BoardValueState, 'name' | 'cellWidth' | 'cellHeight' | 'cellRowCount' | 'cellColumnCount' | 'cellOffsetX' | 'cellOffsetY' | 'backgroundImageZoom'>
  & { backgroundImage?: Maybe<(
    { __typename?: 'FilePath' }
    & FilePathFragment
  )> }
);

export type BoardsOperationFragment = (
  { __typename?: 'BoardsOperation' }
  & { replace: Array<(
    { __typename?: 'ReplaceBoardOperation' }
    & Pick<ReplaceBoardOperation, 'id' | 'createdBy'>
    & { newValue?: Maybe<(
      { __typename?: 'BoardValueState' }
      & BoardValueStateFragment
    )> }
  )>, update: Array<(
    { __typename?: 'UpdateBoardOperation' }
    & Pick<UpdateBoardOperation, 'id' | 'createdBy'>
    & { operation: (
      { __typename?: 'BoardOperation' }
      & BoardOperationFragment
    ) }
  )> }
);

export type BoardOperationFragment = (
  { __typename?: 'BoardOperation' }
  & { name?: Maybe<(
    { __typename?: 'ReplaceStringUpOperation' }
    & Pick<ReplaceStringUpOperation, 'newValue'>
  )>, cellWidth?: Maybe<(
    { __typename?: 'ReplaceNumberUpOperation' }
    & Pick<ReplaceNumberUpOperation, 'newValue'>
  )>, cellHeight?: Maybe<(
    { __typename?: 'ReplaceNumberUpOperation' }
    & Pick<ReplaceNumberUpOperation, 'newValue'>
  )>, cellRowCount?: Maybe<(
    { __typename?: 'ReplaceNumberUpOperation' }
    & Pick<ReplaceNumberUpOperation, 'newValue'>
  )>, cellColumnCount?: Maybe<(
    { __typename?: 'ReplaceNumberUpOperation' }
    & Pick<ReplaceNumberUpOperation, 'newValue'>
  )>, cellOffsetX?: Maybe<(
    { __typename?: 'ReplaceNumberUpOperation' }
    & Pick<ReplaceNumberUpOperation, 'newValue'>
  )>, cellOffsetY?: Maybe<(
    { __typename?: 'ReplaceNumberUpOperation' }
    & Pick<ReplaceNumberUpOperation, 'newValue'>
  )>, backgroundImage?: Maybe<(
    { __typename?: 'ReplaceNullableFilePathUpOperation' }
    & { newValue?: Maybe<(
      { __typename?: 'FilePath' }
      & FilePathFragment
    )> }
  )>, backgroundImageZoom?: Maybe<(
    { __typename?: 'ReplaceNumberUpOperation' }
    & Pick<ReplaceNumberUpOperation, 'newValue'>
  )> }
);

export type BoardLocationValueStateFragment = (
  { __typename?: 'BoardLocationValueState' }
  & Pick<BoardLocationValueState, 'isPrivate' | 'x' | 'y' | 'w' | 'h'>
);

export type BoardLocationStateFragment = (
  { __typename?: 'BoardLocationState' }
  & Pick<BoardLocationState, 'boardId' | 'boardCreatedBy'>
  & { value: (
    { __typename?: 'BoardLocationValueState' }
    & BoardLocationValueStateFragment
  ) }
);

export type BoardLocationOperationFragment = (
  { __typename?: 'BoardLocationOperation' }
  & { isPrivate?: Maybe<(
    { __typename?: 'ReplaceBooleanUpOperation' }
    & Pick<ReplaceBooleanUpOperation, 'newValue'>
  )>, x?: Maybe<(
    { __typename?: 'ReplaceNumberUpOperation' }
    & Pick<ReplaceNumberUpOperation, 'newValue'>
  )>, y?: Maybe<(
    { __typename?: 'ReplaceNumberUpOperation' }
    & Pick<ReplaceNumberUpOperation, 'newValue'>
  )>, w?: Maybe<(
    { __typename?: 'ReplaceNumberUpOperation' }
    & Pick<ReplaceNumberUpOperation, 'newValue'>
  )>, h?: Maybe<(
    { __typename?: 'ReplaceNumberUpOperation' }
    & Pick<ReplaceNumberUpOperation, 'newValue'>
  )> }
);

export type BoardLocationsOperationFragment = (
  { __typename?: 'BoardLocationsOperation' }
  & { replace: Array<(
    { __typename?: 'ReplaceBoardLocationOperation' }
    & Pick<ReplaceBoardLocationOperation, 'boardId' | 'boardCreatedBy'>
    & { newValue?: Maybe<(
      { __typename?: 'BoardLocationValueState' }
      & BoardLocationValueStateFragment
    )> }
  )>, update: Array<(
    { __typename?: 'UpdateBoardLocationOperation' }
    & Pick<UpdateBoardLocationOperation, 'boardId' | 'boardCreatedBy'>
    & { operation: (
      { __typename?: 'BoardLocationOperation' }
      & BoardLocationOperationFragment
    ) }
  )> }
);

export type CharacterStateFragment = (
  { __typename?: 'CharacterState' }
  & Pick<CharacterState, 'id' | 'createdBy'>
  & { value: (
    { __typename?: 'CharacterValueState' }
    & CharacterValueStateFragment
  ) }
);

export type CharacterValueStateFragment = (
  { __typename?: 'CharacterValueState' }
  & Pick<CharacterValueState, 'isPrivate' | 'name'>
  & { image?: Maybe<(
    { __typename?: 'FilePath' }
    & FilePathFragment
  )>, tachieImage?: Maybe<(
    { __typename?: 'FilePath' }
    & FilePathFragment
  )>, pieces: Array<(
    { __typename?: 'PieceState' }
    & PieceStateFragment
  )>, tachieLocations: Array<(
    { __typename?: 'BoardLocationState' }
    & BoardLocationStateFragment
  )>, boolParams: Array<(
    { __typename?: 'BoolParamState' }
    & Pick<BoolParamState, 'key'>
    & { value: (
      { __typename?: 'BoolParamValueState' }
      & Pick<BoolParamValueState, 'isValuePrivate' | 'value'>
    ) }
  )>, numParams: Array<(
    { __typename?: 'NumParamState' }
    & Pick<NumParamState, 'key'>
    & { value: (
      { __typename?: 'NumParamValueState' }
      & Pick<NumParamValueState, 'isValuePrivate' | 'value'>
    ) }
  )>, numMaxParams: Array<(
    { __typename?: 'NumParamState' }
    & Pick<NumParamState, 'key'>
    & { value: (
      { __typename?: 'NumParamValueState' }
      & Pick<NumParamValueState, 'isValuePrivate' | 'value'>
    ) }
  )>, strParams: Array<(
    { __typename?: 'StrParamState' }
    & Pick<StrParamState, 'key'>
    & { value: (
      { __typename?: 'StrParamValueState' }
      & Pick<StrParamValueState, 'isValuePrivate' | 'value'>
    ) }
  )> }
);

export type CharacterValueForMessageFragment = (
  { __typename?: 'CharacterValueForMessage' }
  & Pick<CharacterValueForMessage, 'stateId' | 'isPrivate' | 'name'>
  & { image?: Maybe<(
    { __typename?: 'FilePath' }
    & FilePathFragment
  )>, tachieImage?: Maybe<(
    { __typename?: 'FilePath' }
    & FilePathFragment
  )> }
);

export type CharactersOperationFragment = (
  { __typename?: 'CharactersOperation' }
  & { replace: Array<(
    { __typename?: 'ReplaceCharacterOperation' }
    & Pick<ReplaceCharacterOperation, 'id' | 'createdBy'>
    & { newValue?: Maybe<(
      { __typename?: 'CharacterValueState' }
      & CharacterValueStateFragment
    )> }
  )>, update: Array<(
    { __typename?: 'UpdateCharacterOperation' }
    & Pick<UpdateCharacterOperation, 'id' | 'createdBy'>
    & { operation: (
      { __typename?: 'CharacterOperation' }
      & CharacterOperationFragment
    ) }
  )> }
);

export type CharacterOperationFragment = (
  { __typename?: 'CharacterOperation' }
  & { isPrivate?: Maybe<(
    { __typename?: 'ReplaceBooleanUpOperation' }
    & Pick<ReplaceBooleanUpOperation, 'newValue'>
  )>, name?: Maybe<(
    { __typename?: 'ReplaceStringUpOperation' }
    & Pick<ReplaceStringUpOperation, 'newValue'>
  )>, boolParams: (
    { __typename?: 'BoolParamsOperation' }
    & { update: Array<(
      { __typename?: 'UpdateBoolParamOperation' }
      & Pick<UpdateBoolParamOperation, 'key'>
      & { operation: (
        { __typename?: 'BoolParamOperation' }
        & { isValuePrivate?: Maybe<(
          { __typename?: 'ReplaceBooleanUpOperation' }
          & Pick<ReplaceBooleanUpOperation, 'newValue'>
        )>, value?: Maybe<(
          { __typename?: 'ReplaceNullableBooleanUpOperation' }
          & Pick<ReplaceNullableBooleanUpOperation, 'newValue'>
        )> }
      ) }
    )> }
  ), numParams: (
    { __typename?: 'NumParamsOperation' }
    & { update: Array<(
      { __typename?: 'UpdateNumParamOperation' }
      & Pick<UpdateNumParamOperation, 'key'>
      & { operation: (
        { __typename?: 'NumParamOperation' }
        & { isValuePrivate?: Maybe<(
          { __typename?: 'ReplaceBooleanUpOperation' }
          & Pick<ReplaceBooleanUpOperation, 'newValue'>
        )>, value?: Maybe<(
          { __typename?: 'ReplaceNullableNumberUpOperation' }
          & Pick<ReplaceNullableNumberUpOperation, 'newValue'>
        )> }
      ) }
    )> }
  ), numMaxParams: (
    { __typename?: 'NumParamsOperation' }
    & { update: Array<(
      { __typename?: 'UpdateNumParamOperation' }
      & Pick<UpdateNumParamOperation, 'key'>
      & { operation: (
        { __typename?: 'NumParamOperation' }
        & { isValuePrivate?: Maybe<(
          { __typename?: 'ReplaceBooleanUpOperation' }
          & Pick<ReplaceBooleanUpOperation, 'newValue'>
        )>, value?: Maybe<(
          { __typename?: 'ReplaceNullableNumberUpOperation' }
          & Pick<ReplaceNullableNumberUpOperation, 'newValue'>
        )> }
      ) }
    )> }
  ), strParams: (
    { __typename?: 'StrParamsOperation' }
    & { update: Array<(
      { __typename?: 'UpdateStrParamOperation' }
      & Pick<UpdateStrParamOperation, 'key'>
      & { operation: (
        { __typename?: 'StrParamOperation' }
        & { isValuePrivate?: Maybe<(
          { __typename?: 'ReplaceBooleanUpOperation' }
          & Pick<ReplaceBooleanUpOperation, 'newValue'>
        )>, value?: Maybe<Array<(
          { __typename?: 'TextUpOperationUnit' }
          & TextUpOperationUnitFragment
        )>> }
      ) }
    )> }
  ), image?: Maybe<(
    { __typename?: 'ReplaceNullableFilePathUpOperation' }
    & { newValue?: Maybe<(
      { __typename?: 'FilePath' }
      & FilePathFragment
    )> }
  )>, tachieImage?: Maybe<(
    { __typename?: 'ReplaceNullableFilePathUpOperation' }
    & { newValue?: Maybe<(
      { __typename?: 'FilePath' }
      & FilePathFragment
    )> }
  )>, pieces: (
    { __typename?: 'PiecesOperation' }
    & PiecesOperationFragment
  ), tachieLocations: (
    { __typename?: 'BoardLocationsOperation' }
    & BoardLocationsOperationFragment
  ) }
);

type CreateRoomResult_CreateRoomFailureResult_Fragment = (
  { __typename?: 'CreateRoomFailureResult' }
  & Pick<CreateRoomFailureResult, 'failureType'>
);

type CreateRoomResult_CreateRoomSuccessResult_Fragment = (
  { __typename?: 'CreateRoomSuccessResult' }
  & Pick<CreateRoomSuccessResult, 'id'>
  & { room: (
    { __typename?: 'RoomGetState' }
    & RoomGetStateFragment
  ) }
);

export type CreateRoomResultFragment = CreateRoomResult_CreateRoomFailureResult_Fragment | CreateRoomResult_CreateRoomSuccessResult_Fragment;

export type FilePathFragment = (
  { __typename?: 'FilePath' }
  & Pick<FilePath, 'sourceType' | 'path'>
);

export type GetNonJoinedRoomResultFragment = (
  { __typename?: 'GetNonJoinedRoomResult' }
  & { roomAsListItem: (
    { __typename?: 'RoomAsListItem' }
    & RoomAsListItemFragment
  ) }
);

type GetRoomListResult_GetRoomsListFailureResult_Fragment = (
  { __typename?: 'GetRoomsListFailureResult' }
  & Pick<GetRoomsListFailureResult, 'failureType'>
);

type GetRoomListResult_GetRoomsListSuccessResult_Fragment = (
  { __typename?: 'GetRoomsListSuccessResult' }
  & { rooms: Array<(
    { __typename?: 'RoomAsListItem' }
    & RoomAsListItemFragment
  )> }
);

export type GetRoomListResultFragment = GetRoomListResult_GetRoomsListFailureResult_Fragment | GetRoomListResult_GetRoomsListSuccessResult_Fragment;

type GetRoomResult_GetJoinedRoomResult_Fragment = (
  { __typename?: 'GetJoinedRoomResult' }
  & Pick<GetJoinedRoomResult, 'role'>
  & { room: (
    { __typename?: 'RoomGetState' }
    & RoomGetStateFragment
  ) }
);

type GetRoomResult_GetNonJoinedRoomResult_Fragment = (
  { __typename?: 'GetNonJoinedRoomResult' }
  & GetNonJoinedRoomResultFragment
);

type GetRoomResult_GetRoomFailureResult_Fragment = (
  { __typename?: 'GetRoomFailureResult' }
  & Pick<GetRoomFailureResult, 'failureType'>
);

export type GetRoomResultFragment = GetRoomResult_GetJoinedRoomResult_Fragment | GetRoomResult_GetNonJoinedRoomResult_Fragment | GetRoomResult_GetRoomFailureResult_Fragment;

type JoinRoomResult_JoinRoomFailureResult_Fragment = (
  { __typename?: 'JoinRoomFailureResult' }
  & Pick<JoinRoomFailureResult, 'failureType'>
);

type JoinRoomResult_JoinRoomSuccessResult_Fragment = (
  { __typename?: 'JoinRoomSuccessResult' }
  & { operation?: Maybe<(
    { __typename?: 'RoomOperation' }
    & RoomOperationFragment
  )> }
);

export type JoinRoomResultFragment = JoinRoomResult_JoinRoomFailureResult_Fragment | JoinRoomResult_JoinRoomSuccessResult_Fragment;

export type MyNumberValueStateValueFragment = (
  { __typename?: 'MyNumberValueStateValue' }
  & Pick<MyNumberValueStateValue, 'isValuePrivate' | 'value' | 'valueRangeMin' | 'valueRangeMax'>
  & { pieces: Array<(
    { __typename?: 'PieceState' }
    & PieceStateFragment
  )> }
);

export type MyValueLogFragment = (
  { __typename?: 'MyValueLog' }
  & Pick<MyValueLog, 'messageId' | 'stateUserUid' | 'stateId' | 'createdAt' | 'myValueType' | 'valueChanged' | 'isValuePrivateChanged' | 'replaceType'>
  & { createdPieces: Array<(
    { __typename?: 'BoardId' }
    & Pick<BoardId, 'createdBy' | 'stateId'>
  )>, deletedPieces: Array<(
    { __typename?: 'BoardId' }
    & Pick<BoardId, 'createdBy' | 'stateId'>
  )>, movedPieces: Array<(
    { __typename?: 'BoardId' }
    & Pick<BoardId, 'createdBy' | 'stateId'>
  )>, resizedPieces: Array<(
    { __typename?: 'BoardId' }
    & Pick<BoardId, 'createdBy' | 'stateId'>
  )> }
);

export type PieceValueStateFragment = (
  { __typename?: 'PieceValueState' }
  & Pick<PieceValueState, 'isPrivate' | 'isCellMode' | 'x' | 'y' | 'w' | 'h' | 'cellX' | 'cellY' | 'cellW' | 'cellH'>
);

export type PieceStateFragment = (
  { __typename?: 'PieceState' }
  & Pick<PieceState, 'boardId' | 'boardCreatedBy'>
  & { value: (
    { __typename?: 'PieceValueState' }
    & PieceValueStateFragment
  ) }
);

export type PieceOperationFragment = (
  { __typename?: 'PieceOperation' }
  & { isPrivate?: Maybe<(
    { __typename?: 'ReplaceBooleanUpOperation' }
    & Pick<ReplaceBooleanUpOperation, 'newValue'>
  )>, isCellMode?: Maybe<(
    { __typename?: 'ReplaceBooleanUpOperation' }
    & Pick<ReplaceBooleanUpOperation, 'newValue'>
  )>, x?: Maybe<(
    { __typename?: 'ReplaceNumberUpOperation' }
    & Pick<ReplaceNumberUpOperation, 'newValue'>
  )>, y?: Maybe<(
    { __typename?: 'ReplaceNumberUpOperation' }
    & Pick<ReplaceNumberUpOperation, 'newValue'>
  )>, w?: Maybe<(
    { __typename?: 'ReplaceNumberUpOperation' }
    & Pick<ReplaceNumberUpOperation, 'newValue'>
  )>, h?: Maybe<(
    { __typename?: 'ReplaceNumberUpOperation' }
    & Pick<ReplaceNumberUpOperation, 'newValue'>
  )>, cellX?: Maybe<(
    { __typename?: 'ReplaceNumberUpOperation' }
    & Pick<ReplaceNumberUpOperation, 'newValue'>
  )>, cellY?: Maybe<(
    { __typename?: 'ReplaceNumberUpOperation' }
    & Pick<ReplaceNumberUpOperation, 'newValue'>
  )>, cellW?: Maybe<(
    { __typename?: 'ReplaceNumberUpOperation' }
    & Pick<ReplaceNumberUpOperation, 'newValue'>
  )>, cellH?: Maybe<(
    { __typename?: 'ReplaceNumberUpOperation' }
    & Pick<ReplaceNumberUpOperation, 'newValue'>
  )> }
);

export type PiecesOperationFragment = (
  { __typename?: 'PiecesOperation' }
  & { replace: Array<(
    { __typename?: 'ReplacePieceOperation' }
    & Pick<ReplacePieceOperation, 'boardId' | 'boardCreatedBy'>
    & { newValue?: Maybe<(
      { __typename?: 'PieceValueState' }
      & PieceValueStateFragment
    )> }
  )>, update: Array<(
    { __typename?: 'UpdatePieceOperation' }
    & Pick<UpdatePieceOperation, 'boardId' | 'boardCreatedBy'>
    & { operation: (
      { __typename?: 'PieceOperation' }
      & PieceOperationFragment
    ) }
  )> }
);

export type ParticipantOperationFragment = (
  { __typename?: 'ParticipantOperation' }
  & { name?: Maybe<(
    { __typename?: 'ReplaceStringUpOperation' }
    & Pick<ReplaceStringUpOperation, 'newValue'>
  )>, role?: Maybe<(
    { __typename?: 'ReplaceNullableParticipantRoleUpOperation' }
    & Pick<ReplaceNullableParticipantRoleUpOperation, 'newValue'>
  )>, myNumberValues: (
    { __typename?: 'MyNumberValuesOperation' }
    & { replace: Array<(
      { __typename?: 'ReplaceMyNumberValueOperation' }
      & Pick<ReplaceMyNumberValueOperation, 'stateId'>
      & { newValue?: Maybe<(
        { __typename?: 'MyNumberValueStateValue' }
        & MyNumberValueStateValueFragment
      )> }
    )>, update: Array<(
      { __typename?: 'UpdateMyNumberValueOperation' }
      & Pick<UpdateMyNumberValueOperation, 'stateId'>
      & { operation: (
        { __typename?: 'MyNumberValueOperation' }
        & { isValuePrivate?: Maybe<(
          { __typename?: 'ReplaceBooleanUpOperation' }
          & Pick<ReplaceBooleanUpOperation, 'newValue'>
        )>, value?: Maybe<(
          { __typename?: 'ReplaceNumberUpOperation' }
          & Pick<ReplaceNumberUpOperation, 'newValue'>
        )>, valueRangeMin?: Maybe<(
          { __typename?: 'ReplaceNullableNumberUpOperation' }
          & Pick<ReplaceNullableNumberUpOperation, 'newValue'>
        )>, valueRangeMax?: Maybe<(
          { __typename?: 'ReplaceNullableNumberUpOperation' }
          & Pick<ReplaceNullableNumberUpOperation, 'newValue'>
        )>, pieces: (
          { __typename?: 'PiecesOperation' }
          & PiecesOperationFragment
        ) }
      ) }
    )> }
  ) }
);

export type ParticipantsOperationFragment = (
  { __typename?: 'ParticipantsOperation' }
  & { replace: Array<(
    { __typename?: 'ReplaceParticipantOperation' }
    & Pick<ReplaceParticipantOperation, 'userUid'>
    & { newValue?: Maybe<(
      { __typename?: 'ParticipantValueState' }
      & ParticipantValueStateFragment
    )> }
  )>, update: Array<(
    { __typename?: 'UpdateParticipantOperation' }
    & Pick<UpdateParticipantOperation, 'userUid'>
    & { operation: (
      { __typename?: 'ParticipantOperation' }
      & ParticipantOperationFragment
    ) }
  )> }
);

export type ParticipantValueStateFragment = (
  { __typename?: 'ParticipantValueState' }
  & Pick<ParticipantValueState, 'name' | 'role'>
  & { myNumberValues: Array<(
    { __typename?: 'MyNumberValueState' }
    & Pick<MyNumberValueState, 'stateId'>
    & { value: (
      { __typename?: 'MyNumberValueStateValue' }
      & MyNumberValueStateValueFragment
    ) }
  )> }
);

export type RoomAsListItemFragment = (
  { __typename?: 'RoomAsListItem' }
  & Pick<RoomAsListItem, 'id' | 'name' | 'createdBy' | 'requiresPhraseToJoinAsPlayer' | 'requiresPhraseToJoinAsSpectator'>
);

export type RoomGetStateFragment = (
  { __typename?: 'RoomGetState' }
  & Pick<RoomGetState, 'revision' | 'name' | 'createdBy' | 'publicChannel1Name' | 'publicChannel2Name' | 'publicChannel3Name' | 'publicChannel4Name' | 'publicChannel5Name' | 'publicChannel6Name' | 'publicChannel7Name' | 'publicChannel8Name' | 'publicChannel9Name' | 'publicChannel10Name'>
  & { boards: Array<(
    { __typename?: 'BoardState' }
    & BoardStateFragment
  )>, characters: Array<(
    { __typename?: 'CharacterState' }
    & CharacterStateFragment
  )>, participants: Array<(
    { __typename?: 'ParticipantState' }
    & Pick<ParticipantState, 'userUid'>
    & { value: (
      { __typename?: 'ParticipantValueState' }
      & Pick<ParticipantValueState, 'name' | 'role'>
      & { myNumberValues: Array<(
        { __typename?: 'MyNumberValueState' }
        & Pick<MyNumberValueState, 'stateId'>
        & { value: (
          { __typename?: 'MyNumberValueStateValue' }
          & Pick<MyNumberValueStateValue, 'isValuePrivate' | 'valueRangeMin' | 'valueRangeMax' | 'value'>
          & { pieces: Array<(
            { __typename?: 'PieceState' }
            & PieceStateFragment
          )> }
        ) }
      )> }
    ) }
  )>, paramNames: Array<(
    { __typename?: 'ParamNameState' }
    & Pick<ParamNameState, 'key' | 'type'>
    & { value: (
      { __typename?: 'ParamNameValueState' }
      & Pick<ParamNameValueState, 'name'>
    ) }
  )>, bgms: Array<(
    { __typename?: 'RoomBgmState' }
    & Pick<RoomBgmState, 'channelKey'>
    & { value: (
      { __typename?: 'RoomBgmValueState' }
      & Pick<RoomBgmValueState, 'volume'>
      & { files: Array<(
        { __typename?: 'FilePath' }
        & FilePathFragment
      )> }
    ) }
  )> }
);

export type RoomOperationValueFragment = (
  { __typename?: 'RoomOperationValue' }
  & { boards: (
    { __typename?: 'BoardsOperation' }
    & BoardsOperationFragment
  ), characters: (
    { __typename?: 'CharactersOperation' }
    & CharactersOperationFragment
  ), participants: (
    { __typename?: 'ParticipantsOperation' }
    & ParticipantsOperationFragment
  ), name?: Maybe<(
    { __typename?: 'ReplaceStringUpOperation' }
    & Pick<ReplaceStringUpOperation, 'newValue'>
  )>, publicChannel1Name?: Maybe<(
    { __typename?: 'ReplaceStringUpOperation' }
    & Pick<ReplaceStringUpOperation, 'newValue'>
  )>, publicChannel2Name?: Maybe<(
    { __typename?: 'ReplaceStringUpOperation' }
    & Pick<ReplaceStringUpOperation, 'newValue'>
  )>, publicChannel3Name?: Maybe<(
    { __typename?: 'ReplaceStringUpOperation' }
    & Pick<ReplaceStringUpOperation, 'newValue'>
  )>, publicChannel4Name?: Maybe<(
    { __typename?: 'ReplaceStringUpOperation' }
    & Pick<ReplaceStringUpOperation, 'newValue'>
  )>, publicChannel5Name?: Maybe<(
    { __typename?: 'ReplaceStringUpOperation' }
    & Pick<ReplaceStringUpOperation, 'newValue'>
  )>, publicChannel6Name?: Maybe<(
    { __typename?: 'ReplaceStringUpOperation' }
    & Pick<ReplaceStringUpOperation, 'newValue'>
  )>, publicChannel7Name?: Maybe<(
    { __typename?: 'ReplaceStringUpOperation' }
    & Pick<ReplaceStringUpOperation, 'newValue'>
  )>, publicChannel8Name?: Maybe<(
    { __typename?: 'ReplaceStringUpOperation' }
    & Pick<ReplaceStringUpOperation, 'newValue'>
  )>, publicChannel9Name?: Maybe<(
    { __typename?: 'ReplaceStringUpOperation' }
    & Pick<ReplaceStringUpOperation, 'newValue'>
  )>, publicChannel10Name?: Maybe<(
    { __typename?: 'ReplaceStringUpOperation' }
    & Pick<ReplaceStringUpOperation, 'newValue'>
  )>, bgms: (
    { __typename?: 'RoomBgmsOperation' }
    & { replace: Array<(
      { __typename?: 'ReplaceRoomBgmOperation' }
      & Pick<ReplaceRoomBgmOperation, 'channelKey'>
      & { newValue?: Maybe<(
        { __typename?: 'RoomBgmValueState' }
        & Pick<RoomBgmValueState, 'volume'>
        & { files: Array<(
          { __typename?: 'FilePath' }
          & FilePathFragment
        )> }
      )> }
    )>, update: Array<(
      { __typename?: 'UpdateRoomBgmOperation' }
      & Pick<UpdateRoomBgmOperation, 'channelKey'>
      & { operation: (
        { __typename?: 'RoomBgmOperation' }
        & { files?: Maybe<(
          { __typename?: 'ReplaceFilePathArrayUpOperation' }
          & { newValue: Array<(
            { __typename?: 'FilePath' }
            & FilePathFragment
          )> }
        )>, volume?: Maybe<(
          { __typename?: 'ReplaceNumberUpOperation' }
          & Pick<ReplaceNumberUpOperation, 'newValue'>
        )> }
      ) }
    )> }
  ), paramNames: (
    { __typename?: 'ParamNamesOperation' }
    & { replace: Array<(
      { __typename?: 'ReplaceParamNameOperation' }
      & Pick<ReplaceParamNameOperation, 'key' | 'type'>
      & { newValue?: Maybe<(
        { __typename?: 'ParamNameValueState' }
        & Pick<ParamNameValueState, 'name'>
      )> }
    )>, update: Array<(
      { __typename?: 'UpdateParamNameOperation' }
      & Pick<UpdateParamNameOperation, 'key' | 'type'>
      & { operation: (
        { __typename?: 'ParamNameOperation' }
        & { name?: Maybe<(
          { __typename?: 'ReplaceStringUpOperation' }
          & Pick<ReplaceStringUpOperation, 'newValue'>
        )> }
      ) }
    )> }
  ) }
);

export type RoomOperationFragment = (
  { __typename?: 'RoomOperation' }
  & Pick<RoomOperation, 'revisionTo'>
  & { operatedBy?: Maybe<(
    { __typename?: 'OperatedBy' }
    & Pick<OperatedBy, 'userUid' | 'clientId'>
  )>, value: (
    { __typename?: 'RoomOperationValue' }
    & RoomOperationValueFragment
  ) }
);

export type RoomPublicChannelFragment = (
  { __typename?: 'RoomPublicChannel' }
  & Pick<RoomPublicChannel, 'key' | 'name'>
);

export type RoomPublicMessageFragment = (
  { __typename?: 'RoomPublicMessage' }
  & Pick<RoomPublicMessage, 'messageId' | 'channelKey' | 'text' | 'textColor' | 'altTextToSecret' | 'isSecret' | 'createdBy' | 'customName' | 'createdAt' | 'updatedAt'>
  & { commandResult?: Maybe<(
    { __typename?: 'CommandResult' }
    & Pick<CommandResult, 'text' | 'isSuccess'>
  )>, character?: Maybe<(
    { __typename?: 'CharacterValueForMessage' }
    & CharacterValueForMessageFragment
  )> }
);

export type RoomPrivateMessageFragment = (
  { __typename?: 'RoomPrivateMessage' }
  & Pick<RoomPrivateMessage, 'messageId' | 'visibleTo' | 'text' | 'textColor' | 'altTextToSecret' | 'isSecret' | 'createdBy' | 'customName' | 'createdAt' | 'updatedAt'>
  & { commandResult?: Maybe<(
    { __typename?: 'CommandResult' }
    & Pick<CommandResult, 'text' | 'isSuccess'>
  )>, character?: Maybe<(
    { __typename?: 'CharacterValueForMessage' }
    & CharacterValueForMessageFragment
  )> }
);

export type RoomSoundEffectFragment = (
  { __typename?: 'RoomSoundEffect' }
  & Pick<RoomSoundEffect, 'messageId' | 'createdBy' | 'createdAt' | 'volume'>
  & { file: (
    { __typename?: 'FilePath' }
    & FilePathFragment
  ) }
);

type RoomMessageEvent_MyValueLog_Fragment = (
  { __typename?: 'MyValueLog' }
  & MyValueLogFragment
);

type RoomMessageEvent_RoomPrivateMessage_Fragment = (
  { __typename?: 'RoomPrivateMessage' }
  & RoomPrivateMessageFragment
);

type RoomMessageEvent_RoomPrivateMessageUpdate_Fragment = (
  { __typename?: 'RoomPrivateMessageUpdate' }
  & Pick<RoomPrivateMessageUpdate, 'messageId' | 'text' | 'altTextToSecret' | 'isSecret' | 'updatedAt'>
  & { commandResult?: Maybe<(
    { __typename?: 'CommandResult' }
    & Pick<CommandResult, 'text' | 'isSuccess'>
  )> }
);

type RoomMessageEvent_RoomPublicChannel_Fragment = (
  { __typename?: 'RoomPublicChannel' }
  & RoomPublicChannelFragment
);

type RoomMessageEvent_RoomPublicChannelUpdate_Fragment = (
  { __typename?: 'RoomPublicChannelUpdate' }
  & Pick<RoomPublicChannelUpdate, 'key' | 'name'>
);

type RoomMessageEvent_RoomPublicMessage_Fragment = (
  { __typename?: 'RoomPublicMessage' }
  & RoomPublicMessageFragment
);

type RoomMessageEvent_RoomPublicMessageUpdate_Fragment = (
  { __typename?: 'RoomPublicMessageUpdate' }
  & Pick<RoomPublicMessageUpdate, 'messageId' | 'text' | 'altTextToSecret' | 'isSecret' | 'updatedAt'>
  & { commandResult?: Maybe<(
    { __typename?: 'CommandResult' }
    & Pick<CommandResult, 'text' | 'isSuccess'>
  )> }
);

type RoomMessageEvent_RoomSoundEffect_Fragment = (
  { __typename?: 'RoomSoundEffect' }
  & RoomSoundEffectFragment
);

export type RoomMessageEventFragment = RoomMessageEvent_MyValueLog_Fragment | RoomMessageEvent_RoomPrivateMessage_Fragment | RoomMessageEvent_RoomPrivateMessageUpdate_Fragment | RoomMessageEvent_RoomPublicChannel_Fragment | RoomMessageEvent_RoomPublicChannelUpdate_Fragment | RoomMessageEvent_RoomPublicMessage_Fragment | RoomMessageEvent_RoomPublicMessageUpdate_Fragment | RoomMessageEvent_RoomSoundEffect_Fragment;

export type SemVerFragment = (
  { __typename?: 'SemVer' }
  & Pick<SemVer, 'major' | 'minor' | 'patch'>
  & { prerelease?: Maybe<(
    { __typename?: 'Prerelease' }
    & Pick<Prerelease, 'type' | 'version'>
  )> }
);

export type TextUpOperationUnitFragment = (
  { __typename?: 'TextUpOperationUnit' }
  & Pick<TextUpOperationUnit, 'retain' | 'insert' | 'delete'>
);

export type GetRoomQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetRoomQuery = (
  { __typename?: 'Query' }
  & { result: (
    { __typename?: 'GetJoinedRoomResult' }
    & Pick<GetJoinedRoomResult, 'role'>
    & { room: (
      { __typename?: 'RoomGetState' }
      & RoomGetStateFragment
    ) }
  ) | (
    { __typename?: 'GetNonJoinedRoomResult' }
    & { roomAsListItem: (
      { __typename?: 'RoomAsListItem' }
      & RoomAsListItemFragment
    ) }
  ) | (
    { __typename?: 'GetRoomFailureResult' }
    & Pick<GetRoomFailureResult, 'failureType'>
  ) }
);

export type GetRoomsListQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRoomsListQuery = (
  { __typename?: 'Query' }
  & { result: (
    { __typename?: 'GetRoomsListFailureResult' }
    & Pick<GetRoomsListFailureResult, 'failureType'>
  ) | (
    { __typename?: 'GetRoomsListSuccessResult' }
    & { rooms: Array<(
      { __typename?: 'RoomAsListItem' }
      & RoomAsListItemFragment
    )> }
  ) }
);

export type GetMessagesQueryVariables = Exact<{
  roomId: Scalars['String'];
}>;


export type GetMessagesQuery = (
  { __typename?: 'Query' }
  & { result: { __typename?: 'GetRoomMessagesFailureResult' } | (
    { __typename?: 'RoomMessages' }
    & { publicMessages: Array<(
      { __typename?: 'RoomPublicMessage' }
      & RoomPublicMessageFragment
    )>, privateMessages: Array<(
      { __typename?: 'RoomPrivateMessage' }
      & RoomPrivateMessageFragment
    )>, myValueLogs: Array<(
      { __typename?: 'MyValueLog' }
      & MyValueLogFragment
    )>, publicChannels: Array<(
      { __typename?: 'RoomPublicChannel' }
      & RoomPublicChannelFragment
    )>, soundEffects: Array<(
      { __typename?: 'RoomSoundEffect' }
      & RoomSoundEffectFragment
    )> }
  ) }
);

export type GetLogQueryVariables = Exact<{
  roomId: Scalars['String'];
}>;


export type GetLogQuery = (
  { __typename?: 'Query' }
  & { result: (
    { __typename?: 'GetRoomLogFailureResult' }
    & Pick<GetRoomLogFailureResult, 'failureType'>
  ) | (
    { __typename?: 'RoomMessages' }
    & { publicMessages: Array<(
      { __typename?: 'RoomPublicMessage' }
      & RoomPublicMessageFragment
    )>, privateMessages: Array<(
      { __typename?: 'RoomPrivateMessage' }
      & RoomPrivateMessageFragment
    )>, myValueLogs: Array<(
      { __typename?: 'MyValueLog' }
      & MyValueLogFragment
    )>, publicChannels: Array<(
      { __typename?: 'RoomPublicChannel' }
      & RoomPublicChannelFragment
    )>, soundEffects: Array<(
      { __typename?: 'RoomSoundEffect' }
      & RoomSoundEffectFragment
    )> }
  ) }
);

export type GetServerInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetServerInfoQuery = (
  { __typename?: 'Query' }
  & { result: (
    { __typename?: 'ServerInfo' }
    & { version: (
      { __typename?: 'SemVer' }
      & SemVerFragment
    ) }
  ) }
);

export type ListAvailableGameSystemsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListAvailableGameSystemsQuery = (
  { __typename?: 'Query' }
  & { result: (
    { __typename?: 'ListAvailableGameSystemsResult' }
    & { value: Array<(
      { __typename?: 'AvailableGameSystem' }
      & Pick<AvailableGameSystem, 'id' | 'name' | 'sortKey'>
    )> }
  ) }
);

export type RequiresPhraseToJoinAsPlayerQueryVariables = Exact<{
  roomId: Scalars['String'];
}>;


export type RequiresPhraseToJoinAsPlayerQuery = (
  { __typename?: 'Query' }
  & { result: (
    { __typename?: 'RequiresPhraseFailureResult' }
    & Pick<RequiresPhraseFailureResult, 'failureType'>
  ) | (
    { __typename?: 'RequiresPhraseSuccessResult' }
    & Pick<RequiresPhraseSuccessResult, 'value'>
  ) }
);

export type ChangeParticipantNameMutationVariables = Exact<{
  roomId: Scalars['String'];
  newName: Scalars['String'];
}>;


export type ChangeParticipantNameMutation = (
  { __typename?: 'Mutation' }
  & { result: (
    { __typename?: 'ChangeParticipantNameResult' }
    & Pick<ChangeParticipantNameResult, 'failureType'>
  ) }
);

export type CreateRoomMutationVariables = Exact<{
  input: CreateRoomInput;
}>;


export type CreateRoomMutation = (
  { __typename?: 'Mutation' }
  & { result: (
    { __typename?: 'CreateRoomFailureResult' }
    & Pick<CreateRoomFailureResult, 'failureType'>
  ) | (
    { __typename?: 'CreateRoomSuccessResult' }
    & CreateRoomResult_CreateRoomSuccessResult_Fragment
  ) }
);

export type DeleteRoomMutationVariables = Exact<{
  id: Scalars['String'];
}>;


export type DeleteRoomMutation = (
  { __typename?: 'Mutation' }
  & { result: (
    { __typename?: 'DeleteRoomResult' }
    & Pick<DeleteRoomResult, 'failureType'>
  ) }
);

export type JoinRoomAsPlayerMutationVariables = Exact<{
  id: Scalars['String'];
  name: Scalars['String'];
  phrase?: Maybe<Scalars['String']>;
}>;


export type JoinRoomAsPlayerMutation = (
  { __typename?: 'Mutation' }
  & { result: (
    { __typename?: 'JoinRoomFailureResult' }
    & JoinRoomResult_JoinRoomFailureResult_Fragment
  ) | (
    { __typename?: 'JoinRoomSuccessResult' }
    & JoinRoomResult_JoinRoomSuccessResult_Fragment
  ) }
);

export type JoinRoomAsSpectatorMutationVariables = Exact<{
  id: Scalars['String'];
  name: Scalars['String'];
  phrase?: Maybe<Scalars['String']>;
}>;


export type JoinRoomAsSpectatorMutation = (
  { __typename?: 'Mutation' }
  & { result: (
    { __typename?: 'JoinRoomFailureResult' }
    & JoinRoomResult_JoinRoomFailureResult_Fragment
  ) | (
    { __typename?: 'JoinRoomSuccessResult' }
    & JoinRoomResult_JoinRoomSuccessResult_Fragment
  ) }
);

export type EntryToServerMutationVariables = Exact<{
  phrase: Scalars['String'];
}>;


export type EntryToServerMutation = (
  { __typename?: 'Mutation' }
  & { result: (
    { __typename?: 'EntryToServerResult' }
    & Pick<EntryToServerResult, 'type'>
  ) }
);

export type LeaveRoomMutationVariables = Exact<{
  id: Scalars['String'];
}>;


export type LeaveRoomMutation = (
  { __typename?: 'Mutation' }
  & { result: (
    { __typename?: 'LeaveRoomResult' }
    & Pick<LeaveRoomResult, 'failureType'>
  ) }
);

export type OperateMutationVariables = Exact<{
  id: Scalars['String'];
  revisionFrom: Scalars['Int'];
  operation: RoomOperationInput;
  requestId: Scalars['String'];
}>;


export type OperateMutation = (
  { __typename?: 'Mutation' }
  & { result: (
    { __typename?: 'OperateRoomFailureResult' }
    & Pick<OperateRoomFailureResult, 'failureType'>
  ) | (
    { __typename?: 'OperateRoomIdResult' }
    & Pick<OperateRoomIdResult, 'requestId'>
  ) | (
    { __typename?: 'OperateRoomNonJoinedResult' }
    & { roomAsListItem: (
      { __typename?: 'RoomAsListItem' }
      & RoomAsListItemFragment
    ) }
  ) | (
    { __typename?: 'OperateRoomSuccessResult' }
    & { operation: (
      { __typename?: 'RoomOperation' }
      & RoomOperationFragment
    ) }
  ) }
);

export type PingMutationVariables = Exact<{
  value: Scalars['Float'];
}>;


export type PingMutation = (
  { __typename?: 'Mutation' }
  & { result: (
    { __typename?: 'Pong' }
    & Pick<Pong, 'createdBy' | 'value'>
  ) }
);

export type PromoteToPlayerMutationVariables = Exact<{
  roomId: Scalars['String'];
  phrase?: Maybe<Scalars['String']>;
}>;


export type PromoteToPlayerMutation = (
  { __typename?: 'Mutation' }
  & { result: (
    { __typename?: 'PromoteResult' }
    & Pick<PromoteResult, 'failureType'>
  ) }
);

export type WritePublicMessageMutationVariables = Exact<{
  roomId: Scalars['String'];
  text: Scalars['String'];
  textColor?: Maybe<Scalars['String']>;
  channelKey: Scalars['String'];
  characterStateId?: Maybe<Scalars['String']>;
  customName?: Maybe<Scalars['String']>;
  gameType?: Maybe<Scalars['String']>;
}>;


export type WritePublicMessageMutation = (
  { __typename?: 'Mutation' }
  & { result: (
    { __typename?: 'RoomPublicMessage' }
    & RoomPublicMessageFragment
  ) | (
    { __typename?: 'WritePublicRoomMessageFailureResult' }
    & Pick<WritePublicRoomMessageFailureResult, 'failureType'>
  ) }
);

export type WritePrivateMessageMutationVariables = Exact<{
  roomId: Scalars['String'];
  visibleTo: Array<Scalars['String']> | Scalars['String'];
  text: Scalars['String'];
  textColor?: Maybe<Scalars['String']>;
  characterStateId?: Maybe<Scalars['String']>;
  customName?: Maybe<Scalars['String']>;
}>;


export type WritePrivateMessageMutation = (
  { __typename?: 'Mutation' }
  & { result: (
    { __typename?: 'RoomPrivateMessage' }
    & RoomPrivateMessageFragment
  ) | (
    { __typename?: 'WritePrivateRoomMessageFailureResult' }
    & Pick<WritePrivateRoomMessageFailureResult, 'failureType'>
  ) }
);

export type WriteRoomSoundEffectMutationVariables = Exact<{
  roomId: Scalars['String'];
  file: FilePathInput;
  volume: Scalars['Float'];
}>;


export type WriteRoomSoundEffectMutation = (
  { __typename?: 'Mutation' }
  & { result: (
    { __typename?: 'RoomSoundEffect' }
    & RoomSoundEffectFragment
  ) | (
    { __typename?: 'WriteRoomSoundEffectFailureResult' }
    & Pick<WriteRoomSoundEffectFailureResult, 'failureType'>
  ) }
);

export type EditMessageMutationVariables = Exact<{
  roomId: Scalars['String'];
  messageId: Scalars['String'];
  text: Scalars['String'];
}>;


export type EditMessageMutation = (
  { __typename?: 'Mutation' }
  & { result: (
    { __typename?: 'EditMessageResult' }
    & Pick<EditMessageResult, 'failureType'>
  ) }
);

export type DeleteMessageMutationVariables = Exact<{
  roomId: Scalars['String'];
  messageId: Scalars['String'];
}>;


export type DeleteMessageMutation = (
  { __typename?: 'Mutation' }
  & { result: (
    { __typename?: 'DeleteMessageResult' }
    & Pick<DeleteMessageResult, 'failureType'>
  ) }
);

export type MakeMessageNotSecretMutationVariables = Exact<{
  roomId: Scalars['String'];
  messageId: Scalars['String'];
}>;


export type MakeMessageNotSecretMutation = (
  { __typename?: 'Mutation' }
  & { result: (
    { __typename?: 'MakeMessageNotSecretResult' }
    & Pick<MakeMessageNotSecretResult, 'failureType'>
  ) }
);

export type RoomOperatedSubscriptionVariables = Exact<{
  id: Scalars['String'];
}>;


export type RoomOperatedSubscription = (
  { __typename?: 'Subscription' }
  & { roomOperated?: Maybe<(
    { __typename?: 'DeleteRoomOperation' }
    & Pick<DeleteRoomOperation, 'deletedBy'>
  ) | (
    { __typename?: 'RoomOperation' }
    & RoomOperationFragment
  )> }
);

export type MessageEventSubscriptionVariables = Exact<{
  roomId: Scalars['String'];
}>;


export type MessageEventSubscription = (
  { __typename?: 'Subscription' }
  & { messageEvent?: Maybe<(
    { __typename?: 'MyValueLog' }
    & RoomMessageEvent_MyValueLog_Fragment
  ) | (
    { __typename?: 'RoomPrivateMessage' }
    & RoomMessageEvent_RoomPrivateMessage_Fragment
  ) | (
    { __typename?: 'RoomPrivateMessageUpdate' }
    & RoomMessageEvent_RoomPrivateMessageUpdate_Fragment
  ) | (
    { __typename?: 'RoomPublicChannel' }
    & RoomMessageEvent_RoomPublicChannel_Fragment
  ) | (
    { __typename?: 'RoomPublicChannelUpdate' }
    & RoomMessageEvent_RoomPublicChannelUpdate_Fragment
  ) | (
    { __typename?: 'RoomPublicMessage' }
    & RoomMessageEvent_RoomPublicMessage_Fragment
  ) | (
    { __typename?: 'RoomPublicMessageUpdate' }
    & RoomMessageEvent_RoomPublicMessageUpdate_Fragment
  ) | (
    { __typename?: 'RoomSoundEffect' }
    & RoomMessageEvent_RoomSoundEffect_Fragment
  )> }
);

export type PongSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type PongSubscription = (
  { __typename?: 'Subscription' }
  & { pong: (
    { __typename?: 'Pong' }
    & Pick<Pong, 'createdBy' | 'value'>
  ) }
);

export const FilePathFragmentDoc = gql`
    fragment FilePath on FilePath {
  sourceType
  path
}
    `;
export const BoardValueStateFragmentDoc = gql`
    fragment BoardValueState on BoardValueState {
  name
  cellWidth
  cellHeight
  cellRowCount
  cellColumnCount
  cellOffsetX
  cellOffsetY
  backgroundImage {
    ...FilePath
  }
  backgroundImageZoom
}
    ${FilePathFragmentDoc}`;
export const BoardStateFragmentDoc = gql`
    fragment BoardState on BoardState {
  id
  createdBy
  value {
    ...BoardValueState
  }
}
    ${BoardValueStateFragmentDoc}`;
export const PieceValueStateFragmentDoc = gql`
    fragment PieceValueState on PieceValueState {
  isPrivate
  isCellMode
  x
  y
  w
  h
  cellX
  cellY
  cellW
  cellH
}
    `;
export const PieceStateFragmentDoc = gql`
    fragment PieceState on PieceState {
  boardId
  boardCreatedBy
  value {
    ...PieceValueState
  }
}
    ${PieceValueStateFragmentDoc}`;
export const BoardLocationValueStateFragmentDoc = gql`
    fragment BoardLocationValueState on BoardLocationValueState {
  isPrivate
  x
  y
  w
  h
}
    `;
export const BoardLocationStateFragmentDoc = gql`
    fragment BoardLocationState on BoardLocationState {
  boardId
  boardCreatedBy
  value {
    ...BoardLocationValueState
  }
}
    ${BoardLocationValueStateFragmentDoc}`;
export const CharacterValueStateFragmentDoc = gql`
    fragment CharacterValueState on CharacterValueState {
  isPrivate
  name
  image {
    ...FilePath
  }
  tachieImage {
    ...FilePath
  }
  pieces {
    ...PieceState
  }
  tachieLocations {
    ...BoardLocationState
  }
  boolParams {
    key
    value {
      isValuePrivate
      value
    }
  }
  numParams {
    key
    value {
      isValuePrivate
      value
    }
  }
  numMaxParams {
    key
    value {
      isValuePrivate
      value
    }
  }
  strParams {
    key
    value {
      isValuePrivate
      value
    }
  }
}
    ${FilePathFragmentDoc}
${PieceStateFragmentDoc}
${BoardLocationStateFragmentDoc}`;
export const CharacterStateFragmentDoc = gql`
    fragment CharacterState on CharacterState {
  id
  createdBy
  value {
    ...CharacterValueState
  }
}
    ${CharacterValueStateFragmentDoc}`;
export const RoomGetStateFragmentDoc = gql`
    fragment RoomGetState on RoomGetState {
  revision
  name
  createdBy
  publicChannel1Name
  publicChannel2Name
  publicChannel3Name
  publicChannel4Name
  publicChannel5Name
  publicChannel6Name
  publicChannel7Name
  publicChannel8Name
  publicChannel9Name
  publicChannel10Name
  boards {
    ...BoardState
  }
  characters {
    ...CharacterState
  }
  participants {
    userUid
    value {
      name
      role
      myNumberValues {
        stateId
        value {
          isValuePrivate
          valueRangeMin
          valueRangeMax
          value
          pieces {
            ...PieceState
          }
        }
      }
    }
  }
  paramNames {
    key
    type
    value {
      name
    }
  }
  bgms {
    channelKey
    value {
      files {
        ...FilePath
      }
      volume
    }
  }
}
    ${BoardStateFragmentDoc}
${CharacterStateFragmentDoc}
${PieceStateFragmentDoc}
${FilePathFragmentDoc}`;
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
    ${RoomGetStateFragmentDoc}`;
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
    ${RoomAsListItemFragmentDoc}`;
export const GetNonJoinedRoomResultFragmentDoc = gql`
    fragment GetNonJoinedRoomResult on GetNonJoinedRoomResult {
  roomAsListItem {
    ...RoomAsListItem
  }
}
    ${RoomAsListItemFragmentDoc}`;
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
${GetNonJoinedRoomResultFragmentDoc}`;
export const BoardOperationFragmentDoc = gql`
    fragment BoardOperation on BoardOperation {
  name {
    newValue
  }
  cellWidth {
    newValue
  }
  cellHeight {
    newValue
  }
  cellRowCount {
    newValue
  }
  cellColumnCount {
    newValue
  }
  cellOffsetX {
    newValue
  }
  cellOffsetY {
    newValue
  }
  backgroundImage {
    newValue {
      ...FilePath
    }
  }
  backgroundImageZoom {
    newValue
  }
}
    ${FilePathFragmentDoc}`;
export const BoardsOperationFragmentDoc = gql`
    fragment BoardsOperation on BoardsOperation {
  replace {
    id
    createdBy
    newValue {
      ...BoardValueState
    }
  }
  update {
    id
    createdBy
    operation {
      ...BoardOperation
    }
  }
}
    ${BoardValueStateFragmentDoc}
${BoardOperationFragmentDoc}`;
export const TextUpOperationUnitFragmentDoc = gql`
    fragment TextUpOperationUnit on TextUpOperationUnit {
  retain
  insert
  delete
}
    `;
export const PieceOperationFragmentDoc = gql`
    fragment PieceOperation on PieceOperation {
  isPrivate {
    newValue
  }
  isCellMode {
    newValue
  }
  x {
    newValue
  }
  y {
    newValue
  }
  w {
    newValue
  }
  h {
    newValue
  }
  cellX {
    newValue
  }
  cellY {
    newValue
  }
  cellW {
    newValue
  }
  cellH {
    newValue
  }
}
    `;
export const PiecesOperationFragmentDoc = gql`
    fragment PiecesOperation on PiecesOperation {
  replace {
    boardId
    boardCreatedBy
    newValue {
      ...PieceValueState
    }
  }
  update {
    boardId
    boardCreatedBy
    operation {
      ...PieceOperation
    }
  }
}
    ${PieceValueStateFragmentDoc}
${PieceOperationFragmentDoc}`;
export const BoardLocationOperationFragmentDoc = gql`
    fragment BoardLocationOperation on BoardLocationOperation {
  isPrivate {
    newValue
  }
  x {
    newValue
  }
  y {
    newValue
  }
  w {
    newValue
  }
  h {
    newValue
  }
}
    `;
export const BoardLocationsOperationFragmentDoc = gql`
    fragment BoardLocationsOperation on BoardLocationsOperation {
  replace {
    boardId
    boardCreatedBy
    newValue {
      ...BoardLocationValueState
    }
  }
  update {
    boardId
    boardCreatedBy
    operation {
      ...BoardLocationOperation
    }
  }
}
    ${BoardLocationValueStateFragmentDoc}
${BoardLocationOperationFragmentDoc}`;
export const CharacterOperationFragmentDoc = gql`
    fragment CharacterOperation on CharacterOperation {
  isPrivate {
    newValue
  }
  name {
    newValue
  }
  boolParams {
    update {
      key
      operation {
        isValuePrivate {
          newValue
        }
        value {
          newValue
        }
      }
    }
  }
  numParams {
    update {
      key
      operation {
        isValuePrivate {
          newValue
        }
        value {
          newValue
        }
      }
    }
  }
  numMaxParams {
    update {
      key
      operation {
        isValuePrivate {
          newValue
        }
        value {
          newValue
        }
      }
    }
  }
  strParams {
    update {
      key
      operation {
        isValuePrivate {
          newValue
        }
        value {
          ...TextUpOperationUnit
        }
      }
    }
  }
  image {
    newValue {
      ...FilePath
    }
  }
  tachieImage {
    newValue {
      ...FilePath
    }
  }
  pieces {
    ...PiecesOperation
  }
  tachieLocations {
    ...BoardLocationsOperation
  }
}
    ${TextUpOperationUnitFragmentDoc}
${FilePathFragmentDoc}
${PiecesOperationFragmentDoc}
${BoardLocationsOperationFragmentDoc}`;
export const CharactersOperationFragmentDoc = gql`
    fragment CharactersOperation on CharactersOperation {
  replace {
    id
    createdBy
    newValue {
      ...CharacterValueState
    }
  }
  update {
    id
    createdBy
    operation {
      ...CharacterOperation
    }
  }
}
    ${CharacterValueStateFragmentDoc}
${CharacterOperationFragmentDoc}`;
export const MyNumberValueStateValueFragmentDoc = gql`
    fragment MyNumberValueStateValue on MyNumberValueStateValue {
  isValuePrivate
  value
  valueRangeMin
  valueRangeMax
  pieces {
    ...PieceState
  }
}
    ${PieceStateFragmentDoc}`;
export const ParticipantValueStateFragmentDoc = gql`
    fragment ParticipantValueState on ParticipantValueState {
  name
  role
  myNumberValues {
    stateId
    value {
      ...MyNumberValueStateValue
    }
  }
}
    ${MyNumberValueStateValueFragmentDoc}`;
export const ParticipantOperationFragmentDoc = gql`
    fragment ParticipantOperation on ParticipantOperation {
  name {
    newValue
  }
  role {
    newValue
  }
  myNumberValues {
    replace {
      stateId
      newValue {
        ...MyNumberValueStateValue
      }
    }
    update {
      stateId
      operation {
        isValuePrivate {
          newValue
        }
        value {
          newValue
        }
        valueRangeMin {
          newValue
        }
        valueRangeMax {
          newValue
        }
        pieces {
          ...PiecesOperation
        }
      }
    }
  }
}
    ${MyNumberValueStateValueFragmentDoc}
${PiecesOperationFragmentDoc}`;
export const ParticipantsOperationFragmentDoc = gql`
    fragment ParticipantsOperation on ParticipantsOperation {
  replace {
    userUid
    newValue {
      ...ParticipantValueState
    }
  }
  update {
    userUid
    operation {
      ...ParticipantOperation
    }
  }
}
    ${ParticipantValueStateFragmentDoc}
${ParticipantOperationFragmentDoc}`;
export const RoomOperationValueFragmentDoc = gql`
    fragment RoomOperationValue on RoomOperationValue {
  boards {
    ...BoardsOperation
  }
  characters {
    ...CharactersOperation
  }
  participants {
    ...ParticipantsOperation
  }
  name {
    newValue
  }
  publicChannel1Name {
    newValue
  }
  publicChannel2Name {
    newValue
  }
  publicChannel3Name {
    newValue
  }
  publicChannel4Name {
    newValue
  }
  publicChannel5Name {
    newValue
  }
  publicChannel6Name {
    newValue
  }
  publicChannel7Name {
    newValue
  }
  publicChannel8Name {
    newValue
  }
  publicChannel9Name {
    newValue
  }
  publicChannel10Name {
    newValue
  }
  bgms {
    replace {
      channelKey
      newValue {
        files {
          ...FilePath
        }
        volume
      }
    }
    update {
      channelKey
      operation {
        files {
          newValue {
            ...FilePath
          }
        }
        volume {
          newValue
        }
      }
    }
  }
  paramNames {
    replace {
      key
      type
      newValue {
        name
      }
    }
    update {
      key
      type
      operation {
        name {
          newValue
        }
      }
    }
  }
}
    ${BoardsOperationFragmentDoc}
${CharactersOperationFragmentDoc}
${ParticipantsOperationFragmentDoc}
${FilePathFragmentDoc}`;
export const RoomOperationFragmentDoc = gql`
    fragment RoomOperation on RoomOperation {
  revisionTo
  operatedBy {
    userUid
    clientId
  }
  value {
    ...RoomOperationValue
  }
}
    ${RoomOperationValueFragmentDoc}`;
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
    ${RoomOperationFragmentDoc}`;
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
    ${FilePathFragmentDoc}`;
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
    ${FilePathFragmentDoc}`;
export const RoomPublicMessageFragmentDoc = gql`
    fragment RoomPublicMessage on RoomPublicMessage {
  messageId
  channelKey
  text
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
    ${CharacterValueForMessageFragmentDoc}`;
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
  text
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
    ${CharacterValueForMessageFragmentDoc}`;
export const MyValueLogFragmentDoc = gql`
    fragment MyValueLog on MyValueLog {
  messageId
  stateUserUid
  stateId
  createdAt
  myValueType
  valueChanged
  isValuePrivateChanged
  replaceType
  createdPieces {
    createdBy
    stateId
  }
  deletedPieces {
    createdBy
    stateId
  }
  movedPieces {
    createdBy
    stateId
  }
  resizedPieces {
    createdBy
    stateId
  }
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
  ... on MyValueLog {
    ...MyValueLog
  }
  ... on RoomPublicChannelUpdate {
    key
    name
  }
  ... on RoomPublicMessageUpdate {
    messageId
    text
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
    text
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
${MyValueLogFragmentDoc}`;
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
${RoomAsListItemFragmentDoc}`;

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
export function useGetRoomQuery(baseOptions: Apollo.QueryHookOptions<GetRoomQuery, GetRoomQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRoomQuery, GetRoomQueryVariables>(GetRoomDocument, options);
      }
export function useGetRoomLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRoomQuery, GetRoomQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
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
    ${RoomAsListItemFragmentDoc}`;

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
export function useGetRoomsListQuery(baseOptions?: Apollo.QueryHookOptions<GetRoomsListQuery, GetRoomsListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRoomsListQuery, GetRoomsListQueryVariables>(GetRoomsListDocument, options);
      }
export function useGetRoomsListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRoomsListQuery, GetRoomsListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRoomsListQuery, GetRoomsListQueryVariables>(GetRoomsListDocument, options);
        }
export type GetRoomsListQueryHookResult = ReturnType<typeof useGetRoomsListQuery>;
export type GetRoomsListLazyQueryHookResult = ReturnType<typeof useGetRoomsListLazyQuery>;
export type GetRoomsListQueryResult = Apollo.QueryResult<GetRoomsListQuery, GetRoomsListQueryVariables>;
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
      myValueLogs {
        ...MyValueLog
      }
      publicChannels {
        ...RoomPublicChannel
      }
      soundEffects {
        ...RoomSoundEffect
      }
    }
  }
}
    ${RoomPublicMessageFragmentDoc}
${RoomPrivateMessageFragmentDoc}
${MyValueLogFragmentDoc}
${RoomPublicChannelFragmentDoc}
${RoomSoundEffectFragmentDoc}`;

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
export function useGetMessagesQuery(baseOptions: Apollo.QueryHookOptions<GetMessagesQuery, GetMessagesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMessagesQuery, GetMessagesQueryVariables>(GetMessagesDocument, options);
      }
export function useGetMessagesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMessagesQuery, GetMessagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMessagesQuery, GetMessagesQueryVariables>(GetMessagesDocument, options);
        }
export type GetMessagesQueryHookResult = ReturnType<typeof useGetMessagesQuery>;
export type GetMessagesLazyQueryHookResult = ReturnType<typeof useGetMessagesLazyQuery>;
export type GetMessagesQueryResult = Apollo.QueryResult<GetMessagesQuery, GetMessagesQueryVariables>;
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
      myValueLogs {
        ...MyValueLog
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
${MyValueLogFragmentDoc}
${RoomPublicChannelFragmentDoc}
${RoomSoundEffectFragmentDoc}`;

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
export function useGetLogQuery(baseOptions: Apollo.QueryHookOptions<GetLogQuery, GetLogQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLogQuery, GetLogQueryVariables>(GetLogDocument, options);
      }
export function useGetLogLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLogQuery, GetLogQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLogQuery, GetLogQueryVariables>(GetLogDocument, options);
        }
export type GetLogQueryHookResult = ReturnType<typeof useGetLogQuery>;
export type GetLogLazyQueryHookResult = ReturnType<typeof useGetLogLazyQuery>;
export type GetLogQueryResult = Apollo.QueryResult<GetLogQuery, GetLogQueryVariables>;
export const GetServerInfoDocument = gql`
    query GetServerInfo {
  result: getServerInfo {
    version {
      ...SemVer
    }
  }
}
    ${SemVerFragmentDoc}`;

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
export function useGetServerInfoQuery(baseOptions?: Apollo.QueryHookOptions<GetServerInfoQuery, GetServerInfoQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetServerInfoQuery, GetServerInfoQueryVariables>(GetServerInfoDocument, options);
      }
export function useGetServerInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetServerInfoQuery, GetServerInfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetServerInfoQuery, GetServerInfoQueryVariables>(GetServerInfoDocument, options);
        }
export type GetServerInfoQueryHookResult = ReturnType<typeof useGetServerInfoQuery>;
export type GetServerInfoLazyQueryHookResult = ReturnType<typeof useGetServerInfoLazyQuery>;
export type GetServerInfoQueryResult = Apollo.QueryResult<GetServerInfoQuery, GetServerInfoQueryVariables>;
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
export function useListAvailableGameSystemsQuery(baseOptions?: Apollo.QueryHookOptions<ListAvailableGameSystemsQuery, ListAvailableGameSystemsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListAvailableGameSystemsQuery, ListAvailableGameSystemsQueryVariables>(ListAvailableGameSystemsDocument, options);
      }
export function useListAvailableGameSystemsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListAvailableGameSystemsQuery, ListAvailableGameSystemsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListAvailableGameSystemsQuery, ListAvailableGameSystemsQueryVariables>(ListAvailableGameSystemsDocument, options);
        }
export type ListAvailableGameSystemsQueryHookResult = ReturnType<typeof useListAvailableGameSystemsQuery>;
export type ListAvailableGameSystemsLazyQueryHookResult = ReturnType<typeof useListAvailableGameSystemsLazyQuery>;
export type ListAvailableGameSystemsQueryResult = Apollo.QueryResult<ListAvailableGameSystemsQuery, ListAvailableGameSystemsQueryVariables>;
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
export function useRequiresPhraseToJoinAsPlayerQuery(baseOptions: Apollo.QueryHookOptions<RequiresPhraseToJoinAsPlayerQuery, RequiresPhraseToJoinAsPlayerQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RequiresPhraseToJoinAsPlayerQuery, RequiresPhraseToJoinAsPlayerQueryVariables>(RequiresPhraseToJoinAsPlayerDocument, options);
      }
export function useRequiresPhraseToJoinAsPlayerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RequiresPhraseToJoinAsPlayerQuery, RequiresPhraseToJoinAsPlayerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RequiresPhraseToJoinAsPlayerQuery, RequiresPhraseToJoinAsPlayerQueryVariables>(RequiresPhraseToJoinAsPlayerDocument, options);
        }
export type RequiresPhraseToJoinAsPlayerQueryHookResult = ReturnType<typeof useRequiresPhraseToJoinAsPlayerQuery>;
export type RequiresPhraseToJoinAsPlayerLazyQueryHookResult = ReturnType<typeof useRequiresPhraseToJoinAsPlayerLazyQuery>;
export type RequiresPhraseToJoinAsPlayerQueryResult = Apollo.QueryResult<RequiresPhraseToJoinAsPlayerQuery, RequiresPhraseToJoinAsPlayerQueryVariables>;
export const ChangeParticipantNameDocument = gql`
    mutation ChangeParticipantName($roomId: String!, $newName: String!) {
  result: changeParticipantName(roomId: $roomId, newName: $newName) {
    failureType
  }
}
    `;
export type ChangeParticipantNameMutationFn = Apollo.MutationFunction<ChangeParticipantNameMutation, ChangeParticipantNameMutationVariables>;

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
export function useChangeParticipantNameMutation(baseOptions?: Apollo.MutationHookOptions<ChangeParticipantNameMutation, ChangeParticipantNameMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChangeParticipantNameMutation, ChangeParticipantNameMutationVariables>(ChangeParticipantNameDocument, options);
      }
export type ChangeParticipantNameMutationHookResult = ReturnType<typeof useChangeParticipantNameMutation>;
export type ChangeParticipantNameMutationResult = Apollo.MutationResult<ChangeParticipantNameMutation>;
export type ChangeParticipantNameMutationOptions = Apollo.BaseMutationOptions<ChangeParticipantNameMutation, ChangeParticipantNameMutationVariables>;
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
    ${CreateRoomResultFragmentDoc}`;
export type CreateRoomMutationFn = Apollo.MutationFunction<CreateRoomMutation, CreateRoomMutationVariables>;

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
export function useCreateRoomMutation(baseOptions?: Apollo.MutationHookOptions<CreateRoomMutation, CreateRoomMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateRoomMutation, CreateRoomMutationVariables>(CreateRoomDocument, options);
      }
export type CreateRoomMutationHookResult = ReturnType<typeof useCreateRoomMutation>;
export type CreateRoomMutationResult = Apollo.MutationResult<CreateRoomMutation>;
export type CreateRoomMutationOptions = Apollo.BaseMutationOptions<CreateRoomMutation, CreateRoomMutationVariables>;
export const DeleteRoomDocument = gql`
    mutation DeleteRoom($id: String!) {
  result: deleteRoom(id: $id) {
    failureType
  }
}
    `;
export type DeleteRoomMutationFn = Apollo.MutationFunction<DeleteRoomMutation, DeleteRoomMutationVariables>;

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
export function useDeleteRoomMutation(baseOptions?: Apollo.MutationHookOptions<DeleteRoomMutation, DeleteRoomMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteRoomMutation, DeleteRoomMutationVariables>(DeleteRoomDocument, options);
      }
export type DeleteRoomMutationHookResult = ReturnType<typeof useDeleteRoomMutation>;
export type DeleteRoomMutationResult = Apollo.MutationResult<DeleteRoomMutation>;
export type DeleteRoomMutationOptions = Apollo.BaseMutationOptions<DeleteRoomMutation, DeleteRoomMutationVariables>;
export const JoinRoomAsPlayerDocument = gql`
    mutation JoinRoomAsPlayer($id: String!, $name: String!, $phrase: String) {
  result: joinRoomAsPlayer(id: $id, name: $name, phrase: $phrase) {
    ...JoinRoomResult
  }
}
    ${JoinRoomResultFragmentDoc}`;
export type JoinRoomAsPlayerMutationFn = Apollo.MutationFunction<JoinRoomAsPlayerMutation, JoinRoomAsPlayerMutationVariables>;

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
export function useJoinRoomAsPlayerMutation(baseOptions?: Apollo.MutationHookOptions<JoinRoomAsPlayerMutation, JoinRoomAsPlayerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<JoinRoomAsPlayerMutation, JoinRoomAsPlayerMutationVariables>(JoinRoomAsPlayerDocument, options);
      }
export type JoinRoomAsPlayerMutationHookResult = ReturnType<typeof useJoinRoomAsPlayerMutation>;
export type JoinRoomAsPlayerMutationResult = Apollo.MutationResult<JoinRoomAsPlayerMutation>;
export type JoinRoomAsPlayerMutationOptions = Apollo.BaseMutationOptions<JoinRoomAsPlayerMutation, JoinRoomAsPlayerMutationVariables>;
export const JoinRoomAsSpectatorDocument = gql`
    mutation JoinRoomAsSpectator($id: String!, $name: String!, $phrase: String) {
  result: joinRoomAsSpectator(id: $id, name: $name, phrase: $phrase) {
    ...JoinRoomResult
  }
}
    ${JoinRoomResultFragmentDoc}`;
export type JoinRoomAsSpectatorMutationFn = Apollo.MutationFunction<JoinRoomAsSpectatorMutation, JoinRoomAsSpectatorMutationVariables>;

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
export function useJoinRoomAsSpectatorMutation(baseOptions?: Apollo.MutationHookOptions<JoinRoomAsSpectatorMutation, JoinRoomAsSpectatorMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<JoinRoomAsSpectatorMutation, JoinRoomAsSpectatorMutationVariables>(JoinRoomAsSpectatorDocument, options);
      }
export type JoinRoomAsSpectatorMutationHookResult = ReturnType<typeof useJoinRoomAsSpectatorMutation>;
export type JoinRoomAsSpectatorMutationResult = Apollo.MutationResult<JoinRoomAsSpectatorMutation>;
export type JoinRoomAsSpectatorMutationOptions = Apollo.BaseMutationOptions<JoinRoomAsSpectatorMutation, JoinRoomAsSpectatorMutationVariables>;
export const EntryToServerDocument = gql`
    mutation EntryToServer($phrase: String!) {
  result: entryToServer(phrase: $phrase) {
    type
  }
}
    `;
export type EntryToServerMutationFn = Apollo.MutationFunction<EntryToServerMutation, EntryToServerMutationVariables>;

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
export function useEntryToServerMutation(baseOptions?: Apollo.MutationHookOptions<EntryToServerMutation, EntryToServerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EntryToServerMutation, EntryToServerMutationVariables>(EntryToServerDocument, options);
      }
export type EntryToServerMutationHookResult = ReturnType<typeof useEntryToServerMutation>;
export type EntryToServerMutationResult = Apollo.MutationResult<EntryToServerMutation>;
export type EntryToServerMutationOptions = Apollo.BaseMutationOptions<EntryToServerMutation, EntryToServerMutationVariables>;
export const LeaveRoomDocument = gql`
    mutation LeaveRoom($id: String!) {
  result: leaveRoom(id: $id) {
    failureType
  }
}
    `;
export type LeaveRoomMutationFn = Apollo.MutationFunction<LeaveRoomMutation, LeaveRoomMutationVariables>;

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
export function useLeaveRoomMutation(baseOptions?: Apollo.MutationHookOptions<LeaveRoomMutation, LeaveRoomMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LeaveRoomMutation, LeaveRoomMutationVariables>(LeaveRoomDocument, options);
      }
export type LeaveRoomMutationHookResult = ReturnType<typeof useLeaveRoomMutation>;
export type LeaveRoomMutationResult = Apollo.MutationResult<LeaveRoomMutation>;
export type LeaveRoomMutationOptions = Apollo.BaseMutationOptions<LeaveRoomMutation, LeaveRoomMutationVariables>;
export const OperateDocument = gql`
    mutation Operate($id: String!, $revisionFrom: Int!, $operation: RoomOperationInput!, $requestId: String!) {
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
${RoomAsListItemFragmentDoc}`;
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
export function useOperateMutation(baseOptions?: Apollo.MutationHookOptions<OperateMutation, OperateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OperateMutation, OperateMutationVariables>(OperateDocument, options);
      }
export type OperateMutationHookResult = ReturnType<typeof useOperateMutation>;
export type OperateMutationResult = Apollo.MutationResult<OperateMutation>;
export type OperateMutationOptions = Apollo.BaseMutationOptions<OperateMutation, OperateMutationVariables>;
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
export function usePingMutation(baseOptions?: Apollo.MutationHookOptions<PingMutation, PingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
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
export type PromoteToPlayerMutationFn = Apollo.MutationFunction<PromoteToPlayerMutation, PromoteToPlayerMutationVariables>;

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
export function usePromoteToPlayerMutation(baseOptions?: Apollo.MutationHookOptions<PromoteToPlayerMutation, PromoteToPlayerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PromoteToPlayerMutation, PromoteToPlayerMutationVariables>(PromoteToPlayerDocument, options);
      }
export type PromoteToPlayerMutationHookResult = ReturnType<typeof usePromoteToPlayerMutation>;
export type PromoteToPlayerMutationResult = Apollo.MutationResult<PromoteToPlayerMutation>;
export type PromoteToPlayerMutationOptions = Apollo.BaseMutationOptions<PromoteToPlayerMutation, PromoteToPlayerMutationVariables>;
export const WritePublicMessageDocument = gql`
    mutation WritePublicMessage($roomId: String!, $text: String!, $textColor: String, $channelKey: String!, $characterStateId: String, $customName: String, $gameType: String) {
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
    ${RoomPublicMessageFragmentDoc}`;
export type WritePublicMessageMutationFn = Apollo.MutationFunction<WritePublicMessageMutation, WritePublicMessageMutationVariables>;

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
export function useWritePublicMessageMutation(baseOptions?: Apollo.MutationHookOptions<WritePublicMessageMutation, WritePublicMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<WritePublicMessageMutation, WritePublicMessageMutationVariables>(WritePublicMessageDocument, options);
      }
export type WritePublicMessageMutationHookResult = ReturnType<typeof useWritePublicMessageMutation>;
export type WritePublicMessageMutationResult = Apollo.MutationResult<WritePublicMessageMutation>;
export type WritePublicMessageMutationOptions = Apollo.BaseMutationOptions<WritePublicMessageMutation, WritePublicMessageMutationVariables>;
export const WritePrivateMessageDocument = gql`
    mutation WritePrivateMessage($roomId: String!, $visibleTo: [String!]!, $text: String!, $textColor: String, $characterStateId: String, $customName: String) {
  result: writePrivateMessage(
    roomId: $roomId
    visibleTo: $visibleTo
    text: $text
    textColor: $textColor
    characterStateId: $characterStateId
    customName: $customName
  ) {
    ... on RoomPrivateMessage {
      ...RoomPrivateMessage
    }
    ... on WritePrivateRoomMessageFailureResult {
      failureType
    }
  }
}
    ${RoomPrivateMessageFragmentDoc}`;
export type WritePrivateMessageMutationFn = Apollo.MutationFunction<WritePrivateMessageMutation, WritePrivateMessageMutationVariables>;

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
 *   },
 * });
 */
export function useWritePrivateMessageMutation(baseOptions?: Apollo.MutationHookOptions<WritePrivateMessageMutation, WritePrivateMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<WritePrivateMessageMutation, WritePrivateMessageMutationVariables>(WritePrivateMessageDocument, options);
      }
export type WritePrivateMessageMutationHookResult = ReturnType<typeof useWritePrivateMessageMutation>;
export type WritePrivateMessageMutationResult = Apollo.MutationResult<WritePrivateMessageMutation>;
export type WritePrivateMessageMutationOptions = Apollo.BaseMutationOptions<WritePrivateMessageMutation, WritePrivateMessageMutationVariables>;
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
    ${RoomSoundEffectFragmentDoc}`;
export type WriteRoomSoundEffectMutationFn = Apollo.MutationFunction<WriteRoomSoundEffectMutation, WriteRoomSoundEffectMutationVariables>;

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
export function useWriteRoomSoundEffectMutation(baseOptions?: Apollo.MutationHookOptions<WriteRoomSoundEffectMutation, WriteRoomSoundEffectMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<WriteRoomSoundEffectMutation, WriteRoomSoundEffectMutationVariables>(WriteRoomSoundEffectDocument, options);
      }
export type WriteRoomSoundEffectMutationHookResult = ReturnType<typeof useWriteRoomSoundEffectMutation>;
export type WriteRoomSoundEffectMutationResult = Apollo.MutationResult<WriteRoomSoundEffectMutation>;
export type WriteRoomSoundEffectMutationOptions = Apollo.BaseMutationOptions<WriteRoomSoundEffectMutation, WriteRoomSoundEffectMutationVariables>;
export const EditMessageDocument = gql`
    mutation EditMessage($roomId: String!, $messageId: String!, $text: String!) {
  result: editMessage(roomId: $roomId, messageId: $messageId, text: $text) {
    failureType
  }
}
    `;
export type EditMessageMutationFn = Apollo.MutationFunction<EditMessageMutation, EditMessageMutationVariables>;

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
export function useEditMessageMutation(baseOptions?: Apollo.MutationHookOptions<EditMessageMutation, EditMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EditMessageMutation, EditMessageMutationVariables>(EditMessageDocument, options);
      }
export type EditMessageMutationHookResult = ReturnType<typeof useEditMessageMutation>;
export type EditMessageMutationResult = Apollo.MutationResult<EditMessageMutation>;
export type EditMessageMutationOptions = Apollo.BaseMutationOptions<EditMessageMutation, EditMessageMutationVariables>;
export const DeleteMessageDocument = gql`
    mutation DeleteMessage($roomId: String!, $messageId: String!) {
  result: deleteMessage(roomId: $roomId, messageId: $messageId) {
    failureType
  }
}
    `;
export type DeleteMessageMutationFn = Apollo.MutationFunction<DeleteMessageMutation, DeleteMessageMutationVariables>;

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
export function useDeleteMessageMutation(baseOptions?: Apollo.MutationHookOptions<DeleteMessageMutation, DeleteMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteMessageMutation, DeleteMessageMutationVariables>(DeleteMessageDocument, options);
      }
export type DeleteMessageMutationHookResult = ReturnType<typeof useDeleteMessageMutation>;
export type DeleteMessageMutationResult = Apollo.MutationResult<DeleteMessageMutation>;
export type DeleteMessageMutationOptions = Apollo.BaseMutationOptions<DeleteMessageMutation, DeleteMessageMutationVariables>;
export const MakeMessageNotSecretDocument = gql`
    mutation MakeMessageNotSecret($roomId: String!, $messageId: String!) {
  result: makeMessageNotSecret(roomId: $roomId, messageId: $messageId) {
    failureType
  }
}
    `;
export type MakeMessageNotSecretMutationFn = Apollo.MutationFunction<MakeMessageNotSecretMutation, MakeMessageNotSecretMutationVariables>;

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
export function useMakeMessageNotSecretMutation(baseOptions?: Apollo.MutationHookOptions<MakeMessageNotSecretMutation, MakeMessageNotSecretMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MakeMessageNotSecretMutation, MakeMessageNotSecretMutationVariables>(MakeMessageNotSecretDocument, options);
      }
export type MakeMessageNotSecretMutationHookResult = ReturnType<typeof useMakeMessageNotSecretMutation>;
export type MakeMessageNotSecretMutationResult = Apollo.MutationResult<MakeMessageNotSecretMutation>;
export type MakeMessageNotSecretMutationOptions = Apollo.BaseMutationOptions<MakeMessageNotSecretMutation, MakeMessageNotSecretMutationVariables>;
export const RoomOperatedDocument = gql`
    subscription RoomOperated($id: String!) {
  roomOperated(id: $id) {
    ... on RoomOperation {
      ...RoomOperation
    }
    ... on DeleteRoomOperation {
      deletedBy
    }
  }
}
    ${RoomOperationFragmentDoc}`;

/**
 * __useRoomOperatedSubscription__
 *
 * To run a query within a React component, call `useRoomOperatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useRoomOperatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRoomOperatedSubscription({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRoomOperatedSubscription(baseOptions: Apollo.SubscriptionHookOptions<RoomOperatedSubscription, RoomOperatedSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<RoomOperatedSubscription, RoomOperatedSubscriptionVariables>(RoomOperatedDocument, options);
      }
export type RoomOperatedSubscriptionHookResult = ReturnType<typeof useRoomOperatedSubscription>;
export type RoomOperatedSubscriptionResult = Apollo.SubscriptionResult<RoomOperatedSubscription>;
export const MessageEventDocument = gql`
    subscription MessageEvent($roomId: String!) {
  messageEvent(roomId: $roomId) {
    ...RoomMessageEvent
  }
}
    ${RoomMessageEventFragmentDoc}`;

/**
 * __useMessageEventSubscription__
 *
 * To run a query within a React component, call `useMessageEventSubscription` and pass it any options that fit your needs.
 * When your component renders, `useMessageEventSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMessageEventSubscription({
 *   variables: {
 *      roomId: // value for 'roomId'
 *   },
 * });
 */
export function useMessageEventSubscription(baseOptions: Apollo.SubscriptionHookOptions<MessageEventSubscription, MessageEventSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<MessageEventSubscription, MessageEventSubscriptionVariables>(MessageEventDocument, options);
      }
export type MessageEventSubscriptionHookResult = ReturnType<typeof useMessageEventSubscription>;
export type MessageEventSubscriptionResult = Apollo.SubscriptionResult<MessageEventSubscription>;
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
export function usePongSubscription(baseOptions?: Apollo.SubscriptionHookOptions<PongSubscription, PongSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<PongSubscription, PongSubscriptionVariables>(PongDocument, options);
      }
export type PongSubscriptionHookResult = ReturnType<typeof usePongSubscription>;
export type PongSubscriptionResult = Apollo.SubscriptionResult<PongSubscription>;