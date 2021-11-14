import { CharacterState } from '@flocon-trpg/core';
import { CompositeKey } from '@flocon-trpg/utils';
import { DicePieceValueElement } from '../../../hooks/state/useDicePieceValues';
import { ImagePieceValueElement } from '../../../hooks/state/useImagePieceValues';
import { StringPieceValueElement } from '../../../hooks/state/useStringPieceValues';

export const background = 'background';
export const character = 'character';
export const tachie = 'tachie';
export const dicePieceValue = 'dicePieceValue';
export const numberPieceValue = 'numberPieceValue';
export const imagePieceValue = 'imagePieceValue';

export type ClickOn =
    | {
          type: typeof dicePieceValue;
          element: DicePieceValueElement;
      }
    | {
          type: typeof numberPieceValue;
          element: StringPieceValueElement;
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
