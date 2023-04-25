import {
    AstInfo,
    FFunction,
    FObject,
    FValue,
    OnGettingParams,
    ScriptError,
    beginCast,
} from '@flocon-trpg/flocon-script';
import { recordToArray } from '@flocon-trpg/utils';
import * as BoolParam from '../ot/flocon/room/character/boolParam/types';
import * as Character from '../ot/flocon/room/character/types';
import * as Room from '../ot/flocon/room/types';
import { State } from '../ot/generator/types';
import { FBoolParam } from './boolParam';

const createDefaultState = (): State<typeof BoolParam.template> => ({
    $v: 2,
    $r: 1,
    value: false,
    isValuePrivate: false,
    overriddenParameterName: undefined,
});

export class FBoolParams extends FObject {
    public constructor(
        private readonly boolParams: NonNullable<State<typeof Character.template>['boolParams']>,
        private readonly room: State<typeof Room.template>
    ) {
        super();
    }

    private findKeysByNameOrKey(nameOrKey: string | number) {
        if (this.room.boolParamNames == null) {
            return [];
        }
        return recordToArray(this.room.boolParamNames)
            .filter(({ value }, i) => value.name === nameOrKey || i + 1 === nameOrKey)
            .map(({ key }) => key);
    }

    private findByNameOrKey(nameOrKeyValue: FValue, astInfo: AstInfo | undefined) {
        const nameOrKey = beginCast(nameOrKeyValue, astInfo).addString().addNumber().cast();
        const keys = this.findKeysByNameOrKey(nameOrKey);
        for (const key of keys) {
            const found = (this.boolParams ?? {})[key];
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
        const $newValue = beginCast(newValue, astInfo).addBoolean().cast();
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
                return new FFunction(({ args }) => {
                    const result = this.findByNameOrKey(args[0], astInfo);
                    if (result == null) {
                        return undefined;
                    }
                    return new FBoolParam(result);
                });
            case 'toggleValue':
                return new FFunction(({ args }) => {
                    this.toggleValue(args[0], astInfo);
                    return undefined;
                });
            case 'setValue':
                return new FFunction(({ args }) => {
                    const newValue = beginCast(args[1], astInfo).addBoolean().cast();
                    const found = this.findByNameOrKey(args[0], astInfo);
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
        return this.boolParams;
    }
}
