'use strict';

var zod = require('zod');
var result = require('@kizahasi/result');
var jToml = require('@ltd/j-toml');
var floconScript = require('@flocon-trpg/flocon-script');
var utils = require('@flocon-trpg/utils');
var lodash = require('lodash');
var otString = require('@kizahasi/ot-string');
var truncate = require('truncate-utf8-bytes');
var produce = require('immer');
var otCore = require('@kizahasi/ot-core');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var truncate__default = /*#__PURE__*/_interopDefault(truncate);
var produce__default = /*#__PURE__*/_interopDefault(produce);

const anonymous = 'anonymous';
const authToken = 'authToken';
const $free = '$free';
const $system = '$system';

const firebaseConfig = zod.z.object({
    // databaseURLというキーはおそらくFirestoreを有効化しないと含まれないため、除外している。
    apiKey: zod.z.string(),
    authDomain: zod.z.string(),
    projectId: zod.z.string(),
    storageBucket: zod.z.string(),
    messagingSenderId: zod.z.string(),
    appId: zod.z.string(),
});

const strIndex5Array = ['1', '2', '3', '4', '5'];
const strIndex5Set = new Set(strIndex5Array);
const isStrIndex5 = (source) => {
    return strIndex5Set.has(source);
};
const strIndex10Array = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
];
const strIndex10Set = new Set(strIndex10Array);
const isStrIndex10 = (source) => {
    return strIndex10Set.has(source);
};
const strIndex20Array = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
];
const strIndex20Set = new Set(strIndex20Array);
const isStrIndex20 = (source) => {
    return strIndex20Set.has(source);
};
const strIndex100Array = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '30',
    '31',
    '32',
    '33',
    '34',
    '35',
    '36',
    '37',
    '38',
    '39',
    '40',
    '41',
    '42',
    '43',
    '44',
    '45',
    '46',
    '47',
    '48',
    '49',
    '50',
    '51',
    '52',
    '53',
    '54',
    '55',
    '56',
    '57',
    '58',
    '59',
    '60',
    '61',
    '62',
    '63',
    '64',
    '65',
    '66',
    '67',
    '68',
    '69',
    '70',
    '71',
    '72',
    '73',
    '74',
    '75',
    '76',
    '77',
    '78',
    '79',
    '80',
    '81',
    '82',
    '83',
    '84',
    '85',
    '86',
    '87',
    '88',
    '89',
    '90',
    '91',
    '92',
    '93',
    '94',
    '95',
    '96',
    '97',
    '98',
    '99',
    '100',
];
const strIndex100Set = new Set(strIndex100Array);
const isStrIndex100 = (source) => {
    return strIndex100Set.has(source);
};

// 𩸽や😀のようなサロゲートペアで表現される文字はlengthで2とカウントされるが、欲しい情報は文字数ではなく消費容量であるためlengthで問題ない
const maxLengthString = (maxLength) => zod.z.string().max(maxLength).brand();
const maxLength100String = maxLengthString(100);
const maxLength1000String = maxLengthString(1000);
const emptyString = '';
maxLength100String.parse(emptyString);
maxLength1000String.parse(emptyString);

const forceMaxLength100String = (source) => {
    return maxLength100String.parse(source);
};

/** @deprecated Use `optional` method in zod. */
const maybe = (source) => source.optional();

/* eslint-disable @typescript-eslint/no-namespace */
exports.PublicChannelKey = void 0;
(function (PublicChannelKey) {
    (function (Without$System) {
        Without$System.publicChannelKeys = [
            ...strIndex10Array,
            $free,
        ];
        Without$System.isPublicChannelKey = (source) => {
            return Without$System.publicChannelKeys.find(key => key === source) !== undefined;
        };
    })(PublicChannelKey.Without$System || (PublicChannelKey.Without$System = {}));
    (function (With$System) {
        With$System.publicChannelKeys = [
            ...strIndex10Array,
            $free,
            $system,
        ];
        With$System.isPublicChannelKey = (source) => {
            return With$System.publicChannelKeys.find(key => key === source) !== undefined;
        };
    })(PublicChannelKey.With$System || (PublicChannelKey.With$System = {}));
})(exports.PublicChannelKey || (exports.PublicChannelKey = {}));

// NOT cryptographically secure
const simpleId = () => {
    const idLength = 9;
    let result = Math.random().toString(36).substr(2, idLength);
    while (result.length < idLength) {
        result = result + '0';
    }
    return result;
};

const plain = 'plain';
const expr1 = 'expr1';
const expr2 = 'expr2';
const toExpressionCore = (text) => {
    const bareKey = /[a-zA-Z0-9_-]/;
    const head = []; // plainが連続して続くことはない。
    let tail = {
        type: plain,
        text: '',
    };
    const charArray = Array.from(text);
    let cursor = 0;
    for (; cursor < charArray.length; cursor++) {
        const char = charArray[cursor];
        if (char === undefined) {
            throw new Error('this should not happen. charArray out of range.');
        }
        switch (tail.type) {
            case plain:
                switch (char) {
                    case '\\': {
                        const nextChar = charArray[cursor + 1];
                        if (nextChar == null) {
                            return result.Result.error({
                                message: '末尾を \\ にすることはできません。',
                                index: cursor,
                            });
                        }
                        cursor++;
                        tail = { ...tail, text: tail.text + nextChar };
                        continue;
                    }
                    case '{': {
                        const nextChar = charArray[cursor + 1];
                        head.push(tail);
                        if (nextChar === '{') {
                            cursor++;
                            tail = {
                                type: expr2,
                                path: [],
                                raw: '{{',
                                reading: {
                                    type: 'Begin',
                                },
                            };
                            continue;
                        }
                        tail = {
                            type: expr1,
                            path: [],
                            raw: '{',
                            reading: {
                                type: 'Begin',
                            },
                        };
                        continue;
                    }
                    case '}': {
                        return result.Result.error({
                            message: '} に対応する { が見つかりません。',
                            index: cursor,
                        });
                    }
                    default: {
                        tail = { ...tail, text: tail.text + char };
                        continue;
                    }
                }
            case expr1:
            case expr2: {
                // 基本的に、まずtail.reading.typeで分類して、その次にcharごとに処理を行っている。
                // ただし、char === '}' のケースは、共通処理が複雑なため、同じコードをコピペしたくないので例外的にここでまず処理してしまっている。
                if (char === '}') {
                    switch (tail.reading.type) {
                        case 'Begin':
                            return result.Result.error({
                                message: 'プロパティを空にすることはできません。',
                                index: cursor,
                            });
                        case 'Bare':
                        case 'EndOfProp': {
                            if (tail.type === expr1) {
                                head.push({
                                    type: expr1,
                                    path: tail.reading.type === 'Bare'
                                        ? [...tail.path, tail.reading.text]
                                        : tail.path,
                                    raw: tail.raw + '}',
                                });
                                tail = { type: plain, text: '' };
                                continue;
                            }
                            const nextChar = charArray[cursor + 1];
                            if (nextChar !== '}') {
                                return result.Result.error({
                                    message: '{{ を } で閉じることはできません。',
                                    index: cursor,
                                });
                            }
                            continue;
                        }
                    }
                }
                switch (tail.reading.type) {
                    case 'Begin': {
                        switch (char) {
                            // { が3つ以上続いていた場合は char === '{' になる。
                            case ' ':
                                continue;
                            case "'": {
                                tail = {
                                    ...tail,
                                    reading: {
                                        type: 'InSingleQuote',
                                        text: '',
                                    },
                                    raw: tail.raw + char,
                                };
                                continue;
                            }
                            case '"': {
                                tail = {
                                    ...tail,
                                    reading: {
                                        type: 'InDoubleQuote',
                                        text: '',
                                    },
                                    raw: tail.raw + char,
                                };
                                continue;
                            }
                            default: {
                                if (!bareKey.test(char)) {
                                    return result.Result.error({
                                        message: `${char} はこの場所で使うことはできません。`,
                                        index: cursor,
                                    });
                                }
                                tail = {
                                    ...tail,
                                    reading: {
                                        type: 'Bare',
                                        text: char,
                                    },
                                    raw: tail.raw + char,
                                };
                                continue;
                            }
                        }
                    }
                    case 'EndOfProp': {
                        switch (char) {
                            case ' ':
                                continue;
                            case '.': {
                                tail = {
                                    ...tail,
                                    reading: { type: 'Begin' },
                                    raw: tail.raw + char,
                                };
                                continue;
                            }
                            default: {
                                return result.Result.error({
                                    message: `${char} はこの場所で使うことはできません。`,
                                    index: cursor,
                                });
                            }
                        }
                    }
                    case 'Bare': {
                        switch (char) {
                            case ' ': {
                                tail = {
                                    ...tail,
                                    path: [...tail.path, tail.reading.text],
                                    raw: tail.raw + char,
                                    reading: { type: 'EndOfProp' },
                                };
                                continue;
                            }
                            case '.':
                                tail = {
                                    type: tail.type,
                                    path: [...tail.path, tail.reading.text],
                                    raw: tail.raw + char,
                                    reading: {
                                        type: 'Begin',
                                    },
                                };
                                continue;
                            default: {
                                if (!bareKey.test(char)) {
                                    return result.Result.error({
                                        message: `${char} は ' か " で囲む必要があります。`,
                                        index: cursor,
                                    });
                                }
                                tail = {
                                    ...tail,
                                    raw: tail.raw + char,
                                    reading: {
                                        type: 'Bare',
                                        text: tail.reading.text + char,
                                    },
                                };
                                continue;
                            }
                        }
                    }
                    case 'InDoubleQuote': {
                        switch (char) {
                            case '"': {
                                tail = {
                                    ...tail,
                                    path: [...tail.path, tail.reading.text],
                                    raw: tail.raw + char,
                                    reading: {
                                        type: 'EndOfProp',
                                    },
                                };
                                continue;
                            }
                            case '\\': {
                                const nextChar = charArray[cursor + 1];
                                switch (nextChar) {
                                    case '"':
                                        tail = {
                                            ...tail,
                                            raw: tail.raw + char,
                                            reading: {
                                                type: tail.reading.type,
                                                text: tail.reading.text + '"',
                                            },
                                        };
                                        cursor++;
                                        continue;
                                    case '\\': {
                                        tail = {
                                            ...tail,
                                            raw: tail.raw + char,
                                            reading: {
                                                type: tail.reading.type,
                                                text: tail.reading.text + '\\',
                                            },
                                        };
                                        cursor++;
                                        continue;
                                    }
                                    case undefined:
                                        return result.Result.error({
                                            message: 'エスケープ文字の次に文字がありません。',
                                            index: cursor,
                                        });
                                    default:
                                        // TOMLでは\uXXXXなどでunicodeを直接指定できるが、面倒なので今のところ実装は省略している。
                                        return result.Result.error({
                                            message: `\\${nextChar} は無効なエスケープシーケンスです。`,
                                            index: cursor,
                                        });
                                }
                            }
                            default:
                                tail = {
                                    ...tail,
                                    raw: tail.raw + char,
                                    reading: {
                                        type: tail.reading.type,
                                        text: tail.reading.text + char,
                                    },
                                };
                                continue;
                        }
                    }
                    case 'InSingleQuote': {
                        switch (char) {
                            case "'":
                                tail = {
                                    ...tail,
                                    path: [...tail.path, tail.reading.text],
                                    raw: tail.raw + char,
                                    reading: { type: 'EndOfProp' },
                                };
                                continue;
                            default:
                                tail = {
                                    ...tail,
                                    raw: tail.raw + char,
                                    reading: {
                                        type: tail.reading.type,
                                        text: tail.reading.text + char,
                                    },
                                };
                                continue;
                        }
                    }
                }
            }
        }
    }
    switch (tail.type) {
        case plain:
            return result.Result.ok([...head, tail]);
        case expr1:
            return result.Result.error({
                index: cursor + 1,
                message: '} に対応する { がありません。',
            });
        case expr2:
            return result.Result.error({
                index: cursor + 1,
                message: '}} に対応する {{ がありません。',
            });
    }
};
const analyze = (text) => {
    const expressions = toExpressionCore(text);
    if (expressions.isError) {
        return result.Result.error(`${expressions.error.index}: ${expressions.error.message}`);
    }
    const result$1 = [];
    for (const expr of expressions.value) {
        switch (expr.type) {
            case expr2:
                return result.Result.error('{{と}}で囲む構文は将来のために予約されているため、現在は使用することはできません。');
            case expr1:
                result$1.push({ type: expr1, path: expr.path, raw: expr.raw });
                continue;
            default:
                if (expr.text !== '') {
                    result$1.push({ type: plain, text: expr.text });
                }
                continue;
        }
    }
    return result.Result.ok(result$1);
};

const isTomlDateTime = (source) => {
    return (source instanceof jToml.LocalDate ||
        source instanceof jToml.LocalDateTime ||
        source instanceof jToml.LocalTime ||
        source instanceof jToml.OffsetDateTime);
};
const parseTomlCore = (toml) => {
    let object;
    try {
        object = jToml.parse(toml, 1.0, '\r\n', false);
    }
    catch (error) {
        if (typeof error === 'string') {
            return result.Result.error(error);
        }
        if (error instanceof Error) {
            return result.Result.error(error.message);
        }
        throw error;
    }
    return result.Result.ok(object);
};
const parseToml = (toml) => {
    const core = parseTomlCore(toml);
    if (core.isError) {
        return core;
    }
    return result.Result.ok(core.value);
};
const isValidVarToml = (toml) => {
    const parsed = parseTomlCore(toml);
    if (parsed.isError) {
        return parsed;
    }
    return result.Result.ok(undefined);
};
const tomlDateTime = zod.z.union([
    zod.z.instanceof(jToml.LocalDate),
    zod.z.instanceof(jToml.LocalDateTime),
    zod.z.instanceof(jToml.LocalTime),
    zod.z.instanceof(jToml.OffsetDateTime),
]);
const tomlObjectType = zod.z.union([
    // zod は Date や Map などを z.record(z.unknown()) に変換しようとすると失敗するが、独自のクラスでは失敗しない(JavaScript の仕様を考えると当然ではあるが)。そのため、パース処理そのものは tomlDateTime の有無は影響しないと考えられるが、tomlObjectType.parse の戻り値の型を扱いやすくする目的で付け加えている。
    tomlDateTime,
    zod.z.record(zod.z.unknown()),
    zod.z.number(),
    zod.z.string(),
    zod.z.null(),
    zod.z.undefined(),
]);
const getVariableFromVarTomlObject = (tomlObject, path) => {
    let current = tomlObject;
    for (const key of path) {
        const parsed = tomlObjectType.safeParse(current);
        if (!parsed.success) {
            return result.Result.error(parsed.error.message);
        }
        if (parsed.data == null) {
            return result.Result.ok(undefined);
        }
        if (typeof parsed.data === 'string' || typeof parsed.data === 'number') {
            return result.Result.ok(undefined);
        }
        if (isTomlDateTime(parsed.data)) {
            return result.Result.ok(undefined);
        }
        current = parsed.data[key];
    }
    const parsed = tomlObjectType.safeParse(current);
    if (!parsed.success) {
        return result.Result.error(parsed.error.message);
    }
    return result.Result.ok(parsed.data);
};
const chatPalette = zod.z.object({
    var: maybe(zod.z.record(zod.z.unknown())),
    // textではなくわざわざ冗長なtext.valueにしたのは、[var]→チャットパレットの文字列 の順で書けるようにするため。
    // また、将来的に例えばtext.typeに何かをセットして…という拡張もできる余地がある。
    text: zod.z.object({
        value: zod.z.string(),
    }),
});
// text.valueに例えば {foo} のような文字列が含まれている場合、varで定義されていればそれに置き換える。定義が見つからなければそのまま残す。
/** @deprecated We no longer use TOML in chat palettes. */
const generateChatPalette = (toml) => {
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
    return result.Result.ok(lines);
};

const value$2 = 'value';
const isValueSecret$2 = 'isValueSecret';
class FBoolParam extends floconScript.FObject {
    boolParam;
    constructor(boolParam) {
        super();
        this.boolParam = boolParam;
    }
    getCore({ key }) {
        const keyAsString = key.toString();
        switch (keyAsString) {
            case value$2:
                return this.boolParam.value == null
                    ? undefined
                    : new floconScript.FBoolean(this.boolParam.value);
            case isValueSecret$2:
                return new floconScript.FBoolean(this.boolParam.isValuePrivate);
            default:
                return undefined;
        }
    }
    setCore({ key, newValue, astInfo }) {
        const keyAsString = key.toString();
        switch (keyAsString) {
            case value$2:
                this.boolParam.value = floconScript.beginCast(newValue, astInfo)
                    .addBoolean()
                    .addUndefined()
                    .cast();
                return;
            case isValueSecret$2:
                this.boolParam.isValuePrivate = floconScript.beginCast(newValue, astInfo).addBoolean().cast();
                return;
            default:
                throw new floconScript.ScriptError(`${typeof key === 'symbol' ? 'symbol' : key}への値のセットは制限されています。`);
        }
    }
    toJObject() {
        return this.boolParam;
    }
}

const createDefaultState$2 = () => ({
    $v: 2,
    $r: 1,
    value: false,
    isValuePrivate: false,
    overriddenParameterName: undefined,
});
class FBoolParams extends floconScript.FObject {
    boolParams;
    room;
    constructor(boolParams, room) {
        super();
        this.boolParams = boolParams;
        this.room = room;
    }
    findKeysByNameOrKey(nameOrKey) {
        if (this.room.boolParamNames == null) {
            return [];
        }
        return utils.recordToArray(this.room.boolParamNames)
            .filter(({ value }, i) => value.name === nameOrKey || i + 1 === nameOrKey)
            .map(({ key }) => key);
    }
    findByNameOrKey(nameOrKeyValue, astInfo) {
        const nameOrKey = floconScript.beginCast(nameOrKeyValue, astInfo).addString().addNumber().cast();
        const keys = this.findKeysByNameOrKey(nameOrKey);
        for (const key of keys) {
            const found = (this.boolParams ?? {})[key];
            if (found == null) {
                const newValue = createDefaultState$2();
                this.boolParams[key] = newValue;
                return newValue;
            }
            return found;
        }
        return undefined;
    }
    toggleValue(nameOrKeyValue, astInfo) {
        const found = this.findByNameOrKey(nameOrKeyValue, astInfo);
        if (found == null) {
            return;
        }
        found.value = !(found.value ?? createDefaultState$2().value);
    }
    setIsValuePrivate(nameOrKeyValue, newValue, astInfo) {
        const $newValue = floconScript.beginCast(newValue, astInfo).addBoolean().cast();
        const found = this.findByNameOrKey(nameOrKeyValue, astInfo);
        if (found == null) {
            return;
        }
        found.isValuePrivate = $newValue;
    }
    getCore({ key, astInfo }) {
        const keyAsString = key.toString();
        switch (keyAsString) {
            case 'find':
                return new floconScript.FFunction(({ args }) => {
                    const result = this.findByNameOrKey(args[0], astInfo);
                    if (result == null) {
                        return undefined;
                    }
                    return new FBoolParam(result);
                });
            case 'toggleValue':
                return new floconScript.FFunction(({ args }) => {
                    this.toggleValue(args[0], astInfo);
                    return undefined;
                });
            case 'setValue':
                return new floconScript.FFunction(({ args }) => {
                    const newValue = floconScript.beginCast(args[1], astInfo).addBoolean().cast();
                    const found = this.findByNameOrKey(args[0], astInfo);
                    if (found == null) {
                        return;
                    }
                    found.value = newValue;
                    return undefined;
                });
            case 'setIsValueSecret':
                return new floconScript.FFunction(({ args }) => {
                    this.setIsValuePrivate(args[0], args[1], astInfo);
                    return undefined;
                });
        }
        return undefined;
    }
    setCore() {
        throw new floconScript.ScriptError('値のセットは制限されています。');
    }
    toJObject() {
        return this.boolParams;
    }
}

const update$2 = 'update';
const replace$1 = 'replace';
const recordDownOperationElementFactory = (state, operation) => zod.z.union([
    zod.z.object({
        type: zod.z.literal(replace$1),
        replace: zod.z
            .object({
            oldValue: state,
        })
            .partial(),
    }),
    zod.z.object({
        type: zod.z.literal(update$2),
        update: operation,
    }),
]);
const recordUpOperationElementFactory = (state, operation) => zod.z.union([
    zod.z.object({
        type: zod.z.literal(replace$1),
        replace: zod.z
            .object({
            newValue: state,
        })
            .partial(),
    }),
    zod.z.object({
        type: zod.z.literal(update$2),
        update: operation,
    }),
]);

const r = 'r';
const i = 'i';
const d = 'd';
const downOperationUnit = zod.z.union([
    zod.z.object({
        t: zod.z.literal(r),
        r: zod.z.number(),
    }),
    zod.z.object({
        t: zod.z.literal(i),
        i: zod.z.number(),
    }),
    zod.z.object({
        t: zod.z.literal(d),
        d: zod.z.string(),
    }),
]);
const downOperation$2 = zod.z.array(downOperationUnit);
const upOperationUnit = zod.z.union([
    zod.z.object({
        t: zod.z.literal(r),
        r: zod.z.number(),
    }),
    zod.z.object({
        t: zod.z.literal(i),
        i: zod.z.string(),
    }),
    zod.z.object({
        t: zod.z.literal(d),
        d: zod.z.number(),
    }),
]);
const upOperation$2 = zod.z.array(upOperationUnit);
const apply$5 = (state, action) => {
    const action$ = otString.deserializeUpOperation(action);
    if (action$ == null) {
        return result.Result.ok(state);
    }
    return otString.apply({
        prevState: state,
        upOperation: action$,
    });
};
const applyBack$4 = (state, action) => {
    const action$ = otString.deserializeDownOperation(action);
    if (action$ == null) {
        return result.Result.ok(state);
    }
    return otString.applyBack({
        nextState: state,
        downOperation: action$,
    });
};
const composeDownOperation$3 = (first, second) => {
    const first$ = first == null ? undefined : otString.deserializeDownOperation(first);
    const second$ = second == null ? undefined : otString.deserializeDownOperation(second);
    if (first$ == null) {
        return result.Result.ok(second);
    }
    if (second$ == null) {
        return result.Result.ok(first);
    }
    const result$1 = otString.composeDownOperation({
        first: first$,
        second: second$,
    });
    if (result$1.isError) {
        return result$1;
    }
    return result.Result.ok(otString.serializeDownOperation(result$1.value));
};
const restore$4 = ({ nextState, downOperation, }) => {
    const downOperation$ = downOperation == null ? undefined : otString.deserializeDownOperation(downOperation);
    if (downOperation$ == null) {
        return result.Result.ok({
            prevState: nextState,
            twoWayOperation: undefined,
        });
    }
    const result$1 = otString.applyBackAndRestore({
        nextState,
        downOperation: downOperation$,
    });
    if (result$1.isError) {
        return result$1;
    }
    return result.Result.ok({
        prevState: result$1.value.prevState,
        twoWayOperation: otString.serializeTwoWayOperation(result$1.value.restored),
    });
};
// 元々はこの関数自身がserverTransformとしてexportされていたが、firstPrimeは必要ないためexportを外した。ただし将来使うことがあるかもしれないため一応残している。
const serverTransformCore = ({ first, second, prevState, }) => {
    const first$ = first == null ? undefined : otString.deserizalizeTwoWayOperation(first);
    if (first$ === undefined) {
        const second$ = second == null ? undefined : otString.deserializeUpOperation(second);
        if (second$ === undefined) {
            return result.Result.ok({
                firstPrime: undefined,
                secondPrime: undefined,
            });
        }
        const restoreResult = otString.applyAndRestore({
            prevState,
            upOperation: second$,
        });
        if (restoreResult.isError) {
            return restoreResult;
        }
        return result.Result.ok({
            firstPrime: undefined,
            secondPrime: otString.serializeTwoWayOperation(restoreResult.value.restored),
        });
    }
    const second$ = second == null ? undefined : otString.deserializeUpOperation(second);
    if (second$ === undefined) {
        return result.Result.ok({
            firstPrime: first$,
            secondPrime: undefined,
        });
    }
    const secondResult = otString.applyAndRestore({
        prevState,
        upOperation: second$,
    });
    if (secondResult.isError) {
        return secondResult;
    }
    const result$1 = otString.transformTwoWayOperation({
        first: first$,
        second: secondResult.value.restored,
    });
    if (result$1.isError) {
        return result$1;
    }
    return result.Result.ok({
        firstPrime: otString.serializeTwoWayOperation(result$1.value.firstPrime),
        secondPrime: otString.serializeTwoWayOperation(result$1.value.secondPrime),
    });
};
const serverTransform$r = ({ first, second, prevState, }) => {
    const result$1 = serverTransformCore({ first, second, prevState });
    if (result$1.isError) {
        return result$1;
    }
    return result.Result.ok(result$1.value.secondPrime);
};
const clientTransform$5 = ({ first, second, }) => {
    const first$ = first == null ? undefined : otString.deserializeUpOperation(first);
    if (first$ === undefined) {
        const second$ = second == null ? undefined : otString.deserializeUpOperation(second);
        if (second$ === undefined) {
            return result.Result.ok({
                firstPrime: undefined,
                secondPrime: undefined,
            });
        }
        return result.Result.ok({
            firstPrime: undefined,
            secondPrime: otString.serializeUpOperation(second$),
        });
    }
    const second$ = second == null ? undefined : otString.deserializeUpOperation(second);
    if (second$ === undefined) {
        return result.Result.ok({
            firstPrime: otString.serializeUpOperation(first$),
            secondPrime: undefined,
        });
    }
    const result$1 = otString.transformUpOperation({
        first: first$,
        second: second$,
    });
    if (result$1.isError) {
        return result$1;
    }
    return result.Result.ok({
        firstPrime: otString.serializeUpOperation(result$1.value.firstPrime),
        secondPrime: otString.serializeUpOperation(result$1.value.secondPrime),
    });
};
const diff$4 = ({ prev, next, }) => {
    if (prev === next) {
        return undefined;
    }
    return otString.serializeTwoWayOperation(otString.diff({
        prevState: prev,
        nextState: next,
    }));
};
const toUpOperation$2 = (source) => {
    const twoWayOperation = otString.deserizalizeTwoWayOperation(source);
    if (twoWayOperation == null) {
        throw new Error('This should not happen');
    }
    const upOperation = otString.toUpOperation(twoWayOperation);
    return otString.serializeUpOperation(upOperation);
};
const toDownOperation$2 = (source) => {
    const twoWayOperation = otString.deserizalizeTwoWayOperation(source);
    if (twoWayOperation == null) {
        throw new Error('This should not happen');
    }
    const downOperation = otString.toDownOperation(twoWayOperation);
    return otString.serializeDownOperation(downOperation);
};

// CONSIDER: keyが1つのみのrecordOperationを用いることでこのコードを大幅に簡略化できないか？
const stateShouldNotBeUndefinedMessage = 'state should not be undefined';
const firstTypeShouldBeSameAsSecondType = 'first type and second type should be same';
const stringOrUndefined = zod.z.union([zod.z.string(), zod.z.undefined()]);
const downOperation$1 = zod.z.union([
    zod.z.object({
        type: zod.z.literal(replace$1),
        replace: zod.z.object({
            oldValue: stringOrUndefined,
        }),
    }),
    zod.z.object({
        type: zod.z.literal(update$2),
        update: downOperation$2,
    }),
]);
const upOperation$1 = zod.z.union([
    zod.z.object({
        type: zod.z.literal(replace$1),
        replace: zod.z.object({
            newValue: stringOrUndefined,
        }),
    }),
    zod.z.object({
        type: zod.z.literal(update$2),
        update: upOperation$2,
    }),
]);
const toUpOperation$1 = (source) => {
    if (source.type === replace$1) {
        return {
            type: replace$1,
            replace: {
                newValue: source.replace.newValue,
            },
        };
    }
    return {
        type: update$2,
        update: toUpOperation$2(source.update),
    };
};
const toDownOperation$1 = (source) => {
    if (source.type === replace$1) {
        return {
            type: replace$1,
            replace: {
                oldValue: source.replace.oldValue,
            },
        };
    }
    return {
        type: update$2,
        update: toDownOperation$2(source.update),
    };
};
const apply$4 = (state, action) => {
    if (action.type === replace$1) {
        return result.Result.ok(action.replace.newValue);
    }
    if (state == null) {
        return result.Result.error(stateShouldNotBeUndefinedMessage);
    }
    return apply$5(state, action.update);
};
const applyBack$3 = (state, action) => {
    if (action.type === replace$1) {
        return result.Result.ok(action.replace.oldValue);
    }
    if (state == null) {
        return result.Result.error(stateShouldNotBeUndefinedMessage);
    }
    return applyBack$4(state, action.update);
};
// stateが必要ないため処理を高速化&簡略化できるが、その代わり戻り値のreplaceにおいて oldValue === undefined && newValue === undefined もしくは oldValue !== undefined && newValue !== undefinedになるケースがある。
const composeDownOperation$2 = (first, second) => {
    if (first == null) {
        return result.Result.ok(second);
    }
    if (second == null) {
        return result.Result.ok(first);
    }
    switch (first.type) {
        case replace$1:
            return result.Result.ok(first);
        case update$2:
            switch (second.type) {
                case replace$1: {
                    if (second.replace.oldValue == null) {
                        return result.Result.error('Because first is update, second.oldValue should not be undefined');
                    }
                    const oldValue = applyBack$4(second.replace.oldValue, first.update);
                    if (oldValue.isError) {
                        return oldValue;
                    }
                    return result.Result.ok({
                        type: replace$1,
                        replace: {
                            oldValue: oldValue.value,
                        },
                    });
                }
                case 'update': {
                    const composed = composeDownOperation$3(first.update, second.update);
                    if (composed.isError) {
                        return composed;
                    }
                    if (composed.value == null) {
                        return result.Result.ok(undefined);
                    }
                    return result.Result.ok({
                        type: update$2,
                        update: composed.value,
                    });
                }
            }
    }
};
const diff$3 = ({ prev, next, }) => {
    if (prev == null) {
        if (next == null) {
            return undefined;
        }
        return {
            type: replace$1,
            replace: {
                oldValue: prev,
                newValue: next,
            },
        };
    }
    if (next == null) {
        return {
            type: replace$1,
            replace: {
                oldValue: prev,
                newValue: next,
            },
        };
    }
    const diff = diff$4({ prev, next });
    if (diff == null) {
        return undefined;
    }
    return {
        type: update$2,
        update: diff,
    };
};
// composeDownOperationは、時系列順でremove→addしたものをcomposeすると、本来はupdateになるべきだが、replaceになってしまうという仕様がある。だが、このrestore関数ではそれをupdateに変換してくれる。
const restore$3 = ({ nextState, downOperation, }) => {
    if (downOperation == null) {
        return result.Result.ok({
            prevState: nextState,
            twoWayOperation: undefined,
        });
    }
    if (downOperation.type === replace$1) {
        return result.Result.ok({
            prevState: downOperation.replace.oldValue,
            twoWayOperation: diff$3({ prev: downOperation.replace.oldValue, next: nextState }),
        });
    }
    if (nextState == null) {
        return result.Result.error(stateShouldNotBeUndefinedMessage);
    }
    const restoredResult = restore$4({
        nextState,
        downOperation: downOperation.update,
    });
    if (restoredResult.isError) {
        return restoredResult;
    }
    return result.Result.ok({
        prevState: restoredResult.value.prevState,
        twoWayOperation: restoredResult.value.twoWayOperation == null
            ? undefined
            : {
                type: update$2,
                update: restoredResult.value.twoWayOperation,
            },
    });
};
const serverTransform$q = ({ first, second, prevState, }) => {
    if (second == null) {
        return result.Result.ok(undefined);
    }
    if (second.type === replace$1) {
        const oldValue = prevState;
        const newValue = second.replace.newValue;
        if (oldValue == null) {
            if (newValue == null) {
                return result.Result.ok(undefined);
            }
            return result.Result.ok({
                type: replace$1,
                replace: {
                    oldValue,
                    newValue,
                },
            });
        }
        if (newValue == null) {
            return result.Result.ok({
                type: replace$1,
                replace: {
                    oldValue,
                    newValue,
                },
            });
        }
        const diff = diff$4({ prev: oldValue, next: newValue });
        if (diff == null) {
            return result.Result.ok(undefined);
        }
        return result.Result.ok({
            type: update$2,
            update: diff,
        });
    }
    if (prevState == null) {
        return result.Result.error(stateShouldNotBeUndefinedMessage);
    }
    if (first?.type === replace$1) {
        return result.Result.error(firstTypeShouldBeSameAsSecondType);
    }
    const xformResult = serverTransform$r({
        first: first?.update,
        second: second.update,
        prevState: prevState,
    });
    if (xformResult.isError) {
        return xformResult;
    }
    if (xformResult.value == null) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok({
        type: update$2,
        update: xformResult.value,
    });
};
const clientTransform$4 = ({ first, second, }) => {
    if (first == null || second == null) {
        return result.Result.ok({
            firstPrime: first,
            secondPrime: second,
        });
    }
    if (first.type === replace$1) {
        if (second.type === update$2) {
            if (first.replace.newValue != null) {
                throw new Error('because second is update, first replace.newValue must not be undefined');
            }
            return result.Result.ok({
                firstPrime: first,
            });
        }
        if (first.replace.newValue == null) {
            if (second.replace.newValue != null) {
                throw new Error('first or second should be update');
            }
            return result.Result.ok({});
        }
        if (second.replace.newValue == null) {
            throw new Error('first or second should be update');
        }
        const diff = diff$4({
            prev: second.replace.newValue,
            next: first.replace.newValue,
        });
        return result.Result.ok({
            firstPrime: diff == null
                ? undefined
                : {
                    type: update$2,
                    update: toUpOperation$2(diff),
                },
        });
    }
    if (second.type === update$2) {
        const xformResult = clientTransform$5({
            first: first.update,
            second: second.update,
        });
        if (xformResult.isError) {
            return xformResult;
        }
        return result.Result.ok({
            firstPrime: xformResult.value.firstPrime == null
                ? undefined
                : {
                    type: update$2,
                    update: xformResult.value.firstPrime,
                },
            secondPrime: xformResult.value.secondPrime == null
                ? undefined
                : {
                    type: update$2,
                    update: xformResult.value.secondPrime,
                },
        });
    }
    if (second.replace.newValue != null) {
        throw new Error('because first is update, second replace.newValue must not be undefined');
    }
    return result.Result.ok({
        secondPrime: second,
    });
};

const isEmptyRecord = (source) => {
    for (const key in source) {
        const value = source[key];
        if (value !== undefined) {
            return false;
        }
    }
    return true;
};
const isIdRecord = (source) => {
    for (const key in source) {
        if (key === '$v' || key === '$r') {
            continue;
        }
        const value = source[key];
        if (value !== undefined) {
            return false;
        }
    }
    return true;
};
const record$1 = (value) => zod.z.record(value.optional());

const atomic = 'atomic';
const replace = 'replace';
const ot = 'ot';
const record = 'record';
const paramRecord = 'paramRecord';
const object = 'object';
/** Stateならば`T`に、TwoWayOperationならば`{ oldValue:T; newValue:T }`に変換されるtemplateを作成します。*/
const createReplaceValueTemplate = (value) => {
    return {
        type: atomic,
        mode: replace,
        value,
    };
};
/** Stateならば`string`(ただし`nullable === true`のときは代わりに`string | undefined`となます。`undefined`は`''`と同一として扱われます)に、TwoWayOperationならば変化のある部分のみを抽出したOperationに変換されるtemplateを作成します。*/
const createTextValueTemplate = (nullable) => ({
    type: atomic,
    mode: ot,
    nullable,
});
/** `Record<string, T>`を表すtemplateを作成します。*/
const createRecordValueTemplate = (value) => {
    return {
        type: record,
        value,
    };
};
/** `Record<string, T>`を表すtemplateを作成します。存在しない要素はdefaultStateがセットされているとみなされます。 */
const createParamRecordValueTemplate = (value, defaultState) => {
    return {
        type: paramRecord,
        value,
        defaultState,
    };
};
/** 複数のtemplateから構成される新たなtemplateを作成します。 */
const createObjectValueTemplate = (value, $v, $r) => {
    return {
        type: object,
        $v,
        $r,
        value,
    };
};
const state = (source) => {
    switch (source.type) {
        case atomic: {
            switch (source.mode) {
                case replace:
                    return source.value;
                case ot:
                    return source.nullable
                        ? zod.z.union([zod.z.string(), zod.z.undefined()])
                        : zod.z.string();
            }
            break;
        }
        case record:
        case paramRecord: {
            return zod.z.union([record$1(state(source.value)), zod.z.undefined()]);
        }
        case object: {
            return zod.z
                .object({
                $v: source.$v == null ? zod.z.undefined() : zod.z.literal(source.$v),
                $r: source.$r == null ? zod.z.undefined() : zod.z.literal(source.$r),
            })
                .and(zod.z.object(utils.mapRecord(source.value, value => state(value))));
        }
    }
};
const upOperation = (source) => {
    switch (source.type) {
        case atomic: {
            switch (source.mode) {
                case replace:
                    return zod.z.object({ newValue: source.value });
                case ot:
                    return source.nullable
                        ? upOperation$1
                        : upOperation$2;
            }
            break;
        }
        case record: {
            return record$1(recordUpOperationElementFactory(state(source.value), upOperation(source.value)));
        }
        case paramRecord:
            return record$1(upOperation(source.value));
        case object: {
            return zod.z
                .object({
                $v: source.$v == null ? zod.z.undefined() : zod.z.literal(source.$v),
                $r: source.$r == null ? zod.z.undefined() : zod.z.literal(source.$r),
            })
                .and(zod.z.object(utils.mapRecord(source.value, value => upOperation(value))).partial());
        }
    }
};
const downOperation = (source) => {
    switch (source.type) {
        case atomic: {
            switch (source.mode) {
                case replace:
                    return zod.z.object({ oldValue: source.value });
                case ot:
                    return source.nullable
                        ? downOperation$1
                        : downOperation$2;
            }
            break;
        }
        case record: {
            return record$1(recordDownOperationElementFactory(state(source.value), downOperation(source.value)));
        }
        case paramRecord: {
            return record$1(downOperation(source.value));
        }
        case object: {
            const base = zod.z
                .object({
                $v: source.$v == null ? zod.z.undefined() : zod.z.literal(source.$v),
                $r: source.$r == null ? zod.z.undefined() : zod.z.literal(source.$r),
            })
                .and(zod.z.object(utils.mapRecord(source.value, value => downOperation(value))).partial());
            return base;
        }
    }
};

const Default = 'Default';
const Uploader = 'Uploader';
const FirebaseStorage = 'FirebaseStorage';
const sourceType = zod.z.union([zod.z.literal(Default), zod.z.literal(Uploader), zod.z.literal(FirebaseStorage)]);
const filePathValue = zod.z.object({
    $v: zod.z.literal(1),
    $r: zod.z.literal(1),
    path: zod.z.string(),
    sourceType,
});
const filePathTemplate = createReplaceValueTemplate(filePathValue);

const toFFilePath = (source, astInfo) => {
    const result = new floconScript.FRecord();
    result.set({ property: new floconScript.FString('path'), newValue: new floconScript.FString(source.path), astInfo });
    result.set({
        property: new floconScript.FString('sourceType'),
        newValue: new floconScript.FString(source.sourceType),
        astInfo,
    });
    return result;
};
const toFilePathOrUndefined = (source, astInfo) => {
    if (source === undefined) {
        return undefined;
    }
    if (source?.type !== floconScript.FType.Object) {
        throw new floconScript.ScriptError();
    }
    const path = floconScript.beginCast(source.get({ property: new floconScript.FString('path'), astInfo }), astInfo)
        .addString()
        .cast();
    const sourceType = floconScript.beginCast(source.get({ property: new floconScript.FString('sourceType'), astInfo }), astInfo)
        .addString()
        .cast();
    if (sourceType !== Default && sourceType !== FirebaseStorage) {
        throw new floconScript.ScriptError(`File type must be '${Default}' or '${FirebaseStorage}'`, astInfo?.range);
    }
    return {
        $v: 1,
        $r: 1,
        path,
        sourceType,
    };
};

const value$1 = 'value';
const isValueSecret$1 = 'isValueSecret';
class FNumParam extends floconScript.FObject {
    numParam;
    constructor(numParam) {
        super();
        this.numParam = numParam;
    }
    getCore({ key }) {
        const keyAsString = key.toString();
        switch (keyAsString) {
            case value$1:
                return this.numParam.value == null ? undefined : new floconScript.FNumber(this.numParam.value);
            case isValueSecret$1:
                return new floconScript.FBoolean(this.numParam.isValuePrivate);
            default:
                return undefined;
        }
    }
    setCore({ key, newValue, astInfo }) {
        const keyAsString = key.toString();
        switch (keyAsString) {
            case value$1:
                this.numParam.value = floconScript.beginCast(newValue, astInfo)
                    .addNumber()
                    .addUndefined()
                    .cast();
                return;
            case isValueSecret$1:
                this.numParam.isValuePrivate = floconScript.beginCast(newValue, astInfo).addBoolean().cast();
                return;
            default:
                throw new floconScript.ScriptError(`${typeof key === 'symbol' ? 'symbol' : key}への値のセットは制限されています。`);
        }
    }
    toJObject() {
        return this.numParam;
    }
}

const createDefaultState$1 = () => ({
    $v: 2,
    $r: 1,
    value: 0,
    isValuePrivate: false,
    overriddenParameterName: undefined,
});
class FNumParams extends floconScript.FObject {
    numParams;
    room;
    constructor(numParams, room) {
        super();
        this.numParams = numParams;
        this.room = room;
    }
    findKeysByName(nameOrKey) {
        if (this.room.numParamNames == null) {
            return [];
        }
        return utils.recordToArray(this.room.numParamNames)
            .filter(({ value }, i) => value.name === nameOrKey || i + 1 === nameOrKey)
            .map(({ key }) => key);
    }
    findByName(nameOrKeyValue, astInfo) {
        const name = floconScript.beginCast(nameOrKeyValue, astInfo).addString().addNumber().cast();
        const keys = this.findKeysByName(name);
        for (const key of keys) {
            const found = this.numParams[key];
            if (found == null) {
                const newValue = createDefaultState$1();
                this.numParams[key] = newValue;
                return newValue;
            }
            return found;
        }
        return undefined;
    }
    incrOrDecrValue(nameOrKeyValue, diffValue, isIncr, astInfo) {
        const diff = floconScript.beginCast(diffValue, astInfo).addNumber().cast();
        const found = this.findByName(nameOrKeyValue, astInfo);
        if (found == null) {
            return;
        }
        if (found.value == null) {
            return;
        }
        if (isIncr) {
            found.value += diff;
        }
        else {
            found.value -= diff;
        }
    }
    setIsValuePrivate(nameOrKeyValue, newValue, astInfo) {
        const $newValue = floconScript.beginCast(newValue, astInfo).addBoolean().cast();
        const found = this.findByName(nameOrKeyValue, astInfo);
        if (found == null) {
            return;
        }
        found.isValuePrivate = $newValue;
    }
    getCore({ key, astInfo }) {
        const keyAsString = key.toString();
        switch (keyAsString) {
            case 'find':
                return new floconScript.FFunction(({ args }) => {
                    const result = this.findByName(args[0], astInfo);
                    if (result == null) {
                        return undefined;
                    }
                    return new FNumParam(result);
                });
            case 'incrementValue':
                return new floconScript.FFunction(({ args }) => {
                    this.incrOrDecrValue(args[0], args[1], true, astInfo);
                    return undefined;
                });
            case 'decrementValue':
                return new floconScript.FFunction(({ args }) => {
                    this.incrOrDecrValue(args[0], args[1], false, astInfo);
                    return undefined;
                });
            case 'setValue':
                return new floconScript.FFunction(({ args }) => {
                    const newValue = floconScript.beginCast(args[1], astInfo).addNumber().cast();
                    const found = this.findByName(args[0], astInfo);
                    if (found == null) {
                        return;
                    }
                    found.value = newValue;
                    return undefined;
                });
            case 'setIsValueSecret':
                return new floconScript.FFunction(({ args }) => {
                    this.setIsValuePrivate(args[0], args[1], astInfo);
                    return undefined;
                });
        }
        return undefined;
    }
    setCore() {
        throw new floconScript.ScriptError('値のセットは制限されています。');
    }
    toJObject() {
        return this.numParams;
    }
}

const value = 'value';
const isValueSecret = 'isValueSecret';
class FStrParam extends floconScript.FObject {
    strParam;
    constructor(strParam) {
        super();
        this.strParam = strParam;
    }
    getCore({ key }) {
        const keyAsString = key.toString();
        switch (keyAsString) {
            case value:
                return this.strParam.value == null ? undefined : new floconScript.FString(this.strParam.value);
            case isValueSecret:
                return new floconScript.FBoolean(this.strParam.isValuePrivate);
            default:
                return undefined;
        }
    }
    setCore({ key, newValue, astInfo }) {
        const keyAsString = key.toString();
        switch (keyAsString) {
            case value:
                this.strParam.value = floconScript.beginCast(newValue, astInfo).addString().cast();
                return;
            case isValueSecret:
                this.strParam.isValuePrivate = floconScript.beginCast(newValue, astInfo).addBoolean().cast();
                return;
            default:
                throw new floconScript.ScriptError(`${typeof key === 'symbol' ? 'symbol' : key}への値のセットは制限されています。`);
        }
    }
    toJObject() {
        return this.strParam;
    }
}

const createDefaultState = () => ({
    $v: 2,
    $r: 1,
    value: '',
    isValuePrivate: false,
    overriddenParameterName: undefined,
});
class FStrParams extends floconScript.FObject {
    strParams;
    room;
    constructor(strParams, room) {
        super();
        this.strParams = strParams;
        this.room = room;
    }
    findKeysByName(nameOrKey) {
        if (this.room.strParamNames == null) {
            return [];
        }
        return utils.recordToArray(this.room.strParamNames)
            .filter(({ value }, i) => value.name === nameOrKey || i + 1 === nameOrKey)
            .map(({ key }) => key);
    }
    findByName(nameOrKeyValue, astInfo) {
        const name = floconScript.beginCast(nameOrKeyValue, astInfo).addString().cast();
        const keys = this.findKeysByName(name);
        for (const key of keys) {
            const found = this.strParams[key];
            if (found == null) {
                const newValue = createDefaultState();
                this.strParams[key] = newValue;
                return newValue;
            }
            return found;
        }
        return undefined;
    }
    setIsValuePrivate(nameOrKeyValue, newValue, astInfo) {
        const $newValue = floconScript.beginCast(newValue, astInfo).addBoolean().cast();
        const found = this.findByName(nameOrKeyValue, astInfo);
        if (found == null) {
            return;
        }
        found.isValuePrivate = $newValue;
    }
    getCore({ key, astInfo }) {
        const keyAsString = key.toString();
        switch (keyAsString) {
            case 'find':
                return new floconScript.FFunction(({ args }) => {
                    const result = this.findByName(args[0], astInfo);
                    if (result == null) {
                        return undefined;
                    }
                    return new FStrParam(result);
                });
            case 'setValue':
                return new floconScript.FFunction(({ args }) => {
                    const newValue = floconScript.beginCast(args[1], astInfo).addString().cast();
                    const found = this.findByName(args[0], astInfo);
                    if (found == null) {
                        return;
                    }
                    found.value = newValue;
                    return undefined;
                });
            case 'setIsValueSecret':
                return new floconScript.FFunction(({ args }) => {
                    this.setIsValuePrivate(args[0], args[1], astInfo);
                    return undefined;
                });
        }
        return undefined;
    }
    setCore() {
        throw new floconScript.ScriptError('値のセットは制限されています。');
    }
    toJObject() {
        return this.strParams;
    }
}

const icon = 'icon';
const name$2 = 'name';
const booleanParameters = 'booleanParameters';
const numberParameters = 'numberParameters';
const maxNumberParameters = 'maxNumberParameters';
const portrait = 'portrait';
const stringParameters = 'stringParameters';
class FCharacter extends floconScript.FObject {
    character;
    room;
    constructor(character, room) {
        super();
        this.character = character;
        this.room = room;
    }
    getCore({ key, astInfo }) {
        switch (key) {
            case booleanParameters: {
                if (this.character.boolParams == null) {
                    this.character.boolParams = {};
                }
                return new FBoolParams(this.character.boolParams, this.room);
            }
            case icon:
                return this.character.image == null
                    ? null
                    : toFFilePath(this.character.image, astInfo);
            case maxNumberParameters: {
                if (this.character.numMaxParams == null) {
                    this.character.numMaxParams = {};
                }
                return new FNumParams(this.character.numMaxParams, this.room);
            }
            case name$2:
                return new floconScript.FString(this.character.name);
            case numberParameters: {
                if (this.character.numParams == null) {
                    this.character.numParams = {};
                }
                return new FNumParams(this.character.numParams, this.room);
            }
            case portrait:
                return this.character.portraitImage == null
                    ? null
                    : toFFilePath(this.character.portraitImage, astInfo);
            case stringParameters: {
                if (this.character.strParams == null) {
                    this.character.strParams = {};
                }
                return new FStrParams(this.character.strParams, this.room);
            }
            default:
                return undefined;
        }
    }
    setCore({ key, newValue, astInfo }) {
        switch (key) {
            case icon: {
                const $newValue = floconScript.beginCast(newValue, astInfo).addObject().cast();
                this.character.image = toFilePathOrUndefined($newValue, astInfo);
                return;
            }
            case name$2: {
                const $newValue = floconScript.beginCast(newValue, astInfo).addString().cast();
                this.character.name = $newValue;
                return;
            }
            case booleanParameters:
            case maxNumberParameters:
            case numberParameters:
            case stringParameters: {
                throw new floconScript.ScriptError(`${key}は読み取り専用プロパティです。`);
            }
            case portrait: {
                const $newValue = floconScript.beginCast(newValue, astInfo).addObject().cast();
                this.character.portraitImage = toFilePathOrUndefined($newValue, astInfo);
                return;
            }
            default:
                throw new floconScript.ScriptError(`'${typeof key === 'symbol' ? 'symbol' : key}' is not supported.`, astInfo?.range);
        }
    }
    toJObject() {
        return this.character;
    }
}

class FParamNames extends floconScript.FObject {
    room;
    mode;
    constructor(room, mode) {
        super();
        this.room = room;
        this.mode = mode;
    }
    getParamNames() {
        switch (this.mode) {
            case 'Boolean': {
                if (this.room.boolParamNames == null) {
                    this.room.boolParamNames = {};
                }
                return this.room.boolParamNames;
            }
            case 'Number': {
                if (this.room.numParamNames == null) {
                    this.room.numParamNames = {};
                }
                return this.room.numParamNames;
            }
            case 'String': {
                if (this.room.strParamNames == null) {
                    this.room.strParamNames = {};
                }
                return this.room.strParamNames;
            }
        }
    }
    find(key, astInfo) {
        const keyAsString = floconScript.beginCast(key, astInfo).addNumber().cast().toString();
        if (!isStrIndex20(keyAsString)) {
            return undefined;
        }
        return this.getParamNames()[keyAsString];
    }
    ensure(key, astInfo) {
        const keyAsString = floconScript.beginCast(key, astInfo).addNumber().cast().toString();
        if (!isStrIndex20(keyAsString)) {
            return undefined;
        }
        const found = this.getParamNames()[keyAsString];
        if (found != null) {
            return found;
        }
        const result = {
            $v: 1,
            $r: 1,
            name: '',
        };
        this.getParamNames()[keyAsString] = result;
        return result;
    }
    delete(key, astInfo) {
        const keyAsString = floconScript.beginCast(key, astInfo).addNumber().cast().toString();
        if (!isStrIndex20(keyAsString)) {
            return false;
        }
        const found = this.getParamNames()[keyAsString];
        if (found == null) {
            return false;
        }
        this.getParamNames()[keyAsString] = undefined;
        return true;
    }
    getCore({ key, astInfo }) {
        const keyAsString = key.toString();
        switch (keyAsString) {
            case 'getName':
                return new floconScript.FFunction(({ args }) => {
                    const result = this.find(args[0], astInfo);
                    if (result == null) {
                        return undefined;
                    }
                    return new floconScript.FString(result.name);
                });
            case 'setName':
                return new floconScript.FFunction(({ args }) => {
                    const result = this.ensure(args[0], astInfo);
                    const newName = floconScript.beginCast(args[1], astInfo).addString().cast();
                    if (result == null) {
                        return undefined;
                    }
                    result.name = newName;
                    return undefined;
                });
            case 'delete':
                return new floconScript.FFunction(({ args }) => {
                    return new floconScript.FBoolean(this.delete(args[0], astInfo));
                });
        }
        return undefined;
    }
    setCore() {
        throw new floconScript.ScriptError('値のセットは制限されています。');
    }
    toJObject() {
        return this.getParamNames();
    }
}

const name$1 = 'name';
class FParticipant extends floconScript.FObject {
    participant;
    constructor(participant) {
        super();
        this.participant = participant;
    }
    getCore({ key }) {
        switch (key) {
            case name$1: {
                const name = this.participant.name;
                if (name == null) {
                    return null;
                }
                return new floconScript.FString(name);
            }
            default:
                return undefined;
        }
    }
    setCore({ key, newValue, astInfo }) {
        switch (key) {
            case name$1: {
                const $newValue = floconScript.beginCast(newValue, astInfo).addString().addNull().cast();
                if ($newValue === null) {
                    this.participant.name = undefined;
                    return;
                }
                const parsed = maxLength100String.safeParse($newValue);
                if (!parsed.success) {
                    throw new floconScript.ScriptError(`${key}は100文字以下にする必要があります。`);
                }
                this.participant.name = parsed.data;
                return;
            }
            default:
                throw new floconScript.ScriptError(`'${typeof key === 'symbol' ? 'symbol' : key}' is not supported.`, astInfo?.range);
        }
    }
    toJObject() {
        return this.participant;
    }
}

class FStateRecord extends floconScript.FRecordRef {
    createNewState;
    toRef;
    constructor({ states, createNewState, toRef, unRef, }) {
        super(states, state => (state === undefined ? undefined : toRef(state)), fValue => unRef(fValue));
        this.createNewState = createNewState;
        this.toRef = toRef;
    }
    getCore({ key, astInfo }) {
        switch (key) {
            case 'set':
                // setを有効化すると、不正なStateをセットし放題になってしまうため、代わりにcreateを使ってもらうようにしている。
                return undefined;
            case 'create': {
                const createNewState = this.createNewState;
                if (createNewState == null) {
                    return undefined;
                }
                /*
                createメソッドの代わりにaddメソッドを実装してユーザーが作成したStateを代入できるようにする作戦は不採用とした。理由は、下のようなコードを書かれた場合に困るため。
                
                let states; // FStatesRecordのインスタンス
                let newState; // Stateのインスタンス
                states.add(newState);
                states.add(newState);
                newState.name = 'foo';

                newStateはFRecordであり、それをFStatesRecord.statesに追加する場合はJavaScriptオブジェクトに変換するかFRecordのまま保持するしかない。だが、前者の場合はnewStateの参照の同一性が保持できず、後者はFStatesRecord.statesに2つの型が混在するためコードが複雑化するという問題がある。
                */
                return new floconScript.FFunction(({ isNew, astInfo }) => {
                    this.prepareInstanceMethod(isNew, astInfo);
                    const newState = createNewState();
                    const record = this.source;
                    const id = simpleId();
                    record[id] = newState;
                    const result = new floconScript.FRecord();
                    result.set({ property: new floconScript.FString('id'), newValue: new floconScript.FString(id), astInfo });
                    result.set({
                        property: new floconScript.FString('value'),
                        newValue: this.toRef(newState),
                        astInfo,
                    });
                    return result;
                });
            }
            default:
                return super.getCore({ key, astInfo });
        }
    }
}

const name = 'name';
const characters = 'characters';
class FRoom extends floconScript.FObject {
    myUserUid;
    // FRoom内の State<typeof Room.template> は全てmutableとして扱う。FCharacter内のCharacter.Stateなども同様。
    _room;
    constructor(source, myUserUid) {
        super();
        this.myUserUid = myUserUid;
        this._room = lodash.cloneDeep(source);
    }
    get room() {
        return this._room;
    }
    findCharacter(stateId) {
        const character = (this._room.characters ?? {})[stateId];
        if (character == null) {
            return undefined;
        }
        return new FCharacter(character, this.room);
    }
    getCore({ key }) {
        switch (key) {
            case name:
                return new floconScript.FString(this._room.name);
            case 'booleanParameterNames':
                return new FParamNames(this.room, 'Boolean');
            case characters:
                return new FStateRecord({
                    states: (() => {
                        if (this.room.characters == null) {
                            this.room.characters = {};
                        }
                        return this.room.characters;
                    })(),
                    createNewState: () => ({
                        $v: 2,
                        $r: 1,
                        ownerParticipantId: this.myUserUid,
                        image: undefined,
                        isPrivate: false,
                        memo: '',
                        name: '',
                        chatPalette: '',
                        dicePieceValues: {},
                        hasTag1: false,
                        hasTag2: false,
                        hasTag3: false,
                        hasTag4: false,
                        hasTag5: false,
                        hasTag6: false,
                        hasTag7: false,
                        hasTag8: false,
                        hasTag9: false,
                        hasTag10: false,
                        pieces: {},
                        privateCommands: {},
                        privateVarToml: '',
                        portraitImage: undefined,
                        portraitPieces: {},
                        boolParams: {},
                        numParams: {},
                        numMaxParams: {},
                        strParams: {},
                        stringPieceValues: {},
                    }),
                    toRef: x => new FCharacter(x, this.room),
                    unRef: x => {
                        if (x instanceof FCharacter) {
                            return x.character;
                        }
                        throw new Error('this should not happen');
                    },
                });
            case 'numberParameterNames':
                return new FParamNames(this.room, 'Number');
            case 'stringParameterNames':
                return new FParamNames(this.room, 'String');
            case 'participants':
                return new FStateRecord({
                    states: (() => {
                        if (this.room.participants == null) {
                            this.room.participants = {};
                        }
                        return this.room.participants;
                    })(),
                    createNewState: undefined,
                    toRef: x => new FParticipant(x),
                    unRef: x => {
                        if (x instanceof FParticipant) {
                            return x.participant;
                        }
                        throw new Error('this should not happen');
                    },
                });
            default:
                return undefined;
        }
    }
    setCore({ key, newValue, astInfo }) {
        switch (key) {
            case name: {
                const $newValue = floconScript.beginCast(newValue, astInfo).addString().cast();
                this._room.name = $newValue;
                return;
            }
            default:
                throw new floconScript.ScriptError(`${typeof key === 'symbol' ? 'symbol' : key}への値のセットは制限されています。`, astInfo?.range);
        }
    }
    toJObject() {
        return this._room;
    }
}

class CommandError extends Error {
    range;
    constructor(message, range) {
        super(message);
        this.range = range;
        this.name = 'CommandError';
    }
}
const testCommand = (script) => {
    try {
        floconScript.test(script);
    }
    catch (e) {
        if (e instanceof floconScript.ScriptError) {
            return result.Result.error(new CommandError(e.message, e.range));
        }
        if (e instanceof Error) {
            return result.Result.error(new CommandError(e.message));
        }
        throw e;
    }
    return result.Result.ok(undefined);
};
const execCharacterCommand = ({ script, room, characterId, myUserUid, }) => {
    const fRoom = new FRoom(room, myUserUid);
    const fCharacter = fRoom.findCharacter(characterId);
    if (fCharacter == null) {
        throw new Error(`character(${utils.keyNames(characterId)}) not found`);
    }
    const globalThis = {
        room: fRoom,
        character: fCharacter,
        Array: floconScript.arrayClass,
        console: floconScript.createConsoleClass('[Floconスクリプト]'),
    };
    try {
        floconScript.exec(script, globalThis);
    }
    catch (e) {
        if (e instanceof floconScript.ScriptError) {
            return result.Result.error(new CommandError(e.message, e.range));
        }
        if (e instanceof Error) {
            return result.Result.error(new CommandError(e.message));
        }
        throw e;
    }
    const result$1 = fRoom.room;
    return result.Result.ok(result$1);
};

const toPathArray = (source) => {
    let result;
    if (typeof source === 'string') {
        result = source.replace(/(^\/)|(\/$)/g, '').split('/');
    }
    else {
        result = source;
    }
    return result.filter(name => name !== '');
};
const replacement = '_';
const sanitizeCore = (input) => {
    /*
    npm の sanitize-filename(https://github.com/parshap/node-sanitize-filename/blob/209c39b914c8eb48ee27bcbde64b2c7822fdf3de/index.js ライセンスは WTFPL or ISC)を参考にしている。
    sanitize-filename  からの主な変更点は次の通り。

    - no-useless-escapeのwarningが出る\を消去。
    - windowsReservedReとwindowsTrailingReを消去。
    */
    const illegalRe = /[/?<>\\:*|"]/g;
    // eslint-disable-next-line no-control-regex
    const controlRe = /[\x00-\x1f\x80-\x9f]/g;
    const reservedRe = /^\.+$/;
    return input
        .replace(illegalRe, replacement)
        .replace(controlRe, replacement)
        .replace(reservedRe, replacement);
};
const sanitizeFoldername = (input) => {
    const sanitized = sanitizeCore(input);
    // 255という数値は、実用的な長さの中で最大値だとこちらで判断した値
    return truncate__default.default(sanitized, 255);
};
const sanitizeFilename = (input) => {
    const sanitized = sanitizeCore(input);
    // 255という数値は、実用的な長さの中で最大値だとこちらで判断した値
    const result = truncate__default.default(sanitized, 255);
    if (sanitized !== result) {
        // truncateが発生したファイル名をそのまま返すと、拡張子が消えて混乱を招くおそれがあるため代わりにnullを返している。
        return null;
    }
    return result;
};
const toResult = (path) => {
    const arrayResult = toPathArray(path);
    return {
        string: arrayResult.join('/'),
        array: arrayResult,
    };
};
const trySanitizePath = (path) => {
    const pathArray = toPathArray(path);
    const sanitizedArray = [];
    for (const elem of pathArray) {
        const next = sanitizeCore(elem);
        sanitizedArray.push(next);
    }
    const result = toResult(sanitizedArray);
    if (result.string != null) {
        // Firebase および Cloud Storage には length 1-1024 bytes when UTF-8 encoded という制限があるので1024を指定している
        const truncated = truncate__default.default(result.string, 1024);
        if (result.string !== truncated) {
            // truncateが発生したファイルパスをそのまま返すと、末尾のほうのフォルダがなくなったり、拡張子が消えて混乱を招くおそれがあるため代わりにnullを返している。
            return null;
        }
    }
    return result;
};
/**
 *
 * @returns Sanitizeされていない値を返します。
 */
const joinPath = (left, ...right) => {
    let source = toPathArray(left);
    for (const r of right) {
        const next = toPathArray(r);
        source = [...source, ...next];
    }
    return toResult(source);
};

const createFakeFirebaseConfig1 = () => {
    const json = '{"apiKey": "1abcde-ghijk-lmno-1234","authDomain": "1***.firebaseapp.com","projectId": "1***","storageBucket": "1***.appspot.com","messagingSenderId": "11234567890","appId": "1:1234567890:web:1234567890abcdef"}';
    const parsed = firebaseConfig.parse(JSON.parse(json));
    return [parsed, json];
};
const fakeFirebaseConfig1 = createFakeFirebaseConfig1();
const createFakeFirebaseConfig2 = () => {
    const json = '{"apiKey": "2abcde-ghijk-lmno-1234","authDomain": "2***.firebaseapp.com","projectId": "2***","storageBucket": "2***.appspot.com","messagingSenderId": "21234567890","appId": "2:1234567890:web:1234567890abcdef"}';
    const parsed = firebaseConfig.parse(JSON.parse(json));
    return [parsed, json];
};
const fakeFirebaseConfig2 = createFakeFirebaseConfig2();

// (不正な|悪意のある)キーが混入するおそれがあるのはserverTransformのときのみなので、serverTransform以外では使わなくてよい
const isValidKey = (key) => {
    // Firebase Authenticationのuidは28文字のようなので、最低でもその文字数は許容しなければならない
    if (key.length >= 40) {
        return false;
    }
    return key.match(/^([0-9a-zA-Z]|-|_)+$/g) != null;
};

const restore$2 = ({ nextState: unsafeNextState, downOperation: unsafeDownOperation, innerRestore, }) => {
    const nextState = utils.recordToMap(unsafeNextState);
    if (unsafeDownOperation == null) {
        return result.Result.ok({
            prevState: utils.mapToRecord(nextState),
            twoWayOperation: undefined,
        });
    }
    const prevState = new Map(nextState);
    const twoWayOperation = new Map();
    for (const [key, value] of utils.recordToMap(unsafeDownOperation)) {
        const nextStateElement = nextState.get(key);
        if (nextStateElement === undefined) {
            return result.Result.error(`tried to update "${key}", but nextState does not have such a key`);
        }
        const restored = innerRestore({
            downOperation: value,
            nextState: nextStateElement,
            key,
        });
        if (restored.isError) {
            return restored;
        }
        if (restored.value === undefined) {
            continue;
        }
        prevState.set(key, restored.value.prevState);
        if (restored.value.twoWayOperation !== undefined) {
            twoWayOperation.set(key, restored.value.twoWayOperation);
        }
    }
    return result.Result.ok({
        prevState: utils.mapToRecord(prevState),
        twoWayOperation: twoWayOperation.size === 0 ? undefined : utils.mapToRecord(twoWayOperation),
    });
};
const apply$3 = ({ prevState: unsafePrevState, operation, innerApply, defaultState, }) => {
    if (operation == null) {
        return result.Result.ok(unsafePrevState);
    }
    const prevState = utils.recordToMap(unsafePrevState);
    const nextState = new Map(prevState);
    for (const [key, value] of utils.recordToMap(operation)) {
        const prevStateElement = prevState.get(key) ?? defaultState;
        const newValue = innerApply({
            operation: value,
            prevState: prevStateElement,
            key,
        });
        if (newValue.isError) {
            return newValue;
        }
        nextState.set(key, newValue.value);
    }
    return result.Result.ok(utils.mapToRecord(nextState));
};
const applyBack$2 = ({ nextState: unsafeNextState, operation, innerApplyBack, defaultState, }) => {
    if (operation == null) {
        return result.Result.ok(unsafeNextState);
    }
    const nextState = utils.recordToMap(unsafeNextState);
    const prevState = new Map(nextState);
    for (const [key, value] of utils.recordToMap(operation)) {
        const nextStateElement = nextState.get(key) ?? defaultState;
        const oldValue = innerApplyBack({
            operation: value,
            nextState: nextStateElement,
            key,
        });
        if (oldValue.isError) {
            return oldValue;
        }
        prevState.set(key, oldValue.value);
    }
    return result.Result.ok(utils.mapToRecord(prevState));
};
// UpOperation、DownOperation、TwoWayOperation のいずれにも使用可能なので、composeDownOperationではなくcomposeという汎用的な名前を付けている。
const compose$1 = ({ first, second, innerCompose, }) => {
    if (first == null) {
        return result.Result.ok(second == null || isEmptyRecord(second) ? undefined : second);
    }
    if (second == null) {
        return result.Result.ok(first == null || isEmptyRecord(first) ? undefined : first);
    }
    const result$1 = new Map();
    for (const [key, groupJoined] of utils.groupJoinMap(utils.recordToMap(first), utils.recordToMap(second))) {
        switch (groupJoined.type) {
            case utils.left:
                result$1.set(key, groupJoined.left);
                continue;
            case utils.right:
                result$1.set(key, groupJoined.right);
                continue;
            case utils.both: {
                const update = innerCompose({
                    first: groupJoined.left,
                    second: groupJoined.right,
                    key,
                });
                if (update.isError) {
                    return update;
                }
                if (update.value !== undefined) {
                    result$1.set(key, update.value);
                }
                continue;
            }
        }
    }
    return result.Result.ok(result$1.size === 0 ? undefined : utils.mapToRecord(result$1));
};
/** Make sure `apply(stateBeforeFirst, first) = stateAfterFirst` */
const serverTransform$p = ({ first: unsafeFirst, second: unsafeSecond, stateBeforeFirst: unsafeStateBeforeFirst, stateAfterFirst: unsafeStateAfterFirst, innerTransform, defaultState, }) => {
    if (unsafeSecond === undefined) {
        return result.Result.ok(undefined);
    }
    const result$1 = new Map();
    const prevState = utils.recordToMap(unsafeStateBeforeFirst);
    const nextState = utils.recordToMap(unsafeStateAfterFirst);
    const first = unsafeFirst == null ? undefined : utils.recordToMap(unsafeFirst);
    for (const [key, operation] of utils.recordToMap(unsafeSecond)) {
        if (!isValidKey(key)) {
            return result.Result.error(`${key} is not a valid key.`);
        }
        const innerPrevState = prevState.get(key) ?? defaultState;
        const innerNextState = nextState.get(key) ?? defaultState;
        const innerFirst = first == null ? undefined : first.get(key);
        const transformed = innerTransform({
            first: innerFirst,
            second: operation,
            prevState: innerPrevState,
            nextState: innerNextState,
            key,
        });
        if (transformed.isError) {
            return transformed;
        }
        const transformedUpdate = transformed.value;
        if (transformedUpdate !== undefined) {
            result$1.set(key, transformedUpdate);
        }
    }
    return result.Result.ok(result$1.size === 0 ? undefined : utils.mapToRecord(result$1));
};
const clientTransform$3 = ({ state, first, second, innerTransform, defaultState, }) => {
    if (first === undefined || second === undefined) {
        return result.Result.ok({
            firstPrime: first === undefined || isEmptyRecord(first) ? undefined : first,
            secondPrime: second === undefined || isEmptyRecord(second) ? undefined : second,
        });
    }
    const firstPrime = new Map();
    const secondPrime = new Map();
    let error = undefined;
    utils.groupJoinMap(utils.recordToMap(first), utils.recordToMap(second)).forEach((group, key) => {
        if (error != null) {
            return;
        }
        switch (group.type) {
            case utils.left: {
                firstPrime.set(key, group.left);
                return;
            }
            case utils.right: {
                secondPrime.set(key, group.right);
                return;
            }
            case utils.both: {
                const s = state[key] ?? defaultState;
                const xform = innerTransform({
                    state: s,
                    first: group.left,
                    second: group.right,
                });
                if (xform.isError) {
                    error = { error: xform.error };
                    return;
                }
                if (xform.value.firstPrime !== undefined) {
                    firstPrime.set(key, xform.value.firstPrime);
                }
                if (xform.value.secondPrime !== undefined) {
                    secondPrime.set(key, xform.value.secondPrime);
                }
                return;
            }
        }
    });
    if (error != null) {
        return result.Result.error(error.error);
    }
    return result.Result.ok({
        firstPrime: firstPrime.size === 0 ? undefined : utils.mapToRecord(firstPrime),
        secondPrime: secondPrime.size === 0 ? undefined : utils.mapToRecord(secondPrime),
    });
};
const diff$2 = ({ prevState, nextState, innerDiff, }) => {
    const result = new Map();
    for (const [key, value] of utils.groupJoinMap(utils.recordToMap(prevState), utils.recordToMap(nextState))) {
        let prevState = undefined;
        let nextState = undefined;
        switch (value.type) {
            case utils.left:
                prevState = value.left;
                break;
            case utils.right: {
                nextState = value.right;
                break;
            }
            case utils.both: {
                prevState = value.left;
                nextState = value.right;
                break;
            }
        }
        const diffResult = innerDiff({ prevState, nextState, key });
        if (diffResult === undefined) {
            continue;
        }
        result.set(key, diffResult);
        continue;
    }
    if (result.size === 0) {
        return undefined;
    }
    return utils.mapToRecord(result);
};

/** Make sure `apply(prevState, source) = nextState` */
const toClientState$i = ({ serverState, isPrivate, toClientState, }) => {
    if (serverState == null) {
        return undefined;
    }
    const result = new Map();
    utils.recordForEach(serverState, (value, key) => {
        if (isPrivate(value, key)) {
            return;
        }
        result.set(key, toClientState({ state: value, key }));
    });
    return utils.mapToRecord(result);
};
// composeDownOperationは、レコード内の同一キーを時系列順でremove→addしたものをcomposeすると、本来はupdateになるべきだが、replaceになってしまうという仕様がある。だが、このrestore関数ではそれをupdateに変換してくれる。その代わり、innerDiffはdownでなくtwoWayである必要がある。
const restore$1 = ({ nextState, downOperation, innerRestore, innerDiff, }) => {
    if (downOperation == null) {
        return result.Result.ok({
            prevState: nextState,
            twoWayOperation: undefined,
        });
    }
    const prevState = utils.recordToMap(nextState);
    const twoWayOperation = new Map();
    for (const [key, value] of utils.recordToMap(downOperation)) {
        switch (value.type) {
            case 'replace': {
                const oldValue = value.replace.oldValue;
                const newValue = nextState[key];
                if (oldValue === undefined) {
                    prevState.delete(key);
                }
                else {
                    prevState.set(key, oldValue);
                }
                if (oldValue === undefined) {
                    if (newValue === undefined) {
                        break;
                    }
                    twoWayOperation.set(key, {
                        type: 'replace',
                        replace: { oldValue, newValue },
                    });
                    break;
                }
                if (newValue === undefined) {
                    twoWayOperation.set(key, {
                        type: 'replace',
                        replace: { oldValue, newValue: undefined },
                    });
                    break;
                }
                const diff = innerDiff({
                    key,
                    prevState: oldValue,
                    nextState: newValue,
                });
                if (diff !== undefined) {
                    twoWayOperation.set(key, { type: 'update', update: diff });
                }
                break;
            }
            case 'update': {
                const nextStateElement = nextState[key];
                if (nextStateElement === undefined) {
                    return result.Result.error(`tried to update "${key}", but nextState does not have such a key`);
                }
                const restored = innerRestore({
                    key,
                    downOperation: value.update,
                    nextState: nextStateElement,
                });
                if (restored.isError) {
                    return restored;
                }
                prevState.set(key, restored.value.prevState);
                if (restored.value.twoWayOperation !== undefined) {
                    twoWayOperation.set(key, {
                        type: 'update',
                        update: restored.value.twoWayOperation,
                    });
                }
                break;
            }
        }
    }
    return result.Result.ok({
        prevState: utils.mapToRecord(prevState),
        twoWayOperation: twoWayOperation.size === 0 ? undefined : utils.mapToRecord(twoWayOperation),
    });
};
// replace によって、存在しないキーを削除しようとしたり、すでに存在するキーに上書きするような operation は、現時点では許容している。だが、将来禁止するかもしれない。
const apply$2 = ({ prevState, operation, innerApply, }) => {
    if (operation == null) {
        return result.Result.ok(prevState);
    }
    const nextState = utils.recordToMap(prevState);
    for (const [key, value] of utils.recordToMap(operation)) {
        switch (value.type) {
            case 'replace': {
                if (value.replace.newValue === undefined) {
                    nextState.delete(key);
                }
                else {
                    nextState.set(key, value.replace.newValue);
                }
                break;
            }
            case 'update': {
                const prevStateElement = prevState[key];
                if (prevStateElement === undefined) {
                    return result.Result.error(`tried to update "${key}", but prevState does not have such a key`);
                }
                const newValue = innerApply({
                    key,
                    operation: value.update,
                    prevState: prevStateElement,
                });
                if (newValue.isError) {
                    return newValue;
                }
                nextState.set(key, newValue.value);
                break;
            }
        }
    }
    return result.Result.ok(utils.mapToRecord(nextState));
};
// replace によって、存在しないキーを削除しようとしたり、すでに存在するキーに上書きするような operation は、現時点では許容している。だが、将来禁止するかもしれない。
const applyBack$1 = ({ nextState, operation, innerApplyBack, }) => {
    if (operation == null) {
        return result.Result.ok(nextState);
    }
    const prevState = utils.recordToMap(nextState);
    for (const [key, value] of utils.recordToMap(operation)) {
        switch (value.type) {
            case 'replace': {
                if (value.replace.oldValue === undefined) {
                    prevState.delete(key);
                }
                else {
                    prevState.set(key, value.replace.oldValue);
                }
                break;
            }
            case 'update': {
                const nextStateElement = nextState[key];
                if (nextStateElement === undefined) {
                    return result.Result.error(`tried to update "${key}", but nextState does not have such a key`);
                }
                const oldValue = innerApplyBack({
                    key,
                    operation: value.update,
                    state: nextStateElement,
                });
                if (oldValue.isError) {
                    return oldValue;
                }
                prevState.set(key, oldValue.value);
                break;
            }
        }
    }
    return result.Result.ok(utils.mapToRecord(prevState));
};
// stateが必要ないため処理を高速化&簡略化できるが、その代わり戻り値のreplaceにおいて oldValue === undefined && newValue === undefined もしくは oldValue !== undefined && newValue !== undefinedになるケースがある。
const compose = ({ first, second, composeReplaceReplace, composeReplaceUpdate, composeUpdateReplace, composeUpdateUpdate, }) => {
    if (first == null) {
        return result.Result.ok(second == null || isEmptyRecord(second) ? undefined : second);
    }
    if (second == null) {
        return result.Result.ok(first == null || isEmptyRecord(first) ? undefined : first);
    }
    const result$1 = new Map();
    for (const [key, groupJoined] of utils.groupJoinMap(utils.recordToMap(first), utils.recordToMap(second))) {
        switch (groupJoined.type) {
            case utils.left:
                switch (groupJoined.left.type) {
                    case 'replace':
                        result$1.set(key, {
                            type: 'replace',
                            replace: groupJoined.left.replace,
                        });
                        continue;
                    case 'update':
                        result$1.set(key, {
                            type: 'update',
                            update: groupJoined.left.update,
                        });
                        continue;
                }
                break;
            case utils.right:
                switch (groupJoined.right.type) {
                    case 'replace':
                        result$1.set(key, {
                            type: 'replace',
                            replace: groupJoined.right.replace,
                        });
                        continue;
                    case 'update':
                        result$1.set(key, {
                            type: 'update',
                            update: groupJoined.right.update,
                        });
                        continue;
                }
                break;
            case utils.both:
                switch (groupJoined.left.type) {
                    case 'replace':
                        switch (groupJoined.right.type) {
                            case 'replace': {
                                const composed = composeReplaceReplace({
                                    first: groupJoined.left.replace,
                                    second: groupJoined.right.replace,
                                    key,
                                });
                                if (composed.isError) {
                                    return composed;
                                }
                                if (composed.value === undefined) {
                                    continue;
                                }
                                result$1.set(key, {
                                    type: 'replace',
                                    replace: composed.value,
                                });
                                continue;
                            }
                            case 'update': {
                                const composed = composeReplaceUpdate({
                                    first: groupJoined.left.replace,
                                    second: groupJoined.right.update,
                                    key,
                                });
                                if (composed.isError) {
                                    return composed;
                                }
                                if (composed.value === undefined) {
                                    continue;
                                }
                                result$1.set(key, {
                                    type: 'replace',
                                    replace: composed.value,
                                });
                                continue;
                            }
                        }
                        continue;
                    case 'update':
                        switch (groupJoined.right.type) {
                            case 'replace': {
                                const composed = composeUpdateReplace({
                                    first: groupJoined.left.update,
                                    second: groupJoined.right.replace,
                                    key,
                                });
                                if (composed.isError) {
                                    return composed;
                                }
                                if (composed.value === undefined) {
                                    continue;
                                }
                                result$1.set(key, {
                                    type: 'replace',
                                    replace: composed.value,
                                });
                                continue;
                            }
                            case 'update': {
                                const composed = composeUpdateUpdate({
                                    first: groupJoined.left.update,
                                    second: groupJoined.right.update,
                                    key,
                                });
                                if (composed.isError) {
                                    return composed;
                                }
                                if (composed.value === undefined) {
                                    continue;
                                }
                                result$1.set(key, {
                                    type: 'update',
                                    update: composed.value,
                                });
                                continue;
                            }
                        }
                }
                break;
        }
    }
    return result.Result.ok(result$1.size === 0 ? undefined : utils.mapToRecord(result$1));
};
const composeDownOperation$1 = ({ first, second, innerApplyBack, innerCompose, }) => {
    return compose({
        first,
        second,
        composeReplaceReplace: params => {
            return result.Result.ok(params.first);
        },
        composeReplaceUpdate: params => {
            return result.Result.ok(params.first);
        },
        composeUpdateReplace: params => {
            if (params.second.oldValue === undefined) {
                return result.Result.error(`first is update, but second.oldValue is null. the key is "${params.key}".`);
            }
            const firstOldValue = innerApplyBack({
                key: params.key,
                operation: params.first,
                state: params.second.oldValue,
            });
            if (firstOldValue.isError) {
                return firstOldValue;
            }
            return result.Result.ok({ oldValue: firstOldValue.value });
        },
        composeUpdateUpdate: params => {
            return innerCompose({
                key: params.key,
                first: params.first,
                second: params.second,
            });
        },
    });
};
/** Make sure `apply(stateBeforeFirst, first) = stateAfterFirst` */
const serverTransformWithoutValidation = ({ first, second, stateBeforeFirst, stateAfterFirst, innerTransform, toServerState, cancellationPolicy, }) => {
    // 現在のCharacterの全体Privateの仕組みだと、PrivateになっているCharacterをupdateもしくはremoveしようとしてもエラーは出ない（最新の状態でPrivateになっているかどうかはクライアント側はわからないので、代わりにエラーを返すのは問題がある）。だが、現在のこのtransformのコードだと、存在しないCharacterをupdateもしくはremoveしようとするとエラーを返す。このため、keyを Brute-force attackすることで、PrivateになっているCharacterが存在することを理論上は判別できてしまう。だが、中の値は見ることができないので、現状のままでも問題ないと考えている。
    if (second === undefined) {
        return result.Result.ok(undefined);
    }
    const result$1 = new Map();
    for (const [key, operation] of utils.recordToMap(second)) {
        if (!isValidKey(key)) {
            return result.Result.error(`"${key}" is not a valid key.`);
        }
        switch (operation.type) {
            case replace$1: {
                const innerPrevState = stateBeforeFirst?.[key];
                const innerNextState = stateAfterFirst?.[key];
                /**** requested to remove ****/
                if (operation.replace.newValue === undefined) {
                    if (innerPrevState === undefined) {
                        return result.Result.error(`"${key}" was not found at requested revision. It is not allowed to try to remove non-existing element.`);
                    }
                    if (innerNextState === undefined) {
                        // removeを試みたが、既に誰かによってremoveされているので何もする必要がない。よって終了。
                        break;
                    }
                    if (cancellationPolicy.cancelRemove) {
                        if (cancellationPolicy.cancelRemove({
                            key,
                            state: innerNextState,
                        })) {
                            break;
                        }
                    }
                    result$1.set(key, {
                        type: replace$1,
                        replace: {
                            oldValue: innerNextState,
                            newValue: undefined,
                        },
                    });
                    break;
                }
                /**** requested to add ****/
                if (innerPrevState !== undefined) {
                    return result.Result.error(`"${key}" was found at requested revision. When adding a state, old value must be empty.`);
                }
                if (innerNextState !== undefined) {
                    // addを試みたが、既に誰かによってaddされているので何もする必要がない。よって終了。
                    break;
                }
                const newValue = toServerState(operation.replace.newValue, key);
                if (cancellationPolicy.cancelCreate) {
                    if (cancellationPolicy.cancelCreate({ key, newState: newValue })) {
                        break;
                    }
                }
                result$1.set(key, {
                    type: replace$1,
                    replace: {
                        oldValue: undefined,
                        newValue,
                    },
                });
                break;
            }
            case update$2: {
                const innerPrevState = stateBeforeFirst?.[key];
                const innerNextState = stateAfterFirst?.[key];
                const innerFirst = first?.[key];
                if (innerPrevState === undefined) {
                    return result.Result.error(`tried to update "${key}", but not found.`);
                }
                if (innerNextState === undefined) {
                    // updateを試みたが、既に誰かによってremoveされているのでupdateは行われない。よって終了。
                    break;
                }
                // Type guard。事前条件が満たされていれば、innerPrevState !== undefinedかつinnerNextState !== undefinedならばこれは必ずfalseになるので、下のbreakには来ない。
                if (innerFirst !== undefined && innerFirst.type === replace$1) {
                    break;
                }
                if (cancellationPolicy.cancelUpdate) {
                    if (cancellationPolicy.cancelUpdate({
                        key,
                        prevState: innerPrevState,
                        nextState: innerNextState,
                    })) {
                        break;
                    }
                }
                const transformed = innerTransform({
                    first: innerFirst?.update,
                    second: operation.update,
                    prevState: innerPrevState,
                    nextState: innerNextState,
                    key,
                });
                if (transformed.isError) {
                    return transformed;
                }
                const transformedUpdate = transformed.value;
                if (transformedUpdate !== undefined) {
                    result$1.set(key, {
                        type: update$2,
                        update: transformedUpdate,
                    });
                }
            }
        }
    }
    return result.Result.ok(result$1.size === 0 ? undefined : utils.mapToRecord(result$1));
};
/** Make sure `apply(stateBeforeFirst, first) = stateAfterFirst` */
const serverTransform$o = (params) => {
    const result$1 = serverTransformWithoutValidation(params);
    if (result$1.isError) {
        return result$1;
    }
    if (result$1.value == null) {
        return result$1;
    }
    if (params.validation?.maxRecordLength != null) {
        const prevStateLength = utils.recordToArray(params.stateAfterFirst).length;
        let nextStateLength = prevStateLength;
        utils.recordForEach(result$1.value, operation => {
            if (operation.type === update$2) {
                return;
            }
            if (operation.replace.oldValue != null) {
                nextStateLength--;
            }
            if (operation.replace.newValue != null) {
                nextStateLength++;
            }
        });
        if (params.validation.maxRecordLength < nextStateLength &&
            prevStateLength < nextStateLength) {
            return result.Result.error(`${params.validation.recordName} の要素の数が多すぎるため、これ以上追加することはできません。追加するには、不要な要素を削除してください。`);
        }
    }
    return result$1;
};
const transformElement = ({ state, first, second, innerTransform, innerDiff, errorMessageOnStateNotFound, }) => {
    switch (first.type) {
        case replace$1:
            switch (second.type) {
                case replace$1:
                    // 通常、片方がnon-undefinedならばもう片方もnon-undefined。
                    if (first.replace.newValue !== undefined &&
                        second.replace.newValue !== undefined) {
                        const diffResult = innerDiff({
                            nextState: first.replace.newValue,
                            prevState: second.replace.newValue,
                        });
                        if (diffResult === undefined) {
                            return result.Result.ok({
                                firstPrime: undefined,
                                secondPrime: undefined,
                            });
                        }
                        return result.Result.ok({
                            firstPrime: { type: update$2, update: diffResult },
                            secondPrime: undefined,
                        });
                    }
                    // 通常、ここに来る場合は first.newValue === undefined && second.newValue === undefined
                    return result.Result.ok({
                        firstPrime: undefined,
                        secondPrime: undefined,
                    });
                case update$2:
                    return result.Result.ok({
                        firstPrime: first,
                        secondPrime: undefined,
                    });
            }
            break;
        case update$2:
            switch (second.type) {
                case replace$1: {
                    if (second.replace.newValue !== undefined) {
                        throw new Error('Tried to add an element, but already exists another value.');
                    }
                    return result.Result.ok({
                        firstPrime: undefined,
                        secondPrime: {
                            type: replace$1,
                            replace: {
                                newValue: undefined,
                            },
                        },
                    });
                }
                case update$2: {
                    if (state === undefined) {
                        return result.Result.error(errorMessageOnStateNotFound);
                    }
                    const xform = innerTransform({
                        state,
                        first: first.update,
                        second: second.update,
                    });
                    if (xform.isError) {
                        return xform;
                    }
                    return result.Result.ok({
                        firstPrime: xform.value.firstPrime == null
                            ? undefined
                            : {
                                type: update$2,
                                update: xform.value.firstPrime,
                            },
                        secondPrime: xform.value.secondPrime == null
                            ? undefined
                            : {
                                type: update$2,
                                update: xform.value.secondPrime,
                            },
                    });
                }
            }
            break;
    }
};
const clientTransform$2 = ({ state, first, second, innerTransform, innerDiff, }) => {
    if (first == null || second == null) {
        return result.Result.ok({
            firstPrime: first == null || isEmptyRecord(first) ? undefined : first,
            secondPrime: second == null || isEmptyRecord(second) ? undefined : second,
        });
    }
    const firstPrime = new Map();
    const secondPrime = new Map();
    let error = undefined;
    utils.groupJoinMap(utils.recordToMap(first), utils.recordToMap(second)).forEach((group, key) => {
        if (error != null) {
            return;
        }
        switch (group.type) {
            case utils.left: {
                firstPrime.set(key, group.left);
                return;
            }
            case utils.right: {
                secondPrime.set(key, group.right);
                return;
            }
            case utils.both: {
                const xform = transformElement({
                    state: state[key],
                    first: group.left,
                    second: group.right,
                    innerTransform,
                    innerDiff,
                    errorMessageOnStateNotFound: `"${key}" is not found at RecordOperation.clientTransform.`,
                });
                if (xform.isError) {
                    error = { error: xform.error };
                    return;
                }
                if (xform.value.firstPrime !== undefined) {
                    firstPrime.set(key, xform.value.firstPrime);
                }
                if (xform.value.secondPrime !== undefined) {
                    secondPrime.set(key, xform.value.secondPrime);
                }
                return;
            }
        }
    });
    if (error != null) {
        return result.Result.error(error.error);
    }
    return result.Result.ok({
        firstPrime: firstPrime.size === 0 ? undefined : utils.mapToRecord(firstPrime),
        secondPrime: secondPrime.size === 0 ? undefined : utils.mapToRecord(secondPrime),
    });
};
const diff$1 = ({ prevState, nextState, innerDiff, }) => {
    const result = new Map();
    for (const [key, value] of utils.groupJoinMap(utils.recordToMap(prevState), utils.recordToMap(nextState))) {
        switch (value.type) {
            case utils.left:
                result.set(key, {
                    type: replace$1,
                    replace: { oldValue: value.left, newValue: undefined },
                });
                continue;
            case utils.right: {
                result.set(key, {
                    type: replace$1,
                    replace: { oldValue: undefined, newValue: value.right },
                });
                continue;
            }
            case utils.both: {
                const diffResult = innerDiff({
                    key,
                    prevState: value.left,
                    nextState: value.right,
                });
                if (diffResult === undefined) {
                    continue;
                }
                result.set(key, { type: update$2, update: diffResult });
                continue;
            }
        }
    }
    if (result.size === 0) {
        return undefined;
    }
    return utils.mapToRecord(result);
};
const mapRecordUpOperation = ({ source, mapState, mapOperation, }) => {
    return utils.chooseRecord(source, element => {
        if (element.type === replace$1) {
            return {
                type: replace$1,
                replace: {
                    newValue: element.replace.newValue == null
                        ? undefined
                        : mapState(element.replace.newValue),
                },
            };
        }
        return {
            type: update$2,
            update: mapOperation(element.update),
        };
    });
};
const mapRecordDownOperation = ({ source, mapState, mapOperation, }) => {
    return utils.chooseRecord(source, element => {
        if (element.type === replace$1) {
            return {
                type: replace$1,
                replace: {
                    oldValue: element.replace.oldValue == null
                        ? undefined
                        : mapState(element.replace.oldValue),
                },
            };
        }
        return {
            type: update$2,
            update: mapOperation(element.update),
        };
    });
};

const $v = '$v';
const $r = '$r';
const isKeyToIgnore = (key) => key === $v || key === $r;
const warnNotFoundTemplate = ({ key, objectType, }) => {
    utils.loggerRef.warn(`"${key}" key was found at ${objectType} object, but template not found. It seems that the template is invalid or the ${objectType} object has keys which are not in the template.`);
};
/** TwoWayOperationをUpOperationに変換します。 */
const toUpOperation = (template) => (twoWayOperation) => {
    const twoWayOperationAsAny = twoWayOperation;
    switch (template.type) {
        case atomic: {
            switch (template.mode) {
                case replace:
                    return {
                        newValue: twoWayOperationAsAny.newValue,
                    };
                case ot:
                    return template.nullable
                        ? toUpOperation$1(twoWayOperationAsAny)
                        : toUpOperation$2(twoWayOperationAsAny);
            }
            break;
        }
        case record: {
            return mapRecordUpOperation({
                source: twoWayOperation,
                mapState: x => x,
                mapOperation: operation => toUpOperation(template.value)(operation),
            });
        }
        case paramRecord: {
            return utils.mapRecord(twoWayOperation, x => toUpOperation(template.value)(x));
        }
        case object: {
            return utils.mapRecord(twoWayOperation, (operationElement, key) => {
                if (isKeyToIgnore(key)) {
                    return operationElement;
                }
                const templateElement = template.value[key];
                if (templateElement == null) {
                    warnNotFoundTemplate({ key, objectType: 'operation' });
                    return undefined;
                }
                return toUpOperation(templateElement)(operationElement);
            });
        }
    }
};
/** TwoWayOperationをDownOperationに変換します。 */
const toDownOperation = (template) => (twoWayOperation) => {
    const twoWayOperationAsAny = twoWayOperation;
    switch (template.type) {
        case atomic: {
            switch (template.mode) {
                case replace:
                    return {
                        oldValue: twoWayOperationAsAny.oldValue,
                    };
                case ot:
                    return template.nullable
                        ? toDownOperation$1(twoWayOperationAsAny)
                        : toDownOperation$2(twoWayOperationAsAny);
            }
            break;
        }
        case record: {
            return mapRecordDownOperation({
                source: twoWayOperation,
                mapState: x => x,
                mapOperation: operation => toDownOperation(template.value)(operation),
            });
        }
        case paramRecord: {
            return utils.mapRecord(twoWayOperation, x => toDownOperation(template.value)(x));
        }
        case object: {
            return utils.mapRecord(twoWayOperation, (operationElement, key) => {
                if (isKeyToIgnore(key)) {
                    return operationElement;
                }
                const templateElement = template.value[key];
                if (templateElement == null) {
                    warnNotFoundTemplate({ key, objectType: 'operation' });
                    return undefined;
                }
                return toDownOperation(templateElement)(operationElement);
            });
        }
    }
};
/** StateにUpOperationを適用します。破壊的な処理は行われません。 */
const apply$1 = (template) => ({ state, operation }) => {
    const operationAsAny = operation;
    switch (template.type) {
        case atomic: {
            switch (template.mode) {
                case replace:
                    return result.Result.ok(operationAsAny.newValue);
                case ot:
                    return template.nullable
                        ? apply$4(state, operationAsAny)
                        : apply$5(state, operationAsAny);
            }
            break;
        }
        case record: {
            return apply$2({
                prevState: (state ?? {}),
                operation: operation,
                innerApply: ({ prevState, operation }) => apply$1(template.value)({
                    state: prevState,
                    operation: operation,
                }),
            });
        }
        case paramRecord: {
            return apply$3({
                prevState: state ?? {},
                operation: operation,
                innerApply: ({ prevState, operation }) => apply$1(template.value)({
                    state: prevState,
                    operation: operation,
                }),
                defaultState: template.defaultState,
            });
        }
        case object: {
            const result$1 = { ...state };
            for (const { key, value } of utils.recordToArray(operation)) {
                if (isKeyToIgnore(key)) {
                    continue;
                }
                const templateElement = template.value[key];
                if (templateElement == null) {
                    warnNotFoundTemplate({ key, objectType: 'operation' });
                    continue;
                }
                const applied = apply$1(templateElement)({
                    state: state[key],
                    operation: value,
                });
                if (applied.isError) {
                    return applied;
                }
                result$1[key] = applied.value;
            }
            return result.Result.ok(result$1);
        }
    }
};
/** StateにDownOperationを適用します。破壊的な処理は行われません。 */
const applyBack = (template) => ({ state, operation }) => {
    const operationAsAny = operation;
    switch (template.type) {
        case atomic: {
            switch (template.mode) {
                case replace:
                    return result.Result.ok(operationAsAny.oldValue);
                case ot:
                    return template.nullable
                        ? applyBack$3(state, operationAsAny)
                        : applyBack$4(state, operationAsAny);
            }
            break;
        }
        case record: {
            return applyBack$1({
                nextState: (state ?? {}),
                operation: operation,
                innerApplyBack: ({ state, operation }) => applyBack(template.value)({
                    state,
                    operation: operation,
                }),
            });
        }
        case paramRecord: {
            return applyBack$2({
                nextState: state ?? {},
                operation: operation,
                innerApplyBack: ({ nextState, operation }) => applyBack(template.value)({
                    state: nextState,
                    operation: operation,
                }),
                defaultState: template.defaultState,
            });
        }
        case object: {
            const result$1 = { ...state };
            for (const { key, value } of utils.recordToArray(operation)) {
                if (isKeyToIgnore(key)) {
                    continue;
                }
                const templateElement = template.value[key];
                if (templateElement == null) {
                    warnNotFoundTemplate({ key, objectType: 'operation' });
                    continue;
                }
                const applied = applyBack(templateElement)({
                    state: state[key],
                    operation: value,
                });
                if (applied.isError) {
                    return applied;
                }
                result$1[key] = applied.value;
            }
            return result.Result.ok(result$1);
        }
    }
};
/** 連続する2つのDownOperationを合成します。破壊的な処理は行われません。 */
const composeDownOperation = (template) => ({ first, second }) => {
    const firstAsAny = first;
    const secondAsAny = second;
    switch (template.type) {
        case atomic: {
            switch (template.mode) {
                case replace:
                    return result.Result.ok({
                        oldValue: firstAsAny.oldValue,
                    });
                case ot:
                    return template.nullable
                        ? composeDownOperation$2(firstAsAny, secondAsAny)
                        : composeDownOperation$3(firstAsAny, secondAsAny);
            }
            break;
        }
        case record: {
            return composeDownOperation$1({
                first: first,
                second: second,
                innerApplyBack: ({ state, operation }) => applyBack(template.value)({ state, operation }),
                innerCompose: ({ first, second }) => composeDownOperation(template.value)({ first, second }),
            });
        }
        case paramRecord: {
            return compose$1({
                first,
                second,
                innerCompose: ({ first, second }) => composeDownOperation(template.value)({ first, second }),
            });
        }
        case object: {
            const firstMap = utils.recordToMap(first);
            const secondMap = utils.recordToMap(second);
            const result$1 = {
                [$v]: template.$v,
                [$r]: template.$r,
            };
            for (const [key, value] of utils.groupJoinMap(firstMap, secondMap)) {
                if (isKeyToIgnore(key)) {
                    continue;
                }
                switch (value.type) {
                    case utils.left:
                        result$1[key] = value.left;
                        break;
                    case utils.right:
                        result$1[key] = value.right;
                        break;
                    default: {
                        const templateElement = template.value[key];
                        if (templateElement == null) {
                            warnNotFoundTemplate({ key, objectType: 'operation' });
                            continue;
                        }
                        const composed = composeDownOperation(templateElement)({
                            first: value.left,
                            second: value.right,
                        });
                        if (composed.isError) {
                            return composed;
                        }
                        result$1[key] = composed.value;
                    }
                }
            }
            return result.Result.ok(result$1);
        }
    }
};
/**
 * Stateの情報を用いて、DownOperationをTwoWayOperationに変換します。破壊的な処理は行われません。
 * @param nextState DownOperationが適用される前の状態のState。
 */
const restore = (template) => ({ nextState, downOperation }) => {
    const nextStateAsAny = nextState;
    const downOperationAsAny = downOperation;
    switch (template.type) {
        case atomic: {
            switch (template.mode) {
                case replace:
                    return result.Result.ok({
                        prevState: downOperationAsAny.oldValue,
                        twoWayOperation: {
                            oldValue: downOperationAsAny.oldValue,
                            newValue: nextState,
                        },
                    });
                case ot:
                    return template.nullable
                        ? restore$3({
                            nextState: nextStateAsAny,
                            downOperation: downOperationAsAny,
                        })
                        : restore$4({
                            nextState: nextStateAsAny,
                            downOperation: downOperationAsAny,
                        });
            }
            break;
        }
        case record: {
            return restore$1({
                nextState: (nextState ?? {}),
                downOperation: downOperation,
                innerDiff: ({ prevState, nextState }) => diff(template.value)({ prevState, nextState }),
                innerRestore: ({ downOperation, nextState }) => restore(template.value)({ downOperation: downOperation, nextState }),
            });
        }
        case paramRecord: {
            return restore$2({
                nextState: nextState ?? {},
                downOperation: downOperation,
                innerRestore: ({ downOperation, nextState }) => restore(template.value)({ downOperation: downOperation, nextState }),
            });
        }
        case object: {
            const prevState = { ...nextState };
            const twoWayOperation = {
                [$v]: template.$v,
                [$r]: template.$r,
            };
            for (const { key, value } of utils.recordToArray(downOperation)) {
                if (isKeyToIgnore(key)) {
                    continue;
                }
                const templateElement = template.value[key];
                if (templateElement == null) {
                    warnNotFoundTemplate({ key, objectType: 'operation' });
                    continue;
                }
                const restored = restore(templateElement)({
                    nextState: nextState[key],
                    downOperation: value,
                });
                if (restored.isError) {
                    return restored;
                }
                prevState[key] = restored.value.prevState;
                twoWayOperation[key] = restored.value.twoWayOperation;
            }
            return result.Result.ok({ prevState, twoWayOperation });
        }
    }
};
/** 2つのStateオブジェクトの差分を取ります。
 * @returns 2つのオブジェクトが意味上で同一であればundefinedを返します。
 */
const diff = (template) => ({ prevState, nextState }) => {
    const prevStateAsAny = prevState;
    const nextStateAsAny = nextState;
    switch (template.type) {
        case atomic: {
            switch (template.mode) {
                case replace:
                    return prevState === nextState
                        ? undefined
                        : {
                            oldValue: prevState,
                            newValue: nextState,
                        };
                case ot:
                    return template.nullable
                        ? diff$3({
                            prev: prevStateAsAny,
                            next: nextStateAsAny,
                        })
                        : diff$4({ prev: prevStateAsAny, next: nextStateAsAny });
            }
            break;
        }
        case record: {
            return diff$1({
                prevState: (prevState ?? {}),
                nextState: (nextState ?? {}),
                innerDiff: ({ prevState, nextState }) => diff(template.value)({ prevState, nextState }),
            });
        }
        case paramRecord: {
            return diff$2({
                prevState: (prevState ?? {}),
                nextState: (nextState ?? {}),
                innerDiff: ({ prevState, nextState }) => diff(template.value)({
                    prevState: prevState ?? template.defaultState,
                    nextState: nextState ?? template.defaultState,
                }),
            });
        }
        case object: {
            const prevStateMap = utils.recordToMap(prevState);
            const nextStateMap = utils.recordToMap(nextState);
            const result = {
                [$v]: template.$v,
                [$r]: template.$r,
            };
            for (const [key, value] of utils.groupJoinMap(prevStateMap, nextStateMap)) {
                if (isKeyToIgnore(key)) {
                    continue;
                }
                const templateElement = template.value[key];
                if (templateElement == null) {
                    warnNotFoundTemplate({ key, objectType: 'state' });
                    continue;
                }
                result[key] = diff(templateElement)({
                    prevState: value.left,
                    nextState: value.right,
                });
            }
            if (isIdRecord(result)) {
                return undefined;
            }
            return result;
        }
    }
};
const requiresArrayTransformation = (operations) => {
    for (const operation of operations) {
        if (operation == null) {
            continue;
        }
        for (const operationElement of utils.recordToArray(operation)) {
            if (operationElement.value.type === replace) {
                const newValue = operationElement.value.replace.newValue;
                if (typeof newValue === 'object' &&
                    newValue != null &&
                    $index in newValue &&
                    newValue[$index] !== undefined) {
                    return true;
                }
                continue;
            }
            const update = operationElement.value.update;
            if (typeof update === 'object' &&
                update != null &&
                $index in update &&
                update[$index] !== undefined) {
                return true;
            }
        }
    }
    return false;
};
/**
 * ユーザーの権限を考慮せずに、通常のOperational Transformを行います。主にクライアント側で使われます。破壊的な処理は行われません。
 *
 * この関数は次の2つの制約があります。
 * - `first`適用前のStateと`second`適用前のStateは等しい。
 * - このStateに対して`first`と`secondPrime`を順に適用したStateと、`second`と`firstPrime`を順に適用したStateは等しい。
 *
 * Record の template の場合、state や operation に `$index` というキーのプロパティがある場合はIndexObject(配列の要素)であるとみなされ、`$index`を調整する operation が自動的に追加されることがあります。そのため、配列の要素とみなしたい場合を除いて`$index`というキーをオブジェクトに含めないようにしてください。
 */
const clientTransform$1 = (template) => ({ state, first, second }) => {
    switch (template.type) {
        case atomic: {
            switch (template.mode) {
                case replace:
                    return result.Result.ok({
                        firstPrime: {
                            newValue: first.newValue,
                        },
                        secondPrime: undefined,
                    });
                case ot:
                    return template.nullable
                        ? clientTransform$4({
                            first: first,
                            second: second,
                        })
                        : clientTransform$5({
                            first: first,
                            second: second,
                        });
            }
            break;
        }
        case record: {
            const $first = first;
            const $second = second;
            const args = {
                state,
                first: $first,
                second: $second,
                innerTransform: ({ state, first, second }) => clientTransform$1(template.value)({
                    state,
                    first,
                    second,
                }),
                innerDiff: ({ prevState, nextState }) => {
                    const d = diff(template.value)({ prevState, nextState });
                    if (d == null) {
                        return undefined;
                    }
                    return toUpOperation(template.value)(d);
                },
            };
            if (requiresArrayTransformation([$first, $second])) {
                return clientTransform({
                    ...args,
                    innerApply: ({ prevState, operation }) => apply$1(template.value)({ state: prevState, operation }),
                });
            }
            return clientTransform$2(args);
        }
        case paramRecord: {
            return clientTransform$3({
                state,
                defaultState: template.defaultState,
                first: first,
                second: second,
                innerTransform: ({ state, first, second }) => clientTransform$1(template.value)({
                    state,
                    first,
                    second,
                }),
            });
        }
        case object: {
            const firstMap = utils.recordToMap(first);
            const secondMap = utils.recordToMap(second);
            const firstPrime = {
                [$v]: template.$v,
                [$r]: template.$r,
            };
            const secondPrime = {
                [$v]: template.$v,
                [$r]: template.$r,
            };
            for (const [key, value] of utils.groupJoinMap(firstMap, secondMap)) {
                if (isKeyToIgnore(key)) {
                    continue;
                }
                switch (value.type) {
                    case utils.left:
                        firstPrime[key] = value.left;
                        break;
                    case utils.right:
                        secondPrime[key] = value.right;
                        break;
                    default: {
                        const s = state[key];
                        if (s === undefined) {
                            return result.Result.error(`${key} is not found at object client transform.`);
                        }
                        const templateElement = template.value[key];
                        if (templateElement == null) {
                            warnNotFoundTemplate({ key, objectType: 'operation' });
                            continue;
                        }
                        const xformed = clientTransform$1(templateElement)({
                            state: s,
                            first: value.left,
                            second: value.right,
                        });
                        if (xformed.isError) {
                            return xformed;
                        }
                        firstPrime[key] = xformed.value.firstPrime;
                        secondPrime[key] = xformed.value.secondPrime;
                    }
                }
            }
            return result.Result.ok({
                firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
                secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
            });
        }
    }
};

class OtError extends Error {
    otError;
    constructor(content) {
        // TODO: よりわかりやすいメッセージを表示する
        const message = content.type;
        super(message);
        this.otError = content;
        this.name = 'OtError';
    }
}
const toOtError = (content) => {
    if (typeof content === 'string') {
        return new Error(content);
    }
    return new OtError(content);
};

class NodeAndEdges {
    node;
    edgeTargetNodes;
    constructor(node, 
    /** この node が始点となる edge の全てのうち、それらの終点を表します。 */
    edgeTargetNodes) {
        this.node = node;
        this.edgeTargetNodes = edgeTargetNodes;
    }
    #longestPathsMemo = null;
    /** この node を始点とした、最長の path を返します。この node は含まれます。最長の path が複数ある場合はすべて返します。 */
    // 値はメモ化されるため、longestPath を実行した後に edgeTargetNodes を変更してはならない。
    longestPaths() {
        if (this.#longestPathsMemo != null) {
            return this.#longestPathsMemo;
        }
        let longestPaths = [{ path: [this.node] }];
        let longestPathLength = 1;
        for (const edgeTargetNode of this.edgeTargetNodes) {
            for (const longestPath of edgeTargetNode.longestPaths()) {
                const path = [this.node, ...longestPath.path];
                if (path.length < longestPathLength) {
                    continue;
                }
                if (path.length === longestPathLength) {
                    longestPaths.push({ path });
                    continue;
                }
                longestPaths = [{ path }];
                longestPathLength = path.length;
            }
        }
        this.#longestPathsMemo = longestPaths;
        return this.#longestPathsMemo;
    }
}
/**
 * 与えられた配列について、次のすべての条件を満たした有向グラフを作成します。
 *
 * 条件1. 配列の要素はすべてグラフの node である。例: [1,4,2] の場合は 1,4,2 の3つが node。
 *
 * 条件2. edge の方向は、必ず配列内の位置で左から右の向き。例: [1,4,2] の場合は 1→4,4→2,1→2 のみが edge になりうる。4→1 や 1→1 などは決して edge にならない。
 *
 * 条件3. 2つの edge があり、それを a, b とする。前者の edge の両端の node を x_a, y_a、後者のそれを x_b, y_b とする。このとき、a = b ⇔ x_a = x_b かつ y_a = y_b が成り立つ。つまり、2つの node を結ぶ edge は最大でも1つまでしか存在しない。
 *
 * 条件4. edge は、(edge の始点) < (edge の終点) という順序関係を満たす。なお、(edge の始点) = (edge の終点) という順序関係を満たすことは許容されていない。 例: [1,4,2] の場合は、条件3もあわせて考慮すると、1→4,1→2 のみが edge になりうる。4→2 は決して edge にならない。
 *
 * 条件5. edge は可能な限り多くする。例: [1,4,2,3] の場合は、条件1～4 もあわせて考慮すると、node は 1,4,2,3 で、edge は 1→4, 1→2, 1→3, 2→3 である。
 *
 * なお、次の条件は理論的には必須ではありませんが、この関数を必要とする関数での処理の高速化のために設けています。
 *
 * 条件6. 2つの相異なる node 間を結ぶ path が複数ある場合、最も edge の数が多い path を構成する edge のみを残し、他の edge はすべて削除する。これは条件5より優先される。例: [1,4,2,3] の場合は、条件1～4 のみを考慮すると edge は 1→4, 1→2, 1→3, 2→3 であるが、このうち1→3は1→2→3よりedgeの数が少ないため取り除く。「ショートカットできる経路はすべて削除する」と考えてもよい。
 */
const createGraph = (source, comparer) => {
    const memoized = source.map(() => null);
    function getOrCreateNode(sourceIndex) {
        const memoizedElement = memoized[sourceIndex];
        if (memoizedElement != null) {
            return memoizedElement;
        }
        const startingNode = source[sourceIndex];
        const edgeTargetNodes = [];
        for (let i = sourceIndex + 1; i < source.length; i++) {
            const edgeTargetNode = getOrCreateNode(i);
            const lastEdgeTargetNode = edgeTargetNodes[edgeTargetNodes.length - 1];
            // 上の条件6を満たすような edge の追加はせず continue する
            if (lastEdgeTargetNode != null &&
                comparer(lastEdgeTargetNode.node, edgeTargetNode.node) === '<') {
                continue;
            }
            if (comparer(startingNode, edgeTargetNode.node) === '<') {
                edgeTargetNodes.push(edgeTargetNode);
            }
        }
        const result = new NodeAndEdges(startingNode, edgeTargetNodes);
        memoized[sourceIndex] = result;
        return result;
    }
    source.forEach((_, index) => getOrCreateNode(index));
    return memoized.map(elem => {
        if (elem == null) {
            throw new Error('This should not happen');
        }
        return elem;
    });
};
const getBetterFixedPoints = ({ x, y, getIndex, }) => {
    if (x.length < y.length) {
        return 'yIsBetter';
    }
    if (x.length > y.length) {
        return 'xIsBetter';
    }
    const getGaps = (path) => [...utils.pairwiseIterable(path)]
        .flatMap(pair => {
        if (pair.prev == null) {
            return [];
        }
        return [getIndex(pair.current) - getIndex(pair.prev)];
    })
        .sort((i, j) => i - j);
    const gapsOfPrev = getGaps(x);
    const gapsOfNext = getGaps(y);
    for (const group of utils.groupJoinArray(gapsOfPrev, gapsOfNext)) {
        if (group.type !== utils.both) {
            throw new Error(`group.type should be "${utils.both}", but actually "${group.type}".`);
        }
        if (group.left === group.right) {
            continue;
        }
        return group.left < group.right ? 'yIsBetter' : 'xIsBetter';
    }
    return 'same';
};
/** 配列が `prev` の状態から `next` の状態に変更されたとみなしたときに、動かすべきでない要素の一覧を返します。undefined である要素は無視されます。 */
const getBestFixedPoints = ({ prev, next, getKey, comparer, }) => {
    const nextMap = new Map(next.map((value, index) => [getKey(value), { value, index }]));
    const graph = createGraph(prev.filter(value => nextMap.has(getKey(value))).map((value, index) => ({ value, index })), (x, y) => {
        const nextX = nextMap.get(getKey(x.value));
        const nextY = nextMap.get(getKey(y.value));
        // nextX = nextY = null のときでも '>' を返せば edge は生成されないので問題ない
        if (nextY === undefined) {
            return '>';
        }
        if (nextX === undefined) {
            return '<';
        }
        return comparer(nextX, nextY);
    });
    let longestPath = [];
    for (const g of graph) {
        for (const { path } of g.longestPaths()) {
            const compareResult = getBetterFixedPoints({
                x: longestPath,
                y: path,
                getIndex: x => x.index,
            });
            switch (compareResult) {
                case 'xIsBetter':
                    break;
                case 'yIsBetter':
                    longestPath = path;
                    break;
            }
        }
    }
    return longestPath.map(({ value }) => value);
};
/**
 *
 * 配列を最初の要素から順番に見ていって、`predicate` が満たされなくなるまで配列から要素を取り除きます。
 *
 * @returns 取り除かれた要素。
 *
 */
const removeUntil = (source, predicate) => {
    const result = [];
    while (source.length !== 0) {
        const first = source[0];
        if (!predicate(first)) {
            return result;
        }
        result.push(first);
        source.splice(0, 1);
    }
    return result;
};
const arrayDiff = ({ prev, next, getKey, }) => {
    const clonedPrev = [...prev];
    const clonedNext = [...next];
    const fixedPoints = getBestFixedPoints({
        prev: clonedPrev,
        next: clonedNext,
        getKey,
        comparer: (x, y) => (x.index < y.index ? '<' : '>'),
    });
    const builder = new otCore.OperationBuilder({
        getInsertLength: insert => new otCore.PositiveInt(insert.length),
        getDeleteLength: del => new otCore.PositiveInt(del.length),
        concatInsert: (x, y) => [...x, ...y],
        concatDelete: (x, y) => [...x, ...y],
    });
    for (const fixedPoint of fixedPoints) {
        const deleted = removeUntil(clonedPrev, x => getKey(x) !== getKey(fixedPoint));
        if (utils.isReadonlyNonEmptyArray(deleted)) {
            builder.delete(deleted);
        }
        clonedPrev.splice(0, 1);
        const inserted = removeUntil(clonedNext, x => getKey(x) !== getKey(fixedPoint));
        if (utils.isReadonlyNonEmptyArray(inserted)) {
            builder.insert(inserted);
        }
        clonedNext.splice(0, 1);
        builder.retain(otCore.PositiveInt.one);
    }
    if (utils.isReadonlyNonEmptyArray(clonedPrev)) {
        builder.delete(clonedPrev);
    }
    if (utils.isReadonlyNonEmptyArray(clonedNext)) {
        builder.insert(clonedNext);
    }
    return {
        value: builder.build(),
        iterate: () => builder.toIterable(),
        toUnits: () => builder.toUnits(),
    };
};

const apply = (state, operation) => {
    const builder = new otCore.OperationBuilder({
        getInsertLength: insert => new otCore.PositiveInt(insert.length),
        getDeleteLength: del => new otCore.PositiveInt(del.length),
        concatInsert: (first, second) => [...first, ...second],
        concatDelete: (first, second) => [...first, ...second],
    }, operation);
    const applied = otCore.apply({
        state,
        action: [...builder.toIterable()],
        getStateLength: state => state.length,
        getInsertLength: insert => insert.length,
        getDeleteLength: del => new otCore.PositiveInt(del.length),
        insert: ({ state, start, replacement }) => {
            const result = [...state.slice(0, start), ...replacement, ...state.slice(start)];
            return { newState: result };
        },
        replace: ({ state, start, replacement, deleteCount }) => {
            const deleted = state.slice(start, deleteCount.value);
            const result = [
                ...state.slice(0, start),
                ...(replacement.isNone ? [] : replacement.value),
                ...state.slice(start + deleteCount.value),
            ];
            return { newState: result, deleted: deleted };
        },
    });
    if (applied.isError) {
        return applied;
    }
    return result.Result.ok(applied.value.newState);
};
const transform = (state, stateAppliedFirst, stateAppliedSecond, getKey) => {
    const tagKey = '$tag';
    const $state = state.map(value => ({ value, [tagKey]: 0 }));
    const $stateAppliedFirst = stateAppliedFirst.map(value => ({ value, [tagKey]: 1 }));
    const $stateAppliedSecond = stateAppliedSecond.map(value => ({ value, [tagKey]: 2 }));
    const $getKey = (x) => getKey(x.value);
    const first = arrayDiff({
        prev: $state,
        next: $stateAppliedFirst,
        getKey: $getKey,
    });
    const firstUnits = [...first.toUnits()];
    const second = arrayDiff({
        prev: $state,
        next: $stateAppliedSecond,
        getKey: $getKey,
    });
    const secondUnits = [...second.toUnits()];
    const transformed = otCore.transform({
        first: firstUnits,
        second: secondUnits,
        splitDelete: (target, index) => {
            const left = target.slice(0, index.value);
            const right = target.slice(index.value);
            return [
                left,
                right,
            ];
        },
        factory: {
            getInsertLength: insert => new otCore.PositiveInt(insert.length),
            getDeleteLength: del => new otCore.PositiveInt(del.length),
            concatInsert: (first, second) => [...first, ...second],
            concatDelete: (first, second) => [...first, ...second],
        },
    });
    if (transformed.isError) {
        return transformed;
    }
    // stateAppliedFirst に secondPrime を apply しているが、代わりに stateAppliedSecond に firstPrime を apply したものでも構わない。
    const nonDistictedLastState = apply($stateAppliedFirst, transformed.value.secondPrime);
    if (nonDistictedLastState.isError) {
        return nonDistictedLastState;
    }
    /*
    @kizahasi/ot-core の transform の仕様では要素の同一性は考慮されないため、もし nonDistictedLastState.value をそのまま返してしまうと次のような問題が生じる。
    - 例えば first が [insert 'x', retain 1, delete 'x', retain 1] で、second が [retain 1, delete 'x', retain 1, insert 'x'] のとき(つまり、同一の要素が同時に移動されたとき)、nonDistictedLastState.value に 'x' が2つ存在することになってしまう。そのため、二重に存在する要素は1つのみにしなければならない。
    - first が [delete 'x', retain 1] で、second が [delete 'x', retain 1, insert 'x'] のように、片方が移動で片方が削除の場合は最終的に削除されてほしいが、insert 'x' が残るため nonDistictedLastState.value に 'x' が含まれてしまう。
    そのため、これより下で、nonDistictedLastState.value からそのような要素を取り除く処理を行っている。
    */
    const deletedElemets = new utils.DualKeyMap();
    for (const operation of firstUnits) {
        if (operation.type === otCore.delete$) {
            for (const d of operation.delete) {
                deletedElemets.set({ first: getKey(d.value), second: 1 }, null);
            }
        }
    }
    for (const operation of secondUnits) {
        if (operation.type === otCore.delete$) {
            for (const d of operation.delete) {
                deletedElemets.set({ first: getKey(d.value), second: 2 }, null);
            }
        }
    }
    const groupedLastState = new utils.DualKeyMap();
    for (const { value, $tag } of nonDistictedLastState.value) {
        if ($tag === 0) {
            // 0 は使わないのでスキップ。
            continue;
        }
        groupedLastState.set({ first: getKey(value), second: $tag }, null);
    }
    const result$1 = nonDistictedLastState.value.flatMap(({ value, $tag }) => {
        const key = getKey(value);
        const deletedSimultaneously = deletedElemets.getByFirst(key).size >= 2;
        if (!deletedSimultaneously) {
            return [value];
        }
        const tags = groupedLastState.getByFirst(key);
        switch (tags.size) {
            case 0:
                // 両方のOperationで削除となったケース。
                // この場合は削除とする。
                return [];
            case 1:
                // 片方のOperationでは移動だが、もう片方のOperationでは削除されたケース。
                // この場合は削除を優先する。
                return [];
            case 2:
                // 両方のOperationで移動となったケース。
                // この場合は常にfirstを優先することにしている(問題があれば変えるかも)。
                // ここで $tag === 0 になることはない(もし $tag === 0 であればこの要素を削除するOperationはないことになるが、その場合は deletedSimultaneously === false になるため)。
                return $tag === 1 ? [value] : [];
            default:
                // ここに来ることはない。
                return [];
        }
    });
    return result.Result.ok(result$1);
};

// サーバーとクライアントで書き換え可能だが特殊な値であるため、他のプロパティとの衝突を避ける目的で文字列の頭に $ を頭に付けている。
const $index = '$index';
/**
 * Record を 配列とみなすときに、その要素として必要な値が入った template を作成する際に用いる値。
 *
 * @example
 * ```
 * const indexObjectTemplate = createRecordValueTemplate(
 *     createObjectValueTemplate(
 *         {
 *             ...indexObjectTemplateValue,
 *
 *             // add more properies...
 *         },
 *         1,
 *         1
 *     )
 * );
 * ```
 */
/*
配列の表現方法には { $key: string, ...otherProperties }[] と Record<string, { $index: number; ...otherProperties }> の2種類が考えられたが、後者を採用している。
前者はデータをエクスポートした際にテキストエディタで比較的編集しやすいというメリットがある。ただし、replace と update の2種類だけでは、要素が移動した際に要素を丸ごと delete と insert する必要があるため Operation の容量がかさばるという問題点がある。move のような Operation も定義すれば解決すると思われるが、手間がかかる。いっぽう、後者の方法だと $index を変更するだけで済むため容量がかさばる問題は存在せず、既存の Record の Operational Transformation のシステムに乗っかれるというメリットがある。よって単純化を重視して後者を採用した。
*/
const indexObjectTemplateValue = {
    /**
     * 自身の要素のインデックス。一般的な配列と同様に、0 から始まります。
     *
     * インデックスが他の要素と重複してはなりません。また、0 から順に連続的に割り当てる必要があります。
     */
    [$index]: createReplaceValueTemplate(zod.z.number().nonnegative().int()),
};
const dummyVersion = undefined;
const indexObjectTemplate = createObjectValueTemplate(indexObjectTemplateValue, dummyVersion, dummyVersion);
const indexObjectsToArray = (record) => {
    const groupBy$index = utils.recordToMap(lodash.groupBy(utils.recordToArray(record), ({ value }) => value[$index].toString()));
    const result$1 = [];
    for (let i = 0; groupBy$index.size >= 1; i++) {
        const groupValue = groupBy$index.get(i.toString());
        groupBy$index.delete(i.toString());
        if (groupValue == null || groupValue.length !== 1) {
            return result.Result.error(`Just one element where index is ${i} should exist, but there are ${groupValue?.length ?? 0} elements.`);
        }
        const element = groupValue[0];
        result$1.push(element);
    }
    return result.Result.ok(result$1);
};
/**
 * 配列を Record に変換します。
 *
 * 引数に渡された `$index` は誤っていてもエラーにはならず、自動的かつ非破壊的に調整されます。
 */
const arrayToIndexObjects = (array) => {
    const result = {};
    array.forEach((element, index) => {
        if (result[element.key] !== undefined) {
            throw new Error(`"${element.key}" key is duplicated.`);
        }
        result[element.key] = produce__default.default(element.value, value => {
            value[$index] = index;
        });
    });
    return result;
};
const generateArrayDiff = ({ prevState, nextState, mapOperation, }) => {
    const execDiff = diff(createRecordValueTemplate(indexObjectTemplate));
    const diffResult = execDiff({
        prevState: utils.mapRecord(prevState, ({ $index }) => ({
            $v: dummyVersion,
            $r: dummyVersion,
            $index,
        })),
        nextState: utils.mapRecord(nextState, ({ $index }) => ({
            $v: dummyVersion,
            $r: dummyVersion,
            $index,
        })),
    });
    // replaceは存在しないので、updateだけ抽出する
    return utils.mapRecord(diffResult ?? {}, x => x.type === update$2
        ? {
            ...x,
            // RecordOperation.compose で型エラーを起こさないためだけに行っている変換。
            update: mapOperation(x.update),
        }
        : undefined);
};
/**
 * 配列に対して clientTransform を行います。
 *
 * 通常の Record の serverTransform の処理（つまり、`$index` 以外のプロパティの処理など）も内部で行われるため、通常の Record の serverTransform を別途実行することは避けてください。
 */
const clientTransform = (params) => {
    // いったん通常のRecordOperation.clientTransformを行い、エラーがないかどうか確かめる。
    // Operationの内容に問題がなくともresultFirstの時点では不正な$indexが存在する可能性があるが、この後のresultSecondをcomposeすることで正常になる。
    const recordOperationTransformResult = clientTransform$2(params);
    if (recordOperationTransformResult.isError) {
        return recordOperationTransformResult;
    }
    const execApply = apply$1(createRecordValueTemplate(indexObjectTemplate));
    const arrayObjectAfterFirst = execApply({
        state: utils.mapRecord(params.state, ({ $index }) => ({
            $v: dummyVersion,
            $r: dummyVersion,
            $index,
        })),
        operation: mapRecordUpOperation({
            source: params.first ?? {},
            mapState: ({ $index }) => ({ $v: dummyVersion, $r: dummyVersion, $index }),
            mapOperation: ({ $index }) => ({ $v: dummyVersion, $r: dummyVersion, $index }),
        }),
    });
    if (arrayObjectAfterFirst.isError) {
        // ここに来るということは、クライアントから受け取った Operation が不正(存在しない State に対して update しようとしたなど)であることを示す。だが、その場合は上のRecordOperation.clientTransformですでに弾かれているので、ここには来ないはず。
        return result.Result.error('Error at applying first as an array operation. This is probablly a bug. Message: ' +
            toOtError(arrayObjectAfterFirst.error).message);
    }
    const arrayObjectAfterSecond = execApply({
        state: utils.mapRecord(params.state, ({ $index }) => ({
            $v: dummyVersion,
            $r: dummyVersion,
            $index,
        })),
        operation: mapRecordUpOperation({
            source: params.second ?? {},
            mapState: ({ $index }) => ({ $v: dummyVersion, $r: dummyVersion, $index }),
            mapOperation: ({ $index }) => ({ $v: dummyVersion, $r: dummyVersion, $index }),
        }),
    });
    if (arrayObjectAfterSecond.isError) {
        // ここに来るということは、クライアントから受け取った Operation が不正(存在しない State に対して update しようとしたなど)であることを示す。だが、その場合は上のRecordOperation.clientTransformですでに弾かれているので、ここには来ないはず。
        return result.Result.error('Error at applying second as an array operation. This is probablly a bug. Message: ' +
            toOtError(arrayObjectAfterSecond.error).message);
    }
    const baseArray = indexObjectsToArray(utils.mapRecord(params.state, ({ $index }) => ({ $index })));
    if (baseArray.isError) {
        return result.Result.error('state is invalid as an array. Message: ' + baseArray.error);
    }
    const arrayAfterFirst = indexObjectsToArray(utils.mapRecord(arrayObjectAfterFirst.value ?? {}, ({ $index }) => ({ $index })));
    if (arrayAfterFirst.isError) {
        return result.Result.error('state applied first is invalid as an array. Message: ' + arrayAfterFirst.error);
    }
    const arrayAfterSecond = indexObjectsToArray(utils.mapRecord(arrayObjectAfterSecond.value ?? {}, ({ $index }) => ({ $index })));
    if (arrayAfterSecond.isError) {
        return result.Result.error('state applied second is invalid as an array. Message: ' + arrayAfterFirst.error);
    }
    const finalArrayResult = transform(baseArray.value, arrayAfterFirst.value, arrayAfterSecond.value, x => x.key);
    if (finalArrayResult.isError) {
        // 配列のtransformでエラーが発生することは通常はない。
        return result.Result.error('Error at transforming an array operation. This is probablly a bug. Message: ' +
            finalArrayResult.error);
    }
    const stateAfterFirst = apply$2({
        prevState: params.state,
        operation: params.first ?? {},
        innerApply: ({ prevState, operation }) => params.innerApply({ prevState, operation }),
    });
    if (stateAfterFirst.isError) {
        throw new Error('This should not happen. Message: ' + stateAfterFirst.error);
    }
    const finalStateBeforeIndexRearrangement = apply$2({
        prevState: stateAfterFirst.value,
        operation: recordOperationTransformResult.value.secondPrime,
        innerApply: ({ prevState, operation }) => params.innerApply({ prevState, operation }),
    });
    if (finalStateBeforeIndexRearrangement.isError) {
        throw new Error('This should not happen. Message: ' + finalStateBeforeIndexRearrangement.error);
    }
    const resultSecond = generateArrayDiff({
        prevState: finalStateBeforeIndexRearrangement.value,
        nextState: arrayToIndexObjects(finalArrayResult.value),
        mapOperation: x => ({
            [$index]: x[$index] == null ? undefined : { newValue: x[$index].newValue },
        }),
    });
    const compose$1 = (first) => compose({
        first,
        second: resultSecond,
        composeReplaceUpdate: ({ first, second }) => {
            if (first.newValue === undefined) {
                // 通常はここには来ない
                return result.Result.ok(first);
            }
            return result.Result.ok(produce__default.default(first, first => {
                if (second.$index === undefined) {
                    return;
                }
                if (first.newValue === undefined) {
                    return;
                }
                first.newValue.$index = second.$index.newValue;
            }));
        },
        composeUpdateUpdate: ({ first, second }) => {
            let composed$indexOperation;
            if (second[$index] === undefined) {
                composed$indexOperation = first[$index];
            }
            else {
                composed$indexOperation = second[$index];
            }
            const result$1 = produce__default.default(first, first => {
                first.$index = composed$indexOperation;
            });
            return result.Result.ok(isIdRecord(result$1) ? undefined : result$1);
        },
        composeReplaceReplace: () => {
            throw new Error('This should not happen.');
        },
        composeUpdateReplace: () => {
            throw new Error('This should not happen.');
        },
    });
    const firstPrime = compose$1(recordOperationTransformResult.value.firstPrime ?? {});
    if (firstPrime.isError) {
        return firstPrime;
    }
    const secondPrime = compose$1(recordOperationTransformResult.value.secondPrime ?? {});
    if (secondPrime.isError) {
        return secondPrime;
    }
    return result.Result.ok({
        firstPrime: isIdRecord(firstPrime.value ?? {}) ? undefined : firstPrime.value,
        secondPrime: isIdRecord(secondPrime.value ?? {}) ? undefined : secondPrime.value,
    });
};

/** 全てのStateに完全にアクセスできる。*/
const admin = 'admin';
/* userUidに基づき、一部のStateへのアクセスを制限する。*/
const client = 'client';
/* アクセス制限のあるStateへのアクセスを全て制限する。*/
const restrict = 'restrict';
const anyValue = { type: 'anyValue' };
const none = { type: 'none' };
const isAuthorized = ({ requestedBy, participantId, }) => {
    if (typeof participantId === 'string' || participantId.type === 'none') {
        if (requestedBy.type === admin) {
            return true;
        }
        if (requestedBy.type === restrict) {
            return false;
        }
        return requestedBy.userUid === participantId;
    }
    return true;
};
// 元々は isAuthorized 関数は存在せず、isAuthorized 関数に相当する処理は isOwner 関数で行っていた。だが、isOwner という名前と引数がしっくり来ない場面もあったので、isAuthorized 関数に移した。isOwner 関数は削除するとしっくり来ない場面が生じるかもしれないため、現時点では残している。
const isOwner = ({ requestedBy, ownerParticipantId, }) => {
    return isAuthorized({ requestedBy, participantId: ownerParticipantId });
};
const isBoardOwner = ({ boardId, requestedBy, currentRoomState, }) => {
    if (requestedBy.type === admin) {
        return true;
    }
    const userUid = requestedBy.type === client ? requestedBy.userUid : undefined;
    const board = (currentRoomState.boards ?? {})[boardId];
    if (board != null) {
        if (board.ownerParticipantId == null) {
            return true;
        }
        if (board.ownerParticipantId === userUid) {
            return true;
        }
        return false;
    }
    return false;
};
const isBoardVisible = ({ boardId, requestedBy, currentRoomState, }) => {
    if (isBoardOwner({ boardId: boardId, requestedBy, currentRoomState }) !== false) {
        return true;
    }
    return currentRoomState.activeBoardId === boardId;
};
const isCharacterOwner = ({ requestedBy, characterId, currentRoomState, }) => {
    if (requestedBy.type === admin) {
        return true;
    }
    if (typeof characterId !== 'string') {
        return characterId.type === 'anyValue';
    }
    const userUid = requestedBy.type === client ? requestedBy.userUid : undefined;
    const character = (currentRoomState.characters ?? {})[characterId];
    if (character != null) {
        if (character.ownerParticipantId == null) {
            return true;
        }
        if (character.ownerParticipantId === userUid) {
            return true;
        }
        return false;
    }
    return false;
};
const canChangeOwnerParticipantId = ({ requestedBy, currentOwnerParticipant, }) => {
    if (requestedBy.type === admin) {
        return true;
    }
    let currentOwnerParticipantId;
    if (typeof currentOwnerParticipant === 'string') {
        currentOwnerParticipantId = currentOwnerParticipant;
    }
    else {
        currentOwnerParticipantId = currentOwnerParticipant?.ownerParticipantId;
    }
    return isOwner({ requestedBy, ownerParticipantId: currentOwnerParticipantId ?? anyValue });
};
const canChangeOwnerCharacterId = ({ requestedBy, currentOwnerCharacter, currentRoomState, }) => {
    if (requestedBy.type === admin) {
        return true;
    }
    let currentOwnerCharacterId;
    if (typeof currentOwnerCharacter === 'string') {
        currentOwnerCharacterId = currentOwnerCharacter;
    }
    else {
        currentOwnerCharacterId = currentOwnerCharacter?.ownerCharacterId;
    }
    return isCharacterOwner({
        requestedBy,
        characterId: currentOwnerCharacterId ?? anyValue,
        currentRoomState,
    });
};

const serverTransform$n = ({ first, second, prevState, }) => {
    if (first === undefined && second !== undefined) {
        const newOperation = { oldValue: prevState, newValue: second.newValue };
        if (newOperation.oldValue !== newOperation.newValue) {
            return { oldValue: prevState, newValue: second.newValue };
        }
    }
    return undefined;
};

const toClientState$h = (source) => source;
const serverTransform$m = ({ stateBeforeServerOperation, clientOperation, serverOperation }) => {
    const twoWayOperation = { $v: 1, $r: 1 };
    twoWayOperation.isPaused = serverTransform$n({
        first: serverOperation?.isPaused,
        second: clientOperation.isPaused,
        prevState: stateBeforeServerOperation.isPaused,
    });
    twoWayOperation.files = serverTransform$n({
        first: serverOperation?.files,
        second: clientOperation.files,
        prevState: stateBeforeServerOperation.files,
    });
    twoWayOperation.volume = serverTransform$n({
        first: serverOperation?.volume,
        second: clientOperation.volume,
        prevState: stateBeforeServerOperation.volume,
    });
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok(twoWayOperation);
};

const serverTransform$l = ({ stateBeforeServerOperation, clientOperation, serverOperation }) => {
    const twoWayOperation = { $v: undefined, $r: undefined };
    twoWayOperation.h = serverTransform$n({
        first: serverOperation?.h,
        second: clientOperation.h,
        prevState: stateBeforeServerOperation.h,
    });
    twoWayOperation.isPositionLocked = serverTransform$n({
        first: serverOperation?.isPositionLocked,
        second: clientOperation.isPositionLocked,
        prevState: stateBeforeServerOperation.isPositionLocked,
    });
    const transformedMemo = serverTransform$q({
        first: serverOperation?.memo,
        second: clientOperation.memo,
        prevState: stateBeforeServerOperation.memo,
    });
    if (transformedMemo.isError) {
        return transformedMemo;
    }
    twoWayOperation.memo = transformedMemo.value;
    const transformedName = serverTransform$q({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: stateBeforeServerOperation.name,
    });
    if (transformedName.isError) {
        return transformedName;
    }
    twoWayOperation.name = transformedName.value;
    twoWayOperation.opacity = serverTransform$n({
        first: serverOperation?.opacity,
        second: clientOperation.opacity,
        prevState: stateBeforeServerOperation.opacity,
    });
    twoWayOperation.w = serverTransform$n({
        first: serverOperation?.w,
        second: clientOperation.w,
        prevState: stateBeforeServerOperation.w,
    });
    twoWayOperation.x = serverTransform$n({
        first: serverOperation?.x,
        second: clientOperation.x,
        prevState: stateBeforeServerOperation.x,
    });
    twoWayOperation.y = serverTransform$n({
        first: serverOperation?.y,
        second: clientOperation.y,
        prevState: stateBeforeServerOperation.y,
    });
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok(twoWayOperation);
};

const serverTransform$k = ({ stateBeforeServerOperation, stateAfterServerOperation, clientOperation, serverOperation, }) => {
    const boardPosition = serverTransform$l({
        stateBeforeServerOperation: stateBeforeServerOperation,
        stateAfterServerOperation: stateAfterServerOperation,
        clientOperation,
        serverOperation,
    });
    if (boardPosition.isError) {
        return boardPosition;
    }
    const twoWayOperation = {
        ...boardPosition.value,
        $v: undefined,
        $r: undefined,
    };
    twoWayOperation.cellH = serverTransform$n({
        first: serverOperation?.cellH,
        second: clientOperation.cellH,
        prevState: stateBeforeServerOperation.cellH,
    });
    twoWayOperation.cellW = serverTransform$n({
        first: serverOperation?.cellW,
        second: clientOperation.cellW,
        prevState: stateBeforeServerOperation.cellW,
    });
    twoWayOperation.cellX = serverTransform$n({
        first: serverOperation?.cellX,
        second: clientOperation.cellX,
        prevState: stateBeforeServerOperation.cellX,
    });
    twoWayOperation.cellY = serverTransform$n({
        first: serverOperation?.cellY,
        second: clientOperation.cellY,
        prevState: stateBeforeServerOperation.cellY,
    });
    twoWayOperation.isCellMode = serverTransform$n({
        first: serverOperation?.isCellMode,
        second: clientOperation.isCellMode,
        prevState: stateBeforeServerOperation.isCellMode,
    });
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok(twoWayOperation);
};

const toClientState$g = (isAuthorized) => (source) => {
    return {
        ...source,
        value: source.isValuePrivate && !isAuthorized ? undefined : source.value,
    };
};
const serverTransform$j = (isAuthorized) => ({ stateBeforeServerOperation, clientOperation, serverOperation }) => {
    if (!isAuthorized) {
        // 自分以外はどのプロパティも編集できない。
        return result.Result.ok(undefined);
    }
    const twoWayOperation = {
        $v: 1,
        $r: 1,
    };
    twoWayOperation.dieType = serverTransform$n({
        first: serverOperation?.dieType ?? undefined,
        second: clientOperation.dieType ?? undefined,
        prevState: stateBeforeServerOperation.dieType,
    });
    twoWayOperation.isValuePrivate = serverTransform$n({
        first: serverOperation?.isValuePrivate ?? undefined,
        second: clientOperation.isValuePrivate ?? undefined,
        prevState: stateBeforeServerOperation.isValuePrivate,
    });
    // !isAuthorized の場合は最初の方ですべて弾いているため、isValuePrivateのチェックをする必要はない。
    twoWayOperation.value = serverTransform$n({
        first: serverOperation?.value ?? undefined,
        second: clientOperation.value ?? undefined,
        prevState: stateBeforeServerOperation.value,
    });
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok({ ...twoWayOperation });
};

const templateValue$1 = {
    h: createReplaceValueTemplate(zod.z.number()),
    isPositionLocked: createReplaceValueTemplate(zod.z.boolean()),
    /**
     * @description To 3rd-party developers: Please always set undefined to this if it is CharacterPiece or PortraitPiece.
     */
    memo: createTextValueTemplate(true),
    /**
     * @description To 3rd-party developers: Please always set undefined to this if it is CharacterPiece or PortraitPiece.
     */
    name: createTextValueTemplate(true),
    /**
     * @description To 3rd-party developers: Please always set undefined to this because it is not implemented yet in the official web-server.
     */
    opacity: createReplaceValueTemplate(maybe(zod.z.number())),
    w: createReplaceValueTemplate(zod.z.number()),
    x: createReplaceValueTemplate(zod.z.number()),
    y: createReplaceValueTemplate(zod.z.number()),
};
const template$m = createObjectValueTemplate(templateValue$1, undefined, undefined);

const templateValue = {
    ...templateValue$1,
    cellH: createReplaceValueTemplate(zod.z.number()),
    cellW: createReplaceValueTemplate(zod.z.number()),
    cellX: createReplaceValueTemplate(zod.z.number()),
    cellY: createReplaceValueTemplate(zod.z.number()),
    isCellMode: createReplaceValueTemplate(zod.z.boolean()),
};
const template$l = createObjectValueTemplate(templateValue, undefined, undefined);

// 今の所D6しか対応していない。D4は将来のために予約されている。
const D4 = 'D4';
const D6 = 'D6';
const dieType = zod.z.union([zod.z.literal(D4), zod.z.literal(D6)]);
const template$k = createObjectValueTemplate({
    dieType: createReplaceValueTemplate(dieType),
    isValuePrivate: createReplaceValueTemplate(zod.z.boolean()),
    // undefined になるのは、次の2つのいずれかもしくは両方のケース。
    // 1. isValuePrivate === trueになっておりvalueが隠されているとき
    // 2. 目なしのとき
    value: createReplaceValueTemplate(maybe(zod.z.number())),
}, 1, 1);

const dicePieceStrIndexes = ['1', '2', '3', '4'];
const template$j = createObjectValueTemplate({
    ...templateValue,
    ownerCharacterId: createReplaceValueTemplate(maybe(zod.z.string())),
    dice: createRecordValueTemplate(template$k),
}, 2, 1);

const toClientState$f = (requestedBy, currentRoomState) => (source) => {
    const isAuthorized = isCharacterOwner({
        requestedBy,
        characterId: source.ownerCharacterId ?? anyValue,
        currentRoomState,
    });
    return {
        ...source,
        dice: utils.chooseRecord(source.dice ?? {}, state => toClientState$g(isAuthorized)(state)),
    };
};
const serverTransform$i = (requestedBy, currentRoomState) => ({ stateBeforeServerOperation, stateAfterServerOperation, clientOperation, serverOperation, }) => {
    const isAuthorized = isCharacterOwner({
        requestedBy,
        characterId: stateAfterServerOperation.ownerCharacterId ?? anyValue,
        currentRoomState,
    });
    const dice = serverTransform$o({
        stateBeforeFirst: stateBeforeServerOperation.dice ?? {},
        stateAfterFirst: stateAfterServerOperation.dice ?? {},
        first: serverOperation?.dice,
        second: clientOperation.dice,
        innerTransform: ({ prevState, nextState, first, second }) => serverTransform$j(true)({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: {
            cancelCreate: ({ key }) => !isAuthorized || dicePieceStrIndexes.every(x => x !== key),
            cancelRemove: () => !isAuthorized,
            cancelUpdate: () => !isAuthorized,
        },
    });
    if (dice.isError) {
        return dice;
    }
    const piece = serverTransform$k({
        stateBeforeServerOperation: {
            ...stateBeforeServerOperation,
            $v: undefined,
            $r: undefined,
        },
        stateAfterServerOperation: {
            ...stateAfterServerOperation,
            $v: undefined,
            $r: undefined,
        },
        clientOperation: { ...clientOperation, $v: undefined, $r: undefined },
        serverOperation: { ...serverOperation, $v: undefined, $r: undefined },
    });
    if (piece.isError) {
        return piece;
    }
    const twoWayOperation = {
        $v: 2,
        $r: 1,
        ...piece.value,
        dice: dice.value,
    };
    if (canChangeOwnerCharacterId({
        requestedBy,
        currentOwnerCharacter: stateAfterServerOperation,
        currentRoomState,
    })) {
        twoWayOperation.ownerCharacterId = serverTransform$n({
            first: serverOperation?.ownerCharacterId,
            second: clientOperation.ownerCharacterId,
            prevState: stateBeforeServerOperation.ownerCharacterId,
        });
    }
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok(twoWayOperation);
};

const toClientState$e = (source) => {
    return source;
};
const serverTransform$h = (requestedBy) => ({ stateBeforeServerOperation, stateAfterServerOperation, clientOperation, serverOperation, }) => {
    const piece = serverTransform$k({
        stateBeforeServerOperation: {
            ...stateBeforeServerOperation,
            $v: undefined,
            $r: undefined,
        },
        stateAfterServerOperation: {
            ...stateAfterServerOperation,
            $v: undefined,
            $r: undefined,
        },
        clientOperation: { ...clientOperation, $v: undefined, $r: undefined },
        serverOperation: { ...serverOperation, $v: undefined, $r: undefined },
    });
    if (piece.isError) {
        return piece;
    }
    const twoWayOperation = {
        $v: 2,
        $r: 1,
        ...piece.value,
    };
    if (canChangeOwnerParticipantId({
        requestedBy,
        currentOwnerParticipant: stateAfterServerOperation,
    })) {
        twoWayOperation.ownerParticipantId = serverTransform$n({
            first: serverOperation?.ownerParticipantId,
            second: clientOperation.ownerParticipantId,
            prevState: stateBeforeServerOperation.ownerParticipantId,
        });
    }
    twoWayOperation.image = serverTransform$n({
        first: serverOperation?.image,
        second: clientOperation.image,
        prevState: stateBeforeServerOperation.image,
    });
    twoWayOperation.isPrivate = serverTransform$n({
        first: serverOperation?.isPrivate,
        second: clientOperation.isPrivate,
        prevState: stateBeforeServerOperation.isPrivate,
    });
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok(twoWayOperation);
};

const serverTransform$g = ({ stateBeforeServerOperation, clientOperation, serverOperation }) => {
    const twoWayOperation = {
        $v: 1,
        $r: 1,
    };
    twoWayOperation.fill = serverTransform$n({
        first: serverOperation?.fill,
        second: clientOperation.fill,
        prevState: stateBeforeServerOperation.fill,
    });
    twoWayOperation.shape = serverTransform$n({
        first: serverOperation?.shape,
        second: clientOperation.shape,
        prevState: stateBeforeServerOperation.shape,
    });
    twoWayOperation.stroke = serverTransform$n({
        first: serverOperation?.stroke,
        second: clientOperation.stroke,
        prevState: stateBeforeServerOperation.stroke,
    });
    twoWayOperation.strokeWidth = serverTransform$n({
        first: serverOperation?.strokeWidth,
        second: clientOperation.strokeWidth,
        prevState: stateBeforeServerOperation.strokeWidth,
    });
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok(twoWayOperation);
};

// 現時点では、Webサーバー側ではshapeを最大でも1個までしかセットしていないため、1～9の9個のkeyだけ許可している。
const validateShapeKey = (key) => {
    const regex = /^[1-9]$/;
    return regex.test(key);
};
const toClientState$d = (source) => {
    return source;
};
const serverTransform$f = (requestedBy) => ({ stateBeforeServerOperation, stateAfterServerOperation, clientOperation, serverOperation, }) => {
    const piece = serverTransform$k({
        stateBeforeServerOperation: {
            ...stateBeforeServerOperation,
            $v: undefined,
            $r: undefined,
        },
        stateAfterServerOperation: {
            ...stateAfterServerOperation,
            $v: undefined,
            $r: undefined,
        },
        clientOperation: { ...clientOperation, $v: undefined, $r: undefined },
        serverOperation: { ...serverOperation, $v: undefined, $r: undefined },
    });
    if (piece.isError) {
        return piece;
    }
    const twoWayOperation = {
        $v: 1,
        $r: 1,
        ...piece.value,
    };
    if (canChangeOwnerParticipantId({
        requestedBy,
        currentOwnerParticipant: stateAfterServerOperation,
    })) {
        twoWayOperation.ownerParticipantId = serverTransform$n({
            first: serverOperation?.ownerParticipantId,
            second: clientOperation.ownerParticipantId,
            prevState: stateBeforeServerOperation.ownerParticipantId,
        });
    }
    twoWayOperation.isPrivate = serverTransform$n({
        first: serverOperation?.isPrivate,
        second: clientOperation.isPrivate,
        prevState: stateBeforeServerOperation.isPrivate,
    });
    const shapes = serverTransform$o({
        first: serverOperation?.shapes,
        second: clientOperation.shapes,
        stateBeforeFirst: stateBeforeServerOperation.shapes ?? {},
        stateAfterFirst: stateAfterServerOperation.shapes ?? {},
        innerTransform: ({ prevState, nextState, first, second }) => serverTransform$g({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: {
            // shapeが大量に作られるのを防ぐための保険的対策を行っている
            cancelCreate: ({ key }) => !validateShapeKey(key),
        },
    });
    if (shapes.isError) {
        return shapes;
    }
    twoWayOperation.shapes = shapes.value;
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok(twoWayOperation);
};

const toClientState$c = (requestedBy, currentRoomState) => (source) => {
    const isAuthorized = isCharacterOwner({
        requestedBy,
        characterId: source.ownerCharacterId ?? anyValue,
        currentRoomState,
    });
    return {
        ...source,
        value: source.isValuePrivate && !isAuthorized ? '' : source.value,
    };
};
const serverTransform$e = (requestedBy, currentRoomState) => ({ stateBeforeServerOperation, stateAfterServerOperation, clientOperation, serverOperation, }) => {
    const piece = serverTransform$k({
        stateBeforeServerOperation: {
            ...stateBeforeServerOperation,
            $v: undefined,
            $r: undefined,
        },
        stateAfterServerOperation: {
            ...stateAfterServerOperation,
            $v: undefined,
            $r: undefined,
        },
        clientOperation: { ...clientOperation, $v: undefined, $r: undefined },
        serverOperation: { ...serverOperation, $v: undefined, $r: undefined },
    });
    if (piece.isError) {
        return piece;
    }
    const twoWayOperation = {
        $v: 2,
        $r: 1,
        ...piece.value,
    };
    if (canChangeOwnerCharacterId({
        requestedBy,
        currentOwnerCharacter: stateAfterServerOperation,
        currentRoomState,
    })) {
        twoWayOperation.ownerCharacterId = serverTransform$n({
            first: serverOperation?.ownerCharacterId,
            second: clientOperation.ownerCharacterId,
            prevState: stateBeforeServerOperation.ownerCharacterId,
        });
    }
    twoWayOperation.isValuePrivate = serverTransform$n({
        first: serverOperation?.isValuePrivate ?? undefined,
        second: clientOperation.isValuePrivate ?? undefined,
        prevState: stateBeforeServerOperation.isValuePrivate,
    });
    // !isAuthorized の場合は最初の方ですべて弾いているため、isValuePrivateのチェックをする必要はない。
    const valueResult = serverTransform$r({
        first: serverOperation?.value ?? undefined,
        second: clientOperation.value ?? undefined,
        prevState: stateBeforeServerOperation.value,
    });
    if (valueResult.isError) {
        return valueResult;
    }
    twoWayOperation.value = valueResult.value;
    twoWayOperation.valueInputType = serverTransform$n({
        first: serverOperation?.valueInputType ?? undefined,
        second: clientOperation.valueInputType ?? undefined,
        prevState: stateBeforeServerOperation.valueInputType,
    });
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok(twoWayOperation);
};

const toClientState$b = (requestedBy, currentRoomState) => (source) => {
    return {
        ...source,
        dicePieces: toClientState$i({
            serverState: source.dicePieces,
            isPrivate: () => false,
            toClientState: ({ state }) => toClientState$f(requestedBy, currentRoomState)(state),
        }),
        imagePieces: toClientState$i({
            serverState: source.imagePieces,
            isPrivate: state => state.isPrivate &&
                !isOwner({
                    requestedBy,
                    ownerParticipantId: state.ownerParticipantId ?? anyValue,
                }),
            toClientState: ({ state }) => toClientState$e(state),
        }),
        shapePieces: toClientState$i({
            serverState: source.shapePieces,
            isPrivate: state => state.isPrivate &&
                !isOwner({
                    requestedBy,
                    ownerParticipantId: state.ownerParticipantId ?? anyValue,
                }),
            toClientState: ({ state }) => toClientState$d(state),
        }),
        stringPieces: toClientState$i({
            serverState: source.stringPieces,
            isPrivate: () => false,
            toClientState: ({ state }) => toClientState$c(requestedBy, currentRoomState)(state),
        }),
    };
};
const serverTransform$d = (requestedBy, currentRoomState) => ({ stateBeforeServerOperation, stateAfterServerOperation, clientOperation, serverOperation, }) => {
    const cancellationPolicyOfCharacterPieces = {
        cancelCreate: ({ newState }) => !isCharacterOwner({
            requestedBy,
            characterId: newState.ownerCharacterId ?? none,
            currentRoomState,
        }),
        cancelRemove: ({ state }) => !isCharacterOwner({
            requestedBy,
            characterId: state.ownerCharacterId ?? anyValue,
            currentRoomState,
        }),
    };
    const cancellationPolicyOfParticipantPieces = {
        cancelCreate: ({ newState }) => !isOwner({
            requestedBy,
            ownerParticipantId: newState.ownerParticipantId ?? none,
        }),
        cancelRemove: ({ state }) => !isOwner({
            requestedBy,
            ownerParticipantId: state.ownerParticipantId ?? anyValue,
        }),
    };
    const dicePieces = serverTransform$o({
        first: serverOperation?.dicePieces,
        second: clientOperation.dicePieces,
        stateBeforeFirst: stateBeforeServerOperation.dicePieces ?? {},
        stateAfterFirst: stateAfterServerOperation.dicePieces ?? {},
        innerTransform: ({ first, second, prevState, nextState }) => serverTransform$i(requestedBy, currentRoomState)({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: cancellationPolicyOfCharacterPieces,
    });
    if (dicePieces.isError) {
        return dicePieces;
    }
    const imagePieces = serverTransform$o({
        first: serverOperation?.imagePieces,
        second: clientOperation.imagePieces,
        stateBeforeFirst: stateBeforeServerOperation.imagePieces ?? {},
        stateAfterFirst: stateAfterServerOperation.imagePieces ?? {},
        innerTransform: ({ first, second, prevState, nextState }) => serverTransform$h(requestedBy)({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: cancellationPolicyOfParticipantPieces,
    });
    if (imagePieces.isError) {
        return imagePieces;
    }
    const shapePieces = serverTransform$o({
        first: serverOperation?.shapePieces,
        second: clientOperation.shapePieces,
        stateBeforeFirst: stateBeforeServerOperation.shapePieces ?? {},
        stateAfterFirst: stateAfterServerOperation.shapePieces ?? {},
        innerTransform: ({ first, second, prevState, nextState }) => serverTransform$f(requestedBy)({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: cancellationPolicyOfParticipantPieces,
    });
    if (shapePieces.isError) {
        return shapePieces;
    }
    const stringPieces = serverTransform$o({
        first: serverOperation?.stringPieces,
        second: clientOperation.stringPieces,
        stateBeforeFirst: stateBeforeServerOperation.stringPieces ?? {},
        stateAfterFirst: stateAfterServerOperation.stringPieces ?? {},
        innerTransform: ({ first, second, prevState, nextState }) => serverTransform$e(requestedBy, currentRoomState)({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: cancellationPolicyOfCharacterPieces,
    });
    if (stringPieces.isError) {
        return stringPieces;
    }
    const twoWayOperation = {
        $v: 2,
        $r: 1,
        dicePieces: dicePieces.value,
        imagePieces: imagePieces.value,
        shapePieces: shapePieces.value,
        stringPieces: stringPieces.value,
    };
    twoWayOperation.backgroundImage = serverTransform$n({
        first: serverOperation?.backgroundImage,
        second: clientOperation.backgroundImage,
        prevState: stateBeforeServerOperation.backgroundImage,
    });
    twoWayOperation.backgroundImageZoom = serverTransform$n({
        first: serverOperation?.backgroundImageZoom,
        second: clientOperation.backgroundImageZoom,
        prevState: stateBeforeServerOperation.backgroundImageZoom,
    });
    twoWayOperation.cellColumnCount = serverTransform$n({
        first: serverOperation?.cellColumnCount,
        second: clientOperation.cellColumnCount,
        prevState: stateBeforeServerOperation.cellColumnCount,
    });
    twoWayOperation.cellHeight = serverTransform$n({
        first: serverOperation?.cellHeight,
        second: clientOperation.cellHeight,
        prevState: stateBeforeServerOperation.cellHeight,
    });
    twoWayOperation.cellOffsetX = serverTransform$n({
        first: serverOperation?.cellOffsetX,
        second: clientOperation.cellOffsetX,
        prevState: stateBeforeServerOperation.cellOffsetX,
    });
    twoWayOperation.cellOffsetY = serverTransform$n({
        first: serverOperation?.cellOffsetY,
        second: clientOperation.cellOffsetY,
        prevState: stateBeforeServerOperation.cellOffsetY,
    });
    twoWayOperation.cellRowCount = serverTransform$n({
        first: serverOperation?.cellRowCount,
        second: clientOperation.cellRowCount,
        prevState: stateBeforeServerOperation.cellRowCount,
    });
    twoWayOperation.cellWidth = serverTransform$n({
        first: serverOperation?.cellWidth,
        second: clientOperation.cellWidth,
        prevState: stateBeforeServerOperation.cellWidth,
    });
    const name = serverTransform$r({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: stateBeforeServerOperation.name,
    });
    if (name.isError) {
        return name;
    }
    twoWayOperation.name = name.value;
    if (canChangeOwnerParticipantId({
        requestedBy,
        currentOwnerParticipant: stateAfterServerOperation,
    })) {
        twoWayOperation.ownerParticipantId = serverTransform$n({
            first: serverOperation?.ownerParticipantId,
            second: clientOperation.ownerParticipantId,
            prevState: stateBeforeServerOperation.ownerParticipantId,
        });
    }
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok(twoWayOperation);
};

const toClientState$a = (isAuthorized, defaultValue) => (source) => {
    return {
        ...source,
        value: source.isValuePrivate && !isAuthorized ? defaultValue : source.value,
    };
};
const serverTransform$c = (isAuthorized) => ({ stateBeforeServerOperation, stateAfterServerOperation, clientOperation, serverOperation, }) => {
    const twoWayOperation = { $v: 2, $r: 1 };
    if (isAuthorized) {
        twoWayOperation.isValuePrivate = serverTransform$n({
            first: serverOperation?.isValuePrivate,
            second: clientOperation.isValuePrivate,
            prevState: stateBeforeServerOperation.isValuePrivate,
        });
    }
    if (isAuthorized || !stateAfterServerOperation.isValuePrivate) {
        twoWayOperation.value = serverTransform$n({
            first: serverOperation?.value,
            second: clientOperation.value,
            prevState: stateBeforeServerOperation.value,
        });
    }
    {
        const xformResult = serverTransform$q({
            first: serverOperation?.overriddenParameterName,
            second: clientOperation.overriddenParameterName,
            prevState: stateBeforeServerOperation.overriddenParameterName,
        });
        if (xformResult.isError) {
            return xformResult;
        }
        twoWayOperation.overriddenParameterName = xformResult.value;
    }
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok({ ...twoWayOperation });
};

const toClientState$9 = (source) => {
    return source;
};
const serverTransform$b = ({ stateBeforeServerOperation, stateAfterServerOperation, clientOperation, serverOperation, }) => {
    const boardPosition = serverTransform$k({
        stateBeforeServerOperation: { ...stateBeforeServerOperation, $v: undefined, $r: undefined },
        stateAfterServerOperation: { ...stateAfterServerOperation, $v: undefined, $r: undefined },
        clientOperation: { ...clientOperation, $v: undefined, $r: undefined },
        serverOperation: { ...serverOperation, $v: undefined, $r: undefined },
    });
    if (boardPosition.isError) {
        return boardPosition;
    }
    const twoWayOperation = {
        ...boardPosition.value,
        $v: 2,
        $r: 1,
    };
    twoWayOperation.isPrivate = serverTransform$n({
        first: serverOperation?.isPrivate,
        second: clientOperation.isPrivate,
        prevState: stateBeforeServerOperation.isPrivate,
    });
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok(twoWayOperation);
};

const toClientState$8 = (source) => {
    return source;
};
const serverTransform$a = ({ stateBeforeServerOperation, clientOperation, serverOperation }) => {
    const twoWayOperation = {
        $v: 1,
        $r: 1,
    };
    const name = serverTransform$r({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: stateBeforeServerOperation.name,
    });
    if (name.isError) {
        return name;
    }
    twoWayOperation.name = name.value;
    const value = serverTransform$r({
        first: serverOperation?.value,
        second: clientOperation.value,
        prevState: stateBeforeServerOperation.value,
    });
    if (value.isError) {
        return value;
    }
    twoWayOperation.value = value.value;
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok(twoWayOperation);
};

const toClientState$7 = (isAuthorized, defaultValue) => (source) => {
    return {
        ...source,
        value: source.isValuePrivate && !isAuthorized ? defaultValue : source.value,
    };
};
const serverTransform$9 = (isAuthorized) => ({ stateBeforeServerOperation, stateAfterServerOperation, clientOperation, serverOperation, }) => {
    const twoWayOperation = { $v: 2, $r: 1 };
    if (isAuthorized) {
        twoWayOperation.isValuePrivate = serverTransform$n({
            first: serverOperation?.isValuePrivate,
            second: clientOperation.isValuePrivate,
            prevState: stateBeforeServerOperation.isValuePrivate,
        });
    }
    if (isAuthorized || !stateAfterServerOperation.isValuePrivate) {
        twoWayOperation.value = serverTransform$n({
            first: serverOperation?.value,
            second: clientOperation.value,
            prevState: stateBeforeServerOperation.value,
        });
    }
    {
        const xformResult = serverTransform$q({
            first: serverOperation?.overriddenParameterName,
            second: clientOperation.overriddenParameterName,
            prevState: stateBeforeServerOperation.overriddenParameterName,
        });
        if (xformResult.isError) {
            return xformResult;
        }
        twoWayOperation.overriddenParameterName = xformResult.value;
    }
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok({ ...twoWayOperation });
};

const toClientState$6 = (source) => {
    return source;
};
const serverTransform$8 = ({ stateBeforeServerOperation, stateAfterServerOperation, clientOperation, serverOperation, }) => {
    const boardPosition = serverTransform$l({
        stateBeforeServerOperation: { ...stateBeforeServerOperation, $v: undefined, $r: undefined },
        stateAfterServerOperation: { ...stateAfterServerOperation, $v: undefined, $r: undefined },
        clientOperation: { ...clientOperation, $v: undefined, $r: undefined },
        serverOperation: { ...serverOperation, $v: undefined, $r: undefined },
    });
    if (boardPosition.isError) {
        return boardPosition;
    }
    const twoWayOperation = {
        ...boardPosition.value,
        $v: 2,
        $r: 1,
    };
    twoWayOperation.isPrivate = serverTransform$n({
        first: serverOperation?.isPrivate,
        second: clientOperation.isPrivate,
        prevState: stateBeforeServerOperation.isPrivate,
    });
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok(twoWayOperation);
};

const toClientState$5 = (isAuthorized) => (source) => {
    return {
        ...source,
        value: source.isValuePrivate && !isAuthorized ? '' : source.value,
    };
};
const serverTransform$7 = (isAuthorized) => ({ stateBeforeServerOperation, stateAfterServerOperation, clientOperation, serverOperation, }) => {
    const twoWayOperation = { $v: 2, $r: 1 };
    if (isAuthorized) {
        twoWayOperation.isValuePrivate = serverTransform$n({
            first: serverOperation?.isValuePrivate,
            second: clientOperation.isValuePrivate,
            prevState: stateBeforeServerOperation.isValuePrivate,
        });
    }
    if (isAuthorized || !stateAfterServerOperation.isValuePrivate) {
        const transformed = serverTransform$q({
            first: serverOperation?.value,
            second: clientOperation.value,
            prevState: stateBeforeServerOperation.value,
        });
        if (transformed.isError) {
            return transformed;
        }
        twoWayOperation.value = transformed.value;
    }
    {
        const xformResult = serverTransform$q({
            first: serverOperation?.overriddenParameterName,
            second: clientOperation.overriddenParameterName,
            prevState: stateBeforeServerOperation.overriddenParameterName,
        });
        if (xformResult.isError) {
            return xformResult;
        }
        twoWayOperation.overriddenParameterName = xformResult.value;
    }
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok(twoWayOperation);
};

const template$i = createObjectValueTemplate({
    isValuePrivate: createReplaceValueTemplate(zod.z.boolean()),
    value: createReplaceValueTemplate(zod.z.boolean().optional()),
    overriddenParameterName: createTextValueTemplate(true),
}, 2, 1);

const template$h = createObjectValueTemplate({
    ...templateValue,
    boardId: createReplaceValueTemplate(zod.z.string()),
    isPrivate: createReplaceValueTemplate(zod.z.boolean()),
}, 2, 1);

const template$g = createObjectValueTemplate({
    name: createTextValueTemplate(false),
    value: createTextValueTemplate(false),
}, 1, 1);

const template$f = createObjectValueTemplate({
    isValuePrivate: createReplaceValueTemplate(zod.z.boolean()),
    value: createReplaceValueTemplate(zod.z.number().optional()),
    /**
     * @description Do not use this value for numMaxParam.
     */
    overriddenParameterName: createTextValueTemplate(true),
}, 2, 1);

const template$e = createObjectValueTemplate({
    ...templateValue$1,
    boardId: createReplaceValueTemplate(zod.z.string()),
    isPrivate: createReplaceValueTemplate(zod.z.boolean()),
}, 2, 1);

const template$d = createObjectValueTemplate({
    isValuePrivate: createReplaceValueTemplate(zod.z.boolean()),
    value: createTextValueTemplate(true),
    overriddenParameterName: createTextValueTemplate(true),
}, 2, 1);

// boolParams, numParams, numMaxParams, strParams: keyはstrIndex20などの固定キーを想定。
// pieces, portraitPositions: 誰でも作成できる値。keyはboardのkey。
// キャラクター全体非公開機能との兼ね合いがあるため、piecesとportraitPositionsをState<typeof Room.template>に置くのは綺麗ではない。
const defaultBoolParamState = {
    $v: 2,
    $r: 1,
    isValuePrivate: false,
    value: undefined,
    overriddenParameterName: undefined,
};
const defaultNumParamState = {
    $v: 2,
    $r: 1,
    isValuePrivate: false,
    value: undefined,
    overriddenParameterName: undefined,
};
const defaultStrParamState = {
    $v: 2,
    $r: 1,
    isValuePrivate: false,
    value: undefined,
    overriddenParameterName: undefined,
};
const template$c = createObjectValueTemplate({
    ownerParticipantId: createReplaceValueTemplate(zod.z.string().optional()),
    image: createReplaceValueTemplate(filePathValue.optional()),
    isPrivate: createReplaceValueTemplate(zod.z.boolean()),
    memo: createTextValueTemplate(false),
    name: createTextValueTemplate(false),
    chatPalette: createTextValueTemplate(false),
    privateVarToml: createTextValueTemplate(false),
    portraitImage: createReplaceValueTemplate(filePathValue.optional()),
    hasTag1: createReplaceValueTemplate(zod.z.boolean()),
    hasTag2: createReplaceValueTemplate(zod.z.boolean()),
    hasTag3: createReplaceValueTemplate(zod.z.boolean()),
    hasTag4: createReplaceValueTemplate(zod.z.boolean()),
    hasTag5: createReplaceValueTemplate(zod.z.boolean()),
    hasTag6: createReplaceValueTemplate(zod.z.boolean()),
    hasTag7: createReplaceValueTemplate(zod.z.boolean()),
    hasTag8: createReplaceValueTemplate(zod.z.boolean()),
    hasTag9: createReplaceValueTemplate(zod.z.boolean()),
    hasTag10: createReplaceValueTemplate(zod.z.boolean()),
    boolParams: createParamRecordValueTemplate(template$i, defaultBoolParamState),
    numParams: createParamRecordValueTemplate(template$f, defaultNumParamState),
    numMaxParams: createParamRecordValueTemplate(template$f, defaultNumParamState),
    strParams: createParamRecordValueTemplate(template$d, defaultStrParamState),
    pieces: createRecordValueTemplate(template$h),
    privateCommands: createRecordValueTemplate(template$g),
    portraitPieces: createRecordValueTemplate(template$e),
}, 2, 1);

const oneToTenArray$1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const toClientState$4 = (isAuthorized, requestedBy, currentRoomState) => (source) => {
    return {
        ...source,
        chatPalette: isAuthorized ? source.chatPalette : '',
        privateVarToml: isAuthorized ? source.privateVarToml : '',
        boolParams: toClientState$i({
            serverState: source.boolParams,
            isPrivate: () => false,
            toClientState: ({ state }) => toClientState$a(isAuthorized, undefined)(state),
        }),
        numParams: toClientState$i({
            serverState: source.numParams,
            isPrivate: () => false,
            toClientState: ({ state }) => toClientState$7(isAuthorized, undefined)(state),
        }),
        numMaxParams: toClientState$i({
            serverState: source.numMaxParams,
            isPrivate: () => false,
            toClientState: ({ state }) => toClientState$7(isAuthorized, undefined)(state),
        }),
        strParams: toClientState$i({
            serverState: source.strParams,
            isPrivate: () => false,
            toClientState: ({ state }) => toClientState$5(isAuthorized)(state),
        }),
        pieces: toClientState$i({
            serverState: source.pieces,
            isPrivate: state => !isBoardVisible({
                requestedBy,
                boardId: state.boardId,
                currentRoomState,
            }),
            toClientState: ({ state }) => toClientState$9(state),
        }),
        privateCommands: toClientState$i({
            serverState: source.privateCommands,
            isPrivate: () => !isAuthorized,
            toClientState: ({ state }) => toClientState$8(state),
        }),
        portraitPieces: toClientState$i({
            serverState: source.portraitPieces,
            isPrivate: state => !isBoardVisible({
                requestedBy,
                boardId: state.boardId,
                currentRoomState,
            }),
            toClientState: ({ state }) => toClientState$6(state),
        }),
    };
};
const serverTransform$6 = (isAuthorized, requestedBy, currentRoomState) => ({ stateBeforeServerOperation, stateAfterServerOperation, clientOperation, serverOperation, }) => {
    if (!isAuthorized && stateAfterServerOperation.isPrivate) {
        return result.Result.ok(undefined);
    }
    const boolParams = serverTransform$p({
        stateBeforeFirst: stateBeforeServerOperation.boolParams ?? {},
        stateAfterFirst: stateAfterServerOperation.boolParams ?? {},
        first: serverOperation?.boolParams,
        second: clientOperation.boolParams,
        innerTransform: ({ prevState, nextState, first, second }) => serverTransform$c(isAuthorized)({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: { ...first, $v: 2, $r: 1 },
            clientOperation: { ...second, $v: 2, $r: 1 },
        }),
        defaultState: defaultBoolParamState,
    });
    if (boolParams.isError) {
        return boolParams;
    }
    const numParams = serverTransform$p({
        stateBeforeFirst: stateBeforeServerOperation.numParams ?? {},
        stateAfterFirst: stateAfterServerOperation.numParams ?? {},
        first: serverOperation?.numParams,
        second: clientOperation.numParams,
        innerTransform: ({ prevState, nextState, first, second }) => serverTransform$9(isAuthorized)({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        defaultState: defaultNumParamState,
    });
    if (numParams.isError) {
        return numParams;
    }
    const numMaxParams = serverTransform$p({
        stateBeforeFirst: stateBeforeServerOperation.numMaxParams ?? {},
        stateAfterFirst: stateAfterServerOperation.numMaxParams ?? {},
        first: serverOperation?.numMaxParams,
        second: clientOperation.numMaxParams,
        innerTransform: ({ prevState, nextState, first, second }) => serverTransform$9(isAuthorized)({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        defaultState: defaultNumParamState,
    });
    if (numMaxParams.isError) {
        return numMaxParams;
    }
    const strParams = serverTransform$p({
        stateBeforeFirst: stateBeforeServerOperation.strParams ?? {},
        stateAfterFirst: stateAfterServerOperation.strParams ?? {},
        first: serverOperation?.strParams,
        second: clientOperation.strParams,
        innerTransform: ({ prevState, nextState, first, second }) => serverTransform$7(isAuthorized)({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        defaultState: defaultStrParamState,
    });
    if (strParams.isError) {
        return strParams;
    }
    const pieces = serverTransform$o({
        stateBeforeFirst: stateBeforeServerOperation.pieces ?? {},
        stateAfterFirst: stateAfterServerOperation.pieces ?? {},
        first: serverOperation?.pieces,
        second: clientOperation.pieces,
        innerTransform: ({ prevState, nextState, first, second }) => serverTransform$b({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: {
            cancelCreate: ({ newState }) => !isBoardVisible({
                requestedBy,
                currentRoomState,
                boardId: newState.boardId,
            }) ||
                !isOwner({
                    requestedBy,
                    ownerParticipantId: stateAfterServerOperation.ownerParticipantId ?? none,
                }),
            cancelRemove: params => {
                if (!isBoardVisible({
                    requestedBy,
                    currentRoomState,
                    boardId: params.state.boardId,
                })) {
                    return true;
                }
                return !isAuthorized && params.state.isPrivate;
            },
            cancelUpdate: params => {
                if (!isBoardVisible({
                    requestedBy,
                    currentRoomState,
                    boardId: params.nextState.boardId,
                })) {
                    return true;
                }
                return !isAuthorized && params.nextState.isPrivate;
            },
        },
    });
    if (pieces.isError) {
        return pieces;
    }
    const privateCommands = serverTransform$o({
        stateBeforeFirst: stateBeforeServerOperation.privateCommands ?? {},
        stateAfterFirst: stateAfterServerOperation.privateCommands ?? {},
        first: serverOperation?.privateCommands,
        second: clientOperation.privateCommands,
        innerTransform: ({ prevState, nextState, first, second }) => serverTransform$a({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: {
            cancelCreate: () => !isAuthorized,
            cancelRemove: () => !isAuthorized,
            cancelUpdate: () => !isAuthorized,
        },
    });
    if (privateCommands.isError) {
        return privateCommands;
    }
    const portraitPositions = serverTransform$o({
        stateBeforeFirst: stateBeforeServerOperation.portraitPieces ?? {},
        stateAfterFirst: stateAfterServerOperation.portraitPieces ?? {},
        first: serverOperation?.portraitPieces,
        second: clientOperation.portraitPieces,
        innerTransform: ({ prevState, nextState, first, second }) => serverTransform$8({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: {
            cancelCreate: ({ newState }) => !isBoardVisible({
                requestedBy,
                currentRoomState,
                boardId: newState.boardId,
            }) ||
                !isOwner({
                    requestedBy,
                    ownerParticipantId: stateAfterServerOperation.ownerParticipantId ?? none,
                }),
            cancelRemove: params => {
                if (!isBoardVisible({
                    requestedBy,
                    currentRoomState,
                    boardId: params.state.boardId,
                })) {
                    return true;
                }
                return !isAuthorized && params.state.isPrivate;
            },
            cancelUpdate: params => {
                if (!isBoardVisible({
                    requestedBy,
                    currentRoomState,
                    boardId: params.nextState.boardId,
                })) {
                    return true;
                }
                return !isAuthorized && params.nextState.isPrivate;
            },
        },
    });
    if (portraitPositions.isError) {
        return portraitPositions;
    }
    const twoWayOperation = {
        $v: 2,
        $r: 1,
        boolParams: boolParams.value,
        numParams: numParams.value,
        numMaxParams: numMaxParams.value,
        strParams: strParams.value,
        pieces: pieces.value,
        privateCommands: privateCommands.value,
        portraitPieces: portraitPositions.value,
    };
    if (canChangeOwnerParticipantId({
        requestedBy,
        currentOwnerParticipant: stateAfterServerOperation,
    })) {
        twoWayOperation.ownerParticipantId = serverTransform$n({
            first: serverOperation?.ownerParticipantId,
            second: clientOperation.ownerParticipantId,
            prevState: stateBeforeServerOperation.ownerParticipantId,
        });
    }
    twoWayOperation.image = serverTransform$n({
        first: serverOperation?.image,
        second: clientOperation.image,
        prevState: stateBeforeServerOperation.image,
    });
    twoWayOperation.portraitImage = serverTransform$n({
        first: serverOperation?.portraitImage,
        second: clientOperation.portraitImage,
        prevState: stateBeforeServerOperation.portraitImage,
    });
    twoWayOperation.isPrivate = serverTransform$n({
        first: serverOperation?.isPrivate,
        second: clientOperation.isPrivate,
        prevState: stateBeforeServerOperation.isPrivate,
    });
    for (const index of oneToTenArray$1) {
        const key = `hasTag${index}`;
        twoWayOperation[key] = serverTransform$n({
            first: serverOperation?.[key],
            second: clientOperation[key],
            prevState: stateBeforeServerOperation[key],
        });
    }
    const transformedMemo = serverTransform$r({
        first: serverOperation?.memo,
        second: clientOperation.memo,
        prevState: stateBeforeServerOperation.memo,
    });
    if (transformedMemo.isError) {
        return transformedMemo;
    }
    twoWayOperation.memo = transformedMemo.value;
    const transformedName = serverTransform$r({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: stateBeforeServerOperation.name,
    });
    if (transformedName.isError) {
        return transformedName;
    }
    twoWayOperation.name = transformedName.value;
    if (isAuthorized) {
        const transformedChatPalette = serverTransform$r({
            first: serverOperation?.chatPalette,
            second: clientOperation.chatPalette,
            prevState: stateBeforeServerOperation.chatPalette,
        });
        if (transformedChatPalette.isError) {
            return transformedChatPalette;
        }
        twoWayOperation.chatPalette = transformedChatPalette.value;
    }
    if (isAuthorized) {
        const transformed = serverTransform$r({
            first: serverOperation?.privateVarToml,
            second: clientOperation.privateVarToml,
            prevState: stateBeforeServerOperation.privateVarToml,
        });
        if (transformed.isError) {
            return transformed;
        }
        twoWayOperation.privateVarToml = transformed.value;
    }
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok(twoWayOperation);
};

const toClientState$3 = (source) => source;
const serverTransform$5 = ({ stateBeforeServerOperation, clientOperation, serverOperation }) => {
    const twoWayOperation = { $v: 1, $r: 1 };
    // 暫定的にディレクトリの深さは1までとしている
    if ((clientOperation.dir?.newValue.length ?? 0) <= 1) {
        twoWayOperation.dir = serverTransform$n({
            first: serverOperation?.dir,
            second: clientOperation.dir,
            prevState: stateBeforeServerOperation.dir,
        });
    }
    const name = serverTransform$r({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: stateBeforeServerOperation.name,
    });
    if (name.isError) {
        return name;
    }
    twoWayOperation.name = name.value;
    const text = serverTransform$r({
        first: serverOperation?.text,
        second: clientOperation.text,
        prevState: stateBeforeServerOperation.text,
    });
    if (text.isError) {
        return text;
    }
    twoWayOperation.text = text.value;
    twoWayOperation.textType = serverTransform$n({
        first: serverOperation?.textType,
        second: clientOperation.textType,
        prevState: stateBeforeServerOperation.textType,
    });
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok({ ...twoWayOperation });
};

const toClientState$2 = (source) => source;
const serverTransform$4 = ({ stateBeforeServerOperation, clientOperation, serverOperation }) => {
    const twoWayOperation = { $v: 1, $r: 1 };
    const name = serverTransform$r({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: stateBeforeServerOperation.name,
    });
    if (name.isError) {
        return name;
    }
    twoWayOperation.name = name.value;
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok({ ...twoWayOperation });
};

const toClientState$1 = (source) => {
    return source;
};
const serverTransform$3 = ({ requestedBy, participantKey, }) => ({ stateBeforeServerOperation, clientOperation, serverOperation }) => {
    const isAuthorized = isOwner({
        requestedBy,
        ownerParticipantId: participantKey,
    });
    const twoWayOperation = {
        $v: 2,
        $r: 1,
    };
    if (isAuthorized) {
        // CONSIDER: ユーザーがnameをnullishに変更することは禁止すべきかもしれない
        twoWayOperation.name = serverTransform$n({
            first: serverOperation?.name ?? undefined,
            second: clientOperation.name ?? undefined,
            prevState: stateBeforeServerOperation.name,
        });
    }
    if (requestedBy.type === admin) {
        twoWayOperation.role = serverTransform$n({
            first: serverOperation?.role ?? undefined,
            second: clientOperation.role ?? undefined,
            prevState: stateBeforeServerOperation.role,
        });
    }
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok(twoWayOperation);
};

// Participantとは、そのRoomに入っているユーザーのこと。通常は、Player、Spectatorなどのroleを持っている。
const Player = 'Player';
const Spectator = 'Spectator';
const Master = 'Master';
const participantRole = zod.z.union([zod.z.literal(Player), zod.z.literal(Spectator), zod.z.literal(Master)]);
const template$b = createObjectValueTemplate({
    name: createReplaceValueTemplate(maybe(maxLength100String)),
    role: createReplaceValueTemplate(maybe(participantRole)),
}, 2, 1);

const getOpenRollCalls = (source) => {
    return utils.recordToArray(source).filter(({ value }) => {
        return value.closeStatus == null;
    });
};
/**
 * 現在行われている点呼があればそれを返します。
 *
 * 原則として、現在行われている点呼は最大でも 1 つまでしか存在できません。
 */
const getOpenRollCall = (source) => {
    const activeRollCalls = getOpenRollCalls(source);
    return lodash.maxBy(activeRollCalls, ({ value }) => value.createdAt);
};

const isOpenRollCall = (source) => {
    // キーは何でもいいので、適当なキーを指定している。
    const r = getOpenRollCall({ key: source });
    return r != null;
};

const serverTransform$2 = ({ requestedBy, }) => ({ stateBeforeServerOperation, serverOperation, clientOperation }) => {
    const isAdmin = requestedBy.type === admin;
    if (!isAdmin) {
        return result.Result.ok(undefined);
    }
    const twoWayOperation = { $v: 1, $r: 1 };
    twoWayOperation.answeredAt = serverTransform$n({
        first: serverOperation?.answeredAt,
        second: clientOperation.answeredAt,
        prevState: stateBeforeServerOperation.answeredAt,
    });
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok(twoWayOperation);
};

const serverTransform$1 = ({ requestedBy, }) => ({ stateBeforeServerOperation, stateAfterServerOperation, clientOperation, serverOperation, }) => {
    const isOpenRollCallValue = isOpenRollCall(stateAfterServerOperation);
    const isAdmin = requestedBy.type === admin;
    const participants = serverTransform$o({
        stateBeforeFirst: stateBeforeServerOperation.participants ?? {},
        stateAfterFirst: stateAfterServerOperation.participants ?? {},
        first: serverOperation?.participants,
        second: clientOperation.participants,
        innerTransform: ({ prevState, nextState, first, second }) => serverTransform$2({
            requestedBy,
        })({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: {
            // Master および Player は自分の userUid であれば追加できる。
            // Spectator は Operate Mutation を実行しても無視されるため、Spectator を弾く処理は必要ない。
            cancelCreate: ({ key }) => !(isOpenRollCallValue && isAuthorized({ requestedBy, participantId: key })),
            cancelRemove: () => !isAdmin,
        },
    });
    if (participants.isError) {
        return participants;
    }
    const twoWayOperation = {
        $v: 1,
        $r: 1,
        participants: participants.value,
    };
    if (isAdmin) {
        twoWayOperation.closeStatus = serverTransform$n({
            first: serverOperation?.closeStatus,
            second: clientOperation.closeStatus,
            prevState: stateBeforeServerOperation.closeStatus,
        });
        twoWayOperation.createdAt = serverTransform$n({
            first: serverOperation?.createdAt,
            second: clientOperation.createdAt,
            prevState: stateBeforeServerOperation.createdAt,
        });
        twoWayOperation.createdBy = serverTransform$n({
            first: serverOperation?.createdBy,
            second: clientOperation.createdBy,
            prevState: stateBeforeServerOperation.createdBy,
        });
    }
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok(twoWayOperation);
};

const oneToTenArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
/**
 * Stateから、指定されたユーザーが閲覧できないデータを取り除いた新しいStateを返す。
 * @param requestedBy 生成されたStateを渡すユーザーの種類。権限を確認するために用いられる。
 */
const toClientState = (requestedBy) => (source) => {
    return {
        ...source,
        bgms: toClientState$i({
            serverState: source.bgms,
            isPrivate: () => false,
            toClientState: ({ state }) => toClientState$h(state),
        }),
        boolParamNames: toClientState$i({
            serverState: source.boolParamNames,
            isPrivate: () => false,
            toClientState: ({ state }) => toClientState$2(state),
        }),
        boards: toClientState$i({
            serverState: source.boards,
            isPrivate: (_, boardId) => !isBoardVisible({
                boardId,
                requestedBy,
                currentRoomState: source,
            }),
            toClientState: ({ state }) => toClientState$b(requestedBy, source)(state),
        }),
        characters: toClientState$i({
            serverState: source.characters,
            isPrivate: state => !isOwner({
                requestedBy,
                ownerParticipantId: state.ownerParticipantId ?? anyValue,
            }) && state.isPrivate,
            toClientState: ({ state }) => toClientState$4(isOwner({
                requestedBy,
                ownerParticipantId: state.ownerParticipantId ?? anyValue,
            }), requestedBy, source)(state),
        }),
        memos: toClientState$i({
            serverState: source.memos,
            isPrivate: () => false,
            toClientState: ({ state }) => toClientState$3(state),
        }),
        numParamNames: toClientState$i({
            serverState: source.numParamNames,
            isPrivate: () => false,
            toClientState: ({ state }) => toClientState$2(state),
        }),
        participants: toClientState$i({
            serverState: source.participants,
            isPrivate: () => false,
            toClientState: ({ state }) => toClientState$1(state),
        }),
        strParamNames: toClientState$i({
            serverState: source.strParamNames,
            isPrivate: () => false,
            toClientState: ({ state }) => toClientState$2(state),
        }),
    };
};
/**
 * クライアントによる変更の要求を表すOperationを受け取り、APIサーバーのStateに対してapplyできる状態のOperationに変換して返す。変換処理では、主に次の2つが行われる。
 * - クライアントから受け取ったOperationのうち、不正なもの（例: そのユーザーが本来削除できないはずのキャラクターを削除しようとする）があった場合に、取り除くか拒否してエラーを返す
 * - 編集競合が発生している場合は解決する
 *
 * @param requestedBy 変更を要求したユーザーの種類。権限を確認するために用いられる。
 * @param stateBeforeServerOperation クライアントがStateを変更しようとしたときに用いられたState。
 * @param stateAfterServerOperation APIサーバーにおける実際の最新のState。
 * @param serverOperation `stateBeforeServerOperation`と`stateAfterServerOperation`のDiff。`stateBeforeServerOperation`と`stateAfterServerOperation`が等しい場合はundefined。
 * @param clientOperation クライアントが要求している変更。
 * @returns `stateAfterServerOperation`に対してapplyできる状態のOperation。
 */
const serverTransform = (requestedBy) => ({ stateBeforeServerOperation, stateAfterServerOperation, clientOperation, serverOperation, }) => {
    switch (requestedBy.type) {
        case restrict:
            // エラーを返すべきかもしれない
            return result.Result.ok(undefined);
        case client: {
            const me = (stateAfterServerOperation.participants ?? {})[requestedBy.userUid];
            if (me == null || me.role == null || me.role === Spectator) {
                // エラーを返すべきかもしれない
                return result.Result.ok(undefined);
            }
            break;
        }
    }
    const isAdmin = requestedBy.type === admin;
    const bgms = serverTransform$o({
        stateBeforeFirst: stateBeforeServerOperation.bgms ?? {},
        stateAfterFirst: stateAfterServerOperation.bgms ?? {},
        first: serverOperation?.bgms,
        second: clientOperation.bgms,
        innerTransform: ({ prevState, nextState, first, second }) => serverTransform$m({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: {
            cancelCreate: ({ key }) => !isStrIndex5(key),
        },
    });
    if (bgms.isError) {
        return bgms;
    }
    const boolParamNames = serverTransform$o({
        stateBeforeFirst: stateBeforeServerOperation.boolParamNames ?? {},
        stateAfterFirst: stateAfterServerOperation.boolParamNames ?? {},
        first: serverOperation?.boolParamNames,
        second: clientOperation.boolParamNames,
        innerTransform: ({ prevState, nextState, first, second }) => serverTransform$4({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: {
            cancelCreate: ({ key }) => !isStrIndex20(key),
        },
    });
    if (boolParamNames.isError) {
        return boolParamNames;
    }
    const boards = serverTransform$o({
        first: serverOperation?.boards,
        second: clientOperation.boards,
        stateBeforeFirst: stateBeforeServerOperation.boards ?? {},
        stateAfterFirst: stateAfterServerOperation.boards ?? {},
        innerTransform: ({ first, second, prevState, nextState }) => serverTransform$d(requestedBy, stateAfterServerOperation)({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: {
            cancelCreate: ({ newState }) => !isOwner({
                requestedBy,
                ownerParticipantId: newState.ownerParticipantId ?? none,
            }),
            cancelUpdate: ({ key }) => {
                return !isBoardVisible({
                    boardId: key,
                    currentRoomState: stateAfterServerOperation,
                    requestedBy,
                });
            },
            cancelRemove: ({ state }) => !isOwner({
                requestedBy,
                ownerParticipantId: state.ownerParticipantId ?? anyValue,
            }),
        },
    });
    if (boards.isError) {
        return boards;
    }
    const characters = serverTransform$o({
        first: serverOperation?.characters,
        second: clientOperation.characters,
        stateBeforeFirst: stateBeforeServerOperation.characters ?? {},
        stateAfterFirst: stateAfterServerOperation.characters ?? {},
        innerTransform: ({ first, second, prevState, nextState }) => serverTransform$6(isOwner({
            requestedBy,
            ownerParticipantId: nextState.ownerParticipantId ?? anyValue,
        }), requestedBy, stateAfterServerOperation)({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: {
            cancelCreate: ({ newState }) => !isOwner({
                requestedBy,
                ownerParticipantId: newState.ownerParticipantId ?? none,
            }),
            cancelUpdate: ({ nextState }) => !isOwner({
                requestedBy,
                ownerParticipantId: nextState.ownerParticipantId ?? anyValue,
            }) && nextState.isPrivate,
            cancelRemove: ({ state }) => !isOwner({
                requestedBy,
                ownerParticipantId: state.ownerParticipantId ?? anyValue,
            }) && state.isPrivate,
        },
    });
    if (characters.isError) {
        return characters;
    }
    // TODO: ファイルサイズが巨大になりそうなときに拒否する機能
    const memos = serverTransform$o({
        stateBeforeFirst: stateBeforeServerOperation.memos ?? {},
        stateAfterFirst: stateAfterServerOperation.memos ?? {},
        first: serverOperation?.memos,
        second: clientOperation.memos,
        innerTransform: ({ prevState, nextState, first, second }) => serverTransform$5({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: {},
    });
    if (memos.isError) {
        return memos;
    }
    const numParamNames = serverTransform$o({
        stateBeforeFirst: stateBeforeServerOperation.numParamNames ?? {},
        stateAfterFirst: stateAfterServerOperation.numParamNames ?? {},
        first: serverOperation?.numParamNames,
        second: clientOperation.numParamNames,
        innerTransform: ({ prevState, nextState, first, second }) => serverTransform$4({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: {
            cancelCreate: ({ key }) => !isStrIndex20(key),
        },
    });
    if (numParamNames.isError) {
        return numParamNames;
    }
    const strParamNames = serverTransform$o({
        stateBeforeFirst: stateBeforeServerOperation.strParamNames ?? {},
        stateAfterFirst: stateAfterServerOperation.strParamNames ?? {},
        first: serverOperation?.strParamNames,
        second: clientOperation.strParamNames,
        innerTransform: ({ prevState, nextState, first, second }) => serverTransform$4({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: {
            cancelCreate: ({ key }) => !isStrIndex20(key),
        },
    });
    if (strParamNames.isError) {
        return strParamNames;
    }
    const participants = serverTransform$o({
        stateBeforeFirst: stateBeforeServerOperation.participants ?? {},
        stateAfterFirst: stateAfterServerOperation.participants ?? {},
        first: serverOperation?.participants,
        second: clientOperation.participants,
        innerTransform: ({ prevState, nextState, first, second, key }) => serverTransform$3({
            requestedBy,
            participantKey: key,
        })({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: {},
    });
    if (participants.isError) {
        return participants;
    }
    const hasNoOpenRollCall = getOpenRollCall(stateAfterServerOperation.rollCalls ?? {}) == null;
    const rollCalls = serverTransform$o({
        stateBeforeFirst: stateBeforeServerOperation.rollCalls ?? {},
        stateAfterFirst: stateAfterServerOperation.rollCalls ?? {},
        first: serverOperation?.rollCalls,
        second: clientOperation.rollCalls,
        innerTransform: ({ prevState, nextState, first, second }) => serverTransform$1({
            requestedBy,
        })({
            stateBeforeServerOperation: prevState,
            stateAfterServerOperation: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: {
            cancelCreate: () => !(isAdmin && hasNoOpenRollCall),
            cancelRemove: () => !(isAdmin && hasNoOpenRollCall),
        },
    });
    if (rollCalls.isError) {
        return rollCalls;
    }
    const twoWayOperation = {
        $v: 2,
        $r: 1,
        bgms: bgms.value,
        boards: boards.value,
        characters: characters.value,
        boolParamNames: boolParamNames.value,
        memos: memos.value,
        numParamNames: numParamNames.value,
        strParamNames: strParamNames.value,
        participants: participants.value,
        rollCalls: rollCalls.value,
    };
    // activeBoardIdには、自分が作成したBoardしか設定できない。ただし、nullishにするのは誰でもできる。
    if (clientOperation.activeBoardId != null) {
        if (clientOperation.activeBoardId.newValue == null ||
            isBoardOwner({
                requestedBy,
                boardId: clientOperation.activeBoardId.newValue,
                currentRoomState: stateAfterServerOperation,
            }) === true) {
            twoWayOperation.activeBoardId = serverTransform$n({
                first: serverOperation?.activeBoardId,
                second: clientOperation.activeBoardId,
                prevState: stateBeforeServerOperation.activeBoardId,
            });
        }
    }
    const name = serverTransform$r({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: stateBeforeServerOperation.name,
    });
    if (name.isError) {
        return name;
    }
    twoWayOperation.name = name.value;
    for (const i of oneToTenArray) {
        const key = `characterTag${i}Name`;
        const transformed = serverTransform$q({
            first: serverOperation?.[key],
            second: clientOperation[key],
            prevState: stateBeforeServerOperation[key],
        });
        if (transformed.isError) {
            return transformed;
        }
        twoWayOperation[key] = transformed.value;
    }
    for (const i of oneToTenArray) {
        const key = `publicChannel${i}Name`;
        const transformed = serverTransform$r({
            first: serverOperation?.[key],
            second: clientOperation[key],
            prevState: stateBeforeServerOperation[key],
        });
        if (transformed.isError) {
            return transformed;
        }
        twoWayOperation[key] = transformed.value;
    }
    if (isIdRecord(twoWayOperation)) {
        return result.Result.ok(undefined);
    }
    return result.Result.ok(twoWayOperation);
};

const template$a = createObjectValueTemplate({
    isPaused: createReplaceValueTemplate(zod.z.boolean()),
    files: createReplaceValueTemplate(zod.z.array(filePathValue)),
    volume: createReplaceValueTemplate(zod.z.number()),
}, 1, 1);

const template$9 = createObjectValueTemplate({
    ...templateValue,
    ownerParticipantId: createReplaceValueTemplate(maybe(zod.z.string())),
    image: createReplaceValueTemplate(maybe(filePathValue)),
    isPrivate: createReplaceValueTemplate(zod.z.boolean()),
}, 2, 1);

const path = 'path';
const $path = zod.z.object({
    type: zod.z.literal(path),
    // SVG pathのdと同様の値
    data: zod.z.string(),
});
const shape = $path;

const template$8 = createObjectValueTemplate({
    shape: createReplaceValueTemplate(shape),
    fill: createReplaceValueTemplate(maybe(zod.z.string())),
    stroke: createReplaceValueTemplate(maybe(zod.z.string())),
    strokeWidth: createReplaceValueTemplate(maybe(zod.z.number())),
}, 1, 1);

const template$7 = createObjectValueTemplate({
    ...templateValue,
    ownerParticipantId: createReplaceValueTemplate(zod.z.string().optional()),
    isPrivate: createReplaceValueTemplate(zod.z.boolean()),
    /**
     * keyは`'1'`から`'9'`の9個のみをサポートしています。詳細は`./functions.ts`を参照してください。
     *
     * ShapeのPath.dataは、widthとheightがともに100pxの正方形として記述します。コマなどの大きさに応じて自動的にscaleされます。
     * */
    shapes: createRecordValueTemplate(template$8),
}, 1, 1);

const String = 'String';
const Number = 'Number';
const valueInputType = zod.z.union([zod.z.literal(String), zod.z.literal(Number)]);
const template$6 = createObjectValueTemplate({
    ...templateValue,
    ownerCharacterId: createReplaceValueTemplate(maybe(zod.z.string())),
    isValuePrivate: createReplaceValueTemplate(zod.z.boolean()),
    value: createTextValueTemplate(false),
    valueInputType: createReplaceValueTemplate(maybe(valueInputType)),
}, 2, 1);

const template$5 = createObjectValueTemplate({
    backgroundImage: createReplaceValueTemplate(maybe(filePathValue)),
    backgroundImageZoom: createReplaceValueTemplate(zod.z.number()),
    cellColumnCount: createReplaceValueTemplate(zod.z.number()),
    cellHeight: createReplaceValueTemplate(zod.z.number()),
    cellOffsetX: createReplaceValueTemplate(zod.z.number()),
    cellOffsetY: createReplaceValueTemplate(zod.z.number()),
    cellRowCount: createReplaceValueTemplate(zod.z.number()),
    cellWidth: createReplaceValueTemplate(zod.z.number()),
    name: createTextValueTemplate(false),
    ownerParticipantId: createReplaceValueTemplate(maybe(zod.z.string())),
    dicePieces: createRecordValueTemplate(template$j),
    imagePieces: createRecordValueTemplate(template$9),
    shapePieces: createRecordValueTemplate(template$7),
    stringPieces: createRecordValueTemplate(template$6),
}, 2, 1);

const Plain = 'Plain';
const Markdown = 'Markdown';
/**
 * @description To 3rd-party developers: Please always set 'Plain' to this because 'Markdown' is not implemented yet in the official web-server.
 */
const textType = zod.z.union([zod.z.literal(Plain), zod.z.literal(Markdown)]);
// メモのパスは、/を区切りとして例えば グループ1/グループ2/メモ であれば dir=['グループ1', 'グループ2'], name='メモ' とする。
const template$4 = createObjectValueTemplate({
    name: createTextValueTemplate(false),
    dir: createReplaceValueTemplate(zod.z.array(zod.z.string())),
    text: createTextValueTemplate(false),
    /**
     * @description To 3rd-party developers: Please always set 'Plain' to this because 'Markdown' is not implemented yet in the official web-server.
     */
    textType: createReplaceValueTemplate(textType),
}, 1, 1);

const template$3 = createObjectValueTemplate({
    name: createTextValueTemplate(false),
}, 1, 1);

const template$2 = createObjectValueTemplate({
    /** 点呼に返事したかどうか。`number` の場合は返事をしたことを表し、値は返事した日時となります。 `undefined` の場合は返事をしていないことを表します。`number` から `undefined` に戻すことで返事を撤回することもできます。また、`number` から `number` に変更することで、返事をした時間を更新することもできます。 */
    answeredAt: createReplaceValueTemplate(zod.z.number().optional()),
}, 1, 1);

// # 点呼機能と投票機能(未実装)の違いに関する考察
//
// 点呼機能は投票機能(複数の選択肢があってそこから選ぶ機能)も兼ねようと考えたが、次の点が異なるため、もし投票機能を実装する場合は分けたほうがいいと結論付けた。
// - 投票機能は、何らかのアクションの許可と関連付ける可能性がある。例えば、GMを変更する、デッキの内容を変更していいか確認をとるなど。対して点呼はそのような機能は必要なさそう。
// - 投票機能は、締め切られるまで他の人がどちらに投票したかわからないようにすると理想的(必須ではない)。対して点呼はそのような必要がない。
// - 点呼は全員が返事するかどうかが最も大事。投票はその限りではなく、もし多数決であれば無投票があっても問題ない。
// - 投票は複数が同時進行しても構わないが、点呼は基本的に1つまで。
const closeReason = zod.z.object({
    closedBy: zod.z.string(),
    /**
     * ユーザーが明示的に点呼を終了させたときは `Closed`。
     *
     * 現時点では `Closed` のみに対応していますが、将来、他の点呼が開始されたため自動終了したときの値として `Replaced` が追加される可能性があります。
     */
    reason: zod.z.literal('Closed'),
});
const soundEffect = zod.z.object({
    file: filePathValue,
    volume: zod.z.number(),
});
/** 点呼の状況。 */
const template$1 = createObjectValueTemplate({
    createdAt: createReplaceValueTemplate(zod.z.number()),
    // Participant ID
    createdBy: createReplaceValueTemplate(zod.z.string()),
    /**
     * 締め切られたかどうか。nullish ならば締め切られていないことを表します。原則として、締め切られていない点呼は、最大で1つまでしか存在できません。
     *
     * 締め切られていない場合、参加者は誰でも締め切ることができます(ただし、締め切るには GraphQL の Mutation から実行する必要があります)。すでに締め切られている場合は、再開させることはできません。
     */
    closeStatus: createReplaceValueTemplate(closeReason.optional()),
    /**
     * 各ユーザーの点呼の状況です。keyはParticipantのIDです。
     *
     * 原則として、`Spectator` もしくは存在しない Participant を追加すること、値を削除すること、すでに締め切られている場合に値を追加および変更することはできません。
     *
     * この Record に存在しない `Player` や `Master` も点呼に参加できます。
     */
    participants: createRecordValueTemplate(template$2),
    // このプロパティを実装せず、代わりにクライアント側で点呼開始と同時に通常時の SE 機能から流す案は、次の理由で却下した。もし点呼開始の mutation 実行開始と同時に流す場合は、点呼開始に失敗したときにも SE が流れてしまう。mutation の応答を待って成功していたときのみ流す場合は、点呼開始直後にブラウザを閉じたりしたときに SE が流れないという問題点がある。
    /** 点呼開始時に流す SE。 */
    soundEffect: createReplaceValueTemplate(soundEffect.optional()),
}, 1, 1);

const templateBase = {
    activeBoardId: createReplaceValueTemplate(maybe(zod.z.string())),
    bgms: createRecordValueTemplate(template$a),
    boolParamNames: createRecordValueTemplate(template$3),
    boards: createRecordValueTemplate(template$5),
    characters: createRecordValueTemplate(template$c),
    characterTag1Name: createTextValueTemplate(true),
    characterTag2Name: createTextValueTemplate(true),
    characterTag3Name: createTextValueTemplate(true),
    characterTag4Name: createTextValueTemplate(true),
    characterTag5Name: createTextValueTemplate(true),
    characterTag6Name: createTextValueTemplate(true),
    characterTag7Name: createTextValueTemplate(true),
    characterTag8Name: createTextValueTemplate(true),
    characterTag9Name: createTextValueTemplate(true),
    characterTag10Name: createTextValueTemplate(true),
    memos: createRecordValueTemplate(template$4),
    numParamNames: createRecordValueTemplate(template$3),
    rollCalls: createRecordValueTemplate(template$1),
    publicChannel1Name: createTextValueTemplate(false),
    publicChannel2Name: createTextValueTemplate(false),
    publicChannel3Name: createTextValueTemplate(false),
    publicChannel4Name: createTextValueTemplate(false),
    publicChannel5Name: createTextValueTemplate(false),
    publicChannel6Name: createTextValueTemplate(false),
    publicChannel7Name: createTextValueTemplate(false),
    publicChannel8Name: createTextValueTemplate(false),
    publicChannel9Name: createTextValueTemplate(false),
    publicChannel10Name: createTextValueTemplate(false),
    strParamNames: createRecordValueTemplate(template$3), //keyはStrIndex20
};
const dbTemplate = createObjectValueTemplate(templateBase, 2, 1);
// nameとcreatedByはDBから頻繁に取得されると思われる値なので独立させている。
const template = createObjectValueTemplate({
    ...templateBase,
    createdBy: createReplaceValueTemplate(zod.z.string()),
    name: createTextValueTemplate(false),
    participants: createRecordValueTemplate(template$b),
}, 2, 1);

const decodeState = (source) => {
    return state(template).parse(source);
};
const parseState = (source) => {
    return decodeState(JSON.parse(source));
};
const stringifyState = (source) => {
    const result = state(template).parse(source);
    return JSON.stringify(result);
};
const decodeDbState = (source) => {
    return state(dbTemplate).parse(source);
};
const exactDbState = (source) => {
    return state(dbTemplate).parse(source);
};
const decodeUpOperation = (source) => {
    return upOperation(template).parse(source);
};
const parseUpOperation = (source) => {
    return decodeUpOperation(JSON.parse(source));
};
const stringifyUpOperation = (source) => {
    const result = upOperation(template).parse(source);
    return JSON.stringify(result);
};
const decodeDownOperation = (source) => {
    return downOperation(template).parse(source);
};
const exactDownOperation = (source) => {
    return downOperation(template).parse(source);
};

const createOperation = (version, revision, props) => zod.z
    .object(props)
    .partial()
    .merge(zod.z.object({
    $v: zod.z.literal(version),
    $r: zod.z.literal(revision),
}));

const updateType = 'update';
const createType = 'create';
const deleteType = 'delete';

const dieValueUpOperation = createOperation(1, 1, {
    dieType: zod.z.object({ newValue: dieType }),
    isValuePrivateChanged: zod.z.object({ newValue: maybe(zod.z.number()) }),
    isValueChanged: zod.z.boolean(),
});
const update$1 = zod.z
    .object({
    $v: zod.z.literal(2),
    $r: zod.z.literal(1),
    type: zod.z.literal(updateType),
})
    .and(upOperation(createObjectValueTemplate(templateValue, 2, 1)))
    .and(zod.z
    .object({
    ownerCharacterId: zod.z.object({ newValue: maybe(zod.z.string()) }),
    dice: record$1(recordUpOperationElementFactory(state(template$k), dieValueUpOperation)),
})
    .partial());
const type$1 = zod.z.union([
    zod.z.object({
        $v: zod.z.literal(2),
        $r: zod.z.literal(1),
        type: zod.z.literal(createType),
        value: state(template$j),
    }),
    zod.z.object({
        $v: zod.z.literal(2),
        $r: zod.z.literal(1),
        type: zod.z.literal(deleteType),
        value: state(template$j),
    }),
    update$1,
]);
const ofOperation$1 = (operation, currentState) => {
    const result = {
        ...toUpOperation(template$j)(operation),
        $v: 2,
        $r: 1,
        type: updateType,
        ownerCharacterId: operation.ownerCharacterId,
        dice: operation.dice == null
            ? undefined
            : utils.chooseRecord(operation.dice, (element, key) => {
                switch (element.type) {
                    case update$2: {
                        const currentDiceState = (currentState.dice ?? {})[key];
                        if (currentDiceState == null) {
                            throw new Error('this should not happen');
                        }
                        const update = {
                            $v: 1,
                            $r: 1,
                            dieType: element.update.dieType,
                            isValuePrivateChanged: element.update.isValuePrivate == null ||
                                element.update.isValuePrivate.oldValue ===
                                    element.update.isValuePrivate.newValue
                                ? undefined
                                : {
                                    newValue: element.update.isValuePrivate.newValue
                                        ? undefined
                                        : currentDiceState.value,
                                },
                            isValueChanged: element.update.value != null,
                        };
                        return {
                            type: update$2,
                            update,
                        };
                    }
                    case replace$1: {
                        const newValue = element.replace.newValue == null
                            ? undefined
                            : toClientState$g(false)(element.replace.newValue);
                        return {
                            type: replace$1,
                            replace: {
                                newValue,
                            },
                        };
                    }
                }
            }),
    };
    return type$1.parse(result);
};

const decode$1 = (source) => {
    return type$1.parse(source);
};
const parse$1 = (source) => {
    return decode$1(JSON.parse(source));
};

const update = zod.z
    .object({
    $v: zod.z.literal(2),
    $r: zod.z.literal(1),
    type: zod.z.literal(updateType),
})
    .and(upOperation(createObjectValueTemplate(templateValue, 2, 1)))
    .and(zod.z
    .object({
    ownerCharacterId: zod.z.object({ newValue: maybe(zod.z.string()) }),
    isValuePrivateChanged: zod.z.object({ newValue: maybe(zod.z.string()) }),
    isValueChanged: zod.z.boolean(),
})
    .partial());
const type = zod.z.union([
    zod.z.object({
        $v: zod.z.literal(2),
        $r: zod.z.literal(1),
        type: zod.z.literal(createType),
        value: state(template$6),
    }),
    zod.z.object({
        $v: zod.z.literal(2),
        $r: zod.z.literal(1),
        type: zod.z.literal(deleteType),
        value: state(template$6),
    }),
    update,
]);
const ofOperation = (operation, currentState) => {
    const result = {
        ...toUpOperation(template$6)(operation),
        $v: 2,
        $r: 1,
        type: updateType,
        ownerCharacterId: operation.ownerCharacterId,
        isValueChanged: operation.value != null,
        isValuePrivateChanged: operation.isValuePrivate == null ||
            operation.isValuePrivate.oldValue === operation.isValuePrivate.newValue
            ? undefined
            : {
                newValue: operation.isValuePrivate.newValue ? undefined : currentState.value,
            },
    };
    return type.parse(result);
};

const decode = (source) => {
    return type.parse(source);
};
const parse = (source) => {
    return decode(JSON.parse(source));
};

const createLogs = ({ prevState, nextState, }) => {
    const boardsDiff = diff$1({
        prevState: prevState.boards ?? {},
        nextState: nextState.boards ?? {},
        innerDiff: params => diff(template$5)(params),
    });
    if (boardsDiff == null) {
        return undefined;
    }
    const dicePieceLogs = [];
    const stringPieceLogs = [];
    utils.recordForEach(boardsDiff, (diff, boardId) => {
        if (diff.type === replace$1) {
            utils.recordForEach(diff.replace.oldValue?.dicePieces ?? {}, (value, stateId) => {
                dicePieceLogs.push({
                    boardId,
                    stateId,
                    value: {
                        $v: 2,
                        $r: 1,
                        type: deleteType,
                        value: toClientState$f({ type: restrict }, prevState)(value),
                    },
                });
            });
            utils.recordForEach(diff.replace.newValue?.dicePieces ?? {}, (value, stateId) => {
                dicePieceLogs.push({
                    boardId,
                    stateId,
                    value: {
                        $v: 2,
                        $r: 1,
                        type: createType,
                        value: toClientState$f({ type: restrict }, prevState)(value),
                    },
                });
            });
            utils.recordForEach(diff.replace.oldValue?.stringPieces ?? {}, (value, stateId) => {
                stringPieceLogs.push({
                    boardId,
                    stateId,
                    value: {
                        $v: 2,
                        $r: 1,
                        type: deleteType,
                        value: toClientState$c({ type: restrict }, prevState)(value),
                    },
                });
            });
            utils.recordForEach(diff.replace.newValue?.stringPieces ?? {}, (value, stateId) => {
                stringPieceLogs.push({
                    boardId,
                    stateId,
                    value: {
                        $v: 2,
                        $r: 1,
                        type: createType,
                        value: toClientState$c({ type: restrict }, prevState)(value),
                    },
                });
            });
            return;
        }
        const nextBoard = (nextState.boards ?? {})[boardId];
        if (nextBoard == null) {
            throw new Error('this should not happen. Board.diff has some bugs?');
        }
        utils.recordForEach(diff.update.dicePieces ?? {}, (operation, stateId) => {
            if (operation.type === replace$1) {
                if (operation.replace.oldValue != null) {
                    dicePieceLogs.push({
                        boardId,
                        stateId,
                        value: {
                            $v: 2,
                            $r: 1,
                            type: deleteType,
                            value: toClientState$f({ type: restrict }, prevState)(operation.replace.oldValue),
                        },
                    });
                }
                if (operation.replace.newValue != null) {
                    dicePieceLogs.push({
                        boardId,
                        stateId,
                        value: {
                            $v: 2,
                            $r: 1,
                            type: createType,
                            value: toClientState$f({ type: restrict }, prevState)(operation.replace.newValue),
                        },
                    });
                }
                return;
            }
            const nextDicePiece = (nextBoard.dicePieces ?? {})[stateId];
            if (nextDicePiece == null) {
                throw new Error('this should not happen');
            }
            dicePieceLogs.push({
                boardId,
                stateId,
                value: ofOperation$1(operation.update, nextDicePiece),
            });
        });
        utils.recordForEach(diff.update.stringPieces ?? {}, (operation, stateId) => {
            if (operation.type === replace$1) {
                if (operation.replace.oldValue != null) {
                    stringPieceLogs.push({
                        boardId,
                        stateId,
                        value: {
                            $v: 2,
                            $r: 1,
                            type: deleteType,
                            value: toClientState$c({ type: restrict }, prevState)(operation.replace.oldValue),
                        },
                    });
                }
                if (operation.replace.newValue != null) {
                    stringPieceLogs.push({
                        boardId,
                        stateId,
                        value: {
                            $v: 2,
                            $r: 1,
                            type: createType,
                            value: toClientState$c({ type: restrict }, prevState)(operation.replace.newValue),
                        },
                    });
                }
                return;
            }
            const nextStringPiece = (nextBoard.stringPieces ?? {})[stateId];
            if (nextStringPiece == null) {
                throw new Error('this should not happen');
            }
            stringPieceLogs.push({
                boardId,
                stateId,
                value: ofOperation(operation.update, nextStringPiece),
            });
        });
    });
    return {
        dicePieceLogs,
        stringPieceLogs,
    };
};

exports.$free = $free;
exports.$index = $index;
exports.$r = $r;
exports.$system = $system;
exports.$v = $v;
exports.Default = Default;
exports.FirebaseStorage = FirebaseStorage;
exports.Markdown = Markdown;
exports.Master = Master;
exports.Number = Number;
exports.OtError = OtError;
exports.Plain = Plain;
exports.Player = Player;
exports.Spectator = Spectator;
exports.String = String;
exports.Uploader = Uploader;
exports.admin = admin;
exports.analyze = analyze;
exports.anonymous = anonymous;
exports.apply = apply$1;
exports.applyBack = applyBack;
exports.applyNullableText = apply$4;
exports.applyText = apply$5;
exports.arrayToIndexObjects = arrayToIndexObjects;
exports.atomic = atomic;
exports.authToken = authToken;
exports.bgmTemplate = template$a;
exports.boardPositionTemplate = template$m;
exports.boardTemplate = template$5;
exports.boolParamTemplate = template$i;
exports.characterPieceTemplate = template$h;
exports.characterTemplate = template$c;
exports.client = client;
exports.clientTransform = clientTransform$1;
exports.commandTemplate = template$g;
exports.composeDownOperation = composeDownOperation;
exports.createLogs = createLogs;
exports.createObjectValueTemplate = createObjectValueTemplate;
exports.createParamRecordValueTemplate = createParamRecordValueTemplate;
exports.createRecordValueTemplate = createRecordValueTemplate;
exports.createReplaceValueTemplate = createReplaceValueTemplate;
exports.createTextValueTemplate = createTextValueTemplate;
exports.createType = createType;
exports.decodeDbState = decodeDbState;
exports.decodeDicePiece = decode$1;
exports.decodeDownOperation = decodeDownOperation;
exports.decodeStringPiece = decode;
exports.deleteType = deleteType;
exports.dicePieceLog = type$1;
exports.dicePieceStrIndexes = dicePieceStrIndexes;
exports.dicePieceTemplate = template$j;
exports.dieValueTemplate = template$k;
exports.diff = diff;
exports.downOperation = downOperation;
exports.exactDbState = exactDbState;
exports.exactDownOperation = exactDownOperation;
exports.execCharacterCommand = execCharacterCommand;
exports.expr1 = expr1;
exports.fakeFirebaseConfig1 = fakeFirebaseConfig1;
exports.fakeFirebaseConfig2 = fakeFirebaseConfig2;
exports.filePathTemplate = filePathTemplate;
exports.firebaseConfig = firebaseConfig;
exports.forceMaxLength100String = forceMaxLength100String;
exports.generateChatPalette = generateChatPalette;
exports.getOpenRollCall = getOpenRollCall;
exports.getVariableFromVarTomlObject = getVariableFromVarTomlObject;
exports.imagePieceTemplate = template$9;
exports.indexObjectsToArray = indexObjectsToArray;
exports.isBoardOwner = isBoardOwner;
exports.isCharacterOwner = isCharacterOwner;
exports.isIdRecord = isIdRecord;
exports.isOpenRollCall = isOpenRollCall;
exports.isOwner = isOwner;
exports.isStrIndex10 = isStrIndex10;
exports.isStrIndex100 = isStrIndex100;
exports.isStrIndex20 = isStrIndex20;
exports.isStrIndex5 = isStrIndex5;
exports.isValidVarToml = isValidVarToml;
exports.joinPath = joinPath;
exports.maxLength100String = maxLength100String;
exports.maybe = maybe;
exports.memoTemplate = template$4;
exports.nullableTextDiff = diff$3;
exports.numParamTemplate = template$f;
exports.object = object;
exports.ot = ot;
exports.paramNameTemplate = template$3;
exports.paramRecord = paramRecord;
exports.parseDicePiece = parse$1;
exports.parseState = parseState;
exports.parseStringPiece = parse;
exports.parseToml = parseToml;
exports.parseUpOperation = parseUpOperation;
exports.participantTemplate = template$b;
exports.path = path;
exports.pieceTemplate = template$l;
exports.plain = plain;
exports.portraitPieceTemplate = template$e;
exports.record = record;
exports.replace = replace$1;
exports.restore = restore;
exports.restrict = restrict;
exports.roomDbTemplate = dbTemplate;
exports.roomTemplate = template;
exports.sanitizeFilename = sanitizeFilename;
exports.sanitizeFoldername = sanitizeFoldername;
exports.serverTransform = serverTransform;
exports.shape = shape;
exports.shapePieceTemplate = template$7;
exports.shapeTemplate = template$8;
exports.simpleId = simpleId;
exports.state = state;
exports.strIndex100Array = strIndex100Array;
exports.strIndex10Array = strIndex10Array;
exports.strIndex20Array = strIndex20Array;
exports.strIndex5Array = strIndex5Array;
exports.strParamTemplate = template$d;
exports.stringPieceLog = type;
exports.stringPieceTemplate = template$6;
exports.stringifyState = stringifyState;
exports.stringifyUpOperation = stringifyUpOperation;
exports.testCommand = testCommand;
exports.textDiff = diff$4;
exports.toClientState = toClientState;
exports.toDownOperation = toDownOperation;
exports.toNullableTextUpOperation = toUpOperation$1;
exports.toOtError = toOtError;
exports.toTextUpOperation = toUpOperation$2;
exports.toUpOperation = toUpOperation;
exports.trySanitizePath = trySanitizePath;
exports.upOperation = upOperation;
exports.update = update$2;
exports.updateType = updateType;
//# sourceMappingURL=index.js.map
