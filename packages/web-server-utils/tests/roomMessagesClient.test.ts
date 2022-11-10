import { RoomMessages } from '@flocon-trpg/typed-document-node-v0.7.1';
import { Observable, pairwise, startWith } from 'rxjs';
import {
    Diff as $Diff,
    Message as $Message,
    MessagesChange as $MessagesChange,
    RoomMessagesClient,
    privateMessage,
    publicMessage,
} from '../src';
import { Resources, TestCustomMessage } from './fixtures';

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
        if (this.#prevMessages == null) {
            expect(this.#prevMessages).not.toBeNull();
            throw new Error('Guard');
        }
        expect(event.current).toEqual(expected);
        MessagesChangeTester.#testDiff({
            prevValue: this.#prevMessages,
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
    (type: 'a' | 'b' | true | false): MessageFilter =>
    message => {
        if (type === true || type === false) {
            return type;
        }
        switch (message.type) {
            case publicMessage:
            case privateMessage: {
                const text = message.value.updatedText?.currentText ?? message.value.initText;
                if (text == null) {
                    return true;
                }
                return text.startsWith(type + ':');
            }
            default:
                return true;
        }
    };

describe.each(
    // nullはfilterを適用しないことを示す
    // 'a'は'a:'で始まるメッセージを、'b'は'b:'で始まるメッセージを示す
    [null, true, false, 'a', 'b'] as const
)('RoomMessagesClient: filterType=%o', filterType => {
    const filter = filterType == null ? null : messageFilter(filterType);
    const arrayFilter = filter ?? (() => true);

    it('tests creating an instance', () => {
        const baseClient = new RoomMessagesClient<TestCustomMessage>();
        const client = filter == null ? baseClient.messages : baseClient.messages.filter(filter);
        const clientChanged = new MessagesChangeTester(client.changed);

        expect(client.getCurrent()).toBeNull();
        clientChanged.expectToBeEmpty();
    });

    describe('onQuery', () => {
        it('an empty instance', () => {
            const baseClient = new RoomMessagesClient<TestCustomMessage>();
            const client =
                filter == null ? baseClient.messages : baseClient.messages.filter(filter);
            const clientChanged = new MessagesChangeTester(client.changed);

            baseClient.onQuery(Resources.RoomMessages.empty);

            expect(client.getCurrent()).toEqual([]);
            clientChanged.expectToBeOneQuery([]);
        });

        it.each([
            {
                init: {
                    ...Resources.RoomMessages.empty,
                    publicMessages: [
                        Resources.RoomPublicMessage.message1a,
                        Resources.RoomPublicMessage.message3a,
                    ],
                    publicChannels: [Resources.RoomPublicChannel.channel1],
                },
                expected: [Resources.Message.publicMessage1, Resources.Message.publicMessage3a],
            },
            {
                init: {
                    ...Resources.RoomMessages.empty,
                    publicMessages: [
                        Resources.RoomPublicMessage.message3a,
                        Resources.RoomPublicMessage.message1a,
                    ],
                    publicChannels: [Resources.RoomPublicChannel.channel1],
                },
                expected: [Resources.Message.publicMessage1, Resources.Message.publicMessage3a],
            },
            {
                init: {
                    ...Resources.RoomMessages.empty,
                    publicMessages: [
                        Resources.RoomPublicMessage.message3a,
                        Resources.RoomPublicMessage.message1a,
                    ],
                    publicChannels: [Resources.RoomPublicChannel.channel1],
                    privateMessages: [Resources.RoomPrivateMessage.message2a],
                },
                expected: [
                    Resources.Message.publicMessage1,
                    Resources.Message.privateMessage2,
                    Resources.Message.publicMessage3a,
                ],
            },
        ])('non-empty instances', ({ init, expected }) => {
            const baseClient = new RoomMessagesClient<TestCustomMessage>();
            const client =
                filter == null ? baseClient.messages : baseClient.messages.filter(filter);
            const clientChanged = new MessagesChangeTester(client.changed);

            baseClient.onQuery(init);

            expect(client.getCurrent()).toEqual(expected.filter(arrayFilter));
            clientChanged.expectToBeOneQuery(expected.filter(arrayFilter));
        });
    });

    it('onEvent', () => {
        const baseClient = new RoomMessagesClient<TestCustomMessage>();
        const client = filter == null ? baseClient.messages : baseClient.messages.filter(filter);
        const clientChanged = new MessagesChangeTester(client.changed);

        const event = Resources.RoomPublicMessage.message1a;
        baseClient.onEvent(event);

        expect(client.getCurrent()).toBeNull();
        clientChanged.expectToBeEmpty();
    });

    it('clear', () => {
        const baseClient = new RoomMessagesClient<TestCustomMessage>();
        const client = filter == null ? baseClient.messages : baseClient.messages.filter(filter);
        const clientChanged = new MessagesChangeTester(client.changed);

        baseClient.clear();

        expect(client.getCurrent()).toBeNull();
        clientChanged.expectToBeOneClear();
    });

    describe.each(['none', 'clear', 'query->clear'] as const)(
        'multiple operations',
        clearOnInit => {
            const queryBeforeClear: RoomMessages = {
                ...Resources.RoomMessages.empty,
                publicMessages: [
                    Resources.RoomPublicMessage.message1a,
                    Resources.RoomPublicMessage.message3a,
                    Resources.RoomPublicMessage.message7b,
                ],
                privateMessages: [
                    Resources.RoomPrivateMessage.message2a,
                    Resources.RoomPrivateMessage.message4a,
                    Resources.RoomPrivateMessage.message8b,
                ],
                soundEffects: [Resources.SoundEffect.message5],
                pieceLogs: [Resources.PieceLog.message6],
                publicChannels: [Resources.RoomPublicChannel.channel1],
            };

            it.each([
                {
                    query: {
                        ...Resources.RoomMessages.empty,
                        publicMessages: [
                            Resources.RoomPublicMessage.message1a,
                            Resources.RoomPublicMessage.message7b,
                        ],
                        soundEffects: [Resources.SoundEffect.message5],
                        pieceLogs: [Resources.PieceLog.message6],
                        privateMessages: [
                            Resources.RoomPrivateMessage.message2a,
                            Resources.RoomPrivateMessage.message4a,
                            Resources.RoomPrivateMessage.message8b,
                        ],
                        publicChannels: [Resources.RoomPublicChannel.channel1],
                    },
                    event: Resources.RoomPublicMessage.message3a,
                    expected: [
                        Resources.Message.publicMessage1,
                        Resources.Message.privateMessage2,
                        Resources.Message.publicMessage3a,
                        Resources.Message.privateMessage4a,
                        Resources.Message.soundEffect5,
                        Resources.Message.pieceLog6,
                        Resources.Message.publicMessage7,
                        Resources.Message.privateMessage8,
                    ],
                },
                {
                    query: {
                        ...Resources.RoomMessages.empty,
                        publicMessages: [
                            Resources.RoomPublicMessage.message1a,
                            Resources.RoomPublicMessage.message3a,
                            Resources.RoomPublicMessage.message7b,
                        ],
                        soundEffects: [Resources.SoundEffect.message5],
                        pieceLogs: [Resources.PieceLog.message6],
                        privateMessages: [
                            Resources.RoomPrivateMessage.message2a,
                            Resources.RoomPrivateMessage.message8b,
                        ],
                        publicChannels: [Resources.RoomPublicChannel.channel1],
                    },
                    event: Resources.RoomPrivateMessage.message4a,
                    expected: [
                        Resources.Message.publicMessage1,
                        Resources.Message.privateMessage2,
                        Resources.Message.publicMessage3a,
                        Resources.Message.privateMessage4a,
                        Resources.Message.soundEffect5,
                        Resources.Message.pieceLog6,
                        Resources.Message.publicMessage7,
                        Resources.Message.privateMessage8,
                    ],
                },
                {
                    query: {
                        ...Resources.RoomMessages.empty,
                        publicMessages: [
                            Resources.RoomPublicMessage.message1a,
                            Resources.RoomPublicMessage.message3a,
                            Resources.RoomPublicMessage.message7b,
                        ],
                        soundEffects: [],
                        pieceLogs: [Resources.PieceLog.message6],
                        privateMessages: [
                            Resources.RoomPrivateMessage.message2a,
                            Resources.RoomPrivateMessage.message4a,
                            Resources.RoomPrivateMessage.message8b,
                        ],
                        publicChannels: [Resources.RoomPublicChannel.channel1],
                    },
                    event: Resources.SoundEffect.message5,
                    expected: [
                        Resources.Message.publicMessage1,
                        Resources.Message.privateMessage2,
                        Resources.Message.publicMessage3a,
                        Resources.Message.privateMessage4a,
                        Resources.Message.soundEffect5,
                        Resources.Message.pieceLog6,
                        Resources.Message.publicMessage7,
                        Resources.Message.privateMessage8,
                    ],
                },
                {
                    query: {
                        ...Resources.RoomMessages.empty,
                        publicMessages: [
                            Resources.RoomPublicMessage.message1a,
                            Resources.RoomPublicMessage.message3a,
                            Resources.RoomPublicMessage.message7b,
                        ],
                        soundEffects: [Resources.SoundEffect.message5],
                        pieceLogs: [],
                        privateMessages: [
                            Resources.RoomPrivateMessage.message2a,
                            Resources.RoomPrivateMessage.message4a,
                            Resources.RoomPrivateMessage.message8b,
                        ],
                        publicChannels: [Resources.RoomPublicChannel.channel1],
                    },
                    event: Resources.PieceLog.message6,
                    expected: [
                        Resources.Message.publicMessage1,
                        Resources.Message.privateMessage2,
                        Resources.Message.publicMessage3a,
                        Resources.Message.privateMessage4a,
                        Resources.Message.soundEffect5,
                        Resources.Message.pieceLog6,
                        Resources.Message.publicMessage7,
                        Resources.Message.privateMessage8,
                    ],
                },
                {
                    query: {
                        ...Resources.RoomMessages.empty,
                        publicMessages: [
                            Resources.RoomPublicMessage.message1a,
                            Resources.RoomPublicMessage.message3a,
                            Resources.RoomPublicMessage.message7b,
                        ],
                        privateMessages: [
                            Resources.RoomPrivateMessage.message2a,
                            Resources.RoomPrivateMessage.message4a,
                            Resources.RoomPrivateMessage.message8b,
                        ],
                        soundEffects: [Resources.SoundEffect.message5],
                        pieceLogs: [Resources.PieceLog.message6],
                        publicChannels: [Resources.RoomPublicChannel.channel1],
                    },
                    event: Resources.RoomPublicMessage.updateMessage3aTo3bEvent,
                    expected: [
                        Resources.Message.publicMessage1,
                        Resources.Message.privateMessage2,
                        Resources.Message.updatedPublicMessage3b,
                        Resources.Message.privateMessage4a,
                        Resources.Message.soundEffect5,
                        Resources.Message.pieceLog6,
                        Resources.Message.publicMessage7,
                        Resources.Message.privateMessage8,
                    ],
                },
                {
                    query: {
                        ...Resources.RoomMessages.empty,
                        publicMessages: [
                            Resources.RoomPublicMessage.message1a,
                            Resources.RoomPublicMessage.message3a,
                            Resources.RoomPublicMessage.message7b,
                        ],
                        privateMessages: [
                            Resources.RoomPrivateMessage.message2a,
                            Resources.RoomPrivateMessage.message4a,
                            Resources.RoomPrivateMessage.message8b,
                        ],
                        soundEffects: [Resources.SoundEffect.message5],
                        pieceLogs: [Resources.PieceLog.message6],
                        publicChannels: [Resources.RoomPublicChannel.channel1],
                    },
                    event: Resources.RoomPrivateMessage.updateMessage4aTo4bEvent,
                    expected: [
                        Resources.Message.publicMessage1,
                        Resources.Message.privateMessage2,
                        Resources.Message.publicMessage3a,
                        Resources.Message.updatedPrivateMessage4b,
                        Resources.Message.soundEffect5,
                        Resources.Message.pieceLog6,
                        Resources.Message.publicMessage7,
                        Resources.Message.privateMessage8,
                    ],
                },
            ])('(clear) -> onQuery -> onEvent -> clear', ({ query, event, expected }) => {
                const baseClient = new RoomMessagesClient<TestCustomMessage>();
                const client =
                    filter == null ? baseClient.messages : baseClient.messages.filter(filter);
                const clientChanged = new MessagesChangeTester(client.changed);

                if (clearOnInit !== 'none') {
                    if (clearOnInit === 'query->clear') {
                        baseClient.onQuery(queryBeforeClear);
                    }
                    baseClient.clear();
                    clientChanged.clearChanges();
                }

                baseClient.onQuery(query);

                clientChanged.clearChanges();

                baseClient.onEvent(event);

                expect(client.getCurrent()).toEqual(expected.filter(arrayFilter));
                clientChanged.expectToBeOneEvent(expected.filter(arrayFilter));

                baseClient.clear();

                expect(client.getCurrent()).toBeNull();
                clientChanged.expectToBeOneClear();
            });

            it.each([
                {
                    query: {
                        ...Resources.RoomMessages.empty,
                        publicMessages: [Resources.RoomPublicMessage.message1a],
                    },
                    event1: Resources.RoomPublicMessage.message3a,
                    event2: Resources.RoomPublicMessage.message7b,
                    expected: [
                        Resources.Message.publicMessage1,
                        Resources.Message.publicMessage3a,
                        Resources.Message.publicMessage7,
                    ],
                },
            ])(
                '(clear) -> onQuery -> onEvent -> onEvent -> clear',
                ({ query, event1, event2, expected }) => {
                    const baseClient = new RoomMessagesClient<TestCustomMessage>();
                    const client =
                        filter == null ? baseClient.messages : baseClient.messages.filter(filter);
                    const clientChanged = new MessagesChangeTester(client.changed);

                    if (clearOnInit !== 'none') {
                        if (clearOnInit === 'query->clear') {
                            baseClient.onQuery(queryBeforeClear);
                        }
                        baseClient.clear();
                        clientChanged.clearChanges();
                    }

                    baseClient.onQuery(query);

                    clientChanged.clearChanges();

                    baseClient.onEvent(event1);

                    clientChanged.clearChanges();

                    baseClient.onEvent(event2);

                    expect(client.getCurrent()).toEqual(expected.filter(arrayFilter));
                    clientChanged.expectToBeOneEvent(expected.filter(arrayFilter));

                    baseClient.clear();

                    expect(client.getCurrent()).toBeNull();
                    clientChanged.expectToBeOneClear();
                }
            );

            it.each([
                {
                    events: [
                        Resources.RoomPublicMessage.updateMessage3aTo3bEvent,
                        Resources.RoomPrivateMessage.updateMessage4aTo4bEvent,
                    ],
                    query: {
                        ...Resources.RoomMessages.empty,
                        publicMessages: [
                            Resources.RoomPublicMessage.message1a,
                            Resources.RoomPublicMessage.message3a,
                            Resources.RoomPublicMessage.message7b,
                        ],
                        privateMessages: [
                            Resources.RoomPrivateMessage.message2a,
                            Resources.RoomPrivateMessage.message4a,
                            Resources.RoomPrivateMessage.message8b,
                        ],
                        soundEffects: [Resources.SoundEffect.message5],
                        pieceLogs: [Resources.PieceLog.message6],
                        publicChannels: [Resources.RoomPublicChannel.channel1],
                    },
                    expected: [
                        Resources.Message.publicMessage1,
                        Resources.Message.privateMessage2,
                        Resources.Message.updatedPublicMessage3b,
                        Resources.Message.updatedPrivateMessage4b,
                        Resources.Message.soundEffect5,
                        Resources.Message.pieceLog6,
                        Resources.Message.publicMessage7,
                        Resources.Message.privateMessage8,
                    ],
                },
                {
                    events: [
                        Resources.RoomPrivateMessage.updateMessage4aTo4bEvent,
                        Resources.RoomPublicMessage.updateMessage3aTo3bEvent,
                    ],
                    query: {
                        ...Resources.RoomMessages.empty,
                        publicMessages: [
                            Resources.RoomPublicMessage.message1a,
                            Resources.RoomPublicMessage.message3a,
                            Resources.RoomPublicMessage.message7b,
                        ],
                        privateMessages: [
                            Resources.RoomPrivateMessage.message2a,
                            Resources.RoomPrivateMessage.message4a,
                            Resources.RoomPrivateMessage.message8b,
                        ],
                        soundEffects: [Resources.SoundEffect.message5],
                        pieceLogs: [Resources.PieceLog.message6],
                        publicChannels: [Resources.RoomPublicChannel.channel1],
                    },
                    expected: [
                        Resources.Message.publicMessage1,
                        Resources.Message.privateMessage2,
                        Resources.Message.updatedPublicMessage3b,
                        Resources.Message.updatedPrivateMessage4b,
                        Resources.Message.soundEffect5,
                        Resources.Message.pieceLog6,
                        Resources.Message.publicMessage7,
                        Resources.Message.privateMessage8,
                    ],
                },
            ])('(clear) -> onEvent -> onQuery -> clear', ({ events, query, expected }) => {
                const baseClient = new RoomMessagesClient<TestCustomMessage>();
                const client =
                    filter == null ? baseClient.messages : baseClient.messages.filter(filter);
                const clientChanged = new MessagesChangeTester(client.changed);

                if (clearOnInit !== 'none') {
                    if (clearOnInit === 'query->clear') {
                        baseClient.onQuery(queryBeforeClear);
                    }
                    baseClient.clear();
                    clientChanged.clearChanges();
                }

                events.forEach(event => baseClient.onEvent(event));

                clientChanged.clearChanges();

                baseClient.onQuery(query);

                expect(client.getCurrent()).toEqual(expected.filter(arrayFilter));
                clientChanged.expectToBeOneQuery(expected.filter(arrayFilter));

                clientChanged.clearChanges();

                baseClient.clear();

                expect(client.getCurrent()).toBeNull();
                clientChanged.expectToBeOneClear();
            });

            it.each([
                {
                    query1: {
                        ...Resources.RoomMessages.empty,
                        publicMessages: [
                            Resources.RoomPublicMessage.message1a,
                            Resources.RoomPublicMessage.message3a,
                        ],
                        privateMessages: [
                            Resources.RoomPrivateMessage.message2a,
                            Resources.RoomPrivateMessage.message4a,
                        ],
                    },
                    query2: {
                        ...Resources.RoomMessages.empty,
                        publicMessages: [
                            Resources.RoomPublicMessage.updatedMessage3b,
                            Resources.RoomPublicMessage.message7b,
                        ],
                        privateMessages: [
                            Resources.RoomPrivateMessage.updatedMessage4b,
                            Resources.RoomPrivateMessage.message8b,
                        ],
                        soundEffects: [Resources.SoundEffect.message5],
                        pieceLogs: [Resources.PieceLog.message6],
                    },
                    expected: [
                        Resources.Message.publicMessage1,
                        Resources.Message.privateMessage2,
                        Resources.Message.updatedPublicMessage3b,
                        Resources.Message.updatedPrivateMessage4b,
                        Resources.Message.soundEffect5,
                        Resources.Message.pieceLog6,
                        Resources.Message.publicMessage7,
                        Resources.Message.privateMessage8,
                    ],
                },
            ])('(clear) -> onQuery -> onQuery -> clear', ({ query1, query2, expected }) => {
                const baseClient = new RoomMessagesClient<TestCustomMessage>();
                const client =
                    filter == null ? baseClient.messages : baseClient.messages.filter(filter);
                const clientChanged = new MessagesChangeTester(client.changed);

                if (clearOnInit !== 'none') {
                    if (clearOnInit === 'query->clear') {
                        baseClient.onQuery(queryBeforeClear);
                    }
                    baseClient.clear();
                    clientChanged.clearChanges();
                }

                baseClient.onQuery(query1);

                clientChanged.clearChanges();

                baseClient.onQuery(query2);

                expect(client.getCurrent()).toEqual(expected.filter(arrayFilter));
                clientChanged.expectToBeOneQuery(expected.filter(arrayFilter));

                clientChanged.clearChanges();

                baseClient.clear();

                expect(client.getCurrent()).toBeNull();
                clientChanged.expectToBeOneClear();
            });
        }
    );
});
