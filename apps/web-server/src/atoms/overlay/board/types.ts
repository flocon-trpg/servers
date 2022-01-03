import {
    BoardPositionState,
    CharacterState,
    DicePieceState,
    ImagePieceState,
    StringPieceState,
} from '@flocon-trpg/core';

export const background = 'background';
export const character = 'character';
export const portrait = 'portrait';
export const dicePiece = 'dicePiece';
export const stringPiece = 'stringPiece';
export const imagePiece = 'imagePiece';

export type ClickOn =
    | {
          type: typeof dicePiece;
          boardId: string;
          pieceId: string;
          piece: DicePieceState;
      }
    | {
          type: typeof stringPiece;
          boardId: string;
          pieceId: string;
          piece: StringPieceState;
      }
    | {
          type: typeof imagePiece;
          boardId: string;
          pieceId: string;
          piece: ImagePieceState;
      }
    | {
          type: typeof character | typeof portrait;
          characterId: string;
          pieceId: string;
          character: CharacterState;
      };

export type MouseOverOn =
    | {
          type: typeof background;
      }
    | ClickOn;
