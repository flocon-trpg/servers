import * as t from 'io-ts';
import { MessageFilter, serializedMessageFilter, deserializeMessageFilter } from '../messageFilter';

export type TabConfig = {
    // nullishならば自動で名付けられる
    tabName?: string;
} & MessageFilter;

export const partialTabConfig = t.intersection([
    t.partial({
        tabName: t.string,
    }),
    serializedMessageFilter,
]);

export const deserializeTabConfig = (source: PartialTabConfig): TabConfig => {
    return {
        ...deserializeMessageFilter(source),
        tabName: source.tabName,
    };
};

export type PartialTabConfig = t.TypeOf<typeof partialTabConfig>;
