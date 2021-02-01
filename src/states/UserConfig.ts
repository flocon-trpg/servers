import { castToArray, castToRecord, castToString } from '../utils/cast';
import isObject from '../utils/isObject';
import { castToPartialPanelsConfig, defaultPanelsConfig, PanelsConfig, PartialPanelsConfig, toCompletePanelsConfig } from './PanelsConfig';
import * as Room from '../stateManagers/states/room';
import { __ } from '../@shared/collection';

// UserConfigは現在は使用されていない。これからも使用されないようならば削除して構わない。

export type UserConfig = {
    userUid: string;

    version: 1;
}

export type PartialUserConfig = {
    // PartialUserConfigはlocalforage.getItemで使われるが、localforage.setItemでは使われない。
    // getItemする際、userUidをキーに用いるため、userUidをストレージに保存する必要はない。
    // そのため、UserConfigのほうでは定義しているuserUidは、こちらでは定義していない。

    version?: number;
}

export const castToPartialUserConfig = (source: unknown): PartialUserConfig | undefined => {
    if (!isObject<PartialUserConfig>(source)) {
        return;
    }
    return {
        version: 1,
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
    };
};

export const defaultUserConfig = (userUid: string): UserConfig => {
    return {
        userUid,
        version: 1,
    };
};