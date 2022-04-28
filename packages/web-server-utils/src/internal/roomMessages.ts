import {
    RoomPrivateMessageFragment,
    RoomPublicMessageFragment,
    PieceLogFragment,
    RoomSoundEffectFragment,
    RoomPublicChannelFragment,
    RoomMessages,
    RoomMessageEventFragment,
} from '@flocon-trpg/typed-document-node';
import { toBeNever } from '@flocon-trpg/utils';
import produce from 'immer';
import { mergeMap, Observable, Subject } from 'rxjs';
import { Notification } from './notification';

export const privateMessage = 'privateMessage';
export const publicMessage = 'publicMessage';
export const pieceLog = 'pieceLog';
export const publicChannel = 'publicChannel';
export const soundEffect = 'soundEffect';

type RoomMessage =
    | {
          type: typeof privateMessage;
          value: RoomPrivateMessageFragment;
      }
    | {
          type: typeof publicMessage;
          value: RoomPublicMessageFragment;
      }
    | {
          type: typeof pieceLog;
          value: PieceLogFragment;
      }
    | {
          type: typeof soundEffect;
          value: RoomSoundEffectFragment;
      };

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

export type Message =
    | {
          type: typeof notification;
          value: Notification;
      }
    | RoomMessage;

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

const findMessageIndexFromEnd = (
    messages: readonly Message[],
    predicate: (msg: Message) => boolean
): number => {
    for (let i = messages.length - 1; i >= 0; i--) {
        const element = messages[i];
        if (element == null) {
            throw new Error('This should not happen');
        }
        if (predicate(element)) {
            return i;
        }
    }
    return -1;
};

const noChange = 'noChange';

const reduceEvent = ({
    sortedMessagesArray,
    event,
    filter,
}: {
    sortedMessagesArray: readonly Message[];
    event: RoomMessageEventFragment;
    filter: (message: Message) => boolean;
}): readonly Message[] | typeof noChange => {
    switch (event.__typename) {
        case 'RoomPrivateMessage':
        case 'RoomPublicMessage':
        case 'PieceLog':
        case 'RoomSoundEffect': {
            const newValue = createRoomMessage(event);
            if (newValue == null) {
                return noChange;
            }
            if (!filter(newValue)) {
                return noChange;
            }
            const insertInto = findMessageIndexFromEnd(
                sortedMessagesArray,
                msg => msg.value.createdAt < newValue.value.createdAt
            );
            return produce(sortedMessagesArray, state => {
                if (insertInto === -1) {
                    state.unshift(newValue);
                    return;
                }
                state.splice(insertInto + 1, 0, newValue);
            });
        }
        case 'RoomPublicChannel':
        case 'RoomPublicChannelUpdate':
            return noChange;
        case 'RoomPrivateMessageUpdate':
        case 'RoomPublicMessageUpdate': {
            const index = findMessageIndexFromEnd(
                sortedMessagesArray,
                msg => msg.type !== notification && msg.value.messageId === event.messageId
            );
            if (index === -1) {
                return noChange;
            }
            return produce(sortedMessagesArray, draft => {
                const target = draft[index];
                if (
                    target == null ||
                    target.type === pieceLog ||
                    target.type === soundEffect ||
                    target.type === notification
                ) {
                    return;
                }
                if (!compareUpdatedAt(target.value.updatedAt, '<', event.updatedAt)) {
                    return;
                }
                target.value.altTextToSecret = event.altTextToSecret;
                target.value.commandResult = event.commandResult;
                target.value.isSecret = event.isSecret;
                target.value.initText = event.initText;
                target.value.initTextSource = event.initTextSource;
                target.value.updatedText = event.updatedText;
                target.value.updatedAt = event.updatedAt;
            });
        }
        case 'RoomMessagesReset':
            return [];
        case undefined:
            return noChange;
    }
};

export const event = 'event';
export const query = 'query';
export const reset = 'reset';

type MessagesChangeCore =
    | {
          type: typeof event;
          isLoaded: true;
          current: readonly Message[];
          event: RoomMessageEventFragment;
      }
    | {
          type: typeof event;
          isLoaded: false;
          current?: undefined;
          event: RoomMessageEventFragment;
      }
    | {
          type: typeof query;
          isLoaded: true;
          current: readonly Message[];
          event?: undefined;
      }
    | {
          type: typeof reset;
          isLoaded: false;
          current?: undefined;
          event?: undefined;
      };

export type MessagesChange =
    | {
          type: typeof event;
          current: readonly Message[];
          event: RoomMessageEventFragment;
      }
    | {
          type: typeof query;
          current: readonly Message[];
          event?: undefined;
      }
    | {
          type: typeof reset;
          current?: undefined;
          event?: undefined;
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
            default:
                toBeNever(message);
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
            default:
                toBeNever(message);
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

const loading = 'loading';
const loaded = 'loaded';

export class RoomMessagesClient {
    #messagesState:
        | { type: typeof loading; events: RoomMessageEventFragment[] }
        | { type: typeof loaded; sortedMessages: readonly Message[] } = {
        type: loading,
        events: [],
    };

    #messagesChanged = new Subject<MessagesChangeCore>();

    public readonly messages: AllRoomMessages;

    public constructor() {
        this.messages = {
            getCurrent: () => this.#messages ?? null,
            changed: this.#messagesChanged.pipe(
                mergeMap<MessagesChangeCore, MessagesChange[]>(changeEvent => {
                    switch (changeEvent.type) {
                        case event: {
                            if (!changeEvent.isLoaded) {
                                return [];
                            }
                            return [{ ...changeEvent, isLoaded: undefined }];
                        }
                        default:
                            return [{ ...changeEvent, isLoaded: undefined }];
                    }
                })
            ),
            filter: filter => {
                return {
                    getCurrent: () => this.#messages?.filter(msg => filter(msg)) ?? null,
                    changed: new Observable(observer => {
                        let messages = this.#messages;

                        return this.#messagesChanged.subscribe(changeEvent => {
                            if (changeEvent.type === query) {
                                messages = changeEvent.current.filter(msg => filter(msg));
                                observer.next({ type: query, current: messages });
                                return;
                            }
                            if (changeEvent.type === reset) {
                                messages = null;
                                observer.next({ type: reset });
                                return;
                            }
                            if (messages == null) {
                                return;
                            }
                            const reduced = reduceEvent({
                                sortedMessagesArray: messages,
                                event: changeEvent.event,
                                filter,
                            });
                            if (reduced === noChange) {
                                return;
                            }
                            messages = reduced;
                            observer.next({
                                type: event,
                                current: reduced,
                                event: changeEvent.event,
                            });
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
        return this.#messagesState.sortedMessages;
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
                default:
                    toBeNever(event);
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
                      state: this.#messagesState.sortedMessages,
                      messages,
                      events: [],
                  });
        this.#messagesState = { type: loaded, sortedMessages: newMessages };
        this.#messagesChanged.next({ type: query, isLoaded: true, current: newMessages });
    }

    public onEvent(event: RoomMessageEventFragment): void {
        if (this.#messagesState.type === loading) {
            this.#messagesState = { type: loading, events: [...this.#messagesState.events, event] };
            this.#messagesChanged.next({ type: 'event', isLoaded: false, event });
            return;
        }
        const reduced = reduceEvent({
            sortedMessagesArray: this.#messagesState.sortedMessages,
            event,
            filter: () => true,
        });
        if (reduced === noChange) {
            return;
        }
        this.#messagesState = {
            type: loaded,
            sortedMessages: reduced,
        };
        this.#messagesChanged.next({ type: 'event', isLoaded: true, current: reduced, event });
    }

    public reset(): void {
        this.#messagesState = {
            type: loading,
            events: [],
        };
        this.#messagesChanged.next({ type: reset, isLoaded: false });
    }
}
