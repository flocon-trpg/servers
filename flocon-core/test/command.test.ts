import { recordToMap } from '@kizahasi/util';
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
                    $v: 1,
                    $r: 2,
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
            throw actual.error;
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
                    $v: 1,
                    $r: 2,
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
            throw actual.error;
        }
        expect(actual.value).not.toBe(room);
        expect(actual.value).toEqual({
            ...room,
            participants: {
                [Resources.Participant.Player1.userUid]: {
                    $v: 1,
                    $r: 2,
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

    it('tests finding participant and character', () => {
        const prevCharacterName = 'NAME_0';
        const nextCharacterName = 'NAME_1';

        const room: State = {
            ...Resources.minimumState,
            participants: {
                [Resources.Participant.Player1.userUid]: {
                    $v: 1,
                    $r: 2,
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
            script: `
let myParticipant = this.room.participants.get('${Resources.Participant.Player1.userUid}');
let myCharacter = myParticipant.characters.get('${characterKey}');
myCharacter.name = '${nextCharacterName}';
            `,
            room,
            characterKey: { createdBy: Resources.Participant.Player1.userUid, id: characterKey },
        });
        if (actual.isError) {
            throw actual.error;
        }
        expect(actual.value).toEqual({
            ...room,
            participants: {
                [Resources.Participant.Player1.userUid]: {
                    $v: 1,
                    $r: 2,
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

    it('tests creating character', () => {
        const characterName = 'CHARA_NAME';

        const room: State = {
            ...Resources.minimumState,
            participants: {
                [Resources.Participant.Player1.userUid]: {
                    $v: 1,
                    $r: 2,
                    name: Resources.Participant.Player1.name,
                    role: 'Player',
                    boards: {},
                    characters: {
                        [characterKey]: {
                            ...Resources.Character.emptyState,
                            name: characterName,
                        },
                    },
                    imagePieceValues: {},
                },
            },
        };

        const actual = execCharacterCommand({
            script: `
let myParticipant = this.room.participants.get('${Resources.Participant.Player1.userUid}');
let newCharacter = myParticipant.characters.create();
newCharacter.value.name = 'NEW_CHARA_NAME';
let newCharacterById = myParticipant.characters.get(newCharacter.id);
newCharacter.value.name = newCharacterById.name + '!!';
            `,
            room,
            characterKey: { createdBy: Resources.Participant.Player1.userUid, id: characterKey },
        });
        if (actual.isError) {
            throw actual.error;
        }
        const actualCharacters = recordToMap(
            actual.value.participants[Resources.Participant.Player1.userUid]?.characters ?? {}
        );
        expect(actualCharacters.size).toBe(2);
        actualCharacters.delete(characterKey);
        expect(actualCharacters.size).toBe(1);
        const actualCreatedCharacter = [...actualCharacters][0]?.[1];
        expect(actualCreatedCharacter?.name).toBe('NEW_CHARA_NAME!!');
    });

    it('tests deleting character', () => {
        const characterName = 'CHARA_NAME';
        const anotherCharacterName = 'CHARA_NAME2';
        const anotherCharacterKey = 'CHARA_ID2';

        const room: State = {
            ...Resources.minimumState,
            participants: {
                [Resources.Participant.Player1.userUid]: {
                    $v: 1,
                    $r: 2,
                    name: Resources.Participant.Player1.name,
                    role: 'Player',
                    boards: {},
                    characters: {
                        [characterKey]: {
                            ...Resources.Character.emptyState,
                            name: characterName,
                        },
                        [anotherCharacterKey]: {
                            ...Resources.Character.emptyState,
                            name: anotherCharacterName,
                        },
                    },
                    imagePieceValues: {},
                },
            },
        };

        const actual = execCharacterCommand({
            script: `
let myParticipant = this.room.participants.get('${Resources.Participant.Player1.userUid}');
myParticipant.characters.delete('${characterKey}');
            `,
            room,
            characterKey: { createdBy: Resources.Participant.Player1.userUid, id: characterKey },
        });
        if (actual.isError) {
            throw actual.error;
        }
        expect(actual.value).toEqual({
            ...room,
            participants: {
                [Resources.Participant.Player1.userUid]: {
                    $v: 1,
                    $r: 2,
                    name: Resources.Participant.Player1.name,
                    role: 'Player',
                    boards: {},
                    characters: {
                        [anotherCharacterKey]: {
                            ...Resources.Character.emptyState,
                            name: anotherCharacterName,
                        },
                    },
                    imagePieceValues: {},
                },
            },
        });
    });
});
