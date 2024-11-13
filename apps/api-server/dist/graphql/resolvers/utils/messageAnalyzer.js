'use strict';

var FilePathModule = require('@flocon-trpg/core');
var utils = require('@flocon-trpg/utils');
var result = require('@kizahasi/result');
var bcdice = require('bcdice');

const loader = new bcdice.DynamicLoader();
const listAvailableGameSystems = () => {
    return loader.listAvailableGameSystems();
};
const helpMessage = async (gameSystemId) => {
    const gameSystem = await loader.dynamicLoad(gameSystemId);
    return gameSystem.HELP_MESSAGE;
};
const roll = async (text, gameType) => {
    if (text.trim() === '') {
        return null;
    }
    const gameSystemInfo = listAvailableGameSystems().find(info => info.id === gameType);
    if (gameSystemInfo == null) {
        return null;
    }
    const gameSystem = await loader.dynamicLoad(gameSystemInfo.id);
    return gameSystem.eval(text);
};
const chara = 'chara';
const getParameter = async ({ parameterPath, context, room, }) => {
    if (parameterPath.length === 0) {
        throw new Error('parameterPath.length === 0');
    }
    const parameter = parameterPath[0];
    const privateVarValue = await (async () => {
        if (context?.type !== chara) {
            return null;
        }
        if ((context.value.privateVarToml ?? '').trim() === '') {
            return null;
        }
        const tomlObject = FilePathModule.parseToml(context.value.privateVarToml ?? '');
        if (tomlObject.isError) {
            return null;
        }
        const result = FilePathModule.getVariableFromVarTomlObject(tomlObject.value, parameterPath);
        if (result.isError) {
            return null;
        }
        return result.value ?? null;
    })();
    if (privateVarValue != null && typeof privateVarValue !== 'object') {
        return result.Result.ok({ value: privateVarValue, stringValue: privateVarValue.toString() });
    }
    const paramNameValue = await (async () => {
        if (parameterPath.length >= 2) {
            return result.Result.ok(undefined);
        }
        if (context?.type !== chara) {
            return result.Result.ok(undefined);
        }
        const matchedBoolParams = utils.recordToArray(room.boolParamNames ?? {}).filter(({ value }) => value.name === parameter);
        const matchedNumParams = utils.recordToArray(room.numParamNames ?? {}).filter(({ value }) => value.name === parameter);
        const matchedStrParams = utils.recordToArray(room.strParamNames ?? {}).filter(({ value }) => value.name === parameter);
        const totalLength = matchedBoolParams.length + matchedNumParams.length + matchedStrParams.length;
        if (totalLength >= 2) {
            return result.Result.error(`"${parameter}"という名前のパラメーターが複数存在します。パラメーターの名前を変えることを検討してください`);
        }
        const matchedBoolParams0 = matchedBoolParams[0];
        if (matchedBoolParams0 != null) {
            return result.Result.ok(context.value.boolParams?.[matchedBoolParams0.key]?.value ?? undefined);
        }
        const matchedNumParams0 = matchedNumParams[0];
        if (matchedNumParams0 != null) {
            return result.Result.ok(context.value.numParams?.[matchedNumParams0.key]?.value ?? undefined);
        }
        const matchedStrParams0 = matchedStrParams[0];
        if (matchedStrParams0 != null) {
            return result.Result.ok(context.value.strParams?.[matchedStrParams0.key]?.value ?? undefined);
        }
        return result.Result.ok(undefined);
    })();
    if (paramNameValue.isError) {
        return paramNameValue;
    }
    if (paramNameValue.value !== undefined) {
        return result.Result.ok({
            stringValue: paramNameValue.value.toString(),
            value: paramNameValue.value,
        });
    }
    return undefined;
};
const analyze = async (params) => {
    const expressions = FilePathModule.analyze(params.text);
    if (expressions.isError) {
        return expressions;
    }
    let message = '';
    for (const expr of expressions.value) {
        if (expr.type === FilePathModule.plain) {
            message += expr.text;
            continue;
        }
        const parameterValue = await getParameter({ ...params, parameterPath: expr.path });
        if (parameterValue == null) {
            continue;
        }
        if (parameterValue.isError) {
            return parameterValue;
        }
        message += parameterValue.value.stringValue;
    }
    const rolled = await roll(message, params.gameType);
    return result.Result.ok({
        message,
        diceResult: rolled == null
            ? null
            : {
                result: rolled.text,
                isSecret: rolled.secret,
                isSuccess: rolled.success === rolled.failure ? null : rolled.success,
            },
    });
};

exports.analyze = analyze;
exports.chara = chara;
exports.helpMessage = helpMessage;
exports.listAvailableGameSystems = listAvailableGameSystems;
//# sourceMappingURL=messageAnalyzer.js.map
