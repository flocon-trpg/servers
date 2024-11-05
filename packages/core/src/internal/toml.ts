import { Result } from '@kizahasi/result';
import {
    LocalDate as TomlLocalDate,
    LocalDateTime as TomlLocalDateTime,
    LocalTime as TomlLocalTime,
    OffsetDateTime as TomlOffsetDateTime,
    parse as parseCore,
} from '@ltd/j-toml';
import { z } from 'zod';
import { analyze, expr1 } from './expression';
import { maybe } from './maybe';

type TomlDateTime = TomlLocalDate | TomlLocalDateTime | TomlLocalTime | TomlOffsetDateTime;

const isTomlDateTime = (source: unknown): source is TomlDateTime => {
    return (
        source instanceof TomlLocalDate ||
        source instanceof TomlLocalDateTime ||
        source instanceof TomlLocalTime ||
        source instanceof TomlOffsetDateTime
    );
};

const parseTomlCore = (toml: string) => {
    let object;
    try {
        object = parseCore(toml, 1.0, '\r\n', false);
    } catch (error) {
        if (typeof error === 'string') {
            return Result.error(error);
        }
        if (error instanceof Error) {
            return Result.error(error.message);
        }
        throw error;
    }
    return Result.ok(object);
};

export const parseToml = (toml: string) => {
    const core = parseTomlCore(toml);
    if (core.isError) {
        return core;
    }
    return Result.ok(core.value as unknown);
};

export const isValidVarToml = (toml: string): Result<void> => {
    const parsed = parseTomlCore(toml);
    if (parsed.isError) {
        return parsed;
    }
    return Result.ok(undefined);
};

const tomlDateTime = z.union([
    z.instanceof(TomlLocalDate),
    z.instanceof(TomlLocalDateTime),
    z.instanceof(TomlLocalTime),
    z.instanceof(TomlOffsetDateTime),
]);

const tomlObjectType = z.union([
    // zod は Date や Map などを z.record(z.unknown()) に変換しようとすると失敗するが、独自のクラスでは失敗しない(JavaScript の仕様を考えると当然ではあるが)。そのため、パース処理そのものは tomlDateTime の有無は影響しないと考えられるが、tomlObjectType.parse の戻り値の型を扱いやすくする目的で付け加えている。
    tomlDateTime,
    z.record(z.unknown()),
    z.number(),
    z.string(),
    z.null(),
    z.undefined(),
]);

export const getVariableFromVarTomlObject = (tomlObject: unknown, path: ReadonlyArray<string>) => {
    let current = tomlObject;
    for (const key of path) {
        const parsed = tomlObjectType.safeParse(current);
        if (!parsed.success) {
            return Result.error(parsed.error.message);
        }
        if (parsed.data == null) {
            return Result.ok(undefined);
        }
        if (typeof parsed.data === 'string' || typeof parsed.data === 'number') {
            return Result.ok(undefined);
        }
        if (isTomlDateTime(parsed.data)) {
            return Result.ok(undefined);
        }
        current = parsed.data[key];
    }
    const parsed = tomlObjectType.safeParse(current);
    if (!parsed.success) {
        return Result.error(parsed.error.message);
    }
    return Result.ok(parsed.data);
};

const chatPalette = z.object({
    var: maybe(z.record(z.unknown())),

    // textではなくわざわざ冗長なtext.valueにしたのは、[var]→チャットパレットの文字列 の順で書けるようにするため。
    // また、将来的に例えばtext.typeに何かをセットして…という拡張もできる余地がある。
    text: z.object({
        value: z.string(),
    }),
});

// text.valueに例えば {foo} のような文字列が含まれている場合、varで定義されていればそれに置き換える。定義が見つからなければそのまま残す。
/** @deprecated We no longer use TOML in chat palettes. */
export const generateChatPalette = (toml: string): Result<string[]> => {
    // CONSIDER: TOMLのDateTimeに未対応
    const object = parseTomlCore(toml);
    if (object.isError) {
        return object;
    }
    const decoded = chatPalette.parse(object.value);

    const lines = decoded.text.value.split(/(?:\r\n|\r|\n)/).map(line => {
        const analyzeResult = analyze(line);
        if (analyzeResult.isError) {
            return line;
        }
        return analyzeResult.value
            .map(expr => {
                switch (expr.type) {
                    case expr1: {
                        const replaced = getVariableFromVarTomlObject(decoded.var, expr.path);
                        if (replaced.isError) {
                            return expr.raw;
                        }
                        // TODO: replaced.valueがstring以外のときの処理の仕様が今は曖昧
                        switch (typeof replaced.value) {
                            case 'string':
                            case 'number':
                            case 'boolean':
                                return replaced.value.toString();
                            default:
                                return '';
                        }
                    }
                    default: {
                        return expr.text;
                    }
                }
            })
            .reduce((seed, elem) => seed + elem, '');
    });

    return Result.ok(lines);
};
