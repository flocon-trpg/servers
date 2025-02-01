import {
    State,
    characterTemplate,
    deckPieceTemplate,
    dicePieceTemplate,
    imagePieceTemplate,
    shapePieceTemplate,
    stringPieceTemplate,
} from '@flocon-trpg/core';

type CharacterState = State<typeof characterTemplate>;
type DeckPieceState = State<typeof deckPieceTemplate>;
type DicePieceState = State<typeof dicePieceTemplate>;
type ShapePieceState = State<typeof shapePieceTemplate>;
type StringPieceState = State<typeof stringPieceTemplate>;
type ImagePieceState = State<typeof imagePieceTemplate>;

export const background = 'background';
export const character = 'character';
export const portrait = 'portrait';
export const deckPiece = 'deckPiece';
export const dicePiece = 'dicePiece';
export const shapePiece = 'shapePiece';
export const stringPiece = 'stringPiece';
export const imagePiece = 'imagePiece';

export type ClickOn =
    | {
          type: typeof deckPiece;
          boardId: string;
          pieceId: string;
          piece: DeckPieceState;
      }
    | {
          type: typeof dicePiece;
          boardId: string;
          pieceId: string;
          piece: DicePieceState;
      }
    | {
          type: typeof imagePiece;
          boardId: string;
          pieceId: string;
          piece: ImagePieceState;
      }
    | {
          type: typeof shapePiece;
          boardId: string;
          pieceId: string;
          piece: ShapePieceState;
      }
    | {
          type: typeof stringPiece;
          boardId: string;
          pieceId: string;
          piece: StringPieceState;
      }
    | {
          type: typeof character | typeof portrait;
          boardId: string;
          characterId: string;
          pieceId: string;
          character: CharacterState;
      };

export type MouseOverOn =
    | {
          type: typeof background;
      }
    | ClickOn;

export type D6Value = 1 | 2 | 3 | 4 | 5 | 6;
export const noDie = 'noDie';
export const noValue = 'noValue';
