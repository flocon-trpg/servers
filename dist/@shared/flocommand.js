"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCharacterOperation = exports.characterAction = exports.variable = exports.isValidVarToml = void 0;
const t = __importStar(require("io-ts"));
const j_toml_1 = __importDefault(require("@ltd/j-toml"));
const Result_1 = require("./Result");
const v1_1 = require("./ot/filePath/v1");
var Util;
(function (Util) {
    const imageObject = t.type({
        src: t.string,
        type: v1_1.sourceType,
    });
    Util.image = t.union([imageObject, t.string]);
    Util.toFilePath = (source) => {
        if (typeof source === 'string') {
            const replaced = source.replace(/^firebase:/, '');
            if (source === replaced) {
                return {
                    $version: 1,
                    sourceType: v1_1.Default,
                    path: replaced,
                };
            }
            return {
                $version: 1,
                sourceType: v1_1.FirebaseStorage,
                path: replaced,
            };
        }
        return {
            $version: 1,
            sourceType: source.type,
            path: source.src,
        };
    };
})(Util || (Util = {}));
var Message;
(function (Message) {
    Message.action = t.partial({
        text: t.string,
    });
})(Message || (Message = {}));
const dateTime = new t.Type('DateTime', (obj) => true, (input, context) => {
    if (input == null) {
        return t.failure(input, context);
    }
    if (typeof input.toJSON !== 'function') {
        return t.failure(input, context);
    }
    return t.success(input);
}, t.identity);
const chara = t.partial({
    name: t.string,
    icon: Util.image,
    tachie: Util.image,
    message: Message.action,
});
const characterActionElement = t.partial({
    chara,
});
const $characterAction = t.record(t.string, characterActionElement);
const exactCharacterAction = t.record(t.string, t.exact(characterActionElement));
const errorToMessage = (source) => {
    var _a, _b;
    return (_b = (_a = source[0]) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : '不明なエラーが発生しました';
};
const parse = (toml) => {
    let object;
    try {
        object = j_toml_1.default.parse(toml, 1.0, '\r\n', false);
    }
    catch (error) {
        if (typeof error === 'string') {
            return Result_1.ResultModule.error(error);
        }
        if (error instanceof Error) {
            return Result_1.ResultModule.error(error.message);
        }
        throw error;
    }
    return Result_1.ResultModule.ok(object);
};
const isValidVarToml = (toml) => {
    const parsed = parse(toml);
    if (parsed.isError) {
        return parsed;
    }
    return Result_1.ResultModule.ok(undefined);
};
exports.isValidVarToml = isValidVarToml;
const variable = (toml, path) => {
    const tomlResult = parse(toml);
    if (tomlResult.isError) {
        return tomlResult;
    }
    let current = tomlResult.value;
    for (const key of path) {
        if (typeof current !== 'object') {
            return Result_1.ResultModule.ok(undefined);
        }
        const next = current[key];
        const dateTimeValue = dateTime.decode(next);
        if (dateTimeValue._tag === 'Right') {
            return Result_1.ResultModule.ok(dateTimeValue.right);
        }
        current = current[key];
    }
    const dateTimeValue = dateTime.decode(current);
    if (dateTimeValue._tag === 'Right') {
        return Result_1.ResultModule.ok(dateTimeValue.right);
    }
    switch (typeof current) {
        case 'boolean':
        case 'number':
        case 'string':
        case 'undefined':
            return Result_1.ResultModule.ok(current);
        default:
            return Result_1.ResultModule.ok(undefined);
    }
};
exports.variable = variable;
const characterAction = (toml) => {
    const object = parse(toml);
    if (object.isError) {
        return object;
    }
    const decoded = exactCharacterAction.decode(object.value);
    if (decoded._tag === 'Left') {
        return Result_1.ResultModule.error(errorToMessage(decoded.left));
    }
    return Result_1.ResultModule.ok(decoded.right);
};
exports.characterAction = characterAction;
const toCharacterOperation = ({ action, currentState, commandKey }) => {
    const command = action.get(commandKey);
    if ((command === null || command === void 0 ? void 0 : command.chara) == null) {
        return undefined;
    }
    const result = { $version: 1 };
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
exports.toCharacterOperation = toCharacterOperation;
