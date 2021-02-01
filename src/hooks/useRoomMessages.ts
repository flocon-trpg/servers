import { ApolloError } from '@apollo/client';
import produce from 'immer';
import React from 'react';
import { __ } from '../@shared/collection';
import { useMessageEventSubscription, useGetMessagesQuery, RoomMessageEventFragment, RoomPrivateMessageFragment, RoomPublicMessageFragment, RoomPublicChannelFragment, RoomSoundEffectFragment } from '../generated/graphql';
import { appConsole } from '../utils/appConsole';
import { PrivateChannelSet, PrivateChannelsSet } from '../utils/PrivateChannelsSet';

// 使い方:
// 1. どこかでuseAllRoomMessagesを呼ぶ。冗長な通信を避けるため、useAllRoomMessagesを呼ぶ箇所はなるべく少なくする。
// 2. フィルタリングしたい場合、useAllRoomMessagesによって得た値をuseFilteredRoomMessagesに渡す。配列に対して毎回filterメソッドを実行するより軽いはず。


// CO:
export const privateMessage = 'privateMessage';
export const publicMessage = 'publicMessage';
export const publicChannel = 'publicChannel';
export const soundEffect = 'soundEffect';

export type RoomMessage = {
    type: typeof privateMessage;
    value: RoomPrivateMessageFragment;
} | {
    type: typeof publicMessage;
    value: RoomPublicMessageFragment;
} | {
    type: typeof soundEffect;
    value: RoomSoundEffectFragment;
};

const createRoomMessage = (source: RoomPrivateMessageFragment | RoomPublicMessageFragment | RoomSoundEffectFragment): RoomMessage | undefined => {
    switch (source.__typename) {
        case 'RoomPrivateMessage':
            return {
                type: privateMessage,
                value: source,
            };
        case 'RoomPublicMessage':
            return {
                type: publicMessage,
                value: source,
            };
        case 'RoomSoundEffect':
            return {
                type: soundEffect,
                value: source,
            };
        case undefined:
            return undefined;
    }
};

export type RoomMessageEvent = {
    type: typeof publicChannel;
    value: RoomPublicChannelFragment;
} | RoomMessage


type StateToReduce = {
    messages: RoomMessage[];
    publicChannels: Map<string, RoomPublicChannelFragment>;
    privateChannels: PrivateChannelsSet;
}

export type ReadonlyStateToReduce = {
    messages: ReadonlyArray<RoomMessage>;
    publicChannels: ReadonlyMap<string, RoomPublicChannelFragment>;
    privateChannels: {
        toArray(): PrivateChannelSet[];
    };
}

// Addのとき、同じmessageIdがstateに既に存在する場合も正常に処理される。その代わりに重い。
const reduceInit = (actions: RoomMessageEventFragment[]): StateToReduce => {
    const messages = new Map<string, RoomMessage>();
    const publicChannels = new Map<string, RoomPublicChannelFragment>();
    const privateChannels = new PrivateChannelsSet();

    for (const action of actions) {
        switch (action.__typename) {
            case undefined:
                break;
            case 'RoomPrivateMessage':
            case 'RoomPublicMessage':
            case 'RoomSoundEffect': {
                const newValue = createRoomMessage(action);
                if (newValue == null) {
                    break;
                }
                const exists = messages.get(action.messageId);
                if (exists === undefined) {
                    messages.set(action.messageId, newValue);
                } else {
                    if (exists.value.createdAt < action.createdAt) {
                        messages.set(action.messageId, newValue);
                    }
                }
                break;
            }
            case 'RoomPublicChannel': {
                publicChannels.set(action.key, action);
                break;
            }
            case 'RoomPrivateMessageUpdate': {
                const found = messages.get(action.messageId);
                if (found == null) {
                    break;
                }
                if (found.type !== privateMessage) {
                    appConsole.warn(`{ messageId: ${action.messageId} }が重複しています。`);
                    break;
                }
                const newValue = produce(found, found => {
                    found.value.altTextToSecret = action.altTextToSecret;
                    found.value.commandResult = action.commandResult;
                    found.value.isSecret = action.isSecret;
                    found.value.text = action.text;
                    found.value.updatedAt = action.updatedAt;
                });
                messages.set(action.messageId, newValue);
                break;
            }
            case 'RoomPublicMessageUpdate': {
                const found = messages.get(action.messageId);
                if (found == null) {
                    break;
                }
                if (found.type !== publicMessage) {
                    appConsole.warn(`{ messageId: ${action.messageId} }が重複しています。`);
                    break;
                }
                const newValue = produce(found, found => {
                    found.value.altTextToSecret = action.altTextToSecret;
                    found.value.commandResult = action.commandResult;
                    found.value.isSecret = action.isSecret;
                    found.value.text = action.text;
                    found.value.updatedAt = action.updatedAt;
                });
                messages.set(action.messageId, newValue);
                break;
            }
            case 'RoomPublicChannelUpdate': {
                const found = publicChannels.get(action.key);
                if (found == null) {
                    break;
                }
                const newValue = produce(found, found => {
                    found.name = action.name;
                });
                publicChannels.set(action.key, newValue);
                break;
            }
        }

        switch (action.__typename) {
            case 'RoomPrivateMessage':
                privateChannels.add(action.visibleTo);
                break;
            default:
                break;
        }
    }

    return {
        messages: [...messages.values()].sort((x, y) => x.value.createdAt - y.value.createdAt),
        publicChannels,
        privateChannels,
    };
};

// Addのとき、（filterがtrueを返せば）messageIdの重複や時系列を考えず常に末尾に追加される。その代わりに軽い。
// Addが来る順に依存するので、時系列は多少ずれるかもしれないが、それは仕様ということにしている。ただし、stateの末尾の要素を数十個程度だけ見ることで、あまり重くせずに時系列を事実上完全に揃えることができると思われる。
// Updateのときは同じmessageIdがないかどうか探すため、重さはreduceInitと同じ。ただし、UpdateはAddと比べて発生する頻度が少ないと想定している。
//
// UpdateによってRoomMessageの状態が変わったときでも、filterは再実行されない。理由は、現状ではChannelの振り分けなどにのみ使われるため必要性が薄いから。ユーザーによる検索はantdのComponentなどのほうで行う。
const reduceMessages = (state: RoomMessage[], action: RoomMessageEventFragment, filter: (message: RoomMessage) => boolean): RoomMessage[] => {
    switch (action.__typename) {
        case 'RoomPrivateMessage':
        case 'RoomPublicMessage':
        case 'RoomSoundEffect': {
            const newValue = createRoomMessage(action);
            if (newValue == null) {
                return state;
            }
            if (!filter(newValue)) {
                return state;
            }
            return [...state, newValue];
        }
        case 'RoomPublicChannel':
        case 'RoomPublicChannelUpdate':
            return state;
        case 'RoomPrivateMessageUpdate':
        case 'RoomPublicMessageUpdate': {
            const index = state.findIndex(msg => msg.value.messageId === action.messageId);
            if (index === -1) {
                return state;
            }
            return produce(state, draft => {
                const target = draft[index];
                if (target.type === soundEffect) {
                    return;
                }
                target.value.altTextToSecret = action.altTextToSecret;
                target.value.commandResult = action.commandResult;
                target.value.isSecret = action.isSecret;
                target.value.text = action.text;
                target.value.updatedAt = action.updatedAt;
            });
        }
        case undefined:
            return state;
    }
};

const reduce = (state: StateToReduce, action: RoomMessageEventFragment, filter: (message: RoomMessage) => boolean): StateToReduce => {
    const messages = reduceMessages(state.messages, action, filter);
    switch (action.__typename) {
        case 'RoomPrivateMessage': {
            const privateChannels = state.privateChannels.clone();
            privateChannels.add(action.visibleTo);
            return {
                ...state,
                privateChannels,
                messages,
            };
        }
        case 'RoomPublicChannel': {
            const publicChannels = new Map(state.publicChannels);
            publicChannels.set(action.key, action);
            return {
                ...state,
                messages,
                publicChannels,
            };
        }
        case 'RoomPublicChannelUpdate': {
            const found = state.publicChannels.get(action.key);
            if (found == null) {
                return {
                    ...state,
                    messages,
                };
            }
            const publicChannels = produce(state.publicChannels, draft => {
                const found = draft.get(action.key);
                if (found == null) {
                    return;
                }
                found.name = action.name;
            });
            return {
                ...state,
                messages,
                publicChannels,
            };
        }
        case 'RoomPublicMessage':
        case 'RoomPrivateMessageUpdate':
        case 'RoomPublicMessageUpdate':
        case 'RoomSoundEffect':
        case undefined: {
            return {
                ...state,
                messages
            };
        }
    }
};

export const loading = 'loading';
export const apolloError = 'apolloError';
export const failure = 'failure';
export const loaded = 'loaded';
export const newEvent = 'newEvent';

type AllRoomMessagesResultCore = {
    type: typeof loading;
    events: RoomMessageEventFragment[];
} | {
    type: typeof apolloError;
    error: ApolloError;
} | {
    type: typeof failure;
} | {
    type: typeof loaded;
    value: StateToReduce;
} | {
    type: typeof newEvent;
    value: StateToReduce;
    event: RoomMessageEventFragment;
}

export type AllRoomMessagesSuccessResult = {
    type: typeof loaded;
    value: ReadonlyStateToReduce;
} | {
    type: typeof newEvent;
    value: ReadonlyStateToReduce;
    event: RoomMessageEventFragment;
}

export type AllRoomMessagesResult = {
    type: typeof loading;
} | {
    type: typeof apolloError;
    error: ApolloError;
} | {
    type: typeof failure;
} | AllRoomMessagesSuccessResult

export const useAllRoomMessages = ({ roomId }: { roomId: string }): AllRoomMessagesResult => {
    const [result, setResult] = React.useState<AllRoomMessagesResultCore>({ type: loading, events: [] });

    const messages = useGetMessagesQuery({ variables: { roomId }, fetchPolicy: 'no-cache' });
    const messageEventSubscription = useMessageEventSubscription({ variables: { roomId } });

    React.useEffect(() => {
        const messagesData = messages.data;
        if (messagesData != null) {
            setResult(oldValue => {
                if (oldValue.type !== loading) {
                    return oldValue;
                }
                switch (messagesData.result.__typename) {
                    case 'GetRoomMessagesFailureResult':
                        return {
                            type: 'failure',
                        };
                    case 'RoomMessages': {
                        const actions: RoomMessageEventFragment[] = [...oldValue.events];
                        messagesData.result.publicMessages.forEach(msg => {
                            actions.push(msg);
                        });
                        messagesData.result.publicChannels.forEach(ch => {
                            actions.push(ch);
                        });
                        messagesData.result.privateMessages.forEach(msg => {
                            actions.push(msg);
                        });
                        messagesData.result.soundEffects.forEach(se => {
                            actions.push(se);
                        });
                        return {
                            type: 'loaded',
                            value: reduceInit(actions),
                        };
                    }
                    default:
                        return oldValue;
                }
            });
        }
        const messagesError = messages.error;
        if (messagesError != null) {
            setResult({ type: apolloError, error: messagesError });
        }
    }, [messages.data, messages.error]);

    React.useEffect(() => {
        const messageEvent: RoomMessageEventFragment | null | undefined = messageEventSubscription.data?.messageEvent;
        if (messageEvent != null) {
            setResult(oldValue => {
                switch (oldValue.type) {
                    case loading:
                        return {
                            type: loading,
                            events: [...oldValue.events, messageEvent],
                        };
                    case loaded:
                    case newEvent:
                        return {
                            type: newEvent,
                            value: reduce(oldValue.value, messageEvent, () => true),
                            event: messageEvent,
                        };
                    default:
                        return oldValue;
                }
            });
        }
    }, [messageEventSubscription.data]);

    return result;
};

const emptyArray: RoomMessage[] = [];

// filterは、常に同じ参照にするかuseMemoなどを使うのを忘れずに。
export const useFilteredRoomMessages = ({ allRoomMessagesResult, filter }: { allRoomMessagesResult: AllRoomMessagesSuccessResult; filter?: (message: RoomMessage) => boolean }): RoomMessage[] => {
    const [result, setResult] = React.useState<RoomMessage[] | null>(null);
    const prevFilterRef = React.useRef(filter);
    React.useEffect(() => {
        const prevFilter = prevFilterRef.current;
        prevFilterRef.current = filter;
        switch (allRoomMessagesResult.type) {
            case loaded:
                setResult(allRoomMessagesResult.value.messages.filter(filter ?? (() => true)));
                return;
            case newEvent:
                setResult(oldValue => {
                    // すでにRoomMessage[]を求めていた場合、RoomMessage[]全体に対してfilterを呼ぶのではなく、eventが示す差分のみを更新することで動作を軽量化している。
                    // ReactのdepsはObject.isに相当する操作で等価比較しているようなので、Object.isを用いている。
                    if (oldValue != null && Object.is(prevFilter, filter)) {
                        return reduceMessages(oldValue, allRoomMessagesResult.event, filter ?? (() => true));
                    }
                    // RoomMessage[]がない、もしくはfilterが変更された場合にここに来る。
                    // RoomMessage[]を更新し、以後は（filterが変更されない限り）eventを利用して差分のみが更新される。
                    return allRoomMessagesResult.value.messages.filter(filter ?? (() => true));
                });

        }
    }, [allRoomMessagesResult, filter]);
    return result ?? emptyArray;
};