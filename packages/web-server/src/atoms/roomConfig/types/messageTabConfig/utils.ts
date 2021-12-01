import { MessageFilterUtils } from '../messageFilter/utils';
import { MessageTabConfig } from '.';

export namespace MessageTabConfigUtils {
    export const createEmpty = ({ tabName }: { tabName?: string }): MessageTabConfig => {
        return {
            ...MessageFilterUtils.createEmpty(),
            tabName,
        };
    };

    export const createAll = ({ tabName }: { tabName?: string }): MessageTabConfig => {
        return {
            ...MessageFilterUtils.createAll(),
            tabName,
        };
    };
}
