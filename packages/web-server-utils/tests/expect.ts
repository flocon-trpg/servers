import { PrivateChannelSet } from '../src';

type ReadonlyPrivateChannelSets = {
    toArray(): PrivateChannelSet[];
};

class PrivateChannelSetsTester {
    public constructor(private readonly actual: ReadonlyPrivateChannelSets) {}

    #toKey(visibleTo: readonly string[]) {
        return visibleTo.reduce((seed, elem) => (seed === '' ? elem : `${seed};${elem}`), '');
    }

    public toEqual(visibleToArray: ReadonlyArray<ReadonlyArray<string>>): void {
        const distinctAndSort = (array: ReadonlyArray<ReadonlyArray<string>>) => {
            const map = new Map<string, ReadonlyArray<string>>();
            array.forEach(strs => map.set(this.#toKey(strs), strs));
            [...map.values()]
                .map(visibleTo => [...visibleTo].sort())
                .sort((a, b) => {
                    const a2 = a.reduce(
                        (seed, elem) => (seed === '' ? elem : `${seed};${elem}`),
                        '',
                    );
                    const b2 = b.reduce(
                        (seed, elem) => (seed === '' ? elem : `${seed};${elem}`),
                        '',
                    );
                    return a2.localeCompare(b2);
                });
        };

        expect(distinctAndSort(this.actual.toArray().map(x => x.toStringArray()))).toEqual(
            distinctAndSort(visibleToArray),
        );
    }
}

export const expectPrivateChannels = (actual: ReadonlyPrivateChannelSets) => {
    return new PrivateChannelSetsTester(actual);
};
