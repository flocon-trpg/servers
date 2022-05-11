import { RoomMessageEventFragment, RoomMessages } from '@flocon-trpg/typed-document-node-v0.7.1';
import { Observable } from 'rxjs';
import { Message, MessagesChange, RoomMessagesClient, event, query, reset } from '../src';
import { Resources } from './resources';

class ObservableTester<T> {
    private nexts: T[] = [];

    public constructor(source: Observable<T>) {
        source.subscribe(x => this.nexts.push(x));
    }

    public expect() {
        const actual = this.nexts;
        this.nexts = [];
        return expect(actual);
    }

    public clear() {
        this.nexts = [];
    }
}

const q = (current: readonly Message[]): MessagesChange => {
    return {
        type: query,
        current,
    };
};

const e = ({
    current,
    event: eventValue,
}: {
    current: readonly Message[];
    event: RoomMessageEventFragment;
}): MessagesChange => {
    return {
        type: event,
        current,
        event: eventValue,
    };
};

const r: MessagesChange = { type: reset };

describe('RoomMessagesClient', () => {
    it('tests creating an instance', () => {
        const client = new RoomMessagesClient();
        const clientChanged = new ObservableTester(client.messages.changed);
        const filtered = client.messages.filter(() => true);
        const filteredChanged = new ObservableTester(filtered.changed);

        expect(client.messages.getCurrent()).toBeNull();
        clientChanged.expect().toEqual([]);

        expect(filtered.getCurrent()).toBeNull();
        filteredChanged.expect().toEqual([]);
    });

    describe('onQuery', () => {
        it('an empty instance', () => {
            const client = new RoomMessagesClient();
            const clientChanged = new ObservableTester(client.messages.changed);
            const filtered = client.messages.filter(() => true);
            const filteredChanged = new ObservableTester(filtered.changed);

            client.onQuery(Resources.RoomMessages.empty);

            expect(client.messages.getCurrent()).toEqual([]);
            clientChanged.expect().toEqual([q([])]);

            expect(filtered.getCurrent()).toEqual([]);
            filteredChanged.expect().toEqual([q([])]);
        });

        it.each([
            {
                init: {
                    ...Resources.RoomMessages.empty,
                    publicMessages: [
                        Resources.RoomPublicMessage.message1,
                        Resources.RoomPublicMessage.message3,
                    ],
                    publicChannels: [Resources.RoomPublicChannel.channel1],
                },
                expected: [Resources.Message.publicMessage1, Resources.Message.publicMessage3],
            },
            {
                init: {
                    ...Resources.RoomMessages.empty,
                    publicMessages: [
                        Resources.RoomPublicMessage.message3,
                        Resources.RoomPublicMessage.message1,
                    ],
                    publicChannels: [Resources.RoomPublicChannel.channel1],
                },
                expected: [Resources.Message.publicMessage1, Resources.Message.publicMessage3],
            },
            {
                init: {
                    ...Resources.RoomMessages.empty,
                    publicMessages: [
                        Resources.RoomPublicMessage.message3,
                        Resources.RoomPublicMessage.message1,
                    ],
                    publicChannels: [Resources.RoomPublicChannel.channel1],
                    privateMessages: [Resources.RoomPrivateMessage.message2],
                },
                expected: [
                    Resources.Message.publicMessage1,
                    Resources.Message.privateMessage2,
                    Resources.Message.publicMessage3,
                ],
            },
        ])('non-empty instances', ({ init, expected }) => {
            const client = new RoomMessagesClient();
            const clientChanged = new ObservableTester(client.messages.changed);
            const trueFiltered = client.messages.filter(() => true);
            const trueFilteredChanged = new ObservableTester(trueFiltered.changed);
            const falseFiltered = client.messages.filter(() => false);
            const falseFilteredChanged = new ObservableTester(falseFiltered.changed);

            client.onQuery(init);

            expect(client.messages.getCurrent()).toEqual(expected);
            clientChanged.expect().toEqual([q(expected)]);

            expect(trueFiltered.getCurrent()).toEqual(expected);
            trueFilteredChanged.expect().toEqual([q(expected)]);

            expect(falseFiltered.getCurrent()).toEqual([]);
            falseFilteredChanged.expect().toEqual([q([])]);
        });
    });

    it('onEvent', () => {
        const client = new RoomMessagesClient();
        const clientChanged = new ObservableTester(client.messages.changed);
        const filtered = client.messages.filter(() => true);
        const filteredChanged = new ObservableTester(filtered.changed);

        const event = Resources.RoomPublicMessage.message1;
        client.onEvent(event);

        expect(client.messages.getCurrent()).toBeNull();
        clientChanged.expect().toEqual([]);

        expect(filtered.getCurrent()).toBeNull();
        filteredChanged.expect().toEqual([]);
    });

    it('reset', () => {
        const client = new RoomMessagesClient();
        const clientChanged = new ObservableTester(client.messages.changed);
        const filtered = client.messages.filter(() => true);
        const filteredChanged = new ObservableTester(filtered.changed);

        client.reset();

        expect(client.messages.getCurrent()).toBeNull();
        clientChanged.expect().toEqual([r]);

        expect(filtered.getCurrent()).toBeNull();
        filteredChanged.expect().toEqual([r]);
    });

    describe.each(['none', 'reset', 'query_reset'] as const)('multiple operations', resetOnInit => {
        const queryBeforeReset: RoomMessages = {
            ...Resources.RoomMessages.empty,
            publicMessages: [
                Resources.RoomPublicMessage.message1,
                Resources.RoomPublicMessage.message3,
                Resources.RoomPublicMessage.message7,
            ],
            privateMessages: [
                Resources.RoomPrivateMessage.message2,
                Resources.RoomPrivateMessage.message4,
                Resources.RoomPrivateMessage.message8,
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
                        Resources.RoomPublicMessage.message1,
                        Resources.RoomPublicMessage.message7,
                    ],
                    soundEffects: [Resources.SoundEffect.message5],
                    pieceLogs: [Resources.PieceLog.message6],
                    privateMessages: [
                        Resources.RoomPrivateMessage.message2,
                        Resources.RoomPrivateMessage.message4,
                        Resources.RoomPrivateMessage.message8,
                    ],
                    publicChannels: [Resources.RoomPublicChannel.channel1],
                },
                event: Resources.RoomPublicMessage.message3,
                expected: [
                    Resources.Message.publicMessage1,
                    Resources.Message.privateMessage2,
                    Resources.Message.publicMessage3,
                    Resources.Message.privateMessage4,
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
                        Resources.RoomPublicMessage.message1,
                        Resources.RoomPublicMessage.message3,
                        Resources.RoomPublicMessage.message7,
                    ],
                    soundEffects: [Resources.SoundEffect.message5],
                    pieceLogs: [Resources.PieceLog.message6],
                    privateMessages: [
                        Resources.RoomPrivateMessage.message2,
                        Resources.RoomPrivateMessage.message8,
                    ],
                    publicChannels: [Resources.RoomPublicChannel.channel1],
                },
                event: Resources.RoomPrivateMessage.message4,
                expected: [
                    Resources.Message.publicMessage1,
                    Resources.Message.privateMessage2,
                    Resources.Message.publicMessage3,
                    Resources.Message.privateMessage4,
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
                        Resources.RoomPublicMessage.message1,
                        Resources.RoomPublicMessage.message3,
                        Resources.RoomPublicMessage.message7,
                    ],
                    soundEffects: [],
                    pieceLogs: [Resources.PieceLog.message6],
                    privateMessages: [
                        Resources.RoomPrivateMessage.message2,
                        Resources.RoomPrivateMessage.message4,
                        Resources.RoomPrivateMessage.message8,
                    ],
                    publicChannels: [Resources.RoomPublicChannel.channel1],
                },
                event: Resources.SoundEffect.message5,
                expected: [
                    Resources.Message.publicMessage1,
                    Resources.Message.privateMessage2,
                    Resources.Message.publicMessage3,
                    Resources.Message.privateMessage4,
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
                        Resources.RoomPublicMessage.message1,
                        Resources.RoomPublicMessage.message3,
                        Resources.RoomPublicMessage.message7,
                    ],
                    soundEffects: [Resources.SoundEffect.message5],
                    pieceLogs: [],
                    privateMessages: [
                        Resources.RoomPrivateMessage.message2,
                        Resources.RoomPrivateMessage.message4,
                        Resources.RoomPrivateMessage.message8,
                    ],
                    publicChannels: [Resources.RoomPublicChannel.channel1],
                },
                event: Resources.PieceLog.message6,
                expected: [
                    Resources.Message.publicMessage1,
                    Resources.Message.privateMessage2,
                    Resources.Message.publicMessage3,
                    Resources.Message.privateMessage4,
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
                        Resources.RoomPublicMessage.message1,
                        Resources.RoomPublicMessage.message3,
                        Resources.RoomPublicMessage.message7,
                    ],
                    privateMessages: [
                        Resources.RoomPrivateMessage.message2,
                        Resources.RoomPrivateMessage.message4,
                        Resources.RoomPrivateMessage.message8,
                    ],
                    soundEffects: [Resources.SoundEffect.message5],
                    pieceLogs: [Resources.PieceLog.message6],
                    publicChannels: [Resources.RoomPublicChannel.channel1],
                },
                event: Resources.RoomPublicMessage.updateMessage3Event,
                expected: [
                    Resources.Message.publicMessage1,
                    Resources.Message.privateMessage2,
                    Resources.Message.updatedPublicMessage3,
                    Resources.Message.privateMessage4,
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
                        Resources.RoomPublicMessage.message1,
                        Resources.RoomPublicMessage.message3,
                        Resources.RoomPublicMessage.message7,
                    ],
                    privateMessages: [
                        Resources.RoomPrivateMessage.message2,
                        Resources.RoomPrivateMessage.message4,
                        Resources.RoomPrivateMessage.message8,
                    ],
                    soundEffects: [Resources.SoundEffect.message5],
                    pieceLogs: [Resources.PieceLog.message6],
                    publicChannels: [Resources.RoomPublicChannel.channel1],
                },
                event: Resources.RoomPrivateMessage.updateMessage4Event,
                expected: [
                    Resources.Message.publicMessage1,
                    Resources.Message.privateMessage2,
                    Resources.Message.publicMessage3,
                    Resources.Message.updatedPrivateMessage4,
                    Resources.Message.soundEffect5,
                    Resources.Message.pieceLog6,
                    Resources.Message.publicMessage7,
                    Resources.Message.privateMessage8,
                ],
            },
        ])('(reset) -> onQuery -> onEvent -> reset', ({ query, event, expected }) => {
            const client = new RoomMessagesClient();
            const clientChanged = new ObservableTester(client.messages.changed);
            const trueFiltered = client.messages.filter(() => true);
            const trueFilteredChanged = new ObservableTester(trueFiltered.changed);
            const falseFiltered = client.messages.filter(() => false);
            const falseFilteredChanged = new ObservableTester(falseFiltered.changed);

            if (resetOnInit !== 'none') {
                if (resetOnInit === 'query_reset') {
                    client.onQuery(queryBeforeReset);
                }
                client.reset();

                clientChanged.clear();
                trueFilteredChanged.clear();
                falseFilteredChanged.clear();
            }

            client.onQuery(query);

            clientChanged.clear();
            trueFilteredChanged.clear();
            falseFilteredChanged.clear();

            client.onEvent(event);

            expect(client.messages.getCurrent()).toEqual(expected);
            clientChanged.expect().toEqual([e({ current: expected, event })]);

            expect(trueFiltered.getCurrent()).toEqual(expected);
            trueFilteredChanged.expect().toEqual([e({ current: expected, event })]);

            expect(falseFiltered.getCurrent()).toEqual([]);
            falseFilteredChanged.expect().toEqual([]);

            clientChanged.clear();
            trueFilteredChanged.clear();
            falseFilteredChanged.clear();

            client.reset();

            expect(client.messages.getCurrent()).toBeNull();
            clientChanged.expect().toEqual([r]);

            expect(trueFiltered.getCurrent()).toBeNull();
            trueFilteredChanged.expect().toEqual([r]);

            expect(falseFiltered.getCurrent()).toBeNull();
            falseFilteredChanged.expect().toEqual([r]);
        });

        it.each([
            {
                events: [
                    Resources.RoomPublicMessage.updateMessage3Event,
                    Resources.RoomPrivateMessage.updateMessage4Event,
                ],
                query: {
                    ...Resources.RoomMessages.empty,
                    publicMessages: [
                        Resources.RoomPublicMessage.message1,
                        Resources.RoomPublicMessage.message3,
                        Resources.RoomPublicMessage.message7,
                    ],
                    privateMessages: [
                        Resources.RoomPrivateMessage.message2,
                        Resources.RoomPrivateMessage.message4,
                        Resources.RoomPrivateMessage.message8,
                    ],
                    soundEffects: [Resources.SoundEffect.message5],
                    pieceLogs: [Resources.PieceLog.message6],
                    publicChannels: [Resources.RoomPublicChannel.channel1],
                },
                expected: [
                    Resources.Message.publicMessage1,
                    Resources.Message.privateMessage2,
                    Resources.Message.updatedPublicMessage3,
                    Resources.Message.updatedPrivateMessage4,
                    Resources.Message.soundEffect5,
                    Resources.Message.pieceLog6,
                    Resources.Message.publicMessage7,
                    Resources.Message.privateMessage8,
                ],
            },
            {
                events: [
                    Resources.RoomPrivateMessage.updateMessage4Event,
                    Resources.RoomPublicMessage.updateMessage3Event,
                ],
                query: {
                    ...Resources.RoomMessages.empty,
                    publicMessages: [
                        Resources.RoomPublicMessage.message1,
                        Resources.RoomPublicMessage.message3,
                        Resources.RoomPublicMessage.message7,
                    ],
                    privateMessages: [
                        Resources.RoomPrivateMessage.message2,
                        Resources.RoomPrivateMessage.message4,
                        Resources.RoomPrivateMessage.message8,
                    ],
                    soundEffects: [Resources.SoundEffect.message5],
                    pieceLogs: [Resources.PieceLog.message6],
                    publicChannels: [Resources.RoomPublicChannel.channel1],
                },
                expected: [
                    Resources.Message.publicMessage1,
                    Resources.Message.privateMessage2,
                    Resources.Message.updatedPublicMessage3,
                    Resources.Message.updatedPrivateMessage4,
                    Resources.Message.soundEffect5,
                    Resources.Message.pieceLog6,
                    Resources.Message.publicMessage7,
                    Resources.Message.privateMessage8,
                ],
            },
        ])('(reset) -> onEvent -> onQuery -> reset', ({ events, query, expected }) => {
            const client = new RoomMessagesClient();
            const clientChanged = new ObservableTester(client.messages.changed);
            const trueFiltered = client.messages.filter(() => true);
            const trueFilteredChanged = new ObservableTester(trueFiltered.changed);
            const falseFiltered = client.messages.filter(() => false);
            const falseFilteredChanged = new ObservableTester(falseFiltered.changed);

            if (resetOnInit !== 'none') {
                if (resetOnInit === 'query_reset') {
                    client.onQuery(queryBeforeReset);
                }
                client.reset();

                clientChanged.clear();
                trueFilteredChanged.clear();
                falseFilteredChanged.clear();
            }

            events.forEach(event => client.onEvent(event));

            clientChanged.clear();
            trueFilteredChanged.clear();
            falseFilteredChanged.clear();

            client.onQuery(query);

            expect(client.messages.getCurrent()).toEqual(expected);
            clientChanged.expect().toEqual([q(expected)]);

            expect(trueFiltered.getCurrent()).toEqual(expected);
            trueFilteredChanged.expect().toEqual([q(expected)]);

            expect(falseFiltered.getCurrent()).toEqual([]);
            falseFilteredChanged.expect().toEqual([q([])]);

            clientChanged.clear();
            trueFilteredChanged.clear();
            falseFilteredChanged.clear();

            client.reset();

            expect(client.messages.getCurrent()).toBeNull();
            clientChanged.expect().toEqual([r]);

            expect(trueFiltered.getCurrent()).toBeNull();
            trueFilteredChanged.expect().toEqual([r]);

            expect(falseFiltered.getCurrent()).toBeNull();
            falseFilteredChanged.expect().toEqual([r]);
        });

        it.each([
            {
                query1: {
                    ...Resources.RoomMessages.empty,
                    publicMessages: [
                        Resources.RoomPublicMessage.message1,
                        Resources.RoomPublicMessage.message3,
                    ],
                    privateMessages: [
                        Resources.RoomPrivateMessage.message2,
                        Resources.RoomPrivateMessage.message4,
                    ],
                },
                query2: {
                    ...Resources.RoomMessages.empty,
                    publicMessages: [
                        Resources.RoomPublicMessage.updatedMessage3,
                        Resources.RoomPublicMessage.message7,
                    ],
                    privateMessages: [
                        Resources.RoomPrivateMessage.updatedMessage4,
                        Resources.RoomPrivateMessage.message8,
                    ],
                    soundEffects: [Resources.SoundEffect.message5],
                    pieceLogs: [Resources.PieceLog.message6],
                },
                expected: [
                    Resources.Message.publicMessage1,
                    Resources.Message.privateMessage2,
                    Resources.Message.updatedPublicMessage3,
                    Resources.Message.updatedPrivateMessage4,
                    Resources.Message.soundEffect5,
                    Resources.Message.pieceLog6,
                    Resources.Message.publicMessage7,
                    Resources.Message.privateMessage8,
                ],
            },
        ])('(reset) -> onQuery -> onQuery -> reset', ({ query1, query2, expected }) => {
            const client = new RoomMessagesClient();
            const clientChanged = new ObservableTester(client.messages.changed);
            const trueFiltered = client.messages.filter(() => true);
            const trueFilteredChanged = new ObservableTester(trueFiltered.changed);
            const falseFiltered = client.messages.filter(() => false);
            const falseFilteredChanged = new ObservableTester(falseFiltered.changed);

            if (resetOnInit !== 'none') {
                if (resetOnInit === 'query_reset') {
                    client.onQuery(queryBeforeReset);
                }
                client.reset();

                clientChanged.clear();
                trueFilteredChanged.clear();
                falseFilteredChanged.clear();
            }

            client.onQuery(query1);

            clientChanged.clear();
            trueFilteredChanged.clear();
            falseFilteredChanged.clear();

            client.onQuery(query2);

            expect(client.messages.getCurrent()).toEqual(expected);
            clientChanged.expect().toEqual([q(expected)]);

            expect(trueFiltered.getCurrent()).toEqual(expected);
            trueFilteredChanged.expect().toEqual([q(expected)]);

            expect(falseFiltered.getCurrent()).toEqual([]);
            falseFilteredChanged.expect().toEqual([q([])]);

            clientChanged.clear();
            trueFilteredChanged.clear();
            falseFilteredChanged.clear();

            client.reset();

            expect(client.messages.getCurrent()).toBeNull();
            clientChanged.expect().toEqual([r]);

            expect(trueFiltered.getCurrent()).toBeNull();
            trueFilteredChanged.expect().toEqual([r]);

            expect(falseFiltered.getCurrent()).toBeNull();
            falseFilteredChanged.expect().toEqual([r]);
        });
    });
});
