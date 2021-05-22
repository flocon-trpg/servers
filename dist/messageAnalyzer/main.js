"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyze = exports.chara = exports.listAvailableGameSystems = void 0;
const bcdice_1 = require("bcdice");
const expression_1 = require("../@shared/expression");
const flocommand_1 = require("../@shared/flocommand");
const Result_1 = require("../@shared/Result");
const utils_1 = require("../@shared/utils");
const loader = new bcdice_1.DynamicLoader();
const listAvailableGameSystems = () => {
    return loader.listAvailableGameSystems();
};
exports.listAvailableGameSystems = listAvailableGameSystems;
const roll = async (text, gameType) => {
    if (text.trim() === '') {
        return null;
    }
    const gameSystemInfo = exports.listAvailableGameSystems().find(info => info.id === gameType);
    if (gameSystemInfo == null) {
        return null;
    }
    const gameSystem = await loader.dynamicLoad(gameSystemInfo.id);
    return gameSystem.eval(text);
};
exports.chara = 'chara';
const getParameter = async ({ parameterPath, context, room }) => {
    if (parameterPath.length === 0) {
        throw new Error('parameterPath.length === 0');
    }
    const parameter = parameterPath[0];
    const privateVarValue = await (async () => {
        var _a, _b, _c;
        if ((context === null || context === void 0 ? void 0 : context.type) !== exports.chara) {
            return null;
        }
        if (((_a = context.value.privateVarToml) !== null && _a !== void 0 ? _a : '').trim() === '') {
            return null;
        }
        const result = flocommand_1.TOML.variable((_b = context.value.privateVarToml) !== null && _b !== void 0 ? _b : '', parameterPath);
        if (result.isError) {
            return null;
        }
        return (_c = result.value) !== null && _c !== void 0 ? _c : null;
    })();
    if (privateVarValue != null && typeof privateVarValue !== 'object') {
        return Result_1.ResultModule.ok({ value: privateVarValue, stringValue: privateVarValue.toString() });
    }
    const paramNameValue = await (async () => {
        var _a, _b, _c, _d, _e, _f;
        if (parameterPath.length >= 2) {
            return Result_1.ResultModule.ok(undefined);
        }
        if ((context === null || context === void 0 ? void 0 : context.type) !== exports.chara) {
            return Result_1.ResultModule.ok(undefined);
        }
        const matchedBoolParams = utils_1.recordToArray(room.boolParamNames).filter(({ value }) => value.name === parameter);
        const matchedNumParams = utils_1.recordToArray(room.numParamNames).filter(({ value }) => value.name === parameter);
        const matchedStrParams = utils_1.recordToArray(room.strParamNames).filter(({ value }) => value.name === parameter);
        const totalLength = matchedBoolParams.length + matchedNumParams.length + matchedStrParams.length;
        if (totalLength >= 2) {
            return Result_1.ResultModule.error(`"${parameter}"という名前のパラメーターが複数存在します。パラメーターの名前を変えることを検討してください`);
        }
        if (matchedBoolParams.length !== 0) {
            const matched = matchedBoolParams[0];
            return Result_1.ResultModule.ok((_b = (_a = context.value.boolParams[matched.key]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : undefined);
        }
        if (matchedNumParams.length !== 0) {
            const matched = matchedNumParams[0];
            return Result_1.ResultModule.ok((_d = (_c = context.value.numParams[matched.key]) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : undefined);
        }
        if (matchedStrParams.length !== 0) {
            const matched = matchedStrParams[0];
            return Result_1.ResultModule.ok((_f = (_e = context.value.strParams[matched.key]) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : undefined);
        }
        return Result_1.ResultModule.ok(undefined);
    })();
    if (paramNameValue.isError) {
        return paramNameValue;
    }
    if (paramNameValue.value !== undefined) {
        return Result_1.ResultModule.ok({
            stringValue: paramNameValue.value.toString(),
            value: paramNameValue.value,
        });
    }
    return undefined;
};
const analyze = async (params) => {
    const expressions = expression_1.analyze(params.text);
    if (expressions.isError) {
        return expressions;
    }
    let message = '';
    for (const expr of expressions.value) {
        if (expr.type === expression_1.plain) {
            message += expr.text;
            continue;
        }
        const parameterValue = await getParameter(Object.assign(Object.assign({}, params), { parameterPath: expr.path }));
        if (parameterValue == null) {
            continue;
        }
        if (parameterValue.isError) {
            return parameterValue;
        }
        message += parameterValue.value.stringValue;
    }
    const rolled = await roll(message, params.gameType);
    return Result_1.ResultModule.ok({
        message,
        diceResult: rolled == null ? null : {
            result: rolled.text,
            isSecret: rolled.secret,
            isSuccess: (rolled.success === rolled.failure) ? null : rolled.success,
        },
    });
};
exports.analyze = analyze;
