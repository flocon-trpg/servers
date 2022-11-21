import { simpleId } from '@flocon-trpg/core';
import { MessageFilterUtils } from '../messageFilter/utils';
import { MessageTabConfig } from '.';

export namespace MessageTabConfigUtils {
    export const createEmpty = ({ tabName }: { tabName?: string }): MessageTabConfig => {
        return {
            ...MessageFilterUtils.createEmpty(),
            key: simpleId(),
            tabName,
        };
    };

    export const createAll = ({ tabName }: { tabName?: string }): MessageTabConfig => {
        return {
            ...MessageFilterUtils.createAll(),
            key: simpleId(),
            tabName,
        };
    };
}
