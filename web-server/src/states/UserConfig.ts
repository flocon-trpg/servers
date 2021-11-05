import * as t from 'io-ts';

export type UserConfig = {
    userUid: string;

    // +ボタンを押すと1増え、-ボタンを押すと1減る。+ボタンや-ボタンがどれだけ押されたかを見て、適切なフォントの大きさをコンポーネント側が決めて表示する。
    roomMessagesFontSizeDelta: number;
};

export const serializedUserConfig = t.partial({
    // PartialUserConfigはlocalforage.getItemで使われるが、localforage.setItemでは使われない。
    // getItemする際、userUidをキーに用いるため、userUidをストレージに保存する必要はない。
    // そのため、UserConfigのほうでは定義しているuserUidは、こちらでは定義していない。

    roomMessagesFontSizeDelta: t.number,
});

export type SerializedUserConfig = t.TypeOf<typeof serializedUserConfig>;

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

// versionが未対応のものの場合はundefinedを返す。
export const toCompleteUserConfig = (source: SerializedUserConfig, userUid: string): UserConfig => {
    return {
        userUid,
        roomMessagesFontSizeDelta: source.roomMessagesFontSizeDelta ?? 0,
    };
};

export const defaultUserConfig = (userUid: string): UserConfig => {
    return {
        userUid,
        roomMessagesFontSizeDelta: 0,
    };
};
