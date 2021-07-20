import { execCharacterCommand, State } from '../src';
import { Resources } from './resources';

describe('characterCommand', () => {
    const firstCharacterKey = 'CHARA_CREATED_BY';
    const secondCharacterKey = 'CHARA_ID';

    it('tests room.name', () => {
        const prevRoomName = 'NAME_0';
        const nextRoomName = 'NAME_1';

        const room: State = {
            ...Resources.minimumState,
            name: prevRoomName,
            characters: {
                [firstCharacterKey]: {
                    [secondCharacterKey]: {
                        ...Resources.Character.emptyState,
                    },
                },
            },
        };

        const actual = execCharacterCommand({
            script: `room.name = '${nextRoomName}'`,
            room,
            characterKey: { createdBy: firstCharacterKey, id: secondCharacterKey },
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
            characters: {
                [firstCharacterKey]: {
                    [secondCharacterKey]: {
                        ...Resources.Character.emptyState,
                        name: prevCharacterName,
                    },
                },
            },
        };

        const actual = execCharacterCommand({
            script: `character.name = '${nextCharacterName}'`,
            room,
            characterKey: { createdBy: firstCharacterKey, id: secondCharacterKey },
        });
        if (actual.isError) {
            fail(actual.error);
        }
        expect(actual.value).not.toBe(room);
        expect(actual.value).toEqual({
            ...room,
            characters: {
                [firstCharacterKey]: {
                    [secondCharacterKey]: {
                        ...Resources.Character.emptyState,
                        name: nextCharacterName,
                    },
                },
            },
        });
    });
});
