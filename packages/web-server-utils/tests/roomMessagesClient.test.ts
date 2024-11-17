import { Observable, pairwise, startWith } from 'rxjs';
import {
    Diff as $Diff,
    Message as $Message,
    MessagesChange as $MessagesChange,
    RoomMessagesClient,
    custom,
    privateMessage,
    publicMessage,
} from '../src';
import { Fixtures, TestCustomMessage } from './fixtures';

type Diff = $Diff<TestCustomMessage>;
type Message = $Message<TestCustomMessage>;
type MessagesChange = $MessagesChange<TestCustomMessage>;

type MessageFilter = (message: Message) => boolean;

class MessagesChangeTester {
    #changes: MessagesChange[] = [];
    #prevMessages: readonly Message[] | null = null;

    public constructor(source: Observable<MessagesChange>) {
        source.pipe(startWith(null), pairwise()).subscribe(([prev, current]) => {
            if (current == null) {
                throw new Error('This should not happen');
            }
            if (prev != null) {
                this.#prevMessages = prev.current ?? null;
            }
            this.#changes.push(current);
        });
    }

    public expectToBeEmpty() {
        expect(this.#changes).toEqual([]);
    }

    #expectToBeOneEvent() {
        if (this.#changes.length !== 1) {
            expect(this.#changes).toHaveLength(1);
            throw new Error('Guard');
        }
        return this.#changes[0]!;
    }

    static #testDiff({
        prevValue,
        nextValue,
        actualDiff,
    }: {
        prevValue: readonly Message[];
        nextValue: readonly Message[];
        actualDiff: Diff | null;
    }) {
        const removed = new Set(prevValue);
        const added = new Set<Message>();

        for (const n of nextValue) {
            if (removed.delete(n)) {
                continue;
            }
            added.add(n);
        }

        if (actualDiff == null) {
            expect([]).toEqual([...removed]);
            expect([]).toEqual([...added]);
            return;
        }

        expect(actualDiff.prevValue == null ? [] : [actualDiff.prevValue]).toEqual([...removed]);
        expect(actualDiff.nextValue == null ? [] : [actualDiff.nextValue]).toEqual([...added]);
    }

    public expectToBeOneQuery(expected: readonly Message[]) {
        const event = this.#expectToBeOneEvent();
        if (event.type !== 'query') {
            expect(event.type).toBe('query');
            throw new Error('Guard');
        }
        expect(event.current).toEqual(expected);
        this.#changes = [];
        this.#prevMessages = event.current;
    }

    public expectToBeOneEvent(expected: readonly Message[] | null) {
        const event = this.#expectToBeOneEvent();
        if (event.type !== 'event') {
            expect(event.type).toBe('event');
            throw new Error('Guard');
        }
        expect(event.current).toEqual(expected);
        MessagesChangeTester.#testDiff({
            prevValue: this.#prevMessages ?? [],
            nextValue: event.current,
            actualDiff: event.diff,
        });
        this.#changes = [];
        this.#prevMessages = event.current;
    }

    public expectToBeOneClear() {
        const event = this.#expectToBeOneEvent();
        if (event.type !== 'clear') {
            expect(event.type).toBe('clear');
            throw new Error('Guard');
        }
        this.#changes = [];
        this.#prevMessages = null;
    }

    public clearChanges() {
        this.#changes = [];
    }
}

const messageFilter =
    (startsWith: string | true | false): MessageFilter =>
    message => {
        if (startsWith === true || startsWith === false) {
            return startsWith;
        }
        switch (message.type) {
            case publicMessage:
            case privateMessage: {
                const text = message.value.updatedText?.currentText ?? message.value.initText;
                if (text == null) {
                    return false;
                }
                return text.startsWith(startsWith);
            }
            case custom: {
                const text = message.value;
                if (text == null) {
                    return true;
                }
                return text.startsWith(startsWith);
            }
            default:
                return true;
        }
    };

describe('RoomMessagesClient', () => {
    it.each([null, true])('tests creating an instance - filterType=%p', filterType => {
        const filter = filterType == null ? null : messageFilter(filterType);
        const baseClient = new RoomMessagesClient<TestCustomMessage>();
        const client = filter == null ? baseClient.messages : baseClient.messages.filter(filter);
        const tester = new MessagesChangeTester(client.changed);

        expect(client.getCurrent()).toEqual([]);
        tester.expectToBeEmpty();
    });

    it.each([null, true])('tests an empty query to init - filterType=%p', filterType => {
        const filter = filterType == null ? null : messageFilter(filterType);
        const baseClient = new RoomMessagesClient<TestCustomMessage>();
        const client = filter == null ? baseClient.messages : baseClient.messages.filter(filter);
        const tester = new MessagesChangeTester(client.changed);

        baseClient.onQuery(Fixtures.RoomMessages.empty);

        expect(client.getCurrent()).toEqual([]);
        tester.expectToBeOneQuery([]);
    });

    it.each([null, true])('tests non-filtered query to init - filterType=%p', filterType => {
        const init = {
            ...Fixtures.RoomMessages.empty,
            publicMessages: [Fixtures.RoomPublicMessage.message7b],
            publicChannels: [Fixtures.RoomPublicChannel.channel1],
            privateMessages: [Fixtures.RoomPrivateMessage.message8b],
        };
        const expected = [Fixtures.Message.publicMessage7b, Fixtures.Message.privateMessage8b];

        const filter = filterType == null ? null : messageFilter(filterType);
        const baseClient = new RoomMessagesClient<TestCustomMessage>();
        const client = filter == null ? baseClient.messages : baseClient.messages.filter(filter);
        const tester = new MessagesChangeTester(client.changed);

        baseClient.onQuery(init);

        expect(client.getCurrent()).toEqual(expected);
        tester.expectToBeOneQuery(expected);
    });

    it('tests filtered query to init', () => {
        const filter = messageFilter(':a');
        const baseClient = new RoomMessagesClient<TestCustomMessage>();
        const client = baseClient.messages.filter(filter);
        const tester = new MessagesChangeTester(client.changed);

        const init = {
            ...Fixtures.RoomMessages.empty,
            publicMessages: [
                Fixtures.RoomPublicMessage.message3a,
                Fixtures.RoomPublicMessage.message7b,
            ],
            publicChannels: [Fixtures.RoomPublicChannel.channel1],
            privateMessages: [
                Fixtures.RoomPrivateMessage.message8b,
                Fixtures.RoomPrivateMessage.message2a,
            ],
        };
        const expected = [Fixtures.Message.publicMessage3a, Fixtures.Message.privateMessage2a];
        baseClient.onQuery(init);
        expect(client.getCurrent()).toEqual(expected.filter(filter));
        tester.expectToBeOneQuery(expected.filter(filter));
    });

    it('tests multiple onQuery', () => {
        const filter = messageFilter(':a');
        const baseClient = new RoomMessagesClient<TestCustomMessage>();
        const client = baseClient.messages.filter(filter);
        const tester = new MessagesChangeTester(client.changed);

        const query1 = {
            ...Fixtures.RoomMessages.empty,
            publicMessages: [Fixtures.RoomPublicMessage.message3a],
            privateMessages: [Fixtures.RoomPrivateMessage.message2a],
        };
        const query2 = {
            ...Fixtures.RoomMessages.empty,
            publicMessages: [Fixtures.RoomPublicMessage.updatedMessage3b],
            privateMessages: [Fixtures.RoomPrivateMessage.message4a],
        };
        const expected = [
            Fixtures.Message.updatedPublicMessage3b,
            Fixtures.Message.privateMessage4a,
        ];

        baseClient.onQuery(query1);
        tester.clearChanges();
        baseClient.onQuery(query2);
        expect(client.getCurrent()).toEqual(expected.filter(filter));
        tester.expectToBeOneQuery(expected.filter(filter));
    });

    it.each([null, true])('tests non-filtered addCustomMessage - filterType=%p', filterType => {
        const filter = filterType == null ? null : messageFilter(filterType);
        const baseClient = new RoomMessagesClient<TestCustomMessage>();
        const client = filter == null ? baseClient.messages : baseClient.messages.filter(filter);
        const tester = new MessagesChangeTester(client.changed);

        baseClient.addCustomMessage({
            value: 'TEST_MESSAGE',
            createdAt: 1_000_000_000,
        });

        expect(client.getCurrent()).toEqual([
            {
                type: custom,
                value: 'TEST_MESSAGE',
                createdAt: 1_000_000_000,
            },
        ]);
        tester.expectToBeOneEvent([
            {
                type: custom,
                value: 'TEST_MESSAGE',
                createdAt: 1_000_000_000,
            },
        ]);
    });

    it('tests filtered addCustomMessage', () => {
        const filter = messageFilter(false);
        const baseClient = new RoomMessagesClient<TestCustomMessage>();
        const client = baseClient.messages.filter(filter);
        const tester = new MessagesChangeTester(client.changed);

        baseClient.addCustomMessage({
            value: 'TEST_MESSAGE',
            createdAt: 1_000_000_000,
        });

        expect(client.getCurrent()).toEqual([]);
        tester.expectToBeOneEvent([]);
    });

    it.each([null, true])('onEvent to init', filterType => {
        const filter = filterType == null ? null : messageFilter(filterType);
        const baseClient = new RoomMessagesClient<TestCustomMessage>();
        const client = filter == null ? baseClient.messages : baseClient.messages.filter(filter);
        const tester = new MessagesChangeTester(client.changed);

        const event = Fixtures.RoomPublicMessage.message1a;
        baseClient.onEvent(event);

        expect(client.getCurrent()).toEqual([]);
        tester.expectToBeOneEvent([]);
    });

    it.each([null, true])('adds a PublicMessage by an event - filterType=%p', filterType => {
        const filter = filterType == null ? null : messageFilter(filterType);
        const baseClient = new RoomMessagesClient<TestCustomMessage>();
        const client = filter == null ? baseClient.messages : baseClient.messages.filter(filter);
        const tester = new MessagesChangeTester(client.changed);

        const query = {
            ...Fixtures.RoomMessages.empty,
            publicMessages: [Fixtures.RoomPublicMessage.message1a],
        };
        baseClient.onQuery(query);
        tester.clearChanges();

        const event = Fixtures.RoomPublicMessage.message3a;
        baseClient.onEvent(event);

        const expected = [Fixtures.Message.publicMessage1a, Fixtures.Message.publicMessage3a];
        expect(client.getCurrent()).toEqual(expected);
        tester.expectToBeOneEvent(expected);
    });

    it.each([null, true])('adds a PrivateMessage by an event - filterType=%p', filterType => {
        const filter = filterType == null ? null : messageFilter(filterType);
        const baseClient = new RoomMessagesClient<TestCustomMessage>();
        const client = filter == null ? baseClient.messages : baseClient.messages.filter(filter);
        const tester = new MessagesChangeTester(client.changed);

        const query = {
            ...Fixtures.RoomMessages.empty,
            publicMessages: [Fixtures.RoomPublicMessage.message1a],
        };
        baseClient.onQuery(query);
        tester.clearChanges();

        const event = Fixtures.RoomPrivateMessage.message2a;
        baseClient.onEvent(event);

        const expected = [Fixtures.Message.publicMessage1a, Fixtures.Message.privateMessage2a];
        expect(client.getCurrent()).toEqual(expected);
        tester.expectToBeOneEvent(expected);
    });

    it.each([null, true])('adds a PieceLog by an event - filterType=%p', filterType => {
        const filter = filterType == null ? null : messageFilter(filterType);
        const baseClient = new RoomMessagesClient<TestCustomMessage>();
        const client = filter == null ? baseClient.messages : baseClient.messages.filter(filter);
        const tester = new MessagesChangeTester(client.changed);

        const query = {
            ...Fixtures.RoomMessages.empty,
            publicMessages: [Fixtures.RoomPublicMessage.message1a],
        };
        baseClient.onQuery(query);
        tester.clearChanges();

        const event = Fixtures.PieceLog.message6;
        baseClient.onEvent(event);

        const expected = [Fixtures.Message.publicMessage1a, Fixtures.Message.pieceLog6];
        expect(client.getCurrent()).toEqual(expected);
        tester.expectToBeOneEvent(expected);
    });

    it.each([null, true])('adds a SoundEffect by an event - filterType=%p', filterType => {
        const filter = filterType == null ? null : messageFilter(filterType);
        const baseClient = new RoomMessagesClient<TestCustomMessage>();
        const client = filter == null ? baseClient.messages : baseClient.messages.filter(filter);
        const tester = new MessagesChangeTester(client.changed);

        const query = {
            ...Fixtures.RoomMessages.empty,
            publicMessages: [Fixtures.RoomPublicMessage.message1a],
        };
        baseClient.onQuery(query);
        tester.clearChanges();

        const event = Fixtures.SoundEffect.message5;
        baseClient.onEvent(event);

        const expected = [Fixtures.Message.publicMessage1a, Fixtures.Message.soundEffect5];
        expect(client.getCurrent()).toEqual(expected);
        tester.expectToBeOneEvent(expected);
    });

    it.each([null, true])('should ignore PublicRoomChannel event - filterType=%p', filterType => {
        const filter = filterType == null ? null : messageFilter(filterType);
        const baseClient = new RoomMessagesClient<TestCustomMessage>();
        const client = filter == null ? baseClient.messages : baseClient.messages.filter(filter);
        const tester = new MessagesChangeTester(client.changed);

        const query = {
            ...Fixtures.RoomMessages.empty,
            publicMessages: [Fixtures.RoomPublicMessage.message1a],
        };
        baseClient.onQuery(query);
        tester.clearChanges();

        const event = Fixtures.RoomPublicChannel.channel1;
        baseClient.onEvent(event);

        const expected = [Fixtures.Message.publicMessage1a];
        expect(client.getCurrent()).toEqual(expected);
        tester.expectToBeEmpty();
    });

    it.each([null, true])(
        'updates messages by an update event before - filterType=%p',
        filterType => {
            const filter = filterType == null ? null : messageFilter(filterType);
            const baseClient = new RoomMessagesClient<TestCustomMessage>();
            const client =
                filter == null ? baseClient.messages : baseClient.messages.filter(filter);
            const tester = new MessagesChangeTester(client.changed);

            const event = Fixtures.RoomPublicMessage.updateMessage3aTo3bEvent;
            baseClient.onEvent(event);
            tester.clearChanges();

            const query = {
                ...Fixtures.RoomMessages.empty,
                publicMessages: [Fixtures.RoomPublicMessage.message3a],
            };
            baseClient.onQuery(query);
            const expected = [Fixtures.Message.updatedPublicMessage3b];
            expect(client.getCurrent()).toEqual(expected);
            tester.expectToBeOneQuery(expected);
        },
    );

    it.each([null, true])(
        'updates messages by an update event after - filterType=%p',
        filterType => {
            const filter = filterType == null ? null : messageFilter(filterType);
            const baseClient = new RoomMessagesClient<TestCustomMessage>();
            const client =
                filter == null ? baseClient.messages : baseClient.messages.filter(filter);
            const tester = new MessagesChangeTester(client.changed);

            const query = {
                ...Fixtures.RoomMessages.empty,
                privateMessages: [Fixtures.RoomPrivateMessage.message4a],
            };
            baseClient.onQuery(query);
            tester.clearChanges();

            const event = Fixtures.RoomPrivateMessage.updateMessage4aTo4bEvent;
            baseClient.onEvent(event);

            const expected = [Fixtures.Message.updatedPrivateMessage4b];
            expect(client.getCurrent()).toEqual(expected);
            tester.expectToBeOneEvent(expected);
        },
    );

    it('should show a message by an update event', () => {
        const filter = messageFilter('b:');
        const baseClient = new RoomMessagesClient<TestCustomMessage>();
        const client = baseClient.messages.filter(filter);
        const tester = new MessagesChangeTester(client.changed);

        const query = {
            ...Fixtures.RoomMessages.empty,
            publicMessages: [Fixtures.RoomPublicMessage.message3a],
        };
        baseClient.onQuery(query);
        tester.clearChanges();

        const event = Fixtures.RoomPublicMessage.updateMessage3aTo3bEvent;
        baseClient.onEvent(event);

        const expected = [Fixtures.Message.updatedPublicMessage3b];
        expect(client.getCurrent()).toEqual(expected);
        tester.expectToBeOneEvent(expected);
    });

    it('should hide a message by an update event', () => {
        const filter = messageFilter('a:');
        const baseClient = new RoomMessagesClient<TestCustomMessage>();
        const client = baseClient.messages.filter(filter);
        const tester = new MessagesChangeTester(client.changed);

        const query = {
            ...Fixtures.RoomMessages.empty,
            privateMessages: [Fixtures.RoomPrivateMessage.message4a],
        };
        baseClient.onQuery(query);
        tester.clearChanges();

        const event = Fixtures.RoomPrivateMessage.updateMessage4aTo4bEvent;
        baseClient.onEvent(event);

        const expected: [] = [];
        expect(client.getCurrent()).toEqual(expected);
        tester.expectToBeOneEvent(expected);
    });

    it.each([null, true])('tests clear - filterType=%p', filterType => {
        const filter = filterType == null ? null : messageFilter(filterType);
        const baseClient = new RoomMessagesClient<TestCustomMessage>();
        const client = filter == null ? baseClient.messages : baseClient.messages.filter(filter);
        const tester = new MessagesChangeTester(client.changed);

        const query = {
            ...Fixtures.RoomMessages.empty,
            publicMessages: [Fixtures.RoomPublicMessage.message1a],
        };
        baseClient.onQuery(query);

        baseClient.addCustomMessage({
            value: 'TEST_MESSAGE',
            createdAt: 1_000_000_000,
        });

        tester.clearChanges();

        baseClient.clear();

        const expected: [] = [];
        expect(client.getCurrent()).toEqual(expected);
        tester.expectToBeOneClear();
    });
});
