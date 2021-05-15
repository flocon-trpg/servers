import { ApolloError } from '@apollo/client';
import produce from 'immer';
import React from 'react';
import { __ } from '../@shared/collection';
import { useGetMessagesQuery, RoomMessageEventFragment, RoomPrivateMessageFragment, RoomPublicMessageFragment, RoomPublicChannelFragment, RoomSoundEffectFragment, MyValueLogFragment, RoomEventSubscription, GetRoomMessagesFailureType, useGetMessagesLazyQuery } from '../generated/graphql';
import { appConsole } from '../utils/appConsole';
import { PrivateChannelSet, PrivateChannelSets } from '../utils/PrivateChannelSet';
import { usePrevious } from './usePrevious';
import { Notification } from '../modules/roomModule';
import { useSelector } from '../store';
import { useMe } from './useMe';

// 使い方:
// 1. どこかでuseAllRoomMessagesを呼ぶ。冗長な通信を避けるため、useAllRoomMessagesを呼ぶ箇所はなるべく少なくする。
// 2. フィルタリングしたい場合、useAllRoomMessagesによって得た値をuseFilteredRoomMessagesに渡す。配列に対して毎回filterメソッドを実行するより軽いはず。


export const privateMessage = 'privateMessage';
export const publicMessage = 'publicMessage';
export const myValueLog = 'myValueLog';
export const publicChannel = 'publicChannel';
export const soundEffect = 'soundEffect';

export type RoomMessage = {
    type: typeof privateMessage;
    value: RoomPrivateMessageFragment;
} | {
    type: typeof publicMessage;
    value: RoomPublicMessageFragment;
} | {
    type: typeof myValueLog;
    value: MyValueLogFragment;
} | {
    type: typeof soundEffect;
    value: RoomSoundEffectFragment;
};

const createRoomMessage = (source: RoomPrivateMessageFragment | RoomPublicMessageFragment | MyValueLogFragment | RoomSoundEffectFragment): RoomMessage | undefined => {
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
        case 'MyValueLog':
            return {
                type: myValueLog,
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
    messages: Message[];
    publicChannels: Map<string, RoomPublicChannelFragment>;
    privateChannels: PrivateChannelSets;
}

export type ReadonlyStateToReduce = {
    messages: ReadonlyArray<Message>;
    publicChannels: ReadonlyMap<string, RoomPublicChannelFragment>;
    privateChannels: {
        toArray(): PrivateChannelSet[];
    };
}

// Addのとき、同じmessageIdがstateに既に存在する場合も正常に処理される。その代わりに重い。
const reduceInit = (actions: RoomMessageEventFragment[]): StateToReduce => {
    const messages = new Map<string, RoomMessage>();
    const publicChannels = new Map<string, RoomPublicChannelFragment>();
    const privateChannels = new PrivateChannelSets();

    for (const action of actions) {
        switch (action.__typename) {
            case undefined:
                break;
            case 'RoomPrivateMessage':
            case 'RoomPublicMessage':
            case 'MyValueLog':
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
                    found.value.initText = action.initText;
                    found.value.initTextSource = action.initTextSource;
                    found.value.isSecret = action.isSecret;
                    found.value.updatedAt = action.updatedAt;
                    found.value.updatedText = action.updatedText;
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
                    found.value.initText = action.initText;
                    found.value.initTextSource = action.initTextSource;
                    found.value.isSecret = action.isSecret;
                    found.value.updatedAt = action.updatedAt;
                    found.value.updatedText = action.updatedText;
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
// UpdateによってRoomMessageの状態が変わったときでも、filterは再実行されない。理由は、現状ではChannelの振り分けなどにのみ使われるため必要性が薄いから(ChannelはUpdateによって変わることはない)。ユーザーによる検索はantdのComponentなどのほうで行う。
const reduceMessages = (state: Message[], action: RoomMessageEventFragment, filter: (message: RoomMessage) => boolean): Message[] => {
    switch (action.__typename) {
        case 'RoomPrivateMessage':
        case 'RoomPublicMessage':
        case 'MyValueLog':
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
            const index = state.findIndex(msg => msg.type !== notification && msg.value.messageId === action.messageId);
            if (index === -1) {
                return state;
            }
            return produce(state, draft => {
                const target = draft[index];
                if (target.type === myValueLog || target.type === soundEffect || target.type === notification) {
                    return;
                }
                target.value.altTextToSecret = action.altTextToSecret;
                target.value.commandResult = action.commandResult;
                target.value.isSecret = action.isSecret;
                target.value.initText = action.initText;
                target.value.initTextSource = action.initTextSource;
                target.value.updatedText = action.updatedText;
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
        case 'MyValueLog':
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
    failureType: GetRoomMessagesFailureType;
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
    failureType: GetRoomMessagesFailureType;
} | AllRoomMessagesSuccessResult

export const useAllRoomMessages = ({ roomId, roomEventSubscription }: { roomId: string; roomEventSubscription: RoomEventSubscription | undefined }): AllRoomMessagesResult => {
    const { userUid: myUserUid } = useMe();
    const [result, setResult] = React.useState<AllRoomMessagesResultCore>({ type: loading, events: [] });
    const [getMessages, messages] = useGetMessagesLazyQuery({ fetchPolicy: 'network-only' });

    React.useEffect(() => {
        if (myUserUid == null) {
            return;
        }
        getMessages({ variables: { roomId } });
    }, [roomId, myUserUid, getMessages]);

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
                            type: failure,
                            failureType: messagesData.result.failureType,
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
                        messagesData.result.myValueLogs.forEach(msg => {
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
        const messageEvent: RoomMessageEventFragment | null | undefined = roomEventSubscription?.roomEvent?.roomMessageEvent;
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
    }, [roomEventSubscription]);

    return result;
};

export const notification = 'notification';

export type Message = {
    type: typeof notification;
    value: Notification.StateElement;
} | RoomMessage

const emptyArray: Message[] = [];

// filterは、常に同じ参照にするかuseCallbackなどを使うのを忘れずに。
// 仕様として、Roomが変わるなどでallRoomMessagesResult.valueの中身が大きく変わった場合でもそれは正常に反映されない。そのため、常に同じRoomに対するallRoomMessageResultを渡さなければならない。logNotificationsも同様。
export const useFilteredRoomMessages = ({
    filter,
}: {
    filter?: (message: Message) => boolean;
}): ReadonlyArray<Message> => {
    const logNotifications = useSelector(state => state.roomModule.notifications);
    const allRoomMessagesResult = useSelector(state => state.roomModule.allRoomMessagesResult);

    const [result, setResult] = React.useState<Message[] | null>(null);

    const prevAllRoomMessagesResult = usePrevious(allRoomMessagesResult);
    const prevLogNotifications = usePrevious(logNotifications);
    const prevFilter = usePrevious(filter);

    const sort = (x: Message, y: Message): number => {
        return x.value.createdAt - y.value.createdAt;
    };

    React.useEffect(() => {
        const toRoomMessages = () => allRoomMessagesResult?.type === loaded || allRoomMessagesResult?.type === newEvent ? allRoomMessagesResult.value.messages : [];
        const toNotificationMessages = () => {
            if (logNotifications == null) {
                return [];
            }
            return logNotifications.values.map(n => ({ type: notification, value: n } as const));
        };

        setResult(oldValue => {
            if (oldValue == null || prevFilter !== filter) {
                // RoomMessage[]がない、もしくはfilterが変更された場合にここに来る。
                // RoomMessage[]を更新し、以後は（filterが変更されない限り）eventを利用して差分のみが更新される
                return ([...toRoomMessages(), ...toNotificationMessages()].filter(filter ?? (() => true)).sort(sort));
            }

            let result = oldValue;
            if (allRoomMessagesResult !== prevAllRoomMessagesResult) {
                switch (allRoomMessagesResult?.type) {
                    case newEvent:
                        result = reduceMessages(result, allRoomMessagesResult.event, filter ?? (() => true));
                        break;
                    default:
                        break;
                }
            }

            if (logNotifications !== prevLogNotifications && logNotifications?.newValue != null) {
                const newMessage = { type: notification, value: logNotifications.newValue } as const;
                if (filter == null || filter(newMessage)) {
                    // RoomMessageは通信のラグがあるため、createdAtの時系列は多少ずれるかもしれないが、それは仕様ということにしている。ただし、oldValueの末尾の要素を数十個程度だけ見ることで、あまり重くせずに時系列を事実上完全に揃えることができると思われる。
                    result = [...oldValue, newMessage];
                }
            }

            return result;
        });
    }, [allRoomMessagesResult, prevAllRoomMessagesResult, logNotifications, prevLogNotifications, filter, prevFilter]);

    return result ?? emptyArray;
};

// filterとthenMapは、常に同じ参照にするかuseCallbackなどを使うのを忘れずに。
export const useFilteredAndMapRoomMessages = <TResult>({
    filter,
    thenMap,
}: {
    filter?: (message: Message) => boolean;
    thenMap: (message: ReadonlyArray<Message>) => ReadonlyArray<TResult>;
}): ReadonlyArray<TResult> => {
    const nonMappedResult = useFilteredRoomMessages({ filter });
    const [result, setResult] = React.useState<ReadonlyArray<TResult>>([]);
    React.useEffect(() => {
        setResult(thenMap(nonMappedResult));
    }, [nonMappedResult, thenMap]);
    return result;
};
