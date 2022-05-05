import { RoomEventSubscription } from '@flocon-trpg/typed-document-node';
import _ from 'lodash';
import { Source, pipe, subscribe } from 'wonka';
import { OperationResult } from '@urql/core';
import { RoomMessagesClient, privateMessage, publicMessage } from '@flocon-trpg/web-server-utils';
import { Option } from '@kizahasi/option';
import { recordForEach } from '@flocon-trpg/utils';

export class TestRoomEventSubscription {
    #values: RoomEventSubscription[] = [];
    #messagesClient = new RoomMessagesClient();

    public constructor(source: Source<OperationResult<RoomEventSubscription>>) {
        this.#messagesClient.onQuery({
            publicMessages: [],
            publicChannels: [],
            pieceLogs: [],
            privateMessages: [],
            soundEffects: [],
        });
        pipe(
            source,
            subscribe(result => {
                if (result.error != null) {
                    throw result.error;
                }
                if (result.data != null) {
                    this.#values.push(result.data);
                    if (result.data.roomEvent?.roomMessageEvent != null) {
                        this.#messagesClient.onEvent(result.data.roomEvent?.roomMessageEvent);
                    }
                }
            })
        );
    }

    public clear() {
        this.#values = [];

        this.#messagesClient = new RoomMessagesClient();
        this.#messagesClient.onQuery({
            publicMessages: [],
            publicChannels: [],
            pieceLogs: [],
            privateMessages: [],
            soundEffects: [],
        });
    }

    public toBeEmpty() {
        expect(this.#values.every(x => x.roomEvent == null)).toBe(true);
    }

    public toBeExactlyOneDeleteRoomEvent({ deletedBy }: { deletedBy: string }) {
        expect(this.#values).toHaveLength(1);
        const deleteRoomOperationEvents = _(this.#values)
            .map(x => x.roomEvent?.deleteRoomOperation)
            .compact()
            .value();
        expect(deleteRoomOperationEvents).toHaveLength(1);
        const actualEvent = deleteRoomOperationEvents[0]!;
        expect(actualEvent.deletedBy).toBe(deletedBy);
    }

    public toBeExactlyOneRoomConnectionEvent({
        event,
        userUid,
    }: {
        event: 'connect' | 'disconnect';
        userUid: string;
    }) {
        expect(this.#values).toHaveLength(1);
        const roomConnectionEvents = _(this.#values)
            .map(x => x.roomEvent?.roomConnectionEvent)
            .compact()
            .value();
        expect(roomConnectionEvents).toHaveLength(1);
        const actualEvent = roomConnectionEvents[0]!;
        expect(actualEvent.isConnected ? 'connect' : 'disconnect').toBe(event);
        expect(actualEvent.userUid).toBe(userUid);
    }

    public toBeExactlyOneRoomOperationEvent() {
        expect(this.#values).toHaveLength(1);
        const roomOperationEvents = _(this.#values)
            .map(x => x.roomEvent?.roomOperation)
            .compact()
            .value();
        expect(roomOperationEvents).toHaveLength(1);
        return roomOperationEvents[0]!;
    }

    public toBeExactlyOneRoomMessageEvent() {
        expect(this.#values).toHaveLength(1);
        const value = this.#values[0]!;
        expect(value.roomEvent).toBeTruthy();
        const roomEvent = value.roomEvent!;
        expect(roomEvent.deleteRoomOperation).toBeFalsy();
        expect(roomEvent.isRoomMessagesResetEvent).toBeFalsy();
        expect(roomEvent.roomConnectionEvent).toBeFalsy();
        expect(roomEvent.roomOperation).toBeFalsy();
        expect(roomEvent.writingMessageStatus).toBeFalsy();
        const roomMessageEvents = roomEvent.roomMessageEvent;
        expect(roomMessageEvents).toBeTruthy();
        return roomMessageEvents!;
    }

    public toBeExactlyOneRoomPrivateMessage() {
        const messages = this.#messagesClient.messages.getCurrent() ?? [];
        expect(messages).toHaveLength(1);
        const message = messages[0]!;
        if (message.type !== privateMessage) {
            expect(message.type).toBe(privateMessage);
            throw new Error('Guard');
        }
        return message.value;
    }

    public toBeExactlyOneRoomPublicMessage() {
        const messages = this.#messagesClient.messages.getCurrent() ?? [];
        expect(messages).toHaveLength(1);
        const message = messages[0]!;
        if (message.type !== publicMessage) {
            expect(message.type).toBe(publicMessage);
            throw new Error('Guard');
        }
        return message.value;
    }
}

export class CompositeTestRoomEventSubscription<TUserUids extends ReadonlyArray<string>> {
    public constructor(
        private readonly instances: { [_ in TUserUids[number]]: TestRoomEventSubscription }
    ) {}

    public clear() {
        recordForEach<TestRoomEventSubscription>(this.instances, x => x.clear());
    }

    public toBeEmpty() {
        recordForEach<TestRoomEventSubscription>(this.instances, x => x.toBeEmpty());
    }

    public except(...userUids: TUserUids[number][]): CompositeTestRoomEventSubscription<TUserUids> {
        const newSubscriptions = { ...this.instances };
        userUids.forEach(userUid => {
            delete newSubscriptions[userUid];
        });
        return new CompositeTestRoomEventSubscription(newSubscriptions);
    }

    public distinct<T>(mapping: (subscription: TestRoomEventSubscription) => T): T {
        let lastValue: Option<T> = Option.none();
        recordForEach<TestRoomEventSubscription>(this.instances, instance => {
            const mapped = mapping(instance);
            if (!lastValue.isNone) {
                expect(lastValue.value).toEqual(mapped);
                return;
            }
            lastValue = Option.some(mapped);
        });
        const result = lastValue as Option<T>;
        if (result.isNone) {
            throw new Error('instances should not be empty.');
        }
        return result.value;
    }
}
