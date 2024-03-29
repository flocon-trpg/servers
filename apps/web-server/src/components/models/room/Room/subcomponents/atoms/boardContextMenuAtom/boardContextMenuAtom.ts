import {
    State,
    characterPieceTemplate,
    characterTemplate,
    dicePieceTemplate,
    imagePieceTemplate,
    portraitPieceTemplate,
    shapePieceTemplate,
    stringPieceTemplate,
} from '@flocon-trpg/core';
import { atom } from 'jotai/vanilla';
import { BoardConfig } from '@/atoms/roomConfigAtom/types/boardConfig';

type CharacterState = State<typeof characterTemplate>;
type CharacterPieceState = State<typeof characterPieceTemplate>;
type DicePieceState = State<typeof dicePieceTemplate>;
type ShapePieceState = State<typeof shapePieceTemplate>;
type StringPieceState = State<typeof stringPieceTemplate>;
type ImagePieceState = State<typeof imagePieceTemplate>;
type PortraitPieceState = State<typeof portraitPieceTemplate>;

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
    shapePiecesOnCursor: ReadonlyArray<{
        boardId: string;
        pieceId: string;
        piece: ShapePieceState;
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
