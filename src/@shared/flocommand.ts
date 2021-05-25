/* eslint-disable @typescript-eslint/no-namespace */
import * as t from 'io-ts';
import JTOML from '@ltd/j-toml';
import { Result, ResultModule } from './Result';
import { Default, FilePath, FirebaseStorage, sourceType } from './ot/filePath/v1';
import * as Character from './ot/room/participant/character/v1';

namespace Util {
    const imageObject = t.type({
        src: t.string,
        type: sourceType,
    });
    export const image = t.union([imageObject, t.string]);
    export type Image = t.TypeOf<typeof image>;

    export const toFilePath = (source: Image): FilePath => {
        if (typeof source === 'string') {
            const replaced = source.replace(/^firebase:/, '');
            if (source === replaced) {
                return {
                    $version: 1,
                    sourceType: Default,
                    path: replaced,
                };
            }
            return {
                $version: 1,
                sourceType: FirebaseStorage,
                path: replaced,
            };
        }
        return {
            $version: 1,
            sourceType: source.type,
            path: source.src,
        };
    };
}

namespace Message {
    export const action = t.partial({
        text: t.string,
    });

    export type Action = t.TypeOf<typeof action>;
}

type TomlDateTime = JTOML.LocalDate | JTOML.LocalDateTime | JTOML.LocalTime | JTOML.OffsetDateTime;
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
    t.identity);

const chara = t.partial({
    name: t.string,
    icon: Util.image,
    tachie: Util.image,
    message: Message.action,
});

const characterActionElement = t.partial({
    chara,
});

export type CharacterActionElement = t.TypeOf<typeof characterActionElement>;

const $characterAction = t.record(t.string, characterActionElement);
const exactCharacterAction = t.record(t.string, t.exact(characterActionElement));

export type CharacterAction = t.TypeOf<typeof $characterAction>;

const errorToMessage = (source: t.Errors): string => {
    return source[0]?.message ?? '不明なエラーが発生しました';
};

const parse = (toml: string) => {
    let object;
    try {
        object = JTOML.parse(toml, 1.0, '\r\n', false);
    }
    catch (error) {
        if (typeof error === 'string') {
            return ResultModule.error(error);
        }
        if (error instanceof Error) {
            return ResultModule.error(error.message);
        }
        throw error;
    }
    return ResultModule.ok(object);
};

export const isValidVarToml = (toml: string): Result<undefined> => {
    const parsed = parse(toml);
    if (parsed.isError) {
        return parsed;
    }
    return ResultModule.ok(undefined);
};

export const variable = (toml: string, path: ReadonlyArray<string>) => {
    const tomlResult = parse(toml);
    if (tomlResult.isError) {
        return tomlResult;
    }
    let current: any = tomlResult.value;
    for (const key of path) {
        if (typeof current !== 'object') {
            return ResultModule.ok(undefined);
        }
        const next = current[key];
        const dateTimeValue = dateTime.decode(next);
        if (dateTimeValue._tag === 'Right') {
            return ResultModule.ok(dateTimeValue.right);
        }
        current = current[key];
    }
    const dateTimeValue = dateTime.decode(current);
    if (dateTimeValue._tag === 'Right') {
        return ResultModule.ok(dateTimeValue.right);
    }
    switch (typeof current) {
        case 'boolean':
        case 'number':
        case 'string':
        case 'undefined':
            return ResultModule.ok(current);
        default:
            return ResultModule.ok(undefined);
    }
};

export const characterAction = (toml: string): Result<CharacterAction> => {
    // CONSIDER: TOMLのDateTimeに未対応
    const object = parse(toml);
    if (object.isError) {
        return object;
    }
    const decoded = exactCharacterAction.decode(object.value);
    if (decoded._tag === 'Left') {
        return ResultModule.error(errorToMessage(decoded.left));
    }
    return ResultModule.ok(decoded.right);
};

export const toCharacterOperation = ({ action, currentState, commandKey }: { action: ReadonlyMap<string, CharacterActionElement>; currentState: Character.State; commandKey: string }) => {
    const command = action.get(commandKey);
    if (command?.chara == null) {
        return undefined;
    }

    const result: Character.UpOperation = { $version: 1 };
    if (command.chara.name != null) {
        result.name = { newValue: command.chara.name };
    }
    if (command.chara.icon != null) {
        result.image = { newValue: Util.toFilePath(command.chara.icon) };
    }
    if (command.chara.tachie != null) {
        result.tachieImage = { newValue: Util.toFilePath(command.chara.tachie) };
    }
    return result;
};