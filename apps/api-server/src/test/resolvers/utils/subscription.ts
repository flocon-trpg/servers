import { RoomEventDoc } from '@flocon-trpg/graphql-documents';
import { recordForEach } from '@flocon-trpg/utils';
import { RoomMessagesClient, privateMessage, publicMessage } from '@flocon-trpg/web-server-utils';
import { ResultOf } from '@graphql-typed-document-node/core';
import { Option } from '@kizahasi/option';
import { OperationResult } from '@urql/core';
import { compact } from 'es-toolkit';
import { Source, pipe, subscribe } from 'wonka';

type RoomEventSubscription = ResultOf<typeof RoomEventDoc>;

const mapCompact = <T, U>(array: readonly T[], mapping: (value: T) => U) => {
    return compact(array.map(mapping));
};

const isRoomConnectionOrEmptyEvents = (result: RoomEventSubscription['result']): boolean => {
    return (
        result.deleteRoomOperation == null &&
        result.isRoomMessagesResetEvent === false &&
        result.roomMessageEvent == null &&
        result.roomOperation == null &&
        result.writingMessageStatus == null
    );
};

const isWritingMessageStatusDisconnectedOrEmptyEvents = (
    result: RoomEventSubscription['result'],
): boolean => {
    return (
        result.deleteRoomOperation == null &&
        result.isRoomMessagesResetEvent === false &&
        result.roomMessageEvent == null &&
        result.roomConnectionEvent == null &&
        result.roomOperation == null &&
        (result.writingMessageStatus == null ||
            result.writingMessageStatus.status === 'Disconnected')
    );
};

type IgnoreOption = {
    ignoreRoomConnectionEvents?: boolean;
    ignoreWritingMessageStatusDisconnected?: boolean;
};

const shouldIgnore = (result: RoomEventSubscription['result'], opts: IgnoreOption): boolean => {
    if (opts.ignoreRoomConnectionEvents === true && isRoomConnectionOrEmptyEvents(result)) {
        return true;
    }
    if (
        opts.ignoreWritingMessageStatusDisconnected === true &&
        isWritingMessageStatusDisconnectedOrEmptyEvents(result)
    ) {
        return true;
    }
    return false;
};

export class TestRoomEventSubscription {
    #values: RoomEventSubscription[] = [];
    #messagesClient = new RoomMessagesClient();
    #subscription;

    public constructor(source: Source<OperationResult<RoomEventSubscription>>) {
        this.#messagesClient.onQuery({
            publicMessages: [],
            publicChannels: [],
            pieceLogs: [],
            privateMessages: [],
            soundEffects: [],
        });
        this.#subscription = pipe(
            source,
            subscribe(result => {
                if (result.error != null) {
                    throw result.error;
                }
                if (result.data != null) {
                    this.#values.push(result.data);
                    if (result.data.result?.roomMessageEvent != null) {
                        this.#messagesClient.onEvent(result.data.result.roomMessageEvent);
                    }
                }
            }),
        );
    }

    public unsubscribe() {
        this.#subscription.unsubscribe();
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

    public toBeEmpty(opts: IgnoreOption) {
        expect(
            this.#values.filter(x => x.result != null && !shouldIgnore(x.result, opts)),
        ).toHaveLength(0);
    }

    public toBeExactlyOneDeleteRoomEvent({ deletedBy }: { deletedBy: string }) {
        expect(this.#values).toHaveLength(1);
        const deleteRoomOperationEvents = mapCompact(
            this.#values,
            x => x.result?.deleteRoomOperation,
        );
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
        const roomConnectionEvents = mapCompact(this.#values, x => x.result?.roomConnectionEvent);
        expect(roomConnectionEvents).toHaveLength(1);
        const actualEvent = roomConnectionEvents[0]!;
        expect(actualEvent.isConnected ? 'connect' : 'disconnect').toBe(event);
        expect(actualEvent.userUid).toBe(userUid);
    }

    public toBeExactlyOneRoomOperationEvent(opts: IgnoreOption) {
        expect(this.#values.filter(({ result }) => !shouldIgnore(result, opts))).toHaveLength(1);
        const roomOperationEvents = mapCompact(this.#values, x => x.result?.roomOperation);
        expect(roomOperationEvents).toHaveLength(1);
        return roomOperationEvents[0]!;
    }

    public toBeExactlyOneRoomMessageEvent() {
        expect(this.#values).toHaveLength(1);
        const value = this.#values[0]!;
        expect(value.result).toBeTruthy();
        const roomEvent = value.result;
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
        private readonly instances: { [_ in TUserUids[number]]: TestRoomEventSubscription },
    ) {}

    public unsubscribe() {
        recordForEach<TestRoomEventSubscription>(this.instances, x => x.unsubscribe());
    }

    public clear() {
        recordForEach<TestRoomEventSubscription>(this.instances, x => x.clear());
    }

    public toBeEmpty(opts: IgnoreOption) {
        recordForEach<TestRoomEventSubscription>(this.instances, x => x.toBeEmpty(opts));
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
