/* eslint-disable @typescript-eslint/no-namespace */
import * as t from 'io-ts';
import {
    parse as parseCore,
    LocalDate as TomlLocalDate,
    LocalDateTime as TomlLocalDateTime,
    LocalTime as TomlLocalTime,
    OffsetDateTime as TomlOffsetDateTime,
} from '@ltd/j-toml';
import { Default, FilePath, FirebaseStorage, sourceType } from './ot/filePath/v1';
import * as Character from './ot/room/character/v1';
import * as Room from './ot/room/v1';
import * as Bgm from './ot/room/bgm/v1';
import { Result } from '@kizahasi/result';
import { CompositeKey, dualKeyRecordToDualKeyMap, strIndex5Array } from '@kizahasi/util';
import { analyze, expr1 } from './expression';

const REMOVE = '';
const canBeArray = <T extends t.Mixed>(source: T) => t.union([source, t.array(source)]);
const canBeArrayToArray = <T>(source: T | T[]) => {
    if (Array.isArray(source)) {
        return source;
    }
    return [source];
};
const removable = <T extends t.Mixed>(source: T) => t.union([source, t.literal(REMOVE)]);

namespace File {
    const fileObject = t.type({
        path: t.string,
        type: sourceType,
    });
    export const main = t.union([fileObject, t.string]);
    export type Main = t.TypeOf<typeof main>;

    export const toFilePath = (source: Main): FilePath => {
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
            path: source.path,
        };
    };
}

namespace Message {
    export const action = t.partial({
        text: t.string,
    });

    export type Action = t.TypeOf<typeof action>;
}

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

const bgmElement = t.partial({
    file: canBeArray(File.main),
});

const bgm = t.partial({
    '1': bgmElement,
    '2': bgmElement,
    '3': bgmElement,
    '4': bgmElement,
    '5': bgmElement,
});

type BgmCommand = t.TypeOf<typeof bgm>;

const se = t.partial({
    file: File.main,
    volume: t.number,
});

const image = t.partial({
    file: File.main,
});

const piece = t.partial({
    // hide: t.boolean,
    image,
});

const portrait = t.partial({
    // hide: t.boolean,
    image,
});

const characterAction = t.partial({
    name: t.string,
    piece,
    portrait,
    'write-message': Message.action,
});

type CharacterAction = t.TypeOf<typeof characterAction>;

const characterFilter = t.partial({
    name: t.string,
});

type CharacterFilter = t.TypeOf<typeof characterFilter>;

const characterCommand = t.partial({
    filter: characterFilter,
    filtered: characterAction,
    self: characterAction,
});

type CharacterCommand = t.TypeOf<typeof characterCommand>;

const commandElement = t.partial({
    name: t.string,
    bgm,
    character: canBeArray(characterCommand),
    se,
});

export type CommandElement = t.TypeOf<typeof commandElement>;

const commands = t.type({
    _: canBeArray(commandElement),
});
const exactCommands = t.strict({
    _: canBeArray(t.exact(commandElement)),
});

export type Commands = t.TypeOf<typeof commands>;

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
        if (typeof current !== 'object') {
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

export const parseToCommands = (toml: string): Result<Commands> => {
    // CONSIDER: TOMLのDateTimeに未対応
    const object = parseTomlCore(toml);
    if (object.isError) {
        return object;
    }
    const decoded = exactCommands.decode(object.value);
    if (decoded._tag === 'Left') {
        return Result.error(errorToMessage(decoded.left));
    }
    return Result.ok(decoded.right);
};

const applyBgmCommand = ({
    bgmState,
    bgmCommand,
}: {
    bgmState: Record<string, Bgm.State | undefined>;
    bgmCommand: BgmCommand;
}) => {
    const result = { ...bgmState };
    strIndex5Array.forEach(i => {
        const elem = bgmCommand[i];
        if (elem == null) {
            return;
        }
        const fileCommand = elem.file == null ? undefined : canBeArrayToArray(elem.file);
        if (fileCommand?.length === 0) {
            if (bgmState[i] == null) {
                return;
            }
            result[i] = undefined;
            return;
        }
        const bgmStateElement = bgmState[i];
        if (bgmStateElement == null) {
            if (fileCommand == null) {
                return;
            }
            const newValue: Bgm.State = {
                $version: 1,
                files: fileCommand.map(File.toFilePath),
                isPaused: false,
                volume: 1,
            };
            result[i] = newValue;
            return;
        }
        if (fileCommand == null) {
            return;
        }
        result[i] = {
            ...bgmStateElement,
            files: fileCommand.map(File.toFilePath),
        };
    });
    return result;
};

const applyCharacterAction = ({
    state,
    action,
}: {
    state: Character.State;
    action: CharacterAction;
}) => {
    const result = { ...state };
    if (action.name != null) {
        result.name = action.name;
    }
    if (action.piece?.image?.file != null) {
        result.image = File.toFilePath(action.piece.image.file);
    }
    if (action.portrait?.image?.file != null) {
        result.tachieImage = File.toFilePath(action.portrait.image.file);
    }
    return result;
};

const filterCharacter = ({
    state,
    filter,
}: {
    state: Character.State;
    filter: CharacterFilter;
}): boolean => {
    if (filter.name != null) {
        if (state.name !== filter.name) {
            return false;
        }
    }

    return true;
};

const applyCharacterCommand = ({
    characterState,
    characterCommand,
    selfCharacterId,
}: {
    characterState: Record<string, Record<string, Character.State | undefined> | undefined>;
    characterCommand: CharacterCommand;
    selfCharacterId: CompositeKey | undefined;
}) => {
    const result = dualKeyRecordToDualKeyMap(characterState);
    const self =
        selfCharacterId == null
            ? undefined
            : result.get({ first: selfCharacterId.createdBy, second: selfCharacterId.id });

    if (characterCommand.self != null && selfCharacterId != null && self != null) {
        const newCharacter = applyCharacterAction({
            state: self,
            action: characterCommand.self,
        });
        result.set({ first: selfCharacterId.createdBy, second: selfCharacterId.id }, newCharacter);
    }

    const actionFiltered = characterCommand.filtered;
    if (actionFiltered == null) {
        return result.toStringRecord(
            x => x,
            x => x
        );
    }

    [...result]
        .filter(([, value]) =>
            characterCommand.filter == null
                ? true
                : filterCharacter({ state: value, filter: characterCommand.filter })
        )
        .forEach(([characterKey, character]) => {
            result.set(
                characterKey,
                applyCharacterAction({ state: character, action: actionFiltered })
            );
        });
    return result.toStringRecord(
        x => x,
        x => x
    );
};

export const applyCommands = ({
    commands,
    room,
    selfCharacterId,
    commandIndex,
}: {
    commands: Commands;
    room: Room.State;
    selfCharacterId: CompositeKey | undefined;
    commandIndex: number;
}) => {
    const command = canBeArrayToArray(commands._)[commandIndex];
    if (command == null) {
        return null;
    }
    const result = { ...room };

    if (command.bgm != null) {
        result.bgms = applyBgmCommand({ bgmState: room.bgms, bgmCommand: command.bgm });
    }

    if (command.character != null) {
        canBeArrayToArray(command.character).forEach(characterCommand => {
            result.characters = applyCharacterCommand({
                characterState: room.characters,
                characterCommand,
                selfCharacterId,
            });
        });
    }

    const se =
        command.se?.file == null
            ? undefined
            : {
                  file: File.toFilePath(command.se.file),
                  volume: (command.se.volume ?? 100) / 100,
              };

    return { room: result, se };
};

const exactChatPalette = t.strict({
    var: t.UnknownRecord,

    // paletteではなくわざわざ冗長なpalette.textにしたのは、[var]→チャットパレットの文字列 の順で書けるようにするため。
    palette: t.strict({
        text: t.string,
    }),
});

// palette.textに例えば {foo} のような文字列が含まれている場合、varで定義されていればそれに置き換える。定義が見つからなければそのまま残す。
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

    const lines = decoded.right.palette.text.split(/(?:\r\n|\r|\n)/).map(line => {
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
