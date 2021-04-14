"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyze = exports.command = exports.plain = exports.listAvailableGameSystems = void 0;
const bcdice_1 = require("bcdice");
const expression_1 = require("../@shared/expression");
const RoomParameterNameType_1 = require("../enums/RoomParameterNameType");
const mikro_orm_1 = require("../graphql+mikro-orm/entities/room/character/numParam/mikro-orm");
const mikro_orm_2 = require("../graphql+mikro-orm/entities/room/paramName/mikro-orm");
const loader = new bcdice_1.DynamicLoader();
const listAvailableGameSystems = () => {
    return loader.listAvailableGameSystems();
};
exports.listAvailableGameSystems = listAvailableGameSystems;
const roll = async (text, gameType) => {
    const gameSystemInfo = exports.listAvailableGameSystems().find(info => info.id === gameType);
    if (gameSystemInfo == null) {
        return null;
    }
    const gameSystem = await loader.dynamicLoad(gameSystemInfo.id);
    return gameSystem.eval(text);
};
exports.plain = 'plain';
exports.command = 'command';
const getParameter = async ({ em, parameter, chara, room }) => {
    var _a, _b;
    if (chara == null) {
        return {
            text: 'キャラクターが指定されていないため、数値パラメーターを取得できませんでした',
            number: null,
        };
    }
    const paramNames = await em.find(mikro_orm_2.ParamName, { room: room.id, name: parameter.parameter, type: RoomParameterNameType_1.RoomParameterNameType.Num }, { limit: 2 });
    if (paramNames.length === 0) {
        return {
            text: `"${parameter.parameter}"という名前の数値パラメーターが見つかりませんでした`,
            number: null,
        };
    }
    if (paramNames.length !== 1) {
        return {
            text: `"${parameter.parameter}"という名前の数値パラメーターが複数存在します。パラメーターの名前を変えることを検討してください`,
            number: null,
        };
    }
    const numParam = await em.findOne(mikro_orm_1.NumParam, { chara: chara.id, key: paramNames[0].key });
    return {
        text: `{${parameter.parameter}} → ${(_a = numParam === null || numParam === void 0 ? void 0 : numParam.value) !== null && _a !== void 0 ? _a : 0}`,
        number: (_b = numParam === null || numParam === void 0 ? void 0 : numParam.value) !== null && _b !== void 0 ? _b : 0,
    };
};
const sum = (dice) => {
    let sum = 0;
    dice.rands.forEach(rnd => {
        const result = rnd[0];
        if (result == null) {
            return;
        }
        sum += result;
    });
    return sum;
};
const toHanAscii = (source) => {
    return source.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
};
const getDiceOrNumber = async ({ text, gameType }) => {
    const hankakuText = toHanAscii(text);
    const result = await roll(hankakuText, gameType);
    if (result != null) {
        return { text: result.text, number: sum(result), bcdice: result };
    }
    const number = Number(hankakuText);
    if (isNaN(number) || !isFinite(number)) {
        return null;
    }
    return { text: number.toString(), number, bcdice: null };
};
const getParameterOrDiceOrNumber = async (params) => {
    if (params.value.type === expression_1.maybeDice) {
        return getDiceOrNumber({ text: params.value.command, gameType: params.gameType });
    }
    const result = await getParameter(Object.assign(Object.assign({}, params), { parameter: params.value }));
    return Object.assign(Object.assign({}, result), { bcdice: null });
};
const isSuccess = ({ success, failure }) => {
    if (success === failure) {
        return null;
    }
    return success;
};
const analyze = async (params) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const exp = expression_1.analyze(params.text);
    if ((exp === null || exp === void 0 ? void 0 : exp.isCompare) === true) {
        const left = await getParameterOrDiceOrNumber(Object.assign(Object.assign({}, params), { value: exp.left }));
        const right = await getParameterOrDiceOrNumber(Object.assign(Object.assign({}, params), { value: exp.right }));
        if (left != null && right != null) {
            if (left.number != null && right.number != null) {
                return {
                    type: exports.command,
                    result: `${left.text} ${expression_1.prettifyOperator(exp.compareOperator)} ${right.text}`,
                    isSuccess: expression_1.executeCompareOperator(left.number, right.number, exp.compareOperator),
                    isSecret: ((_b = (_a = left.bcdice) === null || _a === void 0 ? void 0 : _a.secret) !== null && _b !== void 0 ? _b : false) || ((_d = (_c = right.bcdice) === null || _c === void 0 ? void 0 : _c.secret) !== null && _d !== void 0 ? _d : false),
                };
            }
            return {
                type: exports.command,
                result: `${left.text}; ${right.text}`,
                isSuccess: null,
                isSecret: ((_f = (_e = left.bcdice) === null || _e === void 0 ? void 0 : _e.secret) !== null && _f !== void 0 ? _f : false) || ((_h = (_g = right.bcdice) === null || _g === void 0 ? void 0 : _g.secret) !== null && _h !== void 0 ? _h : false),
            };
        }
    }
    const analyzed = await getDiceOrNumber(params);
    if (analyzed == null) {
        return {
            type: exports.plain,
        };
    }
    return {
        type: exports.command,
        result: analyzed.text,
        isSuccess: analyzed.bcdice == null ? null : isSuccess(analyzed.bcdice),
        isSecret: (_k = (_j = analyzed.bcdice) === null || _j === void 0 ? void 0 : _j.secret) !== null && _k !== void 0 ? _k : false,
    };
};
exports.analyze = analyze;
