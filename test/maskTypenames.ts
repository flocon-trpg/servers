export function maskTypeNames(source: unknown): unknown {
    if (typeof source !== 'object') {
        return source;
    }
    if (source == null) {
        return source;
    }
    const result: Record<string, unknown> = {};
    for (const key in source) {
        if (key === '__typename') {
            continue;
        }
        const value: unknown = (source as any)[key];
        result[key] = maskTypeNames(value);
    }
    return result;
}
