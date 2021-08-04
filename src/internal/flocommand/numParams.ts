import {
    beginCast,
    FFunction,
    FObject,
    FValue,
    OnGettingParams,
    ScriptError,
} from '@kizahasi/flocon-script';
import { recordToArray } from '@kizahasi/util';
import * as Character from '../ot/room/character/v1';
import * as NumParam from '../ot/room/character/numParam/v1';
import * as Room from '../ot/room/v1';
import { AstInfo } from '@kizahasi/flocon-script/dist/types/scriptValue';
import { FNumParam } from './numParam';

const createDefaultState = (): NumParam.State => ({ $version: 1, value: 0, isValuePrivate: false });

export class FNumParams extends FObject {
    public constructor(
        private readonly numParams: Character.State['numParams'],
        private readonly room: Room.State
    ) {
        super();
    }

    private findKeysByName(name: string) {
        return recordToArray(this.room.numParamNames)
            .filter(({ value }) => value.name === name)
            .map(({ key }) => key);
    }

    private findByName(nameValue: FValue, astInfo: AstInfo | undefined) {
        const name = beginCast(nameValue).addString().cast(astInfo?.range);
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

    private findAllByName(nameValue: FValue, astInfo: AstInfo | undefined) {
        const name = beginCast(nameValue).addString().cast(astInfo?.range);
        const keys = this.findKeysByName(name);
        const result: NumParam.State[] = [];
        for (const key of keys) {
            const found = this.numParams[key];
            if (found == null) {
                const newValue = createDefaultState();
                this.numParams[key] = newValue;
                result.push(newValue);
                continue;
            }
            result.push(found);
        }
        return result;
    }

    private incrOrDecrValue(
        nameValue: FValue,
        diffValue: FValue,
        isIncr: boolean,
        astInfo: AstInfo | undefined
    ) {
        const diff = beginCast(diffValue).addNumber().cast(astInfo?.range);
        const found = this.findByName(nameValue, astInfo);
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

    public setIsValuePrivate(nameValue: FValue, newValue: boolean, astInfo: AstInfo | undefined) {
        this.findAllByName(nameValue, astInfo).forEach(numParam => {
            numParam.isValuePrivate = newValue;
        });
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
                        return new FNumParam(result);
                    },
                    this,
                    false
                );
            case 'incrementValue':
                return new FFunction(
                    ({ args }) => {
                        this.incrOrDecrValue(args[0], args[1], true, astInfo);
                        return undefined;
                    },
                    this,
                    false
                );
            case 'decrementValue':
                return new FFunction(
                    ({ args }) => {
                        this.incrOrDecrValue(args[0], args[1], false, astInfo);
                        return undefined;
                    },
                    this,
                    false
                );
            case 'setValue':
                return new FFunction(
                    ({ args }) => {
                        const newValue = beginCast(args[1]).addNumber().cast(astInfo?.range);
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
            default:
                break;
        }
        const found = this.numParams[key];
        if (found == null) {
            return undefined;
        }
        return new FNumParam(found);
    }

    override setCore(): void {
        throw new ScriptError('値のセットは制限されています。');
    }

    override toJObject(): unknown {
        return this.numParams;
    }
}
