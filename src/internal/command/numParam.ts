import {
    FObject,
    FValue,
    beginCast,
    FNumber,
    FBoolean,
    ScriptError,
    OnGettingParams,
    OnSettingParams,
} from '@kizahasi/flocon-script';
import * as NumParam from '../ot/room/participant/character/numParam/types';

const value = 'value';
const isValueSecret = 'isValueSecret';

export class FNumParam extends FObject {
    public constructor(private readonly numParam: NumParam.State) {
        super();
    }

    override getCore({ key }: OnGettingParams): FValue {
        const keyAsString = key.toString();
        switch (keyAsString) {
            case value:
                return this.numParam.value == null ? undefined : new FNumber(this.numParam.value);
            case isValueSecret:
                return new FBoolean(this.numParam.isValuePrivate);
            default:
                return undefined;
        }
    }

    override setCore({ key, newValue, astInfo }: OnSettingParams): void {
        const keyAsString = key.toString();
        switch (keyAsString) {
            case value:
                this.numParam.value = beginCast(newValue)
                    .addNumber()
                    .addUndefined()
                    .cast(astInfo?.range);
                return;
            case isValueSecret:
                this.numParam.isValuePrivate = beginCast(newValue)
                    .addBoolean()
                    .cast(astInfo?.range);
                return;
            default:
                throw new ScriptError(`${key}への値のセットは制限されています。`);
        }
    }

    override toJObject(): unknown {
        return this.numParam;
    }
}
