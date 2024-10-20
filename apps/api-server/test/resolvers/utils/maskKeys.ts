export function maskKeys(source: unknown, keys: readonly string[]): unknown {
    if (typeof source !== 'object') {
        return source;
    }
    if (source == null) {
        return source;
    }
    const result: Record<string, unknown> = {};
    for (const key in source) {
        if (keys.includes(key)) {
            continue;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const value: unknown = (source as any)[key];
        result[key] = maskKeys(value, keys);
    }
    return result;
}

export function maskTypeNames(source: unknown): unknown {
    return maskKeys(source, ['__typename']);
}
