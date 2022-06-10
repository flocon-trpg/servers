import { FilterValue } from 'antd/lib/table/interface';
import { FilePath } from './file/filePath';

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

export const none = 'none';
export const some = 'some';

export type FilesManagerDrawerType =
    | {
          openFileType: typeof none;
          defaultFilteredValue?: FilterValue | undefined;
      }
    | {
          openFileType: typeof some;
          onOpen: (path: FilePath) => void;
          defaultFilteredValue: FilterValue | undefined;
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

export type Vector2 = {
    x: number;
    y: number;
};

export type Size = {
    w: number;
    h: number;
};

export type DragEndResult = {
    readonly newPosition?: Vector2;
    readonly newSize?: Size;
};

export type PiecePositionWithoutCell = Vector2 & Size;

export type PiecePositionWithCell = PiecePositionWithoutCell & {
    cellX: number;
    cellY: number;
    cellW: number;
    cellH: number;
};
export type FetchTextState =
    | {
          // fetch関数などの実行が完了していない状態。
          fetched: false;
      }
    | {
          fetched: true;

          // fetch関数などを実行した結果、ファイルが見つかった場合はそのファイルの内容。見つからなかった場合はnull。
          value: string | null;
      };
