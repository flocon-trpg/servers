import { State, participantTemplate } from '@flocon-trpg/core';
import { visibleToToString } from './utils';

type ParticipantState = State<typeof participantTemplate>;

export class PrivateChannelSet {
    readonly #source: ReadonlySet<string>;

    public constructor(userUid: string | ReadonlySet<string> | ReadonlyArray<string>) {
        if (typeof userUid === 'string') {
            this.#source = new Set<string>(userUid.split(';').filter(x => x !== ''));
            return;
        }
        if (userUid instanceof Array) {
            this.#source = new Set(userUid);
            return;
        }
        this.#source = userUid;
    }

    public toString(): string {
        return visibleToToString(this.#source);
    }

    // participantsのkeyはUserUid
    public toChannelNameBase(
        participants: ReadonlyMap<string, ParticipantState>,
        skipMe?: { userUid: string }
    ): string[] {
        const result: string[] = [];
        this.#source.forEach(userUid => {
            if (userUid === skipMe?.userUid) {
                return;
            }
            const participant = participants.get(userUid);
            if (participant === undefined) {
                result.push(userUid);
                return;
            }
            result.push(participant.name ?? `不明なユーザー(${userUid})`);
        });
        result.sort();
        return result;
    }

    public toStringArray(): string[] {
        return [...this.#source].sort();
    }

    public toStringSet(): ReadonlySet<string> {
        return this.#source;
    }
}
