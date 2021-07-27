import {
    BoardLocationState,
    CharacterState,
    DicePieceValueState,
    NumberPieceValueState,
    PieceState,
} from '@kizahasi/flocon-core';
import { CompositeKey } from '@kizahasi/util';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MyKonva } from '../components/MyKonva';
import { DicePieceValueElement } from '../hooks/state/useDicePieceValues';
import { ImagePieceValueElement } from '../hooks/state/useImagePieces';
import { NumberPieceValueElement } from '../hooks/state/useNumberPieceValues';
import { BoardConfig } from '../states/BoardConfig';

export const create = 'create';
export const update = 'update';
export const characterParameterNamesDrawerVisibility = 'characterParameterNamesDrawerVisibility';
export const boardDrawerType = 'boardDrawerType';
export const characterDrawerType = 'characterDrawerType';
export const myNumberValueDrawerType = 'myNumberValueDrawerType';
export const editRoomDrawerVisibility = 'editRoomDrawerVisibility';
export const background = 'background';
export const character = 'character';
export const tachie = 'tachie';
export const dicePieceValue = 'dicePieceValue';
export const numberPieceValue = 'numberPieceValue';
export const imagePieceValue = 'imagePieceValue';
export const characterCommand = 'characterCommand';

export type BoardEditorDrawerType =
    | {
          type: typeof create;
      }
    | {
          type: typeof update;
          stateKey: CompositeKey;
      };

export type CharacterEditorDrawerType =
    | {
          type: typeof create;
      }
    | {
          type: typeof update;
          stateKey: CompositeKey;
          // non-nullishならばPieceの編集UIも表示される。
          // Pieceの編集はcreateとupdate兼用。どちらの場合でもboardKeyとcharacterKeyの値は最初から決まっている。
          boardKey?: CompositeKey;
      };

export type PieceValueDrawerType =
    | {
          // pieceとともに作成するケース
          type: typeof create;
          boardKey: CompositeKey;
          piece: PieceState;
      }
    | {
          // pieceは作成しないケース
          type: typeof create;
          boardKey: null;
          piece: null;
      }
    | {
          type: typeof update;
          characterKey: CompositeKey;
          // boardKey != nullならば、pieceが指定されたupdate。そうでないならばpieceが指定されないupdate。
          boardKey: CompositeKey | null;
          stateKey: string;
      };

export type ImagePieceDrawerType =
    | {
          // pieceとともに作成するケース
          type: typeof create;
          boardKey: CompositeKey;
          piece: PieceState;
      }
    | {
          // pieceは作成しないケース
          type: typeof create;
          boardKey: null;
          piece: null;
      }
    | {
          type: typeof update;
          participantKey: string;
          // boardKey != nullならば、pieceが指定されたupdate。そうでないならばpieceが指定されないupdate。
          boardKey: CompositeKey | null;
          stateKey: string;
      };

export type ChatPaletteOrCommandEditorModalType = {
    type: typeof characterCommand;
    characterKey: CompositeKey;
};

export type ClickOn =
    | {
          type: typeof dicePieceValue;
          element: DicePieceValueElement;
      }
    | {
          type: typeof numberPieceValue;
          element: NumberPieceValueElement;
      }
    | {
          type: typeof imagePieceValue;
          element: ImagePieceValueElement;
      }
    | {
          type: typeof character | typeof tachie;
          characterKey: CompositeKey;
          character: CharacterState;
      };

export type MouseOverOn =
    | {
          type: typeof background;
      }
    | ClickOn;

export type ContextMenuState = {
    boardKey: CompositeKey;
    boardConfig: BoardConfig;
    offsetX: number;
    offsetY: number;
    pageX: number;
    pageY: number;
    characterPiecesOnCursor: ReadonlyArray<{
        characterKey: CompositeKey;
        character: CharacterState;
        piece: PieceState;
    }>;
    tachiesOnCursor: ReadonlyArray<{
        characterKey: CompositeKey;
        character: CharacterState;
        tachieLocation: BoardLocationState;
    }>;
    dicePieceValuesOnCursor: ReadonlyArray<{
        characterKey: CompositeKey;
        dicePieceValueKey: string;
        dicePieceValue: DicePieceValueState;
        piece: PieceState;
    }>;
    numberPieceValuesOnCursor: ReadonlyArray<{
        characterKey: CompositeKey;
        numberPieceValueKey: string;
        numberPieceValue: NumberPieceValueState;
        piece: PieceState;
    }>;
    imagePieceValuesOnCursor: ReadonlyArray<ImagePieceValueElement>;
};
// pageX, pageYではなくpagePositionでまとめられているのには、特に理由はない
export type BoardTooltipState = { pagePosition: MyKonva.Vector2; mouseOverOn: MouseOverOn };
export type BoardPopoverEditorState = { pagePosition: MyKonva.Vector2; dblClickOn: ClickOn };

export type State = {
    characterParameterNamesDrawerVisibility: boolean;
    boardDrawerType: BoardEditorDrawerType | null;
    characterDrawerType: CharacterEditorDrawerType | null;
    dicePieceValueDrawerType: PieceValueDrawerType | null;
    imagePieceDrawerType: ImagePieceDrawerType | null;
    numberPieceValueDrawerType: PieceValueDrawerType | null;
    editRoomDrawerVisibility: boolean;
    chatPaletteEditorModalType: ChatPaletteOrCommandEditorModalType | null;
    commandEditorModalType: ChatPaletteOrCommandEditorModalType | null;

    boardContextMenu: ContextMenuState | null;
    boardTooltip: BoardTooltipState | null;
    boardPopoverEditor: BoardPopoverEditorState | null;
};

const initState: State = {
    characterParameterNamesDrawerVisibility: false,
    boardDrawerType: null,
    characterDrawerType: null,
    dicePieceValueDrawerType: null,
    imagePieceDrawerType: null,
    numberPieceValueDrawerType: null,
    editRoomDrawerVisibility: false,
    chatPaletteEditorModalType: null,
    commandEditorModalType: null,

    boardContextMenu: null,
    boardTooltip: null,
    boardPopoverEditor: null,
};

export const roomDrawerAndPopoverAndModalModule = createSlice({
    name: 'roomDrawerAndPopoverAndModal',
    initialState: initState as State,
    reducers: {
        set: (state: State, action: PayloadAction<Partial<State>>) => {
            return {
                characterParameterNamesDrawerVisibility:
                    action.payload.characterParameterNamesDrawerVisibility === undefined
                        ? state.characterParameterNamesDrawerVisibility
                        : action.payload.characterParameterNamesDrawerVisibility,
                boardDrawerType:
                    action.payload.boardDrawerType === undefined
                        ? state.boardDrawerType
                        : action.payload.boardDrawerType,
                chatPaletteEditorModalType:
                    action.payload.chatPaletteEditorModalType=== undefined
                        ? state.chatPaletteEditorModalType
                        : action.payload.chatPaletteEditorModalType,
                characterDrawerType:
                    action.payload.characterDrawerType === undefined
                        ? state.characterDrawerType
                        : action.payload.characterDrawerType,
                dicePieceValueDrawerType:
                    action.payload.dicePieceValueDrawerType === undefined
                        ? state.dicePieceValueDrawerType
                        : action.payload.dicePieceValueDrawerType,
                imagePieceDrawerType:
                    action.payload.imagePieceDrawerType === undefined
                        ? state.imagePieceDrawerType
                        : action.payload.imagePieceDrawerType,
                numberPieceValueDrawerType:
                    action.payload.numberPieceValueDrawerType === undefined
                        ? state.numberPieceValueDrawerType
                        : action.payload.numberPieceValueDrawerType,
                editRoomDrawerVisibility:
                    action.payload.editRoomDrawerVisibility === undefined
                        ? state.editRoomDrawerVisibility
                        : action.payload.editRoomDrawerVisibility,
                commandEditorModalType:
                    action.payload.commandEditorModalType === undefined
                        ? state.commandEditorModalType
                        : action.payload.commandEditorModalType,

                boardContextMenu:
                    action.payload.boardContextMenu === undefined
                        ? state.boardContextMenu
                        : action.payload.boardContextMenu,
                boardTooltip:
                    action.payload.boardTooltip === undefined
                        ? state.boardTooltip
                        : action.payload.boardTooltip,
                boardPopoverEditor:
                    action.payload.boardPopoverEditor === undefined
                        ? state.boardPopoverEditor
                        : action.payload.boardPopoverEditor,
            };
        },
        reset: (state: State, action: PayloadAction<void>) => {
            return initState;
        },
    },
});
