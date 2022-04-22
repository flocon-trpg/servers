import { PrivateChannelSet } from './privateChannelSet';
import { visibleToToString } from './utils';
export class PrivateChannelSets {
    #core = new Map<string, PrivateChannelSet>();

    public constructor(source?: string) {
        if (source != null) {
            source
                .split(',')
                .filter(x => x !== '')
                .forEach(set => {
                    const newValue = new PrivateChannelSet(set);
                    this.add(newValue);
                });
        }
    }

    public add(visibleTo: ReadonlyArray<string> | PrivateChannelSet): void {
        const castedVisibleTo = visibleTo as string[] | PrivateChannelSet;
        if (Array.isArray(castedVisibleTo)) {
            const set = new Set(castedVisibleTo);
            this.#core.set(visibleToToString(set), new PrivateChannelSet(set));
            return;
        }
        this.#core.set(visibleTo.toString(), castedVisibleTo);
    }

    public clone(): PrivateChannelSets {
        const result = new PrivateChannelSets();
        result.#core = new Map(this.#core);
        return result;
    }

    public toArray(): PrivateChannelSet[] {
        return [...this.#core.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, elem]) => elem);
    }

    public toString(): string {
        return [...this.#core.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .reduce(
                (seed, [, elem], i) => (i === 0 ? elem.toString() : `${seed},${elem.toString()}`),
                ''
            );
    }
}
