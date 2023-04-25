import {
    FBoolean,
    FObject,
    FString,
    FValue,
    OnGettingParams,
    OnSettingParams,
    ScriptError,
    beginCast,
} from '@flocon-trpg/flocon-script';
import * as StrParam from '../ot/flocon/room/character/strParam/types';
import { State } from '../ot/generator/types';

const value = 'value';
const isValueSecret = 'isValueSecret';

export class FStrParam extends FObject {
    public constructor(private readonly strParam: State<typeof StrParam.template>) {
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
                this.strParam.value = beginCast(newValue, astInfo).addString().cast();
                return;
            case isValueSecret:
                this.strParam.isValuePrivate = beginCast(newValue, astInfo).addBoolean().cast();
                return;
            default:
                throw new ScriptError(
                    `${typeof key === 'symbol' ? 'symbol' : key}への値のセットは制限されています。`
                );
        }
    }

    override toJObject(): unknown {
        return this.strParam;
    }
}
