import {
    FBoolean,
    FObject,
    FValue,
    OnGettingParams,
    OnSettingParams,
    ScriptError,
    beginCast,
} from '@flocon-trpg/flocon-script';
import * as BoolParam from '../ot/flocon/room/character/boolParam/types';
import { State } from '../ot/generator';

const value = 'value';
const isValueSecret = 'isValueSecret';

export class FBoolParam extends FObject {
    public constructor(private readonly boolParam: State<typeof BoolParam.template>) {
        super();
    }

    override getCore({ key }: OnGettingParams): FValue {
        const keyAsString = key.toString();
        switch (keyAsString) {
            case value:
                return this.boolParam.value == null
                    ? undefined
                    : new FBoolean(this.boolParam.value);
            case isValueSecret:
                return new FBoolean(this.boolParam.isValuePrivate);
            default:
                return undefined;
        }
    }

    override setCore({ key, newValue, astInfo }: OnSettingParams): void {
        const keyAsString = key.toString();
        switch (keyAsString) {
            case value:
                this.boolParam.value = beginCast(newValue, astInfo)
                    .addBoolean()
                    .addUndefined()
                    .cast();
                return;
            case isValueSecret:
                this.boolParam.isValuePrivate = beginCast(newValue, astInfo).addBoolean().cast();
                return;
            default:
                throw new ScriptError(
                    `${typeof key === 'symbol' ? 'symbol' : key}への値のセットは制限されています。`
                );
        }
    }

    override toJObject(): unknown {
        return this.boolParam;
    }
}
