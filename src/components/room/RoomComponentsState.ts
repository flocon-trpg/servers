import { CompositeKey } from '../../@shared/StateMap';
import * as Character from '../../stateManagers/states/character';

export const create = 'create';
export const update = 'update';
export const characterParameterNamesDrawerVisibility = 'characterParameterNamesDrawerVisibility';
export const boardDrawerType = 'boardDrawerType';
export const characterDrawerType = 'characterDrawerType';
export const editRoomDrawerVisibility = 'editRoomDrawerVisibility';
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
    createPrivateMessageDrawerVisibility: boolean;
}

export const defaultRoomComponentsState: RoomComponentsState = {
    characterParameterNamesDrawerVisibility: false,
    boardDrawerType: null,
    characterDrawerType: null,
    editRoomDrawerVisibility: false,
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
    type: typeof createPrivateMessageDrawerVisibility;
    newValue: boolean;
}

export const reduce = (state: RoomComponentsState, action: RoomComponentsAction): RoomComponentsState => {
    switch(action.type) {
        case characterParameterNamesDrawerVisibility:
            return {
                ...state,
                characterParameterNamesDrawerVisibility: action.newValue
            };
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
        case editRoomDrawerVisibility:
            return {
                ...state,
                editRoomDrawerVisibility: action.newValue,
            };
        case createPrivateMessageDrawerVisibility:
            return {
                ...state,
                createPrivateMessageDrawerVisibility: action.newValue,
            };
    }
};