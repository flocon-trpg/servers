var ChangeParticipantNameFailureType;
(function (ChangeParticipantNameFailureType) {
    ChangeParticipantNameFailureType["NotFound"] = "NotFound";
    ChangeParticipantNameFailureType["NotParticipant"] = "NotParticipant";
})(ChangeParticipantNameFailureType || (ChangeParticipantNameFailureType = {}));
var CreateRoomFailureType;
(function (CreateRoomFailureType) {
    CreateRoomFailureType["UnknownError"] = "UnknownError";
})(CreateRoomFailureType || (CreateRoomFailureType = {}));
var DeleteMessageFailureType;
(function (DeleteMessageFailureType) {
    DeleteMessageFailureType["MessageDeleted"] = "MessageDeleted";
    DeleteMessageFailureType["MessageNotFound"] = "MessageNotFound";
    DeleteMessageFailureType["NotParticipant"] = "NotParticipant";
    DeleteMessageFailureType["NotYourMessage"] = "NotYourMessage";
    DeleteMessageFailureType["RoomNotFound"] = "RoomNotFound";
})(DeleteMessageFailureType || (DeleteMessageFailureType = {}));
var DeleteRoomFailureType;
(function (DeleteRoomFailureType) {
    DeleteRoomFailureType["NotCreatedByYou"] = "NotCreatedByYou";
    DeleteRoomFailureType["NotFound"] = "NotFound";
})(DeleteRoomFailureType || (DeleteRoomFailureType = {}));
var EditMessageFailureType;
(function (EditMessageFailureType) {
    EditMessageFailureType["MessageDeleted"] = "MessageDeleted";
    EditMessageFailureType["MessageNotFound"] = "MessageNotFound";
    EditMessageFailureType["NotParticipant"] = "NotParticipant";
    EditMessageFailureType["NotYourMessage"] = "NotYourMessage";
    EditMessageFailureType["RoomNotFound"] = "RoomNotFound";
})(EditMessageFailureType || (EditMessageFailureType = {}));
var EntryToServerResultType;
(function (EntryToServerResultType) {
    EntryToServerResultType["AlreadyEntried"] = "AlreadyEntried";
    EntryToServerResultType["NoPasswordRequired"] = "NoPasswordRequired";
    EntryToServerResultType["NotSignIn"] = "NotSignIn";
    EntryToServerResultType["Success"] = "Success";
    EntryToServerResultType["WrongPassword"] = "WrongPassword";
})(EntryToServerResultType || (EntryToServerResultType = {}));
var FileSourceType;
(function (FileSourceType) {
    FileSourceType["Default"] = "Default";
    FileSourceType["FirebaseStorage"] = "FirebaseStorage";
    FileSourceType["Uploader"] = "Uploader";
})(FileSourceType || (FileSourceType = {}));
var GetRoomConnectionFailureType;
(function (GetRoomConnectionFailureType) {
    GetRoomConnectionFailureType["NotParticipant"] = "NotParticipant";
    GetRoomConnectionFailureType["RoomNotFound"] = "RoomNotFound";
})(GetRoomConnectionFailureType || (GetRoomConnectionFailureType = {}));
var GetRoomFailureType;
(function (GetRoomFailureType) {
    GetRoomFailureType["NotFound"] = "NotFound";
})(GetRoomFailureType || (GetRoomFailureType = {}));
var GetRoomLogFailureType;
(function (GetRoomLogFailureType) {
    GetRoomLogFailureType["NotAuthorized"] = "NotAuthorized";
    GetRoomLogFailureType["NotParticipant"] = "NotParticipant";
    GetRoomLogFailureType["RoomNotFound"] = "RoomNotFound";
    GetRoomLogFailureType["UnknownError"] = "UnknownError";
})(GetRoomLogFailureType || (GetRoomLogFailureType = {}));
var GetRoomMessagesFailureType;
(function (GetRoomMessagesFailureType) {
    GetRoomMessagesFailureType["NotParticipant"] = "NotParticipant";
    GetRoomMessagesFailureType["RoomNotFound"] = "RoomNotFound";
})(GetRoomMessagesFailureType || (GetRoomMessagesFailureType = {}));
var JoinRoomFailureType;
(function (JoinRoomFailureType) {
    JoinRoomFailureType["AlreadyParticipant"] = "AlreadyParticipant";
    JoinRoomFailureType["NotFound"] = "NotFound";
    JoinRoomFailureType["TransformError"] = "TransformError";
    JoinRoomFailureType["WrongPassword"] = "WrongPassword";
})(JoinRoomFailureType || (JoinRoomFailureType = {}));
var LeaveRoomFailureType;
(function (LeaveRoomFailureType) {
    LeaveRoomFailureType["NotFound"] = "NotFound";
    LeaveRoomFailureType["NotParticipant"] = "NotParticipant";
})(LeaveRoomFailureType || (LeaveRoomFailureType = {}));
var MakeMessageNotSecretFailureType;
(function (MakeMessageNotSecretFailureType) {
    MakeMessageNotSecretFailureType["MessageNotFound"] = "MessageNotFound";
    MakeMessageNotSecretFailureType["NotParticipant"] = "NotParticipant";
    MakeMessageNotSecretFailureType["NotSecret"] = "NotSecret";
    MakeMessageNotSecretFailureType["NotYourMessage"] = "NotYourMessage";
    MakeMessageNotSecretFailureType["RoomNotFound"] = "RoomNotFound";
})(MakeMessageNotSecretFailureType || (MakeMessageNotSecretFailureType = {}));
var OperateRoomFailureType;
(function (OperateRoomFailureType) {
    OperateRoomFailureType["NotFound"] = "NotFound";
})(OperateRoomFailureType || (OperateRoomFailureType = {}));
var ParticipantRole;
(function (ParticipantRole) {
    ParticipantRole["Master"] = "Master";
    ParticipantRole["Player"] = "Player";
    ParticipantRole["Spectator"] = "Spectator";
    ParticipantRole["OfNullishString"] = "ofNullishString";
    ParticipantRole["OfString"] = "ofString";
})(ParticipantRole || (ParticipantRole = {}));
var PieceLogType;
(function (PieceLogType) {
    PieceLogType["Dice"] = "Dice";
    PieceLogType["String"] = "String";
})(PieceLogType || (PieceLogType = {}));
var PrereleaseType;
(function (PrereleaseType) {
    PrereleaseType["Alpha"] = "Alpha";
    PrereleaseType["Beta"] = "Beta";
    PrereleaseType["Rc"] = "Rc";
})(PrereleaseType || (PrereleaseType = {}));
var PromoteFailureType;
(function (PromoteFailureType) {
    PromoteFailureType["NoNeedToPromote"] = "NoNeedToPromote";
    PromoteFailureType["NotFound"] = "NotFound";
    PromoteFailureType["NotParticipant"] = "NotParticipant";
    PromoteFailureType["WrongPassword"] = "WrongPassword";
})(PromoteFailureType || (PromoteFailureType = {}));
var ResetRoomMessagesFailureType;
(function (ResetRoomMessagesFailureType) {
    ResetRoomMessagesFailureType["NotAuthorized"] = "NotAuthorized";
    ResetRoomMessagesFailureType["NotParticipant"] = "NotParticipant";
    ResetRoomMessagesFailureType["RoomNotFound"] = "RoomNotFound";
})(ResetRoomMessagesFailureType || (ResetRoomMessagesFailureType = {}));
var WriteRoomPrivateMessageFailureType;
(function (WriteRoomPrivateMessageFailureType) {
    WriteRoomPrivateMessageFailureType["NotParticipant"] = "NotParticipant";
    WriteRoomPrivateMessageFailureType["RoomNotFound"] = "RoomNotFound";
    WriteRoomPrivateMessageFailureType["SyntaxError"] = "SyntaxError";
    WriteRoomPrivateMessageFailureType["VisibleToIsInvalid"] = "VisibleToIsInvalid";
})(WriteRoomPrivateMessageFailureType || (WriteRoomPrivateMessageFailureType = {}));
var WriteRoomPublicMessageFailureType;
(function (WriteRoomPublicMessageFailureType) {
    WriteRoomPublicMessageFailureType["NotAllowedChannelKey"] = "NotAllowedChannelKey";
    WriteRoomPublicMessageFailureType["NotAuthorized"] = "NotAuthorized";
    WriteRoomPublicMessageFailureType["NotParticipant"] = "NotParticipant";
    WriteRoomPublicMessageFailureType["RoomNotFound"] = "RoomNotFound";
    WriteRoomPublicMessageFailureType["SyntaxError"] = "SyntaxError";
})(WriteRoomPublicMessageFailureType || (WriteRoomPublicMessageFailureType = {}));
var WriteRoomSoundEffectFailureType;
(function (WriteRoomSoundEffectFailureType) {
    WriteRoomSoundEffectFailureType["NotAuthorized"] = "NotAuthorized";
    WriteRoomSoundEffectFailureType["NotParticipant"] = "NotParticipant";
    WriteRoomSoundEffectFailureType["RoomNotFound"] = "RoomNotFound";
})(WriteRoomSoundEffectFailureType || (WriteRoomSoundEffectFailureType = {}));
var WritingMessageStatusInputType;
(function (WritingMessageStatusInputType) {
    WritingMessageStatusInputType["Cleared"] = "Cleared";
    WritingMessageStatusInputType["KeepWriting"] = "KeepWriting";
    WritingMessageStatusInputType["StartWriting"] = "StartWriting";
})(WritingMessageStatusInputType || (WritingMessageStatusInputType = {}));
var WritingMessageStatusType;
(function (WritingMessageStatusType) {
    WritingMessageStatusType["Cleared"] = "Cleared";
    WritingMessageStatusType["Disconnected"] = "Disconnected";
    WritingMessageStatusType["Submit"] = "Submit";
    WritingMessageStatusType["Writing"] = "Writing";
})(WritingMessageStatusType || (WritingMessageStatusType = {}));
const RoomGetStateFragmentDoc = {
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
};
const CreateRoomResultFragmentDoc = {
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
};
const FileItemFragmentDoc = {
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
};
const FileTagFragmentDoc = {
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
};
const RoomAsListItemFragmentDoc = {
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
};
const GetRoomListResultFragmentDoc = {
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
};
const GetNonJoinedRoomResultFragmentDoc = {
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
};
const GetRoomResultFragmentDoc = {
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
};
const RoomOperationFragmentDoc = {
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
};
const JoinRoomResultFragmentDoc = {
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
};
const FilePathFragmentDoc = {
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
};
const RoomSoundEffectFragmentDoc = {
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
};
const CharacterValueForMessageFragmentDoc = {
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
};
const RoomPublicMessageFragmentDoc = {
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
};
const RoomPublicChannelFragmentDoc = {
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
};
const RoomPrivateMessageFragmentDoc = {
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
};
const PieceLogFragmentDoc = {
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
};
const RoomMessageEventFragmentDoc = {
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
};
const SemVerFragmentDoc = {
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
};
const GetAvailableGameSystemsDocument = {
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
};
const GetDiceHelpMessagesDocument = {
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
};
const GetFilesDocument = {
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
};
const GetRoomDocument = {
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
};
const GetRoomsListDocument = {
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
};
const GetMessagesDocument = {
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
};
const GetLogDocument = {
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
};
const GetRoomConnectionsDocument = {
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
};
const GetServerInfoDocument = {
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
};
const IsEntryDocument = {
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
};
const GetRoomAsListItemDocument = {
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
};
const CreateFileTagDocument = {
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
};
const ChangeParticipantNameDocument = {
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
};
const CreateRoomDocument = {
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
};
const DeleteFilesDocument = {
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
};
const DeleteFileTagDocument = {
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
};
const DeleteRoomDocument = {
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
};
const EditFileTagsDocument = {
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
};
const JoinRoomAsPlayerDocument = {
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
};
const JoinRoomAsSpectatorDocument = {
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
};
const EntryToServerDocument = {
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
};
const LeaveRoomDocument = {
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
};
const OperateDocument = {
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
};
const PingDocument = {
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
};
const PromoteToPlayerDocument = {
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
};
const ResetMessagesDocument = {
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
};
const WritePublicMessageDocument = {
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
};
const WritePrivateMessageDocument = {
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
};
const WriteRoomSoundEffectDocument = {
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
};
const EditMessageDocument = {
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
};
const DeleteMessageDocument = {
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
};
const MakeMessageNotSecretDocument = {
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
};
const UpdateWritingMessageStatusDocument = {
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
};
const RoomEventDocument = {
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
};
const PongDocument = {
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
};

export { ChangeParticipantNameDocument, ChangeParticipantNameFailureType, CharacterValueForMessageFragmentDoc, CreateFileTagDocument, CreateRoomDocument, CreateRoomFailureType, CreateRoomResultFragmentDoc, DeleteFileTagDocument, DeleteFilesDocument, DeleteMessageDocument, DeleteMessageFailureType, DeleteRoomDocument, DeleteRoomFailureType, EditFileTagsDocument, EditMessageDocument, EditMessageFailureType, EntryToServerDocument, EntryToServerResultType, FileItemFragmentDoc, FilePathFragmentDoc, FileSourceType, FileTagFragmentDoc, GetAvailableGameSystemsDocument, GetDiceHelpMessagesDocument, GetFilesDocument, GetLogDocument, GetMessagesDocument, GetNonJoinedRoomResultFragmentDoc, GetRoomAsListItemDocument, GetRoomConnectionFailureType, GetRoomConnectionsDocument, GetRoomDocument, GetRoomFailureType, GetRoomListResultFragmentDoc, GetRoomLogFailureType, GetRoomMessagesFailureType, GetRoomResultFragmentDoc, GetRoomsListDocument, GetServerInfoDocument, IsEntryDocument, JoinRoomAsPlayerDocument, JoinRoomAsSpectatorDocument, JoinRoomFailureType, JoinRoomResultFragmentDoc, LeaveRoomDocument, LeaveRoomFailureType, MakeMessageNotSecretDocument, MakeMessageNotSecretFailureType, OperateDocument, OperateRoomFailureType, ParticipantRole, PieceLogFragmentDoc, PieceLogType, PingDocument, PongDocument, PrereleaseType, PromoteFailureType, PromoteToPlayerDocument, ResetMessagesDocument, ResetRoomMessagesFailureType, RoomAsListItemFragmentDoc, RoomEventDocument, RoomGetStateFragmentDoc, RoomMessageEventFragmentDoc, RoomOperationFragmentDoc, RoomPrivateMessageFragmentDoc, RoomPublicChannelFragmentDoc, RoomPublicMessageFragmentDoc, RoomSoundEffectFragmentDoc, SemVerFragmentDoc, UpdateWritingMessageStatusDocument, WritePrivateMessageDocument, WritePublicMessageDocument, WriteRoomPrivateMessageFailureType, WriteRoomPublicMessageFailureType, WriteRoomSoundEffectDocument, WriteRoomSoundEffectFailureType, WritingMessageStatusInputType, WritingMessageStatusType };
