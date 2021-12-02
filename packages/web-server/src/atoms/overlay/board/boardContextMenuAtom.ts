import {
    CharacterState,
    CharacterPieceState,
    DicePieceState,
    StringPieceState,
    BoardPositionState,
    ImagePieceState,
    PortraitPieceState,
} from '@flocon-trpg/core';
import { atom } from 'jotai';
import { BoardConfig } from '../../roomConfig/types/boardConfig';

export type ContextMenuState = {
    boardId: string;
    boardConfig: BoardConfig;
    offsetX: number;
    offsetY: number;
    pageX: number;
    pageY: number;
    characterPiecesOnCursor: ReadonlyArray<{
        characterId: string;
        character: CharacterState;
        pieceId: string;
        piece: CharacterPieceState;
    }>;
    portraitsOnCursor: ReadonlyArray<{
        characterId: string;
        character: CharacterState;
        pieceId: string;
        piece: PortraitPieceState;
    }>;
    dicePiecesOnCursor: ReadonlyArray<{
        boardId: string;
        pieceId: string;
        piece: DicePieceState;
    }>;
    stringPiecesOnCursor: ReadonlyArray<{
        boardId: string;
        pieceId: string;
        piece: StringPieceState;
    }>;
    imagePiecesOnCursor: ReadonlyArray<{
        boardId: string;
        pieceId: string;
        piece: ImagePieceState;
    }>;
};

export const boardContextMenuAtom = atom<ContextMenuState | null>(null);
