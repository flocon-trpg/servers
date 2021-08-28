import {
    FObject,
    FValue,
    beginCast,
    FBoolean,
    ScriptError,
    OnGettingParams,
    OnSettingParams,
    FString,
} from '@kizahasi/flocon-script';
import * as StrParam from '../ot/room/participant/character/strParam/v1';

const value = 'value';
const isValueSecret = 'isValueSecret';

export class FStrParam extends FObject {
    public constructor(private readonly strParam: StrParam.State) {
        super();
    }

    override getCore({ key }: OnGettingParams): FValue {
        const keyAsString = key.toString();
        switch (keyAsString) {
            case value:
                return this.strParam.value == null ? undefined : new FString(this.strParam.value);
            case isValueSecret:
                return new FBoolean(this.strParam.isValuePrivate);
            default:
                return undefined;
        }
    }

    override setCore({ key, newValue, astInfo }: OnSettingParams): void {
        const keyAsString = key.toString();
        switch (keyAsString) {
            case value:
                this.strParam.value = beginCast(newValue).addString().cast(astInfo?.range);
                return;
            case isValueSecret:
                this.strParam.isValuePrivate = beginCast(newValue)
                    .addBoolean()
                    .cast(astInfo?.range);
                return;
            default:
                throw new ScriptError(`${key}への値のセットは制限されています。`);
        }
    }

    override toJObject(): unknown {
        return this.strParam;
    }
}
