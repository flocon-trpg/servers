import {
    AstInfo,
    beginCast,
    FFunction,
    FObject,
    FValue,
    OnGettingParams,
    ScriptError,
} from '@kizahasi/flocon-script';
import { recordToArray } from '@kizahasi/util';
import * as Character from '../ot/room/character/v1';
import * as StrParam from '../ot/room/character/strParam/v1';
import * as Room from '../ot/room/v1';
import { FStrParam } from './strParam';

const createDefaultState = (): StrParam.State => ({
    $version: 1,
    value: '',
    isValuePrivate: false,
});

export class FStrParams extends FObject {
    public constructor(
        private readonly strParams: Character.State['strParams'],
        private readonly room: Room.State
    ) {
        super();
    }

    private findKeysByName(nameOrKey: string | number) {
        return recordToArray(this.room.numParamNames)
            .filter(({ value }, i) => value.name === nameOrKey || i + 1 === nameOrKey)
            .map(({ key }) => key);
    }

    private findByName(nameOrKeyValue: FValue, astInfo: AstInfo | undefined) {
        const name = beginCast(nameOrKeyValue).addString().cast(astInfo?.range);
        const keys = this.findKeysByName(name);
        for (const key of keys) {
            const found = this.strParams[key];
            if (found == null) {
                const newValue = createDefaultState();
                this.strParams[key] = newValue;
                return newValue;
            }
            return found;
        }
        return undefined;
    }

    private setIsValuePrivate(
        nameOrKeyValue: FValue,
        newValue: FValue,
        astInfo: AstInfo | undefined
    ) {
        const $newValue = beginCast(newValue).addBoolean().cast(astInfo?.range);
        const found = this.findByName(nameOrKeyValue, astInfo);
        if (found == null) {
            return;
        }
        found.isValuePrivate = $newValue;
    }

    override getCore({ key, astInfo }: OnGettingParams): FValue {
        const keyAsString = key.toString();
        switch (keyAsString) {
            case 'find':
                return new FFunction(
                    ({ args }) => {
                        const result = this.findByName(args[0], astInfo);
                        if (result == null) {
                            return undefined;
                        }
                        return new FStrParam(result);
                    },
                    this,
                    false
                );
            case 'setValue':
                return new FFunction(
                    ({ args }) => {
                        const newValue = beginCast(args[1]).addString().cast(astInfo?.range);
                        const found = this.findByName(args[0], astInfo);
                        if (found == null) {
                            return;
                        }
                        found.value = newValue;
                        return undefined;
                    },
                    this,
                    false
                );
            case 'setIsValueSecret':
                return new FFunction(
                    ({ args }) => {
                        this.setIsValuePrivate(args[0], args[1], astInfo);
                        return undefined;
                    },
                    this,
                    false
                );

            default:
                break;
        }
        return undefined;
    }

    override setCore(): void {
        throw new ScriptError('値のセットは制限されています。');
    }

    override toJObject(): unknown {
        return this.strParams;
    }
}
