import { RoomChannels } from '../src';
import { Resources } from './resources';

describe('RoomChannels', () => {
    it('tests creating an instance', () => {
        const client = new RoomChannels();

        expect(client.publicChannels.size).toBe(0);
        expect(client.privateChannels.toArray()).toHaveLength(0);
    });

    describe('onQuery', () => {
        it('an empty instance', () => {
            const client = new RoomChannels();

            client.onQuery(Resources.RoomMessages.empty);

            expect(client.publicChannels.size).toBe(0);
            expect(client.privateChannels.toArray()).toHaveLength(0);
        });

        it.each([
            {
                init: {
                    ...Resources.RoomMessages.empty,
                    publicMessages: [
                        Resources.RoomPublicMessage.message1a,
                        Resources.RoomPublicMessage.message3a,
                    ],
                    publicChannels: [
                        Resources.RoomPublicChannel.channel1,
                        Resources.RoomPublicChannel.channel2,
                    ],
                    privateMessages: [
                        Resources.RoomPrivateMessage.message2a,
                        Resources.RoomPrivateMessage.message4a,
                    ],
                },
                expectedPublicChannels: new Map([
                    [
                        Resources.RoomPublicChannel.channel1.key,
                        { name: Resources.RoomPublicChannel.channel1.name },
                    ],
                    [
                        Resources.RoomPublicChannel.channel2.key,
                        { name: Resources.RoomPublicChannel.channel2.name },
                    ],
                ]),
                expectedPrivateChannels: [
                    Resources.RoomPrivateMessage.message2a.visibleTo,
                    Resources.RoomPrivateMessage.message4a.visibleTo,
                ],
            },
        ])('non-empty instances', ({ init, expectedPublicChannels, expectedPrivateChannels }) => {
            const client = new RoomChannels();
            client.onQuery(init);

            expect(client.publicChannels).toEqual(expectedPublicChannels);
            expect(client.privateChannels.toArray().map(ch => ch.toStringArray())).toEqual(
                expectedPrivateChannels
            );
        });
    });

    it.each([
        {
            event: Resources.RoomPublicChannel.channel1,
            expectedPublicChannels: new Map([
                [
                    Resources.RoomPublicChannel.channel1.key,
                    { name: Resources.RoomPublicChannel.channel1.name },
                ],
            ]),
            expectedPrivateChannels: [],
        },
        {
            event: Resources.RoomPublicChannelUpdate.channel1,
            expectedPublicChannels: new Map([
                [
                    Resources.RoomPublicChannel.channel1.key,
                    { name: Resources.RoomPublicChannel.channel1.name },
                ],
            ]),
            expectedPrivateChannels: [],
        },
    ])('onEvent', ({ event, expectedPublicChannels, expectedPrivateChannels }) => {
        const client = new RoomChannels();

        client.onEvent(event);

        expect(client.publicChannels).toEqual(expectedPublicChannels);
        expect(client.privateChannels.toArray().map(ch => ch.toStringArray())).toEqual(
            expectedPrivateChannels
        );
    });
});
