import { execCharacterCommand, State } from '../src';
import { Resources } from './resources';

describe('characterCommand', () => {
    const characterKey = 'CHARA_ID';

    it('tests room.name', () => {
        const prevRoomName = 'NAME_0';
        const nextRoomName = 'NAME_1';

        const room: State = {
            ...Resources.minimumState,
            name: prevRoomName,
            participants: {
                [Resources.Participant.Player1.userUid]: {
                    $version: 1,
                    name: Resources.Participant.Player1.name,
                    role: 'Player',
                    boards: {},
                    characters: {
                        [characterKey]: {
                            ...Resources.Character.emptyState,
                        },
                    },
                    imagePieceValues: {},
                },
            },
        };

        const actual = execCharacterCommand({
            script: `room.name = '${nextRoomName}'`,
            room,
            characterKey: { createdBy: Resources.Participant.Player1.userUid, id: characterKey },
        });
        if (actual.isError) {
            fail(actual.error);
        }
        expect(actual.value).not.toBe(room);
        expect(actual.value).toEqual({
            ...room,
            name: nextRoomName,
        });
    });

    it('tests character.name', () => {
        const prevCharacterName = 'NAME_0';
        const nextCharacterName = 'NAME_1';

        const room: State = {
            ...Resources.minimumState,
            participants: {
                [Resources.Participant.Player1.userUid]: {
                    $version: 1,
                    name: Resources.Participant.Player1.name,
                    role: 'Player',
                    boards: {},
                    characters: {
                        [characterKey]: {
                            ...Resources.Character.emptyState,
                            name: prevCharacterName,
                        },
                    },
                    imagePieceValues: {},
                },
            },
        };

        const actual = execCharacterCommand({
            script: `character.name = '${nextCharacterName}'`,
            room,
            characterKey: { createdBy: Resources.Participant.Player1.userUid, id: characterKey },
        });
        if (actual.isError) {
            fail(actual.error);
        }
        expect(actual.value).not.toBe(room);
        expect(actual.value).toEqual({
            ...room,
            participants: {
                [Resources.Participant.Player1.userUid]: {
                    $version: 1,
                    name: Resources.Participant.Player1.name,
                    role: 'Player',
                    boards: {},
                    characters: {
                        [characterKey]: {
                            ...Resources.Character.emptyState,
                            name: nextCharacterName,
                        },
                    },
                    imagePieceValues: {},
                },
            },
        });
    });
});
