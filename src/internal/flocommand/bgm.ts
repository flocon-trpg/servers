import {
    beginCast,
    FBoolean,
    FNumber,
    FObject,
    FTypedArray,
    FValue,
    OnGettingParams,
    OnSettingParams,
    ScriptError,
} from '@kizahasi/flocon-script';
import * as Bgm from '../ot/room/bgm/v1';
import { toFFilePath, toFilePath } from './filePath';

const isPlaying = 'isPlaying';
const files = 'files';
const volume = 'volume';

export class FBgm extends FObject {
    public constructor(private readonly bgm: Bgm.State) {
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
                    (value, astInfo) => toFilePath(value, astInfo)
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
                const $newValue = beginCast(newValue).addBoolean().cast(astInfo?.range);
                this.bgm.isPaused = !$newValue;
                return;
            }
            case files: {
                const $newValue = beginCast(newValue).addArray().cast(astInfo?.range);
                this.bgm.files = $newValue.iterate().map(x => toFilePath(x, astInfo));
                return;
            }
            case volume: {
                const $newValue = beginCast(newValue).addNumber().cast(astInfo?.range);
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
