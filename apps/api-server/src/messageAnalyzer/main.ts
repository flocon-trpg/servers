import {
    State,
    analyze as analyzeToExpression,
    characterTemplate,
    getVariableFromVarTomlObject,
    parseToml,
    plain,
    roomTemplate,
} from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import { recordToArray } from '@flocon-trpg/utils';
import { DynamicLoader } from 'bcdice';
import BcdiceResult from 'bcdice/ts/result';

type RoomState = State<typeof roomTemplate>;
type CharacterState = State<typeof characterTemplate>;
const loader = new DynamicLoader();

export const listAvailableGameSystems = () => {
    return loader.listAvailableGameSystems();
};

export const helpMessage = async (gameSystemId: string) => {
    const gameSystem = await loader.dynamicLoad(gameSystemId);
    return gameSystem.HELP_MESSAGE;
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
    value: CharacterState;
};

// 全てにおいて何も見つからなかった場合、undefinedが返される。
const getParameter = async ({
    parameterPath,
    context,
    room,
}: {
    parameterPath: string[];
    context: Context | null;
    room: RoomState;
}): Promise<
    Result<{ value: string | boolean | number | undefined; stringValue: string }> | undefined
> => {
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
        const tomlObject = parseToml(context.value.privateVarToml ?? '');
        if (tomlObject.isError) {
            return null;
        }
        const result = getVariableFromVarTomlObject(tomlObject.value, parameterPath);
        if (result.isError) {
            return null;
        }
        return result.value ?? null;
    })();
    if (privateVarValue != null && typeof privateVarValue !== 'object') {
        return Result.ok({ value: privateVarValue, stringValue: privateVarValue.toString() });
    }

    const paramNameValue = await (async () => {
        if (parameterPath.length >= 2) {
            return Result.ok(undefined);
        }

        if (context?.type !== chara) {
            return Result.ok(undefined);
        }

        const matchedBoolParams = recordToArray(room.boolParamNames ?? {}).filter(
            ({ value }) => value.name === parameter
        );
        const matchedNumParams = recordToArray(room.numParamNames ?? {}).filter(
            ({ value }) => value.name === parameter
        );
        const matchedStrParams = recordToArray(room.strParamNames ?? {}).filter(
            ({ value }) => value.name === parameter
        );
        const totalLength =
            matchedBoolParams.length + matchedNumParams.length + matchedStrParams.length;
        if (totalLength >= 2) {
            return Result.error(
                `"${parameter}"という名前のパラメーターが複数存在します。パラメーターの名前を変えることを検討してください`
            );
        }

        const matchedBoolParams0 = matchedBoolParams[0];
        if (matchedBoolParams0 != null) {
            return Result.ok(
                context.value.boolParams?.[matchedBoolParams0.key]?.value ?? undefined
            );
        }
        const matchedNumParams0 = matchedNumParams[0];
        if (matchedNumParams0 != null) {
            return Result.ok(context.value.numParams?.[matchedNumParams0.key]?.value ?? undefined);
        }
        const matchedStrParams0 = matchedStrParams[0];
        if (matchedStrParams0 != null) {
            return Result.ok(context.value.strParams?.[matchedStrParams0.key]?.value ?? undefined);
        }

        return Result.ok(undefined);
    })();
    if (paramNameValue.isError) {
        return paramNameValue;
    }
    if (paramNameValue.value !== undefined) {
        return Result.ok({
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
};

export const analyze = async (params: {
    text: string;
    gameType: string;
    context: Context | null;
    room: RoomState;
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
    return Result.ok({
        message,
        diceResult:
            rolled == null
                ? null
                : {
                      result: rolled.text,
                      isSecret: rolled.secret,
                      isSuccess: rolled.success === rolled.failure ? null : rolled.success,
                  },
    });
};
