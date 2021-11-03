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
import * as Character from '../ot/room/participant/character/types';
import * as NumParam from '../ot/room/participant/character/numParam/types';
import * as Room from '../ot/room/types';
import { FNumParam } from './numParam';

const createDefaultState = (): NumParam.State => ({
    $v: 1,
    $r: 1,
    value: 0,
    isValuePrivate: false,
});

export class FNumParams extends FObject {
    public constructor(
        private readonly numParams: Character.State['numParams'],
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
        const name = beginCast(nameOrKeyValue, astInfo).addString().addNumber().cast();
        const keys = this.findKeysByName(name);
        for (const key of keys) {
            const found = this.numParams[key];
            if (found == null) {
                const newValue = createDefaultState();
                this.numParams[key] = newValue;
                return newValue;
            }
            return found;
        }
        return undefined;
    }

    private incrOrDecrValue(
        nameOrKeyValue: FValue,
        diffValue: FValue,
        isIncr: boolean,
        astInfo: AstInfo | undefined
    ) {
        const diff = beginCast(diffValue, astInfo).addNumber().cast();
        const found = this.findByName(nameOrKeyValue, astInfo);
        if (found == null) {
            return;
        }
        if (found.value == null) {
            return;
        }
        if (isIncr) {
            found.value += diff;
        } else {
            found.value -= diff;
        }
    }

    private setIsValuePrivate(
        nameOrKeyValue: FValue,
        newValue: FValue,
        astInfo: AstInfo | undefined
    ) {
        const $newValue = beginCast(newValue, astInfo).addBoolean().cast();
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
                return new FFunction(({ args }) => {
                    const result = this.findByName(args[0], astInfo);
                    if (result == null) {
                        return undefined;
                    }
                    return new FNumParam(result);
                });
            case 'incrementValue':
                return new FFunction(({ args }) => {
                    this.incrOrDecrValue(args[0], args[1], true, astInfo);
                    return undefined;
                });
            case 'decrementValue':
                return new FFunction(({ args }) => {
                    this.incrOrDecrValue(args[0], args[1], false, astInfo);
                    return undefined;
                });
            case 'setValue':
                return new FFunction(({ args }) => {
                    const newValue = beginCast(args[1], astInfo).addNumber().cast();
                    const found = this.findByName(args[0], astInfo);
                    if (found == null) {
                        return;
                    }
                    found.value = newValue;
                    return undefined;
                });
            case 'setIsValueSecret':
                return new FFunction(({ args }) => {
                    this.setIsValuePrivate(args[0], args[1], astInfo);
                    return undefined;
                });
            default:
                break;
        }
        return undefined;
    }

    override setCore(): void {
        throw new ScriptError('値のセットは制限されています。');
    }

    override toJObject(): unknown {
        return this.numParams;
    }
}
