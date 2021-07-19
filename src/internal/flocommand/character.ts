import {
    FObject,
    FString,
    FValue,
    OnGettingParams,
    OnSettingParams,
    ScriptError,
    beginCast,
} from '@kizahasi/flocon-script';
import { Option } from '@kizahasi/option';
import * as Character from '../ot/room/character/v1';

const name = 'name';

export class FCharacter extends FObject {
    public constructor(public readonly character: Character.State) {
        super();
    }

    private onGettingCore({ key }: OnGettingParams): FValue {
        switch (key) {
            case name:
                return new FString(this.character.name);
            default:
                return undefined;
        }
    }

    override onGetting(params: OnGettingParams): Option<FValue> {
        return Option.some(this.onGettingCore(params));
    }

    override onSetting({ key, newValue, astInfo }: OnSettingParams): void {
        switch (key) {
            case name: {
                const $newValue = beginCast(newValue).addString().cast(astInfo?.range);
                this.character.name = $newValue;
                return;
            }
            default:
                throw new ScriptError(`'${key}' is not supported.`, astInfo?.range);
        }
    }
}
