import {
    FObject,
    FString,
    FValue,
    ScriptError,
    beginCast,
    GetCoreParams,
    SetCoreParams,
} from '@kizahasi/flocon-script';
import * as Room from '../ot/room/types';
import { CompositeKey } from '@kizahasi/util';
import { FCharacter } from './character';
import cloneDeep from 'lodash.clonedeep';
import { FParamNames } from './paramNames';

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
        const character = this._room.participants[key.createdBy]?.characters?.[key.id];
        if (character == null) {
            return undefined;
        }
        return new FCharacter(character, this.room);
    }

    override getCore({ key }: GetCoreParams): FValue {
        switch (key) {
            case name:
                return new FString(this._room.name);
            case 'booleanParameterNames':
                return new FParamNames(this.room, 'Boolean');
            case 'numberParameterNames':
                return new FParamNames(this.room, 'Number');
            case 'stringParameterNames':
                return new FParamNames(this.room, 'String');
            default:
                return undefined;
        }
    }

    override setCore({ key, newValue, astInfo }: SetCoreParams): void {
        switch (key) {
            case name: {
                const $newValue = beginCast(newValue).addString().cast(astInfo?.range);
                this._room.name = $newValue;
                return;
            }
            default:
                throw new ScriptError(`${key}への値のセットは制限されています。`, astInfo?.range);
        }
    }

    override toJObject(): unknown {
        return this._room;
    }
}
