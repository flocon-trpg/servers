import * as t from 'io-ts';

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

export const serializedMessageFilter = t.partial({
    showNotification: t.boolean,
    showSystem: t.boolean,
    showFree: t.boolean,
    showPublic1: t.boolean,
    showPublic2: t.boolean,
    showPublic3: t.boolean,
    showPublic4: t.boolean,
    showPublic5: t.boolean,
    showPublic6: t.boolean,
    showPublic7: t.boolean,
    showPublic8: t.boolean,
    showPublic9: t.boolean,
    showPublic10: t.boolean,
    privateChannels: t.union([t.string, t.boolean]),
});

export type SerializedMessageFilter = t.TypeOf<typeof serializedMessageFilter>;

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
