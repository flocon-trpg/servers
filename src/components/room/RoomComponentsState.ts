import { PieceState } from '@kizahasi/flocon-core';
import { CompositeKey } from '@kizahasi/util';

export const create = 'create';
export const update = 'update';
export const characterParameterNamesDrawerVisibility = 'characterParameterNamesDrawerVisibility';
export const boardDrawerType = 'boardDrawerType';
export const characterDrawerType = 'characterDrawerType';
export const myNumberValueDrawerType = 'myNumberValueDrawerType';
export const editRoomDrawerVisibility = 'editRoomDrawerVisibility';

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
    // non-nullishならばPieceの編集UIも表示される。
    // Pieceの編集はcreateとupdate兼用。どちらの場合でもboardKeyとcharacterKeyの値は最初から決まっている。
    boardKey?: CompositeKey;
}

export type MyNumberValueDrawerType = {
    // pieceとともに作成するケース
    type: typeof create;
    boardKey: CompositeKey;
    piece: PieceState;
} | {
    // pieceは作成しないケース
    type: typeof create;
    boardKey: null;
    piece: null;
} | {
    type: typeof update;
    // boardKey != nullならば、pieceが指定されたupdate。そうでないならばpieceが指定されないupdate。
    boardKey: CompositeKey | null;
    stateKey: string;
}

export type RoomComponentsState = {
    characterParameterNamesDrawerVisibility: boolean;
    boardDrawerType: BoardEditorDrawerType | null;
    characterDrawerType: CharacterEditorDrawerType | null;
    myNumberValueDrawerType: MyNumberValueDrawerType | null;
    editRoomDrawerVisibility: boolean;
}

export const defaultRoomComponentsState: RoomComponentsState = {
    characterParameterNamesDrawerVisibility: false,
    boardDrawerType: null,
    characterDrawerType: null,
    myNumberValueDrawerType: null,
    editRoomDrawerVisibility: false,
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
    type: typeof myNumberValueDrawerType;
    newValue: MyNumberValueDrawerType | null;
} | {
    type: typeof editRoomDrawerVisibility;
    newValue: boolean;
}

export const reduceComponentsState = (state: RoomComponentsState, action: RoomComponentsAction): RoomComponentsState => {
    switch (action.type) {
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
        case myNumberValueDrawerType:
            return {
                ...state,
                myNumberValueDrawerType: action.newValue
            };
        case characterParameterNamesDrawerVisibility:
            return {
                ...state,
                characterParameterNamesDrawerVisibility: action.newValue
            };
        case editRoomDrawerVisibility:
            return {
                ...state,
                editRoomDrawerVisibility: action.newValue,
            };
    }
};