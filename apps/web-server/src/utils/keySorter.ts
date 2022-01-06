import { moveElement } from './moveElement';

type Move<TKey extends string> = {
    from: TKey;
    to: TKey;
};

export class KeySorter<TKey extends string = string> {
    /**
     * @param availableKeys
     * 利用可能なKeyを表す。要素の順番は影響しない。重複する要素があっても構わない（2個目以降は無視される）。
     */
    public constructor(private readonly availableKeys: ReadonlyArray<TKey>) {}

    public generate(configSource: ReadonlyArray<TKey>): TKey[] {
        const remainingAvailableKeys = new Set(this.availableKeys);
        const result: TKey[] = [];

        for (const key of configSource) {
            if (!remainingAvailableKeys.delete(key)) {
                continue;
            }
            result.push(key);
        }

        for (const remainingKey of [...remainingAvailableKeys].sort()) {
            result.push(remainingKey);
        }

        return result;
    }

    public move(configSource: ReadonlyArray<TKey>, move: Move<TKey>) {
        const result = this.generate(configSource);
        return moveElement(result, x => x, move);
    }
}
