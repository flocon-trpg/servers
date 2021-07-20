import { execCharacterCommand, State } from '../src';
import { Resources } from './resources';

it('tests characterCommand', () => {
    const firstCharacterKey = 'CHARA_CREATED_BY';
    const secondCharacterKey = 'CHARA_ID';
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
        ...Resources.minimumState,
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
