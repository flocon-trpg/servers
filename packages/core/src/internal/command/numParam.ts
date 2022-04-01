import {
    FObject,
    FValue,
    beginCast,
    FNumber,
    FBoolean,
    ScriptError,
    OnGettingParams,
    OnSettingParams,
} from '@flocon-trpg/flocon-script';
import { State } from '../ot/generator';
import * as NumParam from '../ot/room/character/numParam/types';

const value = 'value';
const isValueSecret = 'isValueSecret';

export class FNumParam extends FObject {
    public constructor(private readonly numParam: State<typeof NumParam.template>) {
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
                this.numParam.value = beginCast(newValue, astInfo)
                    .addNumber()
                    .addUndefined()
                    .cast();
                return;
            case isValueSecret:
                this.numParam.isValuePrivate = beginCast(newValue, astInfo).addBoolean().cast();
                return;
            default:
                throw new ScriptError(
                    `${typeof key === 'symbol' ? 'symbol' : key}への値のセットは制限されています。`
                );
        }
    }

    override toJObject(): unknown {
        return this.numParam;
    }
}
