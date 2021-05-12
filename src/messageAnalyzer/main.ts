import { DynamicLoader } from 'bcdice';
import BcdiceResult from 'bcdice/ts/result';
import { __ } from '../@shared/collection';
import { analyze as analyzeToExpression, plain } from '../@shared/expression';
import { TOML } from '../@shared/flocommand';
import { Result, ResultModule } from '../@shared/Result';
import { RoomParameterNameType } from '../enums/RoomParameterNameType';
import { BoolParam } from '../graphql+mikro-orm/entities/room/character/boolParam/mikro-orm';
import { Chara } from '../graphql+mikro-orm/entities/room/character/mikro-orm';
import { NumParam } from '../graphql+mikro-orm/entities/room/character/numParam/mikro-orm';
import { StrParam } from '../graphql+mikro-orm/entities/room/character/strParam/mikro-orm';
import { Room } from '../graphql+mikro-orm/entities/room/mikro-orm';
import { ParamName } from '../graphql+mikro-orm/entities/room/paramName/mikro-orm';
import { EM } from '../utils/types';

const loader = new DynamicLoader();

export const listAvailableGameSystems = () => {
    return loader.listAvailableGameSystems();
};

const roll = async (text: string, gameType: string): Promise<BcdiceResult | null> => {
    const gameSystemInfo = listAvailableGameSystems().find(info => info.id === gameType);
    if (gameSystemInfo == null) {
        return null;
    }
    const gameSystem = await loader.dynamicLoad(gameSystemInfo.id);
    return gameSystem.eval(text);
};

export const chara = 'chara';

export type Context = {
    type: typeof chara;
    value: Chara;
}

// 全てにおいて何も見つからなかった場合、nullが返される。
const getParameter = async ({ em, parameterPath, context, room }: { em: EM; parameterPath: string[]; context: Context | null; room: Room }): Promise<Result<{ value: string | boolean | number | undefined; stringValue: string }> | null> => {
    if (parameterPath.length === 0) {
        throw new Error('parameterPath.length === 0');
    }

    const parameter = parameterPath[0];

    const privateVarValue = await (async () => {
        if (context?.type !== chara) {
            return null;
        }
        if (context.value.privateVarToml.trim() === '') {
            return null;
        }
        const result = TOML.variable(context.value.privateVarToml, parameterPath);
        if (result.isError) {
            return null;
        }
        return result.value ?? null;
    })();
    if (privateVarValue != null && typeof privateVarValue !== 'object') {
        return ResultModule.ok({ value: privateVarValue, stringValue: privateVarValue.toString() });
    }

    const paramNameValue = await (async () => {
        if (parameterPath.length >= 2) {
            return null;
        }

        if (context?.type !== chara) {
            return null;
        }

        const paramNames = await em.find(ParamName, { room: room.id, name: parameter }, { limit: 2 });
        if (paramNames.length === 0) {
            return null;
        }
        if (paramNames.length !== 1) {
            return ResultModule.error(`"${parameter}"という名前のパラメーターが複数存在します。パラメーターの名前を変えることを検討してください`);
        }
        const paramName = paramNames[0];
        let paramValue;
        switch (paramName.type) {
            case RoomParameterNameType.Str:
                paramValue = (await em.findOne(StrParam, { chara: context.value.id, key: paramNames[0].key }))?.value;
                break;
            case RoomParameterNameType.Num:
                paramValue = (await em.findOne(NumParam, { chara: context.value.id, key: paramNames[0].key }))?.value;
                break;
            case RoomParameterNameType.Bool:
                paramValue = (await em.findOne(BoolParam, { chara: context.value.id, key: paramNames[0].key }))?.value;
                break;
        }
        return ResultModule.ok({
            stringValue: paramValue?.toString() ?? '',
            value: paramValue,
        });
    })();
    if (paramNameValue != null) {
        return paramNameValue;
    }
    return null;
};

type AnalyzeResult = {
    message: string;
    diceResult: {
        result: string;
        isSecret: boolean;
        // nullの場合は、成功判定のないコマンドを表す
        isSuccess: boolean | null;
    } | null;
}

export const analyze = async (params: {
    em: EM;
    text: string;
    gameType: string;
    context: Context | null;
    room: Room;
}): Promise<Result<AnalyzeResult>> => {
    const expressions = analyzeToExpression(params.text);
    if (expressions.isError) {
        return expressions;
    }
    let message = '';
    for (const expr of expressions.value) {
        if (expr.type === plain) {
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
    return ResultModule.ok({
        message,
        diceResult: rolled == null ? null : {
            result: rolled.text,
            isSecret: rolled.secret,
            isSuccess: (rolled.success === rolled.failure) ? null : rolled.success,
        },
    });
};