import { Participant } from '../stateManagers/states/participant';
import { VisibleTo } from './visibleTo';

export class PrivateChannelSet {
    private readonly _source: ReadonlySet<string>

    public constructor(userUid: string | ReadonlySet<string> | ReadonlyArray<string>) {
        if (typeof userUid === 'string') {
            this._source = new Set<string>(userUid.split(';').filter(x => x !== ''));
            return;
        }
        if (userUid instanceof Array) {
            this._source = new Set(userUid);
            return;
        }
        this._source = userUid;
    }

    public toString(): string {
        return VisibleTo.toString(this._source);
    }

    // participantsのkeyはUserUid
    public toChannelNameBase(participants: ReadonlyMap<string, Participant.State>, skipMe?: { userUid: string }): string[] {
        const result: string[] = [];
        this._source.forEach(userUid => {
            if (userUid === skipMe?.userUid) {
                return;
            }
            const participant = participants.get(userUid);
            if (participant === undefined) {
                result.push(userUid);
                return;
            }
            result.push(participant.name);
        });
        result.sort();
        return result;
    }

    public toStringArray(): string[] {
        return [...this._source].sort();
    }

    public toStringSet(): ReadonlySet<string> {
        return this._source;
    }
}

export class PrivateChannelSets {
    private core = new Map<string, PrivateChannelSet>();

    public constructor(source?: string) {
        if (source != null) {
            source.split(',').filter(x => x !== '').forEach(set => {
                const newValue = new PrivateChannelSet(set);
                this.add(newValue);
            });
        }
    }

    public add(visibleTo: string[] | PrivateChannelSet): void {
        if (Array.isArray(visibleTo)) {
            const set = new Set(visibleTo);
            this.core.set(VisibleTo.toString(set), new PrivateChannelSet(set));
            return;
        }
        this.core.set(visibleTo.toString(), visibleTo);
    }

    public clone(): PrivateChannelSets {
        const result = new PrivateChannelSets();
        result.core = new Map(this.core);
        return result;
    }

    public toArray(): PrivateChannelSet[] {
        return [...this.core.values()];
    }

    public toString(): string {
        return [...this.core.keys()].sort().reduce((seed, elem, i) => i === 0 ? elem : `${seed},${elem}`, '');
    }
}