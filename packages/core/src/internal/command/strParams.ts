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
import * as StrParam from '../ot/flocon/room/character/strParam/types';
import * as Character from '../ot/flocon/room/character/types';
import * as Room from '../ot/flocon/room/types';
import { State } from '../ot/generator/types';
import { FStrParam } from './strParam';

const createDefaultState = (): State<typeof StrParam.template> => ({
    $v: 2,
    $r: 1,
    value: '',
    isValuePrivate: false,
    overriddenParameterName: undefined,
});

export class FStrParams extends FObject {
    public constructor(
        private readonly strParams: NonNullable<State<typeof Character.template>['strParams']>,
        private readonly room: State<typeof Room.template>,
    ) {
        super();
    }

    private findKeysByName(nameOrKey: string | number) {
        if (this.room.strParamNames == null) {
            return [];
        }
        return recordToArray(this.room.strParamNames)
            .filter(({ value }, i) => value.name === nameOrKey || i + 1 === nameOrKey)
            .map(({ key }) => key);
    }

    private findByName(nameOrKeyValue: FValue, astInfo: AstInfo | undefined) {
        const name = beginCast(nameOrKeyValue, astInfo).addString().cast();
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
        astInfo: AstInfo | undefined,
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
                    return new FStrParam(result);
                });
            case 'setValue':
                return new FFunction(({ args }) => {
                    const newValue = beginCast(args[1], astInfo).addString().cast();
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
        return this.strParams;
    }
}
