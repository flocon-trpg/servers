import {
    FObject,
    FString,
    FValue,
    OnGettingParams,
    OnSettingParams,
    ScriptError,
    beginCast,
} from '@flocon-trpg/flocon-script';
import { maxLength100String } from '../maxLengthString';
import * as Participant from '../ot/room/participant/types';
import * as Character from '../ot/room/participant/character/types';
import * as Room from '../ot/room/types';
import { FStateRecord } from './stateRecord';
import { FCharacter } from './character';

const characters = 'characters';
const name = 'name';

export class FParticipant extends FObject {
    public constructor(
        public readonly participant: Participant.State,
        private readonly room: Room.State
    ) {
        super();
    }

    override getCore({ key }: OnGettingParams): FValue {
        switch (key) {
            case characters:
                return new FStateRecord<Character.State, FCharacter>({
                    states: this.participant.characters,
                    createNewState: () => ({
                        $v: 1,
                        $r: 2,
                        image: null,
                        isPrivate: false,
                        memo: '',
                        name: '',
                        chatPalette: '',
                        dicePieceValues: {},
                        pieces: {},
                        privateCommand: '',
                        privateCommands: {},
                        privateVarToml: '',
                        tachieImage: null,
                        tachieLocations: {},
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
            case name: {
                const name = this.participant.name;
                if (name == null) {
                    return null;
                }
                return new FString(name);
            }
            default:
                return undefined;
        }
    }

    override setCore({ key, newValue, astInfo }: OnSettingParams): void {
        switch (key) {
            case characters: {
                throw new ScriptError(`${key}は読み取り専用プロパティです。`);
            }
            case name: {
                const $newValue = beginCast(newValue, astInfo).addString().addNull().cast();
                if ($newValue === null) {
                    this.participant.name = null;
                    return;
                }
                if (!maxLength100String.is($newValue)) {
                    throw new ScriptError(`${key}は100文字以下にする必要があります。`);
                }
                this.participant.name = $newValue;
                return;
            }
            default:
                throw new ScriptError(
                    `'${typeof key === 'symbol' ? 'symbol' : key}' is not supported.`,
                    astInfo?.range
                );
        }
    }

    override toJObject(): unknown {
        return this.participant;
    }
}
