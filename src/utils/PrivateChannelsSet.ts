import * as Participant from '../stateManagers/states/participant';

const toString = (visibleTo: ReadonlySet<string>): string => {
    return [...visibleTo].sort().reduce((seed, elem) => seed === '' ? elem : `${seed};${elem}`, '');
};

export class PrivateChannelSet {
    private readonly _source: ReadonlySet<string>

    public constructor(source: string | ReadonlySet<string>) {
        if (typeof source === 'string') {
            this._source = new Set<string>(source.split(';').filter(x => x !== ''));
            return;
        }
        this._source = source;
    }

    public toString(): string {
        return toString(this._source);
    }

    // participantsのkeyはUserUid
    public toChannelNameBase(participants: ReadonlyMap<string, Participant.State>, myUserUid: string): string[] {
        const result: string[] = [];
        this._source.forEach(userUid => {
            if (userUid === myUserUid) {
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

export class PrivateChannelsSet {
    private core = new Map<string, PrivateChannelSet>();

    public add(visibleTo: string[]): void {
        const set = new Set(visibleTo);
        this.core.set(toString(set), new PrivateChannelSet(set));
    }

    public clone(): PrivateChannelsSet {
        const result = new PrivateChannelsSet();
        result.core = new Map(this.core);
        return result;
    }

    public toArray(): PrivateChannelSet[] {
        return [...this.core.values()];
    }
}