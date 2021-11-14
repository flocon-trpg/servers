import {
    CharacterState,
    PieceState,
    BoardLocationState,
    DicePieceValueState,
    StringPieceValueState,
} from '@flocon-trpg/core';
import { CompositeKey } from '@flocon-trpg/utils';
import { atom } from 'jotai';
import { ImagePieceValueElement } from '../../../hooks/state/useImagePieceValues';
import { BoardConfig } from '../../roomConfig/types/boardConfig';

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
        pieceKey: CompositeKey;
        piece: PieceState;
    }>;
    tachiesOnCursor: ReadonlyArray<{
        characterKey: CompositeKey;
        character: CharacterState;
        tachieLocationKey: CompositeKey;
        tachieLocation: BoardLocationState;
    }>;
    dicePieceValuesOnCursor: ReadonlyArray<{
        characterKey: CompositeKey;
        dicePieceValueKey: string;
        dicePieceValue: DicePieceValueState;
        piece: PieceState;
    }>;
    stringPieceValuesOnCursor: ReadonlyArray<{
        characterKey: CompositeKey;
        stringPieceValueKey: string;
        stringPieceValue: StringPieceValueState;
        piece: PieceState;
    }>;
    imagePieceValuesOnCursor: ReadonlyArray<ImagePieceValueElement>;
};

export const boardContextMenuAtom = atom<ContextMenuState | null>(null);
