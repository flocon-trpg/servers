import { MessageFilterUtils } from '../messageFilter/utils';
import { TabConfig } from '.';

export namespace TabConfigUtils {
    export const createEmpty = ({ tabName }: { tabName?: string }): TabConfig => {
        return {
            ...MessageFilterUtils.createEmpty(),
            tabName,
        };
    };

    export const createAll = ({ tabName }: { tabName?: string }): TabConfig => {
        return {
            ...MessageFilterUtils.createAll(),
            tabName,
        };
    };

    export const toTabName = (source: TabConfig): string => {
        if (source.tabName != null && source.tabName !== '') {
            return source.tabName;
        }
        if (MessageFilterUtils.isAll(source)) {
            return '全てのメッセージ';
        }
        if (MessageFilterUtils.isEmpty(source)) {
            return '(空のタブ)';
        }
        const elements: string[] = [];
        if (source.showSystem) {
            elements.push('システムメッセージ');
        }
        if (source.showFree) {
            elements.push('雑談');
        }

        // TODO: 現在はビルドを通すためだけに暫定の名前を返している
        return '(タブ)';
    };
}
