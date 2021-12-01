import * as t from 'io-ts';
import { MessageFilter, serializedMessageFilter, deserializeMessageFilter } from '../messageFilter';

export type MessageTabConfig = {
    // nullishならば自動で名付けられる
    tabName?: string;
} & MessageFilter;

export const partialMessageTabConfig = t.intersection([
    t.partial({
        tabName: t.string,
    }),
    serializedMessageFilter,
]);

export const deserializeMessageTabConfig = (source: PartialMessageTabConfig): MessageTabConfig => {
    return {
        ...deserializeMessageFilter(source),
        tabName: source.tabName,
    };
};

export type PartialMessageTabConfig = t.TypeOf<typeof partialMessageTabConfig>;
