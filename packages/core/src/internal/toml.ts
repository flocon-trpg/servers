import * as t from 'io-ts';
import {
    LocalDate as TomlLocalDate,
    LocalDateTime as TomlLocalDateTime,
    LocalTime as TomlLocalTime,
    OffsetDateTime as TomlOffsetDateTime,
    parse as parseCore,
} from '@ltd/j-toml';
import { Result } from '@kizahasi/result';
import { analyze, expr1 } from './expression';
import { maybe } from './maybe';

type TomlDateTime = TomlLocalDate | TomlLocalDateTime | TomlLocalTime | TomlOffsetDateTime;
const dateTime = new t.Type<TomlDateTime>(
    'DateTime',
    (obj): obj is TomlDateTime => true,
    (input: any, context) => {
        if (input == null) {
            return t.failure(input, context);
        }
        if (typeof input.toJSON !== 'function') {
            return t.failure(input, context);
        }
        return t.success(input);
    },
    t.identity
);

const errorToMessage = (source: t.Errors): string => {
    return source[0]?.message ?? '不明なエラーが発生しました';
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

export const isValidVarToml = (toml: string): Result<undefined> => {
    const parsed = parseTomlCore(toml);
    if (parsed.isError) {
        return parsed;
    }
    return Result.ok(undefined);
};

export const getVariableFromVarTomlObject = (tomlObject: unknown, path: ReadonlyArray<string>) => {
    let current: any = tomlObject;
    for (const key of path) {
        if (current == null || typeof current !== 'object') {
            return Result.ok(undefined);
        }
        const next = current[key];
        const dateTimeValue = dateTime.decode(next);
        if (dateTimeValue._tag === 'Right') {
            return Result.ok(dateTimeValue.right);
        }
        current = current[key];
    }
    const dateTimeValue = dateTime.decode(current);
    if (dateTimeValue._tag === 'Right') {
        return Result.ok(dateTimeValue.right);
    }
    switch (typeof current) {
        case 'boolean':
        case 'number':
        case 'string':
        case 'undefined':
            return Result.ok(current);
        default:
            return Result.ok(undefined);
    }
};

const exactChatPalette = t.strict({
    var: maybe(t.UnknownRecord),

    // textではなくわざわざ冗長なtext.valueにしたのは、[var]→チャットパレットの文字列 の順で書けるようにするため。
    // また、将来的に例えばtext.typeに何かをセットして…という拡張もできる余地がある。
    text: t.strict({
        value: t.string,
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
    const decoded = exactChatPalette.decode(object.value);
    if (decoded._tag === 'Left') {
        return Result.error(errorToMessage(decoded.left));
    }

    const lines = decoded.right.text.value.split(/(?:\r\n|\r|\n)/).map(line => {
        const analyzeResult = analyze(line);
        if (analyzeResult.isError) {
            return line;
        }
        return analyzeResult.value
            .map(expr => {
                switch (expr.type) {
                    case expr1: {
                        const replaced = getVariableFromVarTomlObject(decoded.right.var, expr.path);
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

/** @deprecated We no longer use TOML in chat palettes. */
export const isValidChatPalette = (toml: string): Result<undefined> => {
    // CONSIDER: TOMLのDateTimeに未対応
    const object = parseTomlCore(toml);
    if (object.isError) {
        return object;
    }
    const decoded = exactChatPalette.decode(object.value);
    if (decoded._tag === 'Left') {
        return Result.error(errorToMessage(decoded.left));
    }
    return Result.ok(undefined);
};
