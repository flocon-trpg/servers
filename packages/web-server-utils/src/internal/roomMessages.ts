import {
    PieceLogFragment,
    RoomMessageEventFragment,
    RoomMessages,
    RoomPrivateMessageFragment,
    RoomPublicChannelFragment,
    RoomPublicMessageFragment,
    RoomSoundEffectFragment,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import produce from 'immer';
import { Observable, Subject, mergeMap } from 'rxjs';
import { FilteredSortedArray, SortedArray } from './filteredArray';
import { Notification } from './notification';

export const privateMessage = 'privateMessage';
export const publicMessage = 'publicMessage';
export const pieceLog = 'pieceLog';
export const publicChannel = 'publicChannel';
export const soundEffect = 'soundEffect';

type PrivateMessageType = {
    type: typeof privateMessage;
    value: RoomPrivateMessageFragment;
};
type PublicMessageType = {
    type: typeof publicMessage;
    value: RoomPublicMessageFragment;
};
type PieceLogType = {
    type: typeof pieceLog;
    value: PieceLogFragment;
};

type SoundEffectType = {
    type: typeof soundEffect;
    value: RoomSoundEffectFragment;
};

type RoomMessage = PrivateMessageType | PublicMessageType | PieceLogType | SoundEffectType;

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
            return undefined;
    }
};

export type RoomMessageEvent =
    | {
          type: typeof publicChannel;
          value: RoomPublicChannelFragment;
      }
    | RoomMessage;

export const notification = 'notification';

type NotificationType = {
    type: typeof notification;
    value: Notification;
};

export type Message = NotificationType | RoomMessage;

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

export const noChange = 'noChange';

export const reset = 'reset';

type DiffBase<T> =
    | {
          prevValue: T;
          nextValue: T;
      }
    | {
          prevValue: T;
          nextValue: undefined;
      }
    | {
          prevValue: undefined;
          nextValue: T;
      };

export type Diff =
    | DiffBase<PublicMessageType>
    | DiffBase<PrivateMessageType>
    | DiffBase<PieceLogType>
    | DiffBase<SoundEffectType>
    | DiffBase<NotificationType>
    | {
          prevValue: { type: typeof reset; value: readonly Message[] };
          nextValue: { type: typeof reset; value: readonly Message[] };
      };

// 引数のmessagesには変更は加えられない
const reduceEvent = <T extends SortedArray<Message> | FilteredSortedArray<Message>>({
    messages: messagesSource,
    event,
}: {
    messages: T;
    event: RoomMessageEventFragment;
}): { messages: T; diff: Diff | null } | typeof noChange => {
    const messages = messagesSource.clone() as T;
    switch (event.__typename) {
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
                if (
                    msg.type === notification ||
                    msg.type === pieceLog ||
                    msg.type === soundEffect
                ) {
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
        case undefined:
            return noChange;
    }
};

export const event = 'event';
export const query = 'query';
export const clear = 'clear';

type MessagesChangeCore =
    | {
          type: typeof event;
          isLoaded: true;
          current: SortedArray<Message>;
          // nullの場合、イベントにより変更されたMessageが無かったことを表す。
          diff: Diff | null;
          event: RoomMessageEventFragment;
      }
    | {
          type: typeof event;
          isLoaded: false;
          current?: undefined;
          diff?: undefined;
          event: RoomMessageEventFragment;
      }
    | {
          type: typeof query;
          isLoaded: true;
          current: SortedArray<Message>;
          diff?: undefined;
          event?: undefined;
      }
    | {
          type: typeof clear;
          isLoaded: false;
          current?: undefined;
          diff?: undefined;
          event?: undefined;
      };

export type MessagesChange =
    | {
          type: typeof event;
          current: readonly Message[];
          // nullの場合、イベントにより変更されたMessageが無かったことを表す。
          diff: Diff | null;
      }
    | {
          type: typeof query;
          current: readonly Message[];
          diff?: undefined;
      }
    | {
          type: typeof clear;
          current?: undefined;
          diff?: undefined;
      };

export type FilteredRoomMessages = Readonly<{
    getCurrent(): readonly Message[] | null;
    changed: Observable<MessagesChange>;
}>;

export type AllRoomMessages = FilteredRoomMessages &
    Readonly<{
        filter(filter: (message: Message) => boolean): FilteredRoomMessages;
    }>;

class MessageSet {
    #notifications = new Map<string, Notification>();
    #publicMessages = new Map<string, RoomPublicMessageFragment>();
    #privateMessages = new Map<string, RoomPrivateMessageFragment>();
    #pieceLogs = new Map<string, PieceLogFragment>();
    #soundEffects = new Map<string, RoomSoundEffectFragment>();

    public add(message: Message) {
        switch (message.type) {
            case notification:
                this.#notifications.set(
                    `${message.value.createdAt};${message.value.message}`,
                    message.value
                );
                break;
            case pieceLog:
                this.#pieceLogs.set(message.value.messageId, message.value);
                break;
            case privateMessage:
                this.#privateMessages.set(message.value.messageId, message.value);
                break;
            case publicMessage:
                this.#publicMessages.set(message.value.messageId, message.value);
                break;
            case soundEffect:
                this.#soundEffects.set(message.value.messageId, message.value);
                break;
        }
    }

    public clear() {
        this.#notifications.clear();
        this.#pieceLogs.clear();
        this.#privateMessages.clear();
        this.#publicMessages.clear();
        this.#soundEffects.clear();
    }

    public getPrivateMessage(messageId: string) {
        return this.#privateMessages.get(messageId);
    }

    public getPublicMessage(messageId: string) {
        return this.#publicMessages.get(messageId);
    }

    public get(message: Message): Message | undefined {
        switch (message.type) {
            case notification: {
                const value = this.#notifications.get(
                    `${message.value.createdAt};${message.value.message}`
                );
                if (value == null) {
                    return undefined;
                }
                return {
                    type: notification,
                    value,
                };
            }
            case pieceLog: {
                const value = this.#pieceLogs.get(message.value.messageId);
                if (value == null) {
                    return undefined;
                }
                return {
                    type: pieceLog,
                    value,
                };
            }
            case privateMessage: {
                const value = this.getPrivateMessage(message.value.messageId);
                if (value == null) {
                    return undefined;
                }
                return {
                    type: privateMessage,
                    value,
                };
            }
            case publicMessage: {
                const value = this.getPublicMessage(message.value.messageId);
                if (value == null) {
                    return undefined;
                }
                return {
                    type: publicMessage,
                    value,
                };
            }
            case soundEffect: {
                const value = this.#soundEffects.get(message.value.messageId);
                if (value == null) {
                    return undefined;
                }
                return {
                    type: soundEffect,
                    value,
                };
            }
        }
    }

    public values() {
        function* main(self: MessageSet): Generator<Message> {
            for (const value of self.#notifications.values()) {
                yield {
                    type: notification,
                    value,
                };
            }
            for (const value of self.#pieceLogs.values()) {
                yield {
                    type: pieceLog,
                    value,
                };
            }
            for (const value of self.#privateMessages.values()) {
                yield {
                    type: privateMessage,
                    value,
                };
            }
            for (const value of self.#publicMessages.values()) {
                yield {
                    type: publicMessage,
                    value,
                };
            }
            for (const value of self.#soundEffects.values()) {
                yield {
                    type: soundEffect,
                    value,
                };
            }
        }
        return main(this);
    }
}

const createSortKey = (message: Message): number => message.value.createdAt;

const loading = 'loading';
const loaded = 'loaded';

export class RoomMessagesClient {
    #messagesState:
        | { type: typeof loading; events: RoomMessageEventFragment[] }
        | { type: typeof loaded; messages: SortedArray<Message> } = {
        type: loading,
        events: [],
    };

    #messagesChanged = new Subject<MessagesChangeCore>();

    public readonly messages: AllRoomMessages;

    public constructor() {
        this.messages = {
            getCurrent: () => this.#messages?.toArray(x => x) ?? null,
            changed: this.#messagesChanged.pipe(
                mergeMap<MessagesChangeCore, MessagesChange[]>(changeEvent => {
                    switch (changeEvent.type) {
                        case event: {
                            if (!changeEvent.isLoaded) {
                                return [];
                            }
                            return [
                                {
                                    ...changeEvent,
                                    current: changeEvent.current.toArray(x => x),
                                    isLoaded: undefined,
                                },
                            ];
                        }
                        case query: {
                            return [
                                {
                                    ...changeEvent,
                                    current: changeEvent.current.toArray(x => x),
                                    isLoaded: undefined,
                                },
                            ];
                        }
                        default:
                            return [
                                {
                                    ...changeEvent,
                                    isLoaded: undefined,
                                },
                            ];
                    }
                })
            ),
            filter: filter => {
                return {
                    getCurrent: () =>
                        this.#messages == null
                            ? null
                            : this.#messages.toArray(x => (filter(x) ? x : undefined)),
                    changed: new Observable(observer => {
                        let messages =
                            this.#messages == null ? null : this.#messages.createFiltered(filter);

                        return this.#messagesChanged.subscribe(changeEvent => {
                            if (changeEvent.type === query) {
                                messages = changeEvent.current.createFiltered(filter);
                                observer.next({ type: query, current: messages.toArray(x => x) });
                                return;
                            }
                            if (changeEvent.type === clear) {
                                messages = null;
                                observer.next({ type: clear });
                                return;
                            }
                            if (messages == null) {
                                return;
                            }
                            const reduced = reduceEvent({
                                messages,
                                event: changeEvent.event,
                            });
                            if (reduced === noChange) {
                                observer.next({
                                    type: event,
                                    current: messages.toArray(x => x),
                                    diff: null,
                                });
                            } else {
                                messages = reduced.messages;
                                observer.next({
                                    type: event,
                                    current: reduced.messages.toArray(x => x),
                                    diff: reduced.diff,
                                });
                            }
                        });
                    }),
                };
            },
        };
    }

    get #messages() {
        if (this.#messagesState.type === loading) {
            return null;
        }
        return this.#messagesState.messages;
    }

    static #reduce({
        state,
        messages,
        events,
    }: {
        state: readonly Message[];
        messages: RoomMessages;
        events: readonly RoomMessageEventFragment[];
    }): readonly Message[] {
        const messagesSet = new MessageSet();
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
                case 'RoomPublicChannelUpdate':
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
                case 'RoomMessagesReset': {
                    messagesSet.clear();
                    break;
                }
            }
        }

        return [...messagesSet.values()].sort((x, y) => x.value.createdAt - y.value.createdAt);
    }

    public onQuery(messages: RoomMessages): void {
        const newMessages =
            this.#messagesState.type === loading
                ? RoomMessagesClient.#reduce({
                      state: [],
                      messages,
                      events: this.#messagesState.events,
                  })
                : RoomMessagesClient.#reduce({
                      state: this.#messagesState.messages.toArray(x => x),
                      messages,
                      events: [],
                  });
        this.#messagesState = {
            type: loaded,
            messages: new SortedArray(createSortKey, newMessages),
        };
        this.#messagesChanged.next({
            type: query,
            isLoaded: true,
            current: new SortedArray(createSortKey, newMessages),
        });
    }

    public onEvent(event: RoomMessageEventFragment): void {
        if (this.#messagesState.type === loading) {
            this.#messagesState = { type: loading, events: [...this.#messagesState.events, event] };
            this.#messagesChanged.next({ type: 'event', isLoaded: false, event });
            return;
        }
        const reduced = reduceEvent({
            messages: this.#messagesState.messages,
            event,
        });
        if (reduced === noChange) {
            this.#messagesChanged.next({
                type: 'event',
                isLoaded: true,
                current: this.#messagesState.messages.clone(),
                diff: null,
                event,
            });
            return;
        }
        this.#messagesState = {
            type: loaded,
            messages: reduced.messages,
        };
        this.#messagesChanged.next({
            type: 'event',
            isLoaded: true,
            current: reduced.messages,
            diff: reduced.diff,
            event,
        });
    }

    public clear(): void {
        this.#messagesState = {
            type: loading,
            events: [],
        };
        this.#messagesChanged.next({ type: clear, isLoaded: false });
    }
}
