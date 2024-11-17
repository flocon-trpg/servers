import { z } from 'zod';

export const column = 'column';
export const row = 'row';

export type UserConfig = {
    userUid: string;

    // +ボタンを押すと1増え、-ボタンを押すと1減る。+ボタンや-ボタンがどれだけ押されたかを見て、適切なフォントの大きさをコンポーネント側が決めて表示する。
    roomMessagesFontSizeDelta: number;

    // nullishの場合はautoとなる
    chatInputDirection?: typeof column | typeof row;
};

export const serializedUserConfig = z
    .object({
        // PartialUserConfigはlocalforage.getItemで使われるが、localforage.setItemでは使われない。
        // getItemする際、userUidをキーに用いるため、userUidをストレージに保存する必要はない。
        // そのため、UserConfigのほうでは定義しているuserUidは、こちらでは定義していない。

        roomMessagesFontSizeDelta: z.number(),
    })
    .partial();

export type SerializedUserConfig = z.TypeOf<typeof serializedUserConfig>;

// versionが未対応のものの場合はundefinedを返す。
export const deserializeUserConfig = (
    source: SerializedUserConfig,
    userUid: string,
): UserConfig => {
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
