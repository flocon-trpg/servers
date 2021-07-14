// https://qiita.com/suin/items/e0f7b7add75092196cd8?utm_campaign=popular_items&utm_medium=feed&utm_source=popular_items

type WouldBe<T> = { [P in keyof T]?: unknown };

// eslint-disable-next-line @typescript-eslint/ban-types
function isObject<T extends object>(source: unknown): source is WouldBe<T> {
    return typeof source === 'object' && source !== null;
}

export default isObject;
