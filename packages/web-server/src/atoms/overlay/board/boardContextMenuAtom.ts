import {
    CharacterState,
    PieceState,
    DicePieceValueState,
    StringPieceValueState,
    BoardPositionState,
    ImagePieceValueState,
} from '@flocon-trpg/core';
import { atom } from 'jotai';
import { ImagePieceValueElement } from '../../../hooks/state/useImagePieceValues';
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
        piece: PieceState;
    }>;
    portraitsOnCursor: ReadonlyArray<{
        characterId: string;
        character: CharacterState;
        portraitPositionId: string;
        portraitPosition: BoardPositionState;
    }>;
    dicePieceValuesOnCursor: ReadonlyArray<{
        dicePieceValueId: string;
        dicePieceValue: DicePieceValueState;
        piece: PieceState;
    }>;
    stringPieceValuesOnCursor: ReadonlyArray<{
        stringPieceValueId: string;
        stringPieceValue: StringPieceValueState;
        piece: PieceState;
    }>;
    imagePieceValuesOnCursor: ReadonlyArray<{
        imagePieceValueId: string;
        imagePieceValue: ImagePieceValueState;
        piece: PieceState;
    }>;
};

export const boardContextMenuAtom = atom<ContextMenuState | null>(null);
