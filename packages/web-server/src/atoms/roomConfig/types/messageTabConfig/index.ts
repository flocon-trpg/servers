import { simpleId } from '@flocon-trpg/core';
import * as t from 'io-ts';
import { MessageFilter, serializedMessageFilter, deserializeMessageFilter } from '../messageFilter';

export type MessageTabConfig = {
    // 同一Panel内にある他のCharacterTabConfigのkeyと重複しないようにしなければならない
    key: string;

    // nullishならば自動で名付けられる
    tabName?: string;
} & MessageFilter;

export const partialMessageTabConfig = t.intersection([
    t.partial({
        key: t.string,
        tabName: t.string,
    }),
    serializedMessageFilter,
]);

export const deserializeMessageTabConfig = (source: PartialMessageTabConfig): MessageTabConfig => {
    return {
        ...deserializeMessageFilter(source),
        key: source.key ?? simpleId(),
        tabName: source.tabName,
    };
};

export type PartialMessageTabConfig = t.TypeOf<typeof partialMessageTabConfig>;
