import { DynamicLoader } from 'bcdice';
import Result from 'bcdice/ts/result';
import { __ } from '../@shared/collection';
import { analyze as analyzeCore, executeCompareOperator, maybeDice, MaybeDice, Parameter, prettifyOperator } from '../@shared/expression';
import { RoomParameterNameType } from '../enums/RoomParameterNameType';
import { Chara } from '../graphql+mikro-orm/entities/character/mikro-orm';
import { NumParam } from '../graphql+mikro-orm/entities/character/numParam/mikro-orm';
import { Room } from '../graphql+mikro-orm/entities/room/mikro-orm';
import { ParamName } from '../graphql+mikro-orm/entities/room/paramName/mikro-orm';
import { EM } from '../utils/types';

const loader = new DynamicLoader();

export const listAvailableGameSystems = () => {
    return loader.listAvailableGameSystems();
};

const roll = async (text: string, gameType: string): Promise<Result | null> => {
    const gameSystemInfo = listAvailableGameSystems().find(info => info.id === gameType);
    if (gameSystemInfo == null) {
        return null;
    }
    const gameSystem = await loader.dynamicLoad(gameSystemInfo.id);
    return gameSystem.eval(text);
};

export const plain = 'plain';
export const command = 'command';

// 戻り値は、number==nullのときはtextにエラーメッセージが入る。number!=nullのときはパラメーター名と結果のセットを表す文字列が入る。
const getParameter = async ({ em, parameter, chara, room }: { em: EM; parameter: Parameter; chara: Chara | null; room: Room }): Promise<{ text: string; number: number | null }> => {
    if (chara == null) {
        return {
            text: 'キャラクターが指定されていないため、数値パラメーターを取得できませんでした',
            number: null,
        };
    }
    const paramNames = await em.find(ParamName, { room: room.id, name: parameter.parameter, type: RoomParameterNameType.Num }, { limit: 2 });
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
    const numParam = await em.findOne(NumParam, { chara: chara.id, key: paramNames[0].key });
    return {
        text: `{${parameter.parameter}} → ${numParam?.value ?? 0}`,
        number: numParam?.value ?? 0,
    };
};

const sum = (dice: Result): number => {
    let sum = 0;
    dice.rands.forEach(rnd => {
        const result = rnd[0];
        // result == nullになるケースは確認していないが、念の為。
        if (result == null) {
            return;
        }
        sum += result;
    });
    return sum;
};

// https://www.yoheim.net/blog.php?q=20191101
const toHanAscii = (source: string): string => {
    return source.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
};

// {text: '1d100'} -> bcdiceのtextを返す
// {text: '5'} -> 5
const getDiceOrNumber = async ({ text, gameType }: { text: string; gameType: string }): Promise<{ text: string; number: number; bcdice: Result | null } | null> => {
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

const getParameterOrDiceOrNumber = async (params: {
    em: EM;
    value: MaybeDice | Parameter;
    chara: Chara | null;
    gameType: string;
    room: Room;
}): Promise<{ text: string; number: number | null; bcdice: Result | null } | null> => {
    if (params.value.type === maybeDice) {
        return getDiceOrNumber({ text: params.value.command, gameType: params.gameType });
    }
    const result = await getParameter({ ...params, parameter: params.value });
    return { ...result, bcdice: null };
};

type AnalyzeResult = {
    type: typeof plain;
} | {
    type: typeof command;
    result: string;
    isSecret: boolean;
    // nullの場合は、成功判定のないコマンドを表す
    isSuccess: boolean | null;
}

const isSuccess = ({ success, failure }: { success: boolean; failure: boolean }) => {
    if (success === failure) {
        return null;
    }
    return success;
};

export const analyze = async (params: {
    em: EM;
    text: string;
    chara: Chara | null;
    gameType: string;
    room: Room;
}): Promise<AnalyzeResult> => {
    const analyzed = await getDiceOrNumber(params);
    if (analyzed == null) {
        const exp = analyzeCore(params.text);
        if (exp == null) {
            return { type: plain };
        }
        if (!exp.isCompare) {
            return {
                type: plain,
            };
        }

        const left = await getParameterOrDiceOrNumber({ ...params, value: exp.left });
        const right = await getParameterOrDiceOrNumber({ ...params, value: exp.right });
        if (left == null || right == null) {
            // 少なくとも一方がダイスロールのフォーマットになっていないため、ただの文字列とみなす。
            return {
                type: plain,
            };
        }
        if (left.number != null && right.number != null) {
            return {
                type: command,
                result: `${left.text} ${prettifyOperator(exp.compareOperator)} ${right.text}`,
                isSuccess: executeCompareOperator(left.number, right.number, exp.compareOperator),
                isSecret: (left.bcdice?.secret ?? false) || (right.bcdice?.secret ?? false),
            };
        }
        return {
            type: command,
            result: `${left.text}; ${right.text}`,
            isSuccess: null,
            isSecret: (left.bcdice?.secret ?? false) || (right.bcdice?.secret ?? false),
        };
    }

    return {
        type: command,
        result: analyzed.text,
        isSuccess: analyzed.bcdice == null ? null : isSuccess(analyzed.bcdice),
        isSecret: analyzed.bcdice?.secret ?? false,
    };
};