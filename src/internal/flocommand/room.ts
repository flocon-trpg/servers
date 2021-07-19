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
import * as Room from '../ot/room/v1';
import * as Character from '../ot/room/character/v1';
import { CompositeKey, dualKeyRecordFind } from '@kizahasi/util';
import { FCharacter } from './character';
import cloneDeep from 'lodash.clonedeep';

const name = 'name';

export class FRoom extends FObject {
    // FRoom内のRoom.Stateは全てmutableとして扱う。FCharacter内のCharacter.Stateなども同様。
    private readonly _room: Room.State;

    public constructor(source: Room.State) {
        super();
        this._room = cloneDeep(source);
    }

    public get room(): Room.State {
        return this._room;
    }

    public findCharacter(key: CompositeKey): FCharacter | undefined {
        const character = dualKeyRecordFind<Character.State>(this._room.characters, {
            first: key.createdBy,
            second: key.id,
        });
        if (character == null) {
            return undefined;
        }
        return new FCharacter(character);
    }

    private onGettingCore({ key }: OnGettingParams): FValue {
        switch (key) {
            case name:
                return new FString(this._room.name);
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
                this._room.name = $newValue;
                return;
            }
            default:
                throw new ScriptError(`'${key}' is not supported.`, astInfo?.range);
        }
    }
}
