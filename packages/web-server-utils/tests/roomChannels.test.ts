import { RoomChannels } from '../src';
import { Fixtures } from './fixtures';

describe('RoomChannels', () => {
    it('tests creating an instance', () => {
        const client = new RoomChannels();

        expect(client.publicChannels.size).toBe(0);
        expect(client.privateChannels.toArray()).toHaveLength(0);
    });

    describe('onQuery', () => {
        it('an empty instance', () => {
            const client = new RoomChannels();

            client.onQuery(Fixtures.RoomMessages.empty);

            expect(client.publicChannels.size).toBe(0);
            expect(client.privateChannels.toArray()).toHaveLength(0);
        });

        it.each([
            {
                init: {
                    ...Fixtures.RoomMessages.empty,
                    publicMessages: [
                        Fixtures.RoomPublicMessage.message1a,
                        Fixtures.RoomPublicMessage.message3a,
                    ],
                    publicChannels: [
                        Fixtures.RoomPublicChannel.channel1,
                        Fixtures.RoomPublicChannel.channel2,
                    ],
                    privateMessages: [
                        Fixtures.RoomPrivateMessage.message2a,
                        Fixtures.RoomPrivateMessage.message4a,
                    ],
                },
                expectedPublicChannels: new Map([
                    [
                        Fixtures.RoomPublicChannel.channel1.key,
                        { name: Fixtures.RoomPublicChannel.channel1.name },
                    ],
                    [
                        Fixtures.RoomPublicChannel.channel2.key,
                        { name: Fixtures.RoomPublicChannel.channel2.name },
                    ],
                ]),
                expectedPrivateChannels: [
                    Fixtures.RoomPrivateMessage.message2a.visibleTo,
                    Fixtures.RoomPrivateMessage.message4a.visibleTo,
                ],
            },
        ])('non-empty instances', ({ init, expectedPublicChannels, expectedPrivateChannels }) => {
            const client = new RoomChannels();
            client.onQuery(init);

            expect(client.publicChannels).toEqual(expectedPublicChannels);
            expect(client.privateChannels.toArray().map(ch => ch.toStringArray())).toEqual(
                expectedPrivateChannels,
            );
        });
    });

    it.each([
        {
            event: Fixtures.RoomPublicChannel.channel1,
            expectedPublicChannels: new Map([
                [
                    Fixtures.RoomPublicChannel.channel1.key,
                    { name: Fixtures.RoomPublicChannel.channel1.name },
                ],
            ]),
            expectedPrivateChannels: [],
        },
        {
            event: Fixtures.RoomPublicChannelUpdate.channel1,
            expectedPublicChannels: new Map([
                [
                    Fixtures.RoomPublicChannel.channel1.key,
                    { name: Fixtures.RoomPublicChannel.channel1.name },
                ],
            ]),
            expectedPrivateChannels: [],
        },
    ])('onEvent', ({ event, expectedPublicChannels, expectedPrivateChannels }) => {
        const client = new RoomChannels();

        client.onEvent(event);

        expect(client.publicChannels).toEqual(expectedPublicChannels);
        expect(client.privateChannels.toArray().map(ch => ch.toStringArray())).toEqual(
            expectedPrivateChannels,
        );
    });
});
