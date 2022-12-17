const parseMilliseconds = (milliseconds: number) => {
    const absMilliseconds = Math.abs(milliseconds);

    return {
        day: Math.trunc(absMilliseconds / 86400_000),
        hour: Math.trunc(absMilliseconds / 3600_000) % 24,
        minute: Math.trunc(absMilliseconds / 60_000) % 60,
        second: Math.trunc(absMilliseconds / 1_000) % 60,
    };
};

type Parsed = ReturnType<typeof parseMilliseconds>;

const isZero = (source: Parsed): boolean => {
    return source.day === 0 && source.hour === 0 && source.minute === 0 && source.second === 0;
};

const toMilliseconds = (source: Date | number): number => {
    if (typeof source === 'number') {
        return source;
    }
    return source.getTime();
};

const formatJa = (parsed: Parsed, operator: '+' | '-') => {
    const { day, hour, minute, second } = parsed;

    const zengo = isZero(parsed) ? '' : operator === '+' ? '後' : '前';
    if (parsed.day === 0) {
        if (parsed.hour === 0) {
            if (parsed.minute === 0) {
                return `${second} 秒${zengo}`;
            }
            return `${minute} 分 ${second} 秒${zengo}`;
        }
        return `${hour} 時間 ${minute} 分${zengo}`;
    }
    return `${day} 日 ${hour} 時間${zengo}`;
};

export const prettyElapsed = (
    value: Date | number,
    opts?: { now?: Date | number; customizeMilliseconds: (source: number) => number }
) => {
    const now = opts?.now ?? new Date();
    const elapsedBySource = toMilliseconds(value) - toMilliseconds(now);
    const elapsedBy = opts?.customizeMilliseconds
        ? opts.customizeMilliseconds(elapsedBySource)
        : elapsedBySource;
    const parsed = parseMilliseconds(elapsedBy);
    const operator = elapsedBy > 0 ? '+' : '-';
    return formatJa(parsed, operator);
};
