import {
    PieceLogFragment,
    RoomMessageEventFragment,
    RoomMessages,
    RoomPrivateMessageFragment,
    RoomPublicMessageFragment,
    RoomSoundEffectFragment,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import { loggerRef } from '@flocon-trpg/utils';
import { produce } from 'immer';
import { Observable, Subject, map } from 'rxjs';
import { FilteredSortedArray, SortedArray } from './filteredArray';
import { MessageSet } from './messageSet';
import {
    CustomMessage,
    Diff,
    Message,
    RoomMessage,
    custom,
    pieceLog,
    privateMessage,
    publicMessage,
    reset,
    soundEffect,
} from './roomMessageTypes';

const createRoomMessage = (
    source:
        | RoomPrivateMessageFragment
        | RoomPublicMessageFragment
        | PieceLogFragment
        | RoomSoundEffectFragment
): RoomMessage | undefined => {
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
        case 'PieceLog':
            return {
                type: pieceLog,
                value: source,
            };
        case 'RoomSoundEffect':
            return {
                type: soundEffect,
                value: source,
            };
        case undefined:
            loggerRef.warn(
                { object: source },
                'createRoomMessage 関数に渡されたオブジェクトの __typename が undefined だったため、処理はスキップされました。RoomPrivateMessageFragment | RoomPublicMessageFragment | PieceLogFragment | RoomSoundEffectFragment では __typename がないとメッセージを処理できません。GraphQL クライアントの設定を確認し、__typename を常にセットするようにしてください。'
            );
            return undefined;
    }
};

const compareUpdatedAt = (
    left: number | null | undefined,
    operator: '<',
    right: number | null | undefined
) => {
    if (left == null) {
        return right != null;
    }
    if (right == null) {
        return false;
    }
    return left < right;
};

const noChange = 'noChange';

// switch 文で場合分けしやすいように、__typename を用いている 。
type AddCustomMessageEvent<TCustomMessage> = {
    __typename: typeof custom;
    value: CustomMessage<TCustomMessage>;
};

// 引数のmessagesには変更は加えられない
const reduceEvent = <
    TCustomMessage,
    T extends SortedArray<Message<TCustomMessage>> | FilteredSortedArray<Message<TCustomMessage>>
>({
    messages: messagesSource,
    event,
}: {
    messages: T;
    event: RoomMessageEventFragment | AddCustomMessageEvent<TCustomMessage>;
}): { messages: T; diff: Diff<TCustomMessage> | null } | typeof noChange => {
    const messages = messagesSource.clone() as T;
    switch (event.__typename) {
        case custom: {
            const added = messages.add(event.value);
            if (added === false) {
                return { messages, diff: null };
            }
            return {
                messages,
                diff: {
                    prevValue: undefined,
                    nextValue: event.value,
                },
            };
        }
        case 'RoomPrivateMessage':
        case 'RoomPublicMessage':
        case 'PieceLog':
        case 'RoomSoundEffect': {
            const newValue = createRoomMessage(event);
            if (newValue == null) {
                return noChange;
            }
            const added = messages.add(newValue);
            if (added === false) {
                return { messages, diff: null };
            }
            return {
                messages,
                diff: {
                    prevValue: undefined,
                    nextValue: newValue,
                },
            };
        }
        case 'RoomPublicChannel':
        case 'RoomPublicChannelUpdate':
            return noChange;
        case 'RoomPrivateMessageUpdate':
        case 'RoomPublicMessageUpdate': {
            const updateResult = messages.updateLast(msg => {
                if (msg.type === custom || msg.type === pieceLog || msg.type === soundEffect) {
                    return undefined;
                }
                if (msg.value.messageId !== event.messageId) {
                    return undefined;
                }
                if (!compareUpdatedAt(msg.value.updatedAt, '<', event.updatedAt)) {
                    return undefined;
                }
                return produce(msg, msg => {
                    msg.value.altTextToSecret = event.altTextToSecret;
                    msg.value.commandResult = event.commandResult;
                    msg.value.isSecret = event.isSecret;
                    msg.value.initText = event.initText;
                    msg.value.initTextSource = event.initTextSource;
                    msg.value.updatedText = event.updatedText;
                    msg.value.updatedAt = event.updatedAt;
                });
            });
            if (updateResult == null) {
                return noChange;
            }
            return {
                messages,
                diff: {
                    prevValue: updateResult.oldValue,
                    nextValue: updateResult.newValue as any,
                },
            };
        }
        case 'RoomMessagesReset': {
            const prevValue = messages.toArray(x => x);
            messages.clear();
            return {
                messages,
                diff: {
                    prevValue: { type: reset, value: prevValue },
                    nextValue: { type: reset, value: [] },
                },
            };
        }
    }
};

export const event = 'event';
export const query = 'query';
export const clear = 'clear';

type MessagesChangeCore<TCustomMessage> =
    | {
          type: typeof event;
          isQueryFetched: boolean;
          current: SortedArray<Message<TCustomMessage>>;
          // nullの場合、イベントにより変更されたMessageが無かったことを表す。
          diff: Diff<TCustomMessage> | null;
          event: RoomMessageEventFragment | AddCustomMessageEvent<TCustomMessage>;
      }
    | {
          type: typeof query;
          isQueryFetched: true;
          current: SortedArray<Message<TCustomMessage>>;
          diff?: undefined;
          event?: undefined;
      }
    | {
          type: typeof clear;
          isQueryFetched: false;
          current: SortedArray<Message<TCustomMessage>>;
          diff?: undefined;
          event?: undefined;
      };

export type MessagesChange<TCustomMessage> =
    | {
          type: typeof event;
          current: readonly Message<TCustomMessage>[];
          // nullの場合、イベントにより変更されたMessageが無かったことを表す。
          diff: Diff<TCustomMessage> | null;
      }
    | {
          type: typeof query | typeof clear;
          current: readonly Message<TCustomMessage>[];
      };

export type FilteredRoomMessages<TCustomMessage> = Readonly<{
    getCurrent(): readonly Message<TCustomMessage>[];
    changed: Observable<MessagesChange<TCustomMessage>>;
}>;

export type AllRoomMessages<TCustomMessage> = FilteredRoomMessages<TCustomMessage> &
    Readonly<{
        filter(
            filter: (message: Message<TCustomMessage>) => boolean
        ): FilteredRoomMessages<TCustomMessage>;
    }>;

const createSortKey = <T>(message: Message<T>): number =>
    message.type === custom ? message.createdAt : message.value.createdAt;

export class RoomMessagesClient<TCustomMessage> {
    #messagesState:
        | {
              isQueryFetched: false;
              eventsQueue: RoomMessageEventFragment[];
          }
        | {
              isQueryFetched: true;
          } = {
        isQueryFetched: false,
        eventsQueue: [],
    };

    #messagesChanged = new Subject<MessagesChangeCore<TCustomMessage>>();

    #messages = new SortedArray<Message<TCustomMessage>>(createSortKey);

    readonly messages: AllRoomMessages<TCustomMessage>;

    constructor() {
        this.messages = {
            getCurrent: () => this.#messages.toArray(x => x),
            changed: this.#messagesChanged.pipe(
                map(changeEvent => {
                    switch (changeEvent.type) {
                        case event: {
                            return {
                                type: event,
                                current: changeEvent.current.toArray(x => x),
                                diff: changeEvent.diff,
                            };
                        }
                        case query: {
                            return {
                                type: query,
                                current: changeEvent.current.toArray(x => x),
                            };
                        }
                        default:
                            return {
                                type: clear,
                                current: changeEvent.current.toArray(x => x),
                            };
                    }
                })
            ),
            filter: filter => {
                return {
                    getCurrent: () => this.#messages.toArray(x => (filter(x) ? x : undefined)),
                    changed: new Observable(observer => {
                        let messages = this.#messages.createFiltered(filter);

                        return this.#messagesChanged.subscribe(changeEvent => {
                            if (changeEvent.type !== event) {
                                messages = changeEvent.current.createFiltered(filter);
                                observer.next({
                                    type: changeEvent.type,
                                    current: messages.toArray(x => x),
                                });
                                return;
                            }
                            if (
                                !this.#messagesState.isQueryFetched &&
                                changeEvent.event.__typename !== custom
                            ) {
                                observer.next({
                                    type: changeEvent.type,
                                    current: changeEvent.current.toArray(x => x).filter(filter),
                                    diff: null,
                                });
                                return;
                            }

                            const reduced = reduceEvent<TCustomMessage, typeof messages>({
                                messages,
                                event: changeEvent.event,
                            });
                            if (reduced === noChange) {
                                observer.next({
                                    type: event,
                                    current: messages.toArray(x => x),
                                    diff: null,
                                });
                                return;
                            }
                            messages = reduced.messages;
                            observer.next({
                                type: event,
                                current: reduced.messages.toArray(x => x),
                                diff: reduced.diff,
                            });
                        });
                    }),
                };
            },
        };
    }

    // 'onEvent' と比べて、重複したメッセージは取り除かれるが、そのぶん処理は重め。
    static #reduceOnQuery<TCustomMessage>({
        state,
        messages,
        events,
    }: {
        state: readonly Message<TCustomMessage>[];
        messages: RoomMessages;
        events: readonly RoomMessageEventFragment[];
    }): readonly Message<TCustomMessage>[] {
        const messagesSet = new MessageSet<TCustomMessage>();
        state.forEach(msg => {
            messagesSet.add(msg);
        });

        const setMessage = (action: Parameters<typeof createRoomMessage>[0]): void => {
            const newValue = createRoomMessage(action);
            if (newValue == null) {
                return;
            }
            const exists = messagesSet.get(newValue);
            if (exists === undefined) {
                messagesSet.add(newValue);
                return;
            }
            let existsUpdatedAt: number | null | undefined;
            switch (exists.type) {
                case publicMessage:
                case privateMessage:
                    existsUpdatedAt = exists.value.updatedAt;
                    break;
                default:
                    existsUpdatedAt = null;
                    break;
            }
            let actionUpdatedAt: number | null | undefined;
            switch (action.__typename) {
                case 'RoomPublicMessage':
                case 'RoomPrivateMessage':
                    actionUpdatedAt = action.updatedAt;
                    break;
                default:
                    actionUpdatedAt = null;
                    break;
            }
            if (compareUpdatedAt(existsUpdatedAt, '<', actionUpdatedAt)) {
                messagesSet.add(newValue);
            }
        };

        messages.pieceLogs.forEach(setMessage);
        messages.privateMessages.forEach(setMessage);
        messages.publicMessages.forEach(setMessage);
        messages.soundEffects.forEach(setMessage);

        for (const event of events) {
            switch (event.__typename) {
                case 'RoomPrivateMessage':
                    setMessage({ ...event, __typename: 'RoomPrivateMessage' });
                    break;
                case 'RoomPublicMessage':
                    setMessage({ ...event, __typename: 'RoomPublicMessage' });
                    break;
                case 'PieceLog':
                    setMessage({ ...event, __typename: 'PieceLog' });
                    break;
                case 'RoomSoundEffect':
                    setMessage({ ...event, __typename: 'RoomSoundEffect' });
                    break;
                case 'RoomPublicChannel':
                    break;
                case 'RoomPrivateMessageUpdate': {
                    const found = messagesSet.getPrivateMessage(event.messageId);
                    if (found == null) {
                        break;
                    }
                    if (compareUpdatedAt(found.updatedAt, '<', event.updatedAt)) {
                        const newValue = produce(found, found => {
                            found.altTextToSecret = event.altTextToSecret;
                            found.commandResult = event.commandResult;
                            found.initText = event.initText;
                            found.initTextSource = event.initTextSource;
                            found.isSecret = event.isSecret;
                            found.updatedAt = event.updatedAt;
                            found.updatedText = event.updatedText;
                        });
                        messagesSet.add({ type: privateMessage, value: newValue });
                    }
                    break;
                }
                case 'RoomPublicMessageUpdate': {
                    const found = messagesSet.getPublicMessage(event.messageId);
                    if (found == null) {
                        break;
                    }
                    if (compareUpdatedAt(found.updatedAt, '<', event.updatedAt)) {
                        const newValue = produce(found, found => {
                            found.altTextToSecret = event.altTextToSecret;
                            found.commandResult = event.commandResult;
                            found.initText = event.initText;
                            found.initTextSource = event.initTextSource;
                            found.isSecret = event.isSecret;
                            found.updatedAt = event.updatedAt;
                            found.updatedText = event.updatedText;
                        });
                        messagesSet.add({ type: publicMessage, value: newValue });
                    }
                    break;
                }
                case 'RoomPublicChannelUpdate':
                case 'RoomMessagesReset': {
                    loggerRef.warn(`${event.__typename} is deprecated.`);
                    break;
                }
                case undefined:
                    loggerRef.warn(
                        { object: event },
                        '#reduceOnQuery メソッドの引数で __typename が undefined のオブジェクトが見つかったため、このオブジェクトの処理はスキップされました。RoomMessageEventFragment では __typename がないとメッセージを処理できません。GraphQL クライアントの設定を確認し、__typename を常にセットするようにしてください。'
                    );
                    break;
            }
        }

        return [...messagesSet.values()].sort((x, y) => createSortKey(x) - createSortKey(y));
    }

    onQuery(messages: RoomMessages): void {
        const newMessages = RoomMessagesClient.#reduceOnQuery<TCustomMessage>({
            state: this.#messages.toArray(x => x),
            messages,
            events: this.#messagesState.isQueryFetched ? [] : this.#messagesState.eventsQueue,
        });
        this.#messages = new SortedArray(createSortKey, newMessages);
        this.#messagesState = {
            isQueryFetched: true,
        };
        this.#messagesChanged.next({
            type: query,
            isQueryFetched: true,
            current: new SortedArray(createSortKey, newMessages),
        });
    }

    // `#reduceOnQuery` と比べて、重複したメッセージは取り除かれないが、そのぶん処理は軽め。
    onEvent(event: RoomMessageEventFragment): void {
        const messages = this.#messages;
        if (!this.#messagesState.isQueryFetched) {
            this.#messagesState = {
                ...this.#messagesState,
                eventsQueue: [...this.#messagesState.eventsQueue, event],
            };
            this.#messagesChanged.next({
                type: 'event',
                isQueryFetched: false,
                event,
                current: messages.clone(),
                diff: null,
            });
            return;
        }
        const reduced = reduceEvent<TCustomMessage, typeof messages>({
            messages: this.#messages,
            event,
        });
        if (reduced === noChange) {
            return;
        }
        this.#messages = reduced.messages;
        this.#messagesState = {
            isQueryFetched: true,
        };
        this.#messagesChanged.next({
            type: 'event',
            isQueryFetched: true,
            current: reduced.messages,
            diff: reduced.diff,
            event,
        });
    }

    addCustomMessage(message: Omit<CustomMessage<TCustomMessage>, 'type'>): void {
        const customMessage = { ...message, type: custom } as const;
        const messagesClone = this.#messages.clone();
        messagesClone.add(customMessage);
        this.#messages = messagesClone;
        this.#messagesChanged.next({
            type: event,
            isQueryFetched: false,
            event: { __typename: custom, value: customMessage },
            current: this.#messages.clone(),
            diff: {
                prevValue: undefined,
                nextValue: customMessage,
            },
        });
    }

    clear(): void {
        this.#messagesState = {
            isQueryFetched: false,
            eventsQueue: [],
        };
        this.#messages = new SortedArray(createSortKey);
        this.#messagesChanged.next({
            type: clear,
            isQueryFetched: false,
            current: this.#messages.clone(),
        });
    }
}
