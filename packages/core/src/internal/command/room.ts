import {
    FObject,
    FString,
    FValue,
    ScriptError,
    beginCast,
    GetCoreParams,
    SetCoreParams,
} from '@flocon-trpg/flocon-script';
import * as Room from '../ot/room/types';
import { FCharacter } from './character';
import cloneDeep from 'lodash.clonedeep';
import { FParamNames } from './paramNames';
import { FStateRecord } from './stateRecord';
import { FParticipant } from './participant';
import * as Character from '../ot/room/character/types';
import { State } from '../ot/generator';

const name = 'name';
const characters = 'characters';

export class FRoom extends FObject {
    // FRoom内の State<typeof Room.template> は全てmutableとして扱う。FCharacter内のCharacter.Stateなども同様。
    private readonly _room: State<typeof Room.template>;

    public constructor(source: State<typeof Room.template>, private readonly myUserUid: string) {
        super();
        this._room = cloneDeep(source);
    }

    public get room(): State<typeof Room.template> {
        return this._room;
    }

    public findCharacter(stateId: string): FCharacter | undefined {
        const character = this._room.characters[stateId];
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
            case characters:
                return new FStateRecord<State<typeof Character.template>, FCharacter>({
                    states: this.room.characters,
                    createNewState: () => ({
                        $v: 2,
                        $r: 1,
                        ownerParticipantId: this.myUserUid,
                        image: undefined,
                        isPrivate: false,
                        memo: '',
                        name: '',
                        chatPalette: '',
                        dicePieceValues: {},
                        hasTag1: false,
                        hasTag2: false,
                        hasTag3: false,
                        hasTag4: false,
                        hasTag5: false,
                        hasTag6: false,
                        hasTag7: false,
                        hasTag8: false,
                        hasTag9: false,
                        hasTag10: false,
                        pieces: {},
                        privateCommands: {},
                        privateVarToml: '',
                        portraitImage: undefined,
                        portraitPieces: {},
                        boolParams: {},
                        numParams: {},
                        numMaxParams: {},
                        strParams: {},
                        stringPieceValues: {},
                    }),
                    toRef: x => new FCharacter(x, this.room),
                    unRef: x => {
                        if (x instanceof FCharacter) {
                            return x.character;
                        }
                        throw new Error('this should not happen');
                    },
                });
            case 'numberParameterNames':
                return new FParamNames(this.room, 'Number');
            case 'stringParameterNames':
                return new FParamNames(this.room, 'String');
            case 'participants':
                return new FStateRecord({
                    states: this.room.participants,
                    createNewState: undefined,
                    toRef: x => new FParticipant(x),
                    unRef: x => {
                        if (x instanceof FParticipant) {
                            return x.participant;
                        }
                        throw new Error('this should not happen');
                    },
                });
            default:
                return undefined;
        }
    }

    override setCore({ key, newValue, astInfo }: SetCoreParams): void {
        switch (key) {
            case name: {
                const $newValue = beginCast(newValue, astInfo).addString().cast();
                this._room.name = $newValue;
                return;
            }
            default:
                throw new ScriptError(
                    `${typeof key === 'symbol' ? 'symbol' : key}への値のセットは制限されています。`,
                    astInfo?.range
                );
        }
    }

    override toJObject(): unknown {
        return this._room;
    }
}
