import { z } from 'zod';

export type MessageFilter = {
    showNotification: boolean;
    showSystem: boolean;
    showFree: boolean;
    showPublic1: boolean;
    showPublic2: boolean;
    showPublic3: boolean;
    showPublic4: boolean;
    showPublic5: boolean;
    showPublic6: boolean;
    showPublic7: boolean;
    showPublic8: boolean;
    showPublic9: boolean;
    showPublic10: boolean;
    // trueならばプライベートメッセージをすべて含める、falseならすべて除外。stringならばPrivateChannelSetsを表し、そのプライベートメッセージのみ含める。
    privateChannels: string | boolean;
};

export const serializedMessageFilter = z
    .object({
        showNotification: z.boolean(),
        showSystem: z.boolean(),
        showFree: z.boolean(),
        showPublic1: z.boolean(),
        showPublic2: z.boolean(),
        showPublic3: z.boolean(),
        showPublic4: z.boolean(),
        showPublic5: z.boolean(),
        showPublic6: z.boolean(),
        showPublic7: z.boolean(),
        showPublic8: z.boolean(),
        showPublic9: z.boolean(),
        showPublic10: z.boolean(),
        privateChannels: z.union([z.string(), z.boolean()]),
    })
    .partial();

export type SerializedMessageFilter = z.TypeOf<typeof serializedMessageFilter>;

export const deserializeMessageFilter = (source: SerializedMessageFilter): MessageFilter => {
    return {
        privateChannels: source.privateChannels ?? false,
        showNotification: source.showNotification ?? false,
        showFree: source.showFree ?? false,
        showPublic10: source.showPublic10 ?? false,
        showPublic1: source.showPublic1 ?? false,
        showPublic2: source.showPublic2 ?? false,
        showPublic3: source.showPublic3 ?? false,
        showPublic4: source.showPublic4 ?? false,
        showPublic5: source.showPublic5 ?? false,
        showPublic6: source.showPublic6 ?? false,
        showPublic7: source.showPublic7 ?? false,
        showPublic8: source.showPublic8 ?? false,
        showPublic9: source.showPublic9 ?? false,
        showSystem: source.showSystem ?? false,
    };
};
