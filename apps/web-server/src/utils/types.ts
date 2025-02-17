import { TabsProps } from 'antd';
import { create, update } from './constants';
import { PixelPosition } from '@/components/models/room/Room/subcomponents/utils/positionAndSizeAndRect';

export type BoardType =
    | { type: 'boardEditor'; boardEditorPanelId: string }
    | { type: 'activeBoardViewer'; isBackground: boolean };

export type CharacterTagNames = {
    characterTag1Name: string | undefined;
    characterTag2Name: string | undefined;
    characterTag3Name: string | undefined;
    characterTag4Name: string | undefined;
    characterTag5Name: string | undefined;
    characterTag6Name: string | undefined;
    characterTag7Name: string | undefined;
    characterTag8Name: string | undefined;
    characterTag9Name: string | undefined;
    characterTag10Name: string | undefined;
};

export type PublicChannelNames = {
    publicChannel1Name: string;
    publicChannel2Name: string;
    publicChannel3Name: string;
    publicChannel4Name: string;
    publicChannel5Name: string;
    publicChannel6Name: string;
    publicChannel7Name: string;
    publicChannel8Name: string;
    publicChannel9Name: string;
    publicChannel10Name: string;
};

export const emptyPublicChannelNames: PublicChannelNames = {
    publicChannel1Name: '',
    publicChannel2Name: '',
    publicChannel3Name: '',
    publicChannel4Name: '',
    publicChannel5Name: '',
    publicChannel6Name: '',
    publicChannel7Name: '',
    publicChannel8Name: '',
    publicChannel9Name: '',
    publicChannel10Name: '',
};

export const reset = 'reset';

export type Reset = { type: typeof reset };

export type Recipe<T> = (state: T) => T | void;

export type PieceModalState =
    | {
          type: typeof create;
          boardId: string;
          piecePosition: PixelPosition;
      }
    | {
          type: typeof update;
          boardId: string;
          pieceId: string;
      };

export type SetAction<State> = State | ((prevState: State) => State);

type ArrayType<T> = T extends Array<infer U> ? U : never;

export type AntdTab = ArrayType<NonNullable<TabsProps['items']>>;
