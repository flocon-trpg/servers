import { FilterValue } from 'antd/lib/table/interface';
import { FilePath } from './filePath';

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
    readonly newLocation?: Vector2;
    readonly newSize?: Size;
};
