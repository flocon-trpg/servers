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
import * as Character from '../ot/room/participant/character/v1';
import * as BoolParam from '../ot/room/participant/character/boolParam/v1';
import * as Room from '../ot/room/v1';
import { FBoolParam } from './boolParam';

const createDefaultState = (): BoolParam.State => ({
    $v: 1,
    value: false,
    isValuePrivate: false,
});

export class FBoolParams extends FObject {
    public constructor(
        private readonly boolParams: Character.State['boolParams'],
        private readonly room: Room.State
    ) {
        super();
    }

    private findKeysByNameOrKey(nameOrKey: string | number) {
        return recordToArray(this.room.numParamNames)
            .filter(({ value }, i) => value.name === nameOrKey || i + 1 === nameOrKey)
            .map(({ key }) => key);
    }

    private findByNameOrKey(nameOrKeyValue: FValue, astInfo: AstInfo | undefined) {
        const nameOrKey = beginCast(nameOrKeyValue).addString().addNumber().cast(astInfo?.range);
        const keys = this.findKeysByNameOrKey(nameOrKey);
        for (const key of keys) {
            const found = this.boolParams[key];
            if (found == null) {
                const newValue = createDefaultState();
                this.boolParams[key] = newValue;
                return newValue;
            }
            return found;
        }
        return undefined;
    }

    private toggleValue(nameOrKeyValue: FValue, astInfo: AstInfo | undefined) {
        const found = this.findByNameOrKey(nameOrKeyValue, astInfo);
        if (found == null) {
            return;
        }
        found.value = !(found.value ?? createDefaultState().value);
    }

    private setIsValuePrivate(
        nameOrKeyValue: FValue,
        newValue: FValue,
        astInfo: AstInfo | undefined
    ) {
        const $newValue = beginCast(newValue).addBoolean().cast(astInfo?.range);
        const found = this.findByNameOrKey(nameOrKeyValue, astInfo);
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
                        const result = this.findByNameOrKey(args[0], astInfo);
                        if (result == null) {
                            return undefined;
                        }
                        return new FBoolParam(result);
                    },
                    this,
                    false
                );
            case 'toggleValue':
                return new FFunction(
                    ({ args }) => {
                        this.toggleValue(args[0], astInfo);
                        return undefined;
                    },
                    this,
                    false
                );
            case 'setValue':
                return new FFunction(
                    ({ args }) => {
                        const newValue = beginCast(args[1]).addBoolean().cast(astInfo?.range);
                        const found = this.findByNameOrKey(args[0], astInfo);
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
        return this.boolParams;
    }
}
