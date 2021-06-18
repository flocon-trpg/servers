import { castToNumber } from '../utils/cast';
import isObject from '../utils/isObject';

// UserConfigは現在は使用されていない。これからも使用されないようならば削除して構わない。

export type UserConfig = {
    userUid: string;

    version: 1;

    // +ボタンを押すと1増え、-ボタンを押すと1減る。+ボタンや-ボタンがどれだけ押されたかを見て、適切なフォントの大きさをコンポーネント側が決めて表示する。
    roomMessagesFontSizeDelta: number;
}

export namespace UserConfig {
    export const getRoomMessagesFontSize = (roomMessagesFontSizeDelta: number): number => {
        switch (roomMessagesFontSizeDelta) {
            case -3:
                return 9;
            case -2:
                return 10;
            case -1:
                return 11;
            case 0:
                return 12;
            case 1:
                return 13;
            case 2:
                return 14;
            case 3:
                return 15;
            default:
                if (roomMessagesFontSizeDelta < 0) {
                    return 9;
                }
                return 15;
        }
    };
}

export type PartialUserConfig = {
    // PartialUserConfigはlocalforage.getItemで使われるが、localforage.setItemでは使われない。
    // getItemする際、userUidをキーに用いるため、userUidをストレージに保存する必要はない。
    // そのため、UserConfigのほうでは定義しているuserUidは、こちらでは定義していない。

    version?: number;

    roomMessagesFontSizeDelta?: number;
}

export const castToPartialUserConfig = (source: unknown): PartialUserConfig | undefined => {
    if (!isObject<PartialUserConfig>(source)) {
        return;
    }
    return {
        version: 1,
        roomMessagesFontSizeDelta: castToNumber(source.roomMessagesFontSizeDelta),
    };
};

// versionが未対応のものの場合はundefinedを返す。
// TODO: Configをユーザーがリセットできないと、versionが不正になってしまったときに永遠に使用できなくなる問題への対処。
export const toCompleteUserConfig = (source: PartialUserConfig, userUid: string): UserConfig | undefined => {
    if (source.version !== 1) {
        return;
    }
    return {
        userUid,
        version: source.version,
        roomMessagesFontSizeDelta: source.roomMessagesFontSizeDelta ?? 0,
    };
};

export const defaultUserConfig = (userUid: string): UserConfig => {
    return {
        userUid,
        version: 1,
        roomMessagesFontSizeDelta: 0,
    };
};