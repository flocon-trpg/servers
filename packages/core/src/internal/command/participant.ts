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

const name = 'name';

export class FParticipant extends FObject {
    public constructor(public readonly participant: Participant.State) {
        super();
    }

    override getCore({ key }: OnGettingParams): FValue {
        switch (key) {
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
            case name: {
                const $newValue = beginCast(newValue, astInfo).addString().addNull().cast();
                if ($newValue === null) {
                    this.participant.name = undefined;
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
