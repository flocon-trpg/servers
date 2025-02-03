const FileSourceType = {
    Default: 'Default',
    FirebaseStorage: 'FirebaseStorage',
    Uploader: 'Uploader',
};
const GetRoomFailureType = {
    NotFound: 'NotFound',
};
const GetRoomMessagesFailureType = {
    NotParticipant: 'NotParticipant',
    RoomNotFound: 'RoomNotFound',
};
const JoinRoomFailureType = {
    AlreadyParticipant: 'AlreadyParticipant',
    NotFound: 'NotFound',
    TransformError: 'TransformError',
    WrongPassword: 'WrongPassword',
};
const OperateRoomFailureType = {
    NotFound: 'NotFound',
};
const ParticipantRole = {
    Master: 'Master',
    Player: 'Player',
    Spectator: 'Spectator',
};
const PieceLogType = {
    Dice: 'Dice',
    String: 'String',
};
const PrereleaseType = {
    Alpha: 'Alpha',
    Beta: 'Beta',
    Rc: 'Rc',
};
const WriteRoomPrivateMessageFailureType = {
    NotParticipant: 'NotParticipant',
    RoomNotFound: 'RoomNotFound',
    SyntaxError: 'SyntaxError',
    VisibleToIsInvalid: 'VisibleToIsInvalid',
};
const WriteRoomPublicMessageFailureType = {
    NotAllowedChannelKey: 'NotAllowedChannelKey',
    NotAuthorized: 'NotAuthorized',
    NotParticipant: 'NotParticipant',
    RoomNotFound: 'RoomNotFound',
    SyntaxError: 'SyntaxError',
};
const WritingMessageStatusInputType = {
    Cleared: 'Cleared',
    KeepWriting: 'KeepWriting',
    StartWriting: 'StartWriting',
};
const WritingMessageStatusType = {
    Cleared: 'Cleared',
    Disconnected: 'Disconnected',
    Submit: 'Submit',
    Writing: 'Writing',
};
const CharacterValueForMessageFragmentDoc$1 = {
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
};
const RoomPublicMessageFragmentDoc$1 = {
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
};
const RoomPrivateMessageFragmentDoc$1 = {
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
};
const PieceLogFragmentDoc$1 = {
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
const RoomPrivateMessageUpdateFragmentDoc$1 = {
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
};
const RoomPublicMessageUpdateFragmentDoc$1 = {
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
};
const RoomSoundEffectFragmentDoc$1 = {
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
};
const RoomPublicChannelFragmentDoc$1 = {
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
const RoomPublicChannelUpdateFragmentDoc$1 = {
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
};
const RoomGetStateFragmentDoc$1 = {
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
};
const RoomAsListItemFragmentDoc$1 = {
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
};
const RoomOperationFragmentDoc$1 = {
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
};
const OperateRoomDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'operateRoom' },
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
                        name: { kind: 'Name', value: 'operateRoom' },
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

/* eslint-disable */
/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
const documents = {
    '\n    fragment CharacterValueForMessage on CharacterValueForMessage {\n        image {\n            path\n            sourceType\n        }\n        isPrivate\n        name\n        portraitImage {\n            path\n            sourceType\n        }\n        stateId\n    }\n': CharacterValueForMessageFragmentDoc$1,
    '\n    fragment RoomPublicMessage on RoomPublicMessage {\n        messageId\n        altTextToSecret\n        textColor\n        updatedAt\n        updatedText {\n            currentText\n            updatedAt\n        }\n        channelKey\n        character {\n            ...CharacterValueForMessage\n        }\n        commandResult {\n            isSuccess\n            text\n        }\n        createdAt\n        createdBy\n        customName\n        initText\n        initTextSource\n        isSecret\n    }\n': RoomPublicMessageFragmentDoc$1,
    '\n    fragment RoomPrivateMessage on RoomPrivateMessage {\n        messageId\n        visibleTo\n        initText\n        initTextSource\n        updatedText {\n            currentText\n            updatedAt\n        }\n        textColor\n        commandResult {\n            text\n            isSuccess\n        }\n        altTextToSecret\n        isSecret\n        createdBy\n        character {\n            ...CharacterValueForMessage\n        }\n        customName\n        createdAt\n        updatedAt\n        initText\n        initTextSource\n    }\n': RoomPrivateMessageFragmentDoc$1,
    '\n    fragment PieceLog on PieceLog {\n        messageId\n        stateId\n        createdAt\n        logType\n        valueJson\n    }\n': PieceLogFragmentDoc$1,
    '\n    fragment RoomPrivateMessageUpdate on RoomPrivateMessageUpdate {\n        messageId\n        altTextToSecret\n        commandResult {\n            isSuccess\n            text\n        }\n        initText\n        initTextSource\n        isSecret\n        updatedAt\n        updatedText {\n            currentText\n            updatedAt\n        }\n    }\n': RoomPrivateMessageUpdateFragmentDoc$1,
    '\n    fragment RoomPublicMessageUpdate on RoomPublicMessageUpdate {\n        altTextToSecret\n        commandResult {\n            isSuccess\n            text\n        }\n        initText\n        initTextSource\n        isSecret\n        messageId\n        updatedAt\n        updatedText {\n            currentText\n            updatedAt\n        }\n    }\n': RoomPublicMessageUpdateFragmentDoc$1,
    '\n    fragment RoomSoundEffect on RoomSoundEffect {\n        createdAt\n        createdBy\n        file {\n            path\n            sourceType\n        }\n        messageId\n        volume\n    }\n': RoomSoundEffectFragmentDoc$1,
    '\n    fragment RoomPublicChannel on RoomPublicChannel {\n        key\n        name\n    }\n': RoomPublicChannelFragmentDoc$1,
    '\n    fragment RoomPublicChannelUpdate on RoomPublicChannelUpdate {\n        key\n        name\n    }\n': RoomPublicChannelUpdateFragmentDoc$1,
    '\n    fragment RoomGetState on RoomGetState {\n        revision\n        createdBy\n        createdAt\n        updatedAt\n        role\n        isBookmarked\n        stateJson\n    }\n': RoomGetStateFragmentDoc$1,
    '\n    fragment RoomAsListItem on RoomAsListItem {\n        roomId\n        name\n        createdBy\n        createdAt\n        updatedAt\n        role\n        isBookmarked\n        requiresPlayerPassword\n        requiresSpectatorPassword\n    }\n': RoomAsListItemFragmentDoc$1,
    '\n    fragment RoomOperation on RoomOperation {\n        revisionTo\n        operatedBy {\n            userUid\n            clientId\n        }\n        valueJson\n    }\n': RoomOperationFragmentDoc$1,
    '\n    subscription RoomEvent($roomId: String!) {\n        result: roomEvent(roomId: $roomId) {\n            isRoomMessagesResetEvent\n            roomOperation {\n                ...RoomOperation\n            }\n            deleteRoomOperation {\n                deletedBy\n            }\n            roomMessageEvent {\n                __typename\n                ... on PieceLog {\n                    ...PieceLog\n                }\n                ... on RoomMessagesReset {\n                    publicMessagesDeleted\n                }\n                ... on RoomPrivateMessage {\n                    ...RoomPrivateMessage\n                }\n                ... on RoomPrivateMessageUpdate {\n                    ...RoomPrivateMessageUpdate\n                }\n                ... on RoomPublicChannel {\n                    ...RoomPublicChannel\n                }\n                ... on RoomPublicChannelUpdate {\n                    ...RoomPublicChannelUpdate\n                }\n                ... on RoomPublicMessage {\n                    ...RoomPublicMessage\n                }\n                ... on RoomPublicMessageUpdate {\n                    ...RoomPublicMessageUpdate\n                }\n                ... on RoomSoundEffect {\n                    ...RoomSoundEffect\n                }\n            }\n            roomConnectionEvent {\n                userUid\n                isConnected\n                updatedAt\n            }\n            writingMessageStatus {\n                userUid\n                status\n            }\n        }\n    }\n': RoomEventDocument,
    '\n    query GetMessages($roomId: String!) {\n        result: getMessages(roomId: $roomId) {\n            __typename\n            ... on RoomMessages {\n                pieceLogs {\n                    createdAt\n                    logType\n                    messageId\n                    stateId\n                    valueJson\n                }\n                privateMessages {\n                    ...RoomPrivateMessage\n                }\n                publicChannels {\n                    key\n                    name\n                }\n                publicMessages {\n                    ...RoomPublicMessage\n                }\n                soundEffects {\n                    createdAt\n                    createdBy\n                    file {\n                        path\n                        sourceType\n                    }\n                    messageId\n                    volume\n                }\n            }\n            ... on GetRoomMessagesFailureResult {\n                failureType\n            }\n        }\n    }\n': GetMessagesDocument,
    '\n    mutation WritePublicMessage(\n        $roomId: String!\n        $text: String!\n        $textColor: String\n        $channelKey: String!\n        $characterId: String\n        $customName: String\n        $gameType: String\n    ) {\n        result: writePublicMessage(\n            roomId: $roomId\n            text: $text\n            textColor: $textColor\n            channelKey: $channelKey\n            characterId: $characterId\n            customName: $customName\n            gameType: $gameType\n        ) {\n            __typename\n            ... on RoomPublicMessage {\n                ...RoomPublicMessage\n            }\n            ... on WriteRoomPublicMessageFailureResult {\n                failureType\n            }\n            ... on RoomMessageSyntaxError {\n                errorMessage\n            }\n        }\n    }\n': WritePublicMessageDocument,
    '\n    mutation WritePrivateMessage(\n        $roomId: String!\n        $visibleTo: [String!]!\n        $text: String!\n        $textColor: String\n        $characterId: String\n        $customName: String\n        $gameType: String\n    ) {\n        result: writePrivateMessage(\n            roomId: $roomId\n            visibleTo: $visibleTo\n            text: $text\n            textColor: $textColor\n            characterId: $characterId\n            customName: $customName\n            gameType: $gameType\n        ) {\n            __typename\n            ... on RoomPrivateMessage {\n                ...RoomPrivateMessage\n            }\n            ... on WriteRoomPrivateMessageFailureResult {\n                failureType\n            }\n            ... on RoomMessageSyntaxError {\n                errorMessage\n            }\n        }\n    }\n': WritePrivateMessageDocument,
    '\n    mutation operateRoom(\n        $roomId: String!\n        $revisionFrom: Int!\n        $operation: RoomOperationInput!\n        $requestId: String!\n    ) {\n        result: operateRoom(\n            roomId: $roomId\n            prevRevision: $revisionFrom\n            operation: $operation\n            requestId: $requestId\n        ) {\n            __typename\n            ... on OperateRoomSuccessResult {\n                operation {\n                    ...RoomOperation\n                }\n            }\n            ... on OperateRoomIdResult {\n                requestId\n            }\n            ... on OperateRoomFailureResult {\n                failureType\n            }\n            ... on OperateRoomNonJoinedResult {\n                roomAsListItem {\n                    ...RoomAsListItem\n                }\n            }\n        }\n    }\n': OperateRoomDocument,
    '\n    query GetRoom($roomId: String!) {\n        result: getRoom(roomId: $roomId) {\n            __typename\n            ... on GetJoinedRoomResult {\n                role\n                room {\n                    ...RoomGetState\n                }\n            }\n            ... on GetNonJoinedRoomResult {\n                roomAsListItem {\n                    ...RoomAsListItem\n                }\n            }\n            ... on GetRoomFailureResult {\n                failureType\n            }\n        }\n    }\n': GetRoomDocument,
    '\n    mutation UpdateWritingMessageStatus(\n        $roomId: String!\n        $newStatus: WritingMessageStatusInputType!\n    ) {\n        result: updateWritingMessageStatus(roomId: $roomId, newStatus: $newStatus)\n    }\n': UpdateWritingMessageStatusDocument,
    '\n    query GetRoomConnections($roomId: String!) {\n        result: getRoomConnections(roomId: $roomId) {\n            __typename\n            ... on GetRoomConnectionsSuccessResult {\n                fetchedAt\n                connectedUserUids\n            }\n            ... on GetRoomConnectionsFailureResult {\n                failureType\n            }\n        }\n    }\n': GetRoomConnectionsDocument,
};
function graphql(source) {
    return documents[source] ?? {};
}

const CharacterValueForMessageFragmentDoc = graphql(`
    fragment CharacterValueForMessage on CharacterValueForMessage {
        image {
            path
            sourceType
        }
        isPrivate
        name
        portraitImage {
            path
            sourceType
        }
        stateId
    }
`);
const RoomPublicMessageFragmentDoc = graphql(`
    fragment RoomPublicMessage on RoomPublicMessage {
        messageId
        altTextToSecret
        textColor
        updatedAt
        updatedText {
            currentText
            updatedAt
        }
        channelKey
        character {
            ...CharacterValueForMessage
        }
        commandResult {
            isSuccess
            text
        }
        createdAt
        createdBy
        customName
        initText
        initTextSource
        isSecret
    }
`);
const RoomPrivateMessageFragmentDoc = graphql(`
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
        initText
        initTextSource
    }
`);
const PieceLogFragmentDoc = graphql(`
    fragment PieceLog on PieceLog {
        messageId
        stateId
        createdAt
        logType
        valueJson
    }
`);
const RoomPrivateMessageUpdateFragmentDoc = graphql(`
    fragment RoomPrivateMessageUpdate on RoomPrivateMessageUpdate {
        messageId
        altTextToSecret
        commandResult {
            isSuccess
            text
        }
        initText
        initTextSource
        isSecret
        updatedAt
        updatedText {
            currentText
            updatedAt
        }
    }
`);
const RoomPublicMessageUpdateFragmentDoc = graphql(`
    fragment RoomPublicMessageUpdate on RoomPublicMessageUpdate {
        altTextToSecret
        commandResult {
            isSuccess
            text
        }
        initText
        initTextSource
        isSecret
        messageId
        updatedAt
        updatedText {
            currentText
            updatedAt
        }
    }
`);
const RoomSoundEffectFragmentDoc = graphql(`
    fragment RoomSoundEffect on RoomSoundEffect {
        createdAt
        createdBy
        file {
            path
            sourceType
        }
        messageId
        volume
    }
`);
const RoomPublicChannelFragmentDoc = graphql(`
    fragment RoomPublicChannel on RoomPublicChannel {
        key
        name
    }
`);
const RoomPublicChannelUpdateFragmentDoc = graphql(`
    fragment RoomPublicChannelUpdate on RoomPublicChannelUpdate {
        key
        name
    }
`);
const RoomGetStateFragmentDoc = graphql(`
    fragment RoomGetState on RoomGetState {
        revision
        createdBy
        createdAt
        updatedAt
        role
        isBookmarked
        stateJson
    }
`);
const RoomAsListItemFragmentDoc = graphql(`
    fragment RoomAsListItem on RoomAsListItem {
        roomId
        name
        createdBy
        createdAt
        updatedAt
        role
        isBookmarked
        requiresPlayerPassword
        requiresSpectatorPassword
    }
`);
const RoomOperationFragmentDoc = graphql(`
    fragment RoomOperation on RoomOperation {
        revisionTo
        operatedBy {
            userUid
            clientId
        }
        valueJson
    }
`);
const RoomEventDoc = graphql(`
    subscription RoomEvent($roomId: String!) {
        result: roomEvent(roomId: $roomId) {
            isRoomMessagesResetEvent
            roomOperation {
                ...RoomOperation
            }
            deleteRoomOperation {
                deletedBy
            }
            roomMessageEvent {
                __typename
                ... on PieceLog {
                    ...PieceLog
                }
                ... on RoomMessagesReset {
                    publicMessagesDeleted
                }
                ... on RoomPrivateMessage {
                    ...RoomPrivateMessage
                }
                ... on RoomPrivateMessageUpdate {
                    ...RoomPrivateMessageUpdate
                }
                ... on RoomPublicChannel {
                    ...RoomPublicChannel
                }
                ... on RoomPublicChannelUpdate {
                    ...RoomPublicChannelUpdate
                }
                ... on RoomPublicMessage {
                    ...RoomPublicMessage
                }
                ... on RoomPublicMessageUpdate {
                    ...RoomPublicMessageUpdate
                }
                ... on RoomSoundEffect {
                    ...RoomSoundEffect
                }
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
`);
const GetMessagesDoc = graphql(`
    query GetMessages($roomId: String!) {
        result: getMessages(roomId: $roomId) {
            __typename
            ... on RoomMessages {
                pieceLogs {
                    createdAt
                    logType
                    messageId
                    stateId
                    valueJson
                }
                privateMessages {
                    ...RoomPrivateMessage
                }
                publicChannels {
                    key
                    name
                }
                publicMessages {
                    ...RoomPublicMessage
                }
                soundEffects {
                    createdAt
                    createdBy
                    file {
                        path
                        sourceType
                    }
                    messageId
                    volume
                }
            }
            ... on GetRoomMessagesFailureResult {
                failureType
            }
        }
    }
`);
const WritePublicMessageDoc = graphql(`
    mutation WritePublicMessage(
        $roomId: String!
        $text: String!
        $textColor: String
        $channelKey: String!
        $characterId: String
        $customName: String
        $gameType: String
    ) {
        result: writePublicMessage(
            roomId: $roomId
            text: $text
            textColor: $textColor
            channelKey: $channelKey
            characterId: $characterId
            customName: $customName
            gameType: $gameType
        ) {
            __typename
            ... on RoomPublicMessage {
                ...RoomPublicMessage
            }
            ... on WriteRoomPublicMessageFailureResult {
                failureType
            }
            ... on RoomMessageSyntaxError {
                errorMessage
            }
        }
    }
`);
const WritePrivateMessageDoc = graphql(`
    mutation WritePrivateMessage(
        $roomId: String!
        $visibleTo: [String!]!
        $text: String!
        $textColor: String
        $characterId: String
        $customName: String
        $gameType: String
    ) {
        result: writePrivateMessage(
            roomId: $roomId
            visibleTo: $visibleTo
            text: $text
            textColor: $textColor
            characterId: $characterId
            customName: $customName
            gameType: $gameType
        ) {
            __typename
            ... on RoomPrivateMessage {
                ...RoomPrivateMessage
            }
            ... on WriteRoomPrivateMessageFailureResult {
                failureType
            }
            ... on RoomMessageSyntaxError {
                errorMessage
            }
        }
    }
`);
const OperateRoomDoc = graphql(`
    mutation operateRoom(
        $roomId: String!
        $revisionFrom: Int!
        $operation: RoomOperationInput!
        $requestId: String!
    ) {
        result: operateRoom(
            roomId: $roomId
            prevRevision: $revisionFrom
            operation: $operation
            requestId: $requestId
        ) {
            __typename
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
`);
const GetRoomDoc = graphql(`
    query GetRoom($roomId: String!) {
        result: getRoom(roomId: $roomId) {
            __typename
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
`);
const UpdateWritingMessageStatusDoc = graphql(`
    mutation UpdateWritingMessageStatus(
        $roomId: String!
        $newStatus: WritingMessageStatusInputType!
    ) {
        result: updateWritingMessageStatus(roomId: $roomId, newStatus: $newStatus)
    }
`);
const GetRoomConnectionsDoc = graphql(`
    query GetRoomConnections($roomId: String!) {
        result: getRoomConnections(roomId: $roomId) {
            __typename
            ... on GetRoomConnectionsSuccessResult {
                fetchedAt
                connectedUserUids
            }
            ... on GetRoomConnectionsFailureResult {
                failureType
            }
        }
    }
`);

export { CharacterValueForMessageFragmentDoc, FileSourceType, GetMessagesDoc, GetRoomConnectionsDoc, GetRoomDoc, GetRoomFailureType, GetRoomMessagesFailureType, JoinRoomFailureType, OperateRoomDoc, OperateRoomFailureType, ParticipantRole, PieceLogFragmentDoc, PieceLogType, PrereleaseType, RoomAsListItemFragmentDoc, RoomEventDoc, RoomGetStateFragmentDoc, RoomOperationFragmentDoc, RoomPrivateMessageFragmentDoc, RoomPrivateMessageUpdateFragmentDoc, RoomPublicChannelFragmentDoc, RoomPublicChannelUpdateFragmentDoc, RoomPublicMessageFragmentDoc, RoomPublicMessageUpdateFragmentDoc, RoomSoundEffectFragmentDoc, UpdateWritingMessageStatusDoc, WritePrivateMessageDoc, WritePublicMessageDoc, WriteRoomPrivateMessageFailureType, WriteRoomPublicMessageFailureType, WritingMessageStatusInputType, WritingMessageStatusType };
//# sourceMappingURL=index.js.map
