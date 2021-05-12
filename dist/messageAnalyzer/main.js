"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyze = exports.chara = exports.listAvailableGameSystems = void 0;
const bcdice_1 = require("bcdice");
const expression_1 = require("../@shared/expression");
const flocommand_1 = require("../@shared/flocommand");
const Result_1 = require("../@shared/Result");
const RoomParameterNameType_1 = require("../enums/RoomParameterNameType");
const mikro_orm_1 = require("../graphql+mikro-orm/entities/room/character/boolParam/mikro-orm");
const mikro_orm_2 = require("../graphql+mikro-orm/entities/room/character/numParam/mikro-orm");
const mikro_orm_3 = require("../graphql+mikro-orm/entities/room/character/strParam/mikro-orm");
const mikro_orm_4 = require("../graphql+mikro-orm/entities/room/paramName/mikro-orm");
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
exports.chara = 'chara';
const getParameter = async ({ em, parameterPath, context, room }) => {
    if (parameterPath.length === 0) {
        throw new Error('parameterPath.length === 0');
    }
    const parameter = parameterPath[0];
    const privateVarValue = await (async () => {
        var _a;
        if ((context === null || context === void 0 ? void 0 : context.type) !== exports.chara) {
            return null;
        }
        if (context.value.privateVarToml.trim() === '') {
            return null;
        }
        const result = flocommand_1.TOML.variable(context.value.privateVarToml, parameterPath);
        if (result.isError) {
            return null;
        }
        return (_a = result.value) !== null && _a !== void 0 ? _a : null;
    })();
    if (privateVarValue != null && typeof privateVarValue !== 'object') {
        return Result_1.ResultModule.ok({ value: privateVarValue, stringValue: privateVarValue.toString() });
    }
    const paramNameValue = await (async () => {
        var _a, _b, _c, _d;
        if (parameterPath.length >= 2) {
            return null;
        }
        if ((context === null || context === void 0 ? void 0 : context.type) !== exports.chara) {
            return null;
        }
        const paramNames = await em.find(mikro_orm_4.ParamName, { room: room.id, name: parameter }, { limit: 2 });
        if (paramNames.length === 0) {
            return null;
        }
        if (paramNames.length !== 1) {
            return Result_1.ResultModule.error(`"${parameter}"という名前のパラメーターが複数存在します。パラメーターの名前を変えることを検討してください`);
        }
        const paramName = paramNames[0];
        let paramValue;
        switch (paramName.type) {
            case RoomParameterNameType_1.RoomParameterNameType.Str:
                paramValue = (_a = (await em.findOne(mikro_orm_3.StrParam, { chara: context.value.id, key: paramNames[0].key }))) === null || _a === void 0 ? void 0 : _a.value;
                break;
            case RoomParameterNameType_1.RoomParameterNameType.Num:
                paramValue = (_b = (await em.findOne(mikro_orm_2.NumParam, { chara: context.value.id, key: paramNames[0].key }))) === null || _b === void 0 ? void 0 : _b.value;
                break;
            case RoomParameterNameType_1.RoomParameterNameType.Bool:
                paramValue = (_c = (await em.findOne(mikro_orm_1.BoolParam, { chara: context.value.id, key: paramNames[0].key }))) === null || _c === void 0 ? void 0 : _c.value;
                break;
        }
        return Result_1.ResultModule.ok({
            stringValue: (_d = paramValue === null || paramValue === void 0 ? void 0 : paramValue.toString()) !== null && _d !== void 0 ? _d : '',
            value: paramValue,
        });
    })();
    if (paramNameValue != null) {
        return paramNameValue;
    }
    return null;
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
