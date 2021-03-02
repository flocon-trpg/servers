import { CompositeKey } from '../../@shared/StateMap';

export const create = 'create';
export const update = 'update';
export const characterParameterNamesDrawerVisibility = 'characterParameterNamesDrawerVisibility';
export const boardDrawerType = 'boardDrawerType';
export const characterDrawerType = 'characterDrawerType';
export const editRoomDrawerVisibility = 'editRoomDrawerVisibility';
export const editParticipantDrawerVisibility = 'editParticipantDrawerVisibility';
export const createPrivateMessageDrawerVisibility = 'createPrivateMessageDrawerVisibility';

export type BoardEditorDrawerType = {
    type: typeof create;
} | {
    type: typeof update;
    stateKey: CompositeKey;
}

export type CharacterEditorDrawerType = {
    type: typeof create;
} | {
    type: typeof update;
    stateKey: CompositeKey;
    // non-nullishならばPieceLocationの編集UIも表示される。
    // PieceLocationの編集はcreateとupdate兼用。どちらの場合でもboardKeyとcharacterKeyの値は最初から決まっている。
    boardKey?: CompositeKey;
}

export type RoomComponentsState = {
    characterParameterNamesDrawerVisibility: boolean;
    boardDrawerType: BoardEditorDrawerType | null;
    characterDrawerType: CharacterEditorDrawerType | null;
    editRoomDrawerVisibility: boolean;
    editParticipantDrawerVisibility: boolean;
    createPrivateMessageDrawerVisibility: boolean;
}

export const defaultRoomComponentsState: RoomComponentsState = {
    characterParameterNamesDrawerVisibility: false,
    boardDrawerType: null,
    characterDrawerType: null,
    editRoomDrawerVisibility: false,
    editParticipantDrawerVisibility: true,
    createPrivateMessageDrawerVisibility: false,
};

export type RoomComponentsAction = {
    type: typeof characterParameterNamesDrawerVisibility;
    newValue: boolean;
} | {
    type: typeof boardDrawerType;
    newValue: BoardEditorDrawerType | null;
} | {
    type: typeof characterDrawerType;
    newValue: CharacterEditorDrawerType | null;
} | {
    type: typeof editRoomDrawerVisibility;
    newValue: boolean;
} | {
    type: typeof editParticipantDrawerVisibility;
    newValue: boolean;
} | {
    type: typeof createPrivateMessageDrawerVisibility;
    newValue: boolean;
}

export const reduceComponentsState = (state: RoomComponentsState, action: RoomComponentsAction): RoomComponentsState => {
    switch(action.type) {
        case boardDrawerType:
            return {
                ...state,
                boardDrawerType: action.newValue,
            };
        case characterDrawerType:
            return {
                ...state,
                characterDrawerType: action.newValue,
            };
        case characterParameterNamesDrawerVisibility:
            return {
                ...state,
                characterParameterNamesDrawerVisibility: action.newValue
            };
        case createPrivateMessageDrawerVisibility:
            return {
                ...state,
                createPrivateMessageDrawerVisibility: action.newValue,
            };
        case editParticipantDrawerVisibility:
            return {
                ...state,
                editParticipantDrawerVisibility: action.newValue,
            };
        case editRoomDrawerVisibility:
            return {
                ...state,
                editRoomDrawerVisibility: action.newValue,
            };
    }
};