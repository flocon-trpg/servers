import { simpleId } from '@flocon-trpg/core';
import { z } from 'zod';
import { MessageFilter, deserializeMessageFilter, serializedMessageFilter } from '../messageFilter';

export type MessageTabConfig = {
    // 同一Panel内にある他のCharacterTabConfigのkeyと重複しないようにしなければならない
    key: string;

    // nullishならば自動で名付けられる
    tabName?: string;
} & MessageFilter;

export const partialMessageTabConfig = z
    .object({
        key: z.string(),
        tabName: z.string(),
    })
    .partial()
    .merge(serializedMessageFilter);

export const deserializeMessageTabConfig = (source: PartialMessageTabConfig): MessageTabConfig => {
    return {
        ...deserializeMessageFilter(source),
        key: source.key ?? simpleId(),
        tabName: source.tabName,
    };
};

export type PartialMessageTabConfig = z.TypeOf<typeof partialMessageTabConfig>;
