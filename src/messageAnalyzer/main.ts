import { DynamicLoader } from 'bcdice';
import BcdiceResult from 'bcdice/ts/result';
import { __ } from '../@shared/collection';
import { analyze as analyzeToExpression, plain } from '../@shared/expression';
import { TOML } from '../@shared/flocommand';
import { Result, ResultModule } from '../@shared/Result';
import * as CharacterModule from '../@shared/ot/room/participant/character/v1';
import * as RoomModule from '../@shared/ot/room/v1';
import { recordToArray } from '../@shared/utils';

const loader = new DynamicLoader();

export const listAvailableGameSystems = () => {
    return loader.listAvailableGameSystems();
};

const roll = async (text: string, gameType: string): Promise<BcdiceResult | null> => {
    if (text.trim() === '') {
        // 空のメッセージを渡すとbcdiceでエラーが出るようなので弾いている
        return null;
    }

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
    value: CharacterModule.State;
}

// 全てにおいて何も見つからなかった場合、undefinedが返される。
const getParameter = async ({ parameterPath, context, room }: { parameterPath: string[]; context: Context | null; room: RoomModule.State }): Promise<Result<{ value: string | boolean | number | undefined; stringValue: string }> | undefined> => {
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
        const result = TOML.variable(context.value.privateVarToml ?? '', parameterPath);
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
            return ResultModule.ok(undefined);
        }

        if (context?.type !== chara) {
            return ResultModule.ok(undefined);
        }

        const matchedBoolParams = recordToArray(room.boolParamNames).filter(({ value }) => value.name === parameter);
        const matchedNumParams = recordToArray(room.numParamNames).filter(({ value }) => value.name === parameter);
        const matchedStrParams = recordToArray(room.strParamNames).filter(({ value }) => value.name === parameter);
        const totalLength = matchedBoolParams.length + matchedNumParams.length + matchedStrParams.length;
        if (totalLength >= 2) {
            return ResultModule.error(`"${parameter}"という名前のパラメーターが複数存在します。パラメーターの名前を変えることを検討してください`);
        }

        if (matchedBoolParams.length !== 0) {
            const matched = matchedBoolParams[0];
            return ResultModule.ok(context.value.boolParams[matched.key]?.value ?? undefined);
        }
        if (matchedNumParams.length !== 0) {
            const matched = matchedNumParams[0];
            return ResultModule.ok(context.value.numParams[matched.key]?.value ?? undefined);
        }
        if (matchedStrParams.length !== 0) {
            const matched = matchedStrParams[0];
            return ResultModule.ok(context.value.strParams[matched.key]?.value ?? undefined);
        }

        return ResultModule.ok(undefined);
    })();
    if (paramNameValue.isError) {
        return paramNameValue;
    }
    if (paramNameValue.value !== undefined) {
        return ResultModule.ok({
            stringValue: paramNameValue.value.toString(),
            value: paramNameValue.value,
        });
    }
    return undefined;
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
    text: string;
    gameType: string;
    context: Context | null;
    room: RoomModule.State;
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