import {
    FBoolean,
    FNumber,
    FObject,
    FTypedArray,
    FValue,
    OnGettingParams,
    OnSettingParams,
    ScriptError,
    beginCast,
} from '@flocon-trpg/flocon-script';
import * as BgmTypes from '../ot/flocon/room/bgm/types';
import { State } from '../ot/generator/types';
import { toFFilePath, toFilePath } from './filePath';

const isPlaying = 'isPlaying';
const files = 'files';
const volume = 'volume';

export class FBgm extends FObject {
    public constructor(private readonly bgm: State<typeof BgmTypes.template>) {
        super();
    }

    override getCore({ key }: OnGettingParams): FValue {
        const keyAsString = key.toString();
        switch (keyAsString) {
            case isPlaying:
                return new FBoolean(!this.bgm.isPaused);
            case files:
                return new FTypedArray(
                    this.bgm.files,
                    value => toFFilePath(value, undefined),
                    (value, astInfo) => toFilePath(value, astInfo),
                );
            case volume:
                return new FNumber(this.bgm.volume * 100);
            default:
                break;
        }
        return undefined;
    }

    override setCore({ key, newValue, astInfo }: OnSettingParams): void {
        const keyAsString = key.toString();
        switch (keyAsString) {
            case isPlaying: {
                const $newValue = beginCast(newValue, astInfo).addBoolean().cast();
                this.bgm.isPaused = !$newValue;
                return;
            }
            case files: {
                const $newValue = beginCast(newValue, astInfo).addArray().cast();
                this.bgm.files = $newValue.toJArray().map(x => toFilePath(x, astInfo));
                return;
            }
            case volume: {
                const $newValue = beginCast(newValue, astInfo).addNumber().cast();
                this.bgm.volume = $newValue / 100;
                return;
            }
            default:
                break;
        }
        throw new ScriptError('値のセットは制限されています。');
    }

    override toJObject(): unknown {
        return this.bgm;
    }
}
