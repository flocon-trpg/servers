import { PieceState } from '@kizahasi/flocon-core';
import { CompositeKey } from '@kizahasi/util';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

export type PieceValueDrawerType = {
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
    characterKey: CompositeKey;
    // boardKey != nullならば、pieceが指定されたupdate。そうでないならばpieceが指定されないupdate。
    boardKey: CompositeKey | null;
    stateKey: string;
}

export type State = {
    characterParameterNamesDrawerVisibility: boolean;
    boardDrawerType: BoardEditorDrawerType | null;
    characterDrawerType: CharacterEditorDrawerType | null;
    dicePieceValueDrawerType: PieceValueDrawerType | null;
    numberPieceValueDrawerType: PieceValueDrawerType | null;
    editRoomDrawerVisibility: boolean;
}

const initState: State = {
    characterParameterNamesDrawerVisibility: false,
    boardDrawerType: null,
    characterDrawerType: null,
    dicePieceValueDrawerType: null,
    numberPieceValueDrawerType: null,
    editRoomDrawerVisibility: false,
};

export const roomDrawerModule = createSlice({
    name: 'roomDrawer',
    initialState: initState as State,
    reducers: {
        set: (state: State, action: PayloadAction<Partial<State>>) => {
            return {
                characterParameterNamesDrawerVisibility: action.payload.characterParameterNamesDrawerVisibility === undefined ? state.characterParameterNamesDrawerVisibility : action.payload.characterParameterNamesDrawerVisibility,
                boardDrawerType: action.payload.boardDrawerType === undefined ?state.boardDrawerType : action.payload.boardDrawerType,
                characterDrawerType: action.payload.characterDrawerType === undefined ? state.characterDrawerType : action.payload.characterDrawerType,
                dicePieceValueDrawerType: action.payload.dicePieceValueDrawerType === undefined ? state.dicePieceValueDrawerType : action.payload.dicePieceValueDrawerType,
                numberPieceValueDrawerType: action.payload.numberPieceValueDrawerType === undefined ? state.numberPieceValueDrawerType : action.payload.numberPieceValueDrawerType,
                editRoomDrawerVisibility: action.payload.editRoomDrawerVisibility === undefined ? state.editRoomDrawerVisibility : action.payload.editRoomDrawerVisibility,
            };
        },
        reset: (state: State, action: PayloadAction<void>) => {
            return initState;
        },
    }
});