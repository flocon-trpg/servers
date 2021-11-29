import { CharacterState } from '@flocon-trpg/core';
import { DicePieceValueElement } from '../../../hooks/state/useDicePieceValues';
import { ImagePieceValueElement } from '../../../hooks/state/useImagePieceValues';
import { StringPieceValueElement } from '../../../hooks/state/useStringPieceValues';

export const background = 'background';
export const character = 'character';
export const portrait = 'portrait';
export const dicePieceValue = 'dicePieceValue';
export const stringPieceValue = 'stringPieceValue';
export const imagePieceValue = 'imagePieceValue';

export type ClickOn =
    | {
          type: typeof dicePieceValue;
          element: DicePieceValueElement;
      }
    | {
          type: typeof stringPieceValue;
          element: StringPieceValueElement;
      }
    | {
          type: typeof imagePieceValue;
          element: ImagePieceValueElement;
      }
    | {
          type: typeof character | typeof portrait;
          characterId: string;
          character: CharacterState;
      };

export type MouseOverOn =
    | {
          type: typeof background;
      }
    | ClickOn;
