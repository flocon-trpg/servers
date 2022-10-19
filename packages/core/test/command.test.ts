import { recordToMap } from '@flocon-trpg/utils';
import { State as S, execCharacterCommand, roomTemplate } from '../src';
import { Resources } from './resources';

type State = S<typeof roomTemplate>;

describe('characterCommand', () => {
    const characterId = 'CHARA_ID';

    it('tests room.name', () => {
        const participantId = Resources.Participant.Player1.userUid;
        const prevRoomName = 'NAME_0';
        const nextRoomName = 'NAME_1';

        const room: State = {
            ...Resources.minimumState,
            name: prevRoomName,
            characters: {
                [characterId]: {
                    ...Resources.Character.emptyState(participantId),
                },
            },
            participants: {
                [participantId]: {
                    $v: 2,
                    $r: 1,
                    name: Resources.Participant.Player1.name,
                    role: 'Player',
                },
            },
        };

        const actual = execCharacterCommand({
            script: `room.name = '${nextRoomName}'`,
            room,
            characterId,
            myUserUid: participantId,
        });
        if (actual.isError) {
            const error: Error = actual.error;
            throw error;
        }
        expect(actual.value).not.toBe(room);
        expect(actual.value).toEqual({
            ...room,
            name: nextRoomName,
        });
    });

    it('tests character.name', () => {
        const participantId = Resources.Participant.Player1.userUid;
        const prevCharacterName = 'NAME_0';
        const nextCharacterName = 'NAME_1';

        const room: State = {
            ...Resources.minimumState,
            characters: {
                [characterId]: {
                    ...Resources.Character.emptyState(participantId),
                    name: prevCharacterName,
                },
            },
            participants: {
                [participantId]: {
                    $v: 2,
                    $r: 1,
                    name: Resources.Participant.Player1.name,
                    role: 'Player',
                },
            },
        };

        const actual = execCharacterCommand({
            script: `character.name = '${nextCharacterName}'`,
            room,
            characterId,
            myUserUid: participantId,
        });
        if (actual.isError) {
            throw actual.error;
        }

        expect(actual.value).not.toBe(room);
        const expected: State = {
            ...room,
            characters: {
                [characterId]: {
                    ...Resources.Character.emptyState(participantId),
                    name: nextCharacterName,
                },
            },
            participants: {
                [participantId]: {
                    $v: 2,
                    $r: 1,
                    name: Resources.Participant.Player1.name,
                    role: 'Player',
                },
            },
        };
        expect(actual.value).toEqual(expected);
    });

    it('tests finding participant and character', () => {
        const participantId = Resources.Participant.Player1.userUid;
        const prevCharacterName = 'NAME_0';
        const nextCharacterName = 'NAME_1';

        const room: State = {
            ...Resources.minimumState,
            characters: {
                [characterId]: {
                    ...Resources.Character.emptyState(participantId),
                    name: prevCharacterName,
                },
            },
            participants: {
                [participantId]: {
                    $v: 2,
                    $r: 1,
                    name: Resources.Participant.Player1.name,
                    role: 'Player',
                },
            },
        };

        const actual = execCharacterCommand({
            script: `
let myCharacter = this.room.characters.get('${characterId}');
myCharacter.name = '${nextCharacterName}';
            `,
            room,
            characterId,
            myUserUid: participantId,
        });
        if (actual.isError) {
            throw actual.error;
        }

        const expected: State = {
            ...room,
            characters: {
                [characterId]: {
                    ...Resources.Character.emptyState(participantId),
                    name: nextCharacterName,
                },
            },
            participants: {
                [participantId]: {
                    $v: 2,
                    $r: 1,
                    name: Resources.Participant.Player1.name,
                    role: 'Player',
                },
            },
        };
        expect(actual.value).toEqual(expected);
    });

    it('tests creating character', () => {
        const participantId = Resources.Participant.Player1.userUid;
        const characterName = 'CHARA_NAME';

        const room: State = {
            ...Resources.minimumState,
            characters: {
                [characterId]: {
                    ...Resources.Character.emptyState(participantId),
                    name: characterName,
                },
            },
            participants: {
                [participantId]: {
                    $v: 2,
                    $r: 1,
                    name: Resources.Participant.Player1.name,
                    role: 'Player',
                },
            },
        };

        const actual = execCharacterCommand({
            script: `
let newCharacter = this.room.characters.create();
newCharacter.value.name = 'NEW_CHARA_NAME';
let newCharacterById = this.room.characters.get(newCharacter.id);
newCharacter.value.name = newCharacterById.name + '!!';
            `,
            room,
            characterId,
            myUserUid: participantId,
        });
        if (actual.isError) {
            throw actual.error;
        }
        const actualCharacters = recordToMap(actual.value.characters ?? {});
        expect(actualCharacters.size).toBe(2);
        actualCharacters.delete(characterId);
        expect(actualCharacters.size).toBe(1);
        const actualCreatedCharacter = [...actualCharacters][0]?.[1];
        expect(actualCreatedCharacter?.name).toBe('NEW_CHARA_NAME!!');
    });

    it('tests deleting character', () => {
        const participantId = Resources.Participant.Player1.userUid;
        const characterName = 'CHARA_NAME';
        const anotherCharacterName = 'CHARA_NAME2';
        const anotherCharacterId = 'CHARA_ID2';

        const room: State = {
            ...Resources.minimumState,
            characters: {
                [characterId]: {
                    ...Resources.Character.emptyState(participantId),
                    name: characterName,
                },
                [anotherCharacterId]: {
                    ...Resources.Character.emptyState(participantId),
                    name: anotherCharacterName,
                },
            },
            participants: {
                [participantId]: {
                    $v: 2,
                    $r: 1,
                    name: Resources.Participant.Player1.name,
                    role: 'Player',
                },
            },
        };

        const actual = execCharacterCommand({
            script: `
this.room.characters.delete('${characterId}');
            `,
            room,
            characterId,
            myUserUid: participantId,
        });
        if (actual.isError) {
            throw actual.error;
        }

        const expected: State = {
            ...room,
            characters: {
                [anotherCharacterId]: {
                    ...Resources.Character.emptyState(participantId),
                    name: anotherCharacterName,
                },
            },
            participants: {
                [participantId]: {
                    $v: 2,
                    $r: 1,
                    name: Resources.Participant.Player1.name,
                    role: 'Player',
                },
            },
        };
        expect(actual.value).toEqual(expected);
    });
});
