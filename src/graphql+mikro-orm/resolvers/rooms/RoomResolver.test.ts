import { ParticipantRole } from '../../../enums/ParticipantRole';

import * as $MikroORM from '../../entities/room/mikro-orm';
import * as GraphQL from '../../entities/room/graphql';
import * as Board$GraphQL from '../../entities/room/board/graphql';
import * as Character$GraphQL from '../../entities/room/character/graphql';
import { createPostgreSQL, createSQLite } from '../../../mikro-orm';
import { EM, ORM } from '../../../utils/types';
import { User as User$MikroORM } from '../../entities/user/mikro-orm';
import { v4 } from 'uuid';
import { ResolverContext } from '../../utils/Contexts';
import { PromiseQueue } from '../../../utils/PromiseQueue';
import { RoomResolver } from './RoomResolver';
import * as Board$MikroORM from '../../entities/room/board/mikro-orm';
import * as Character$MikroORM from '../../entities/room/character/mikro-orm';
import * as PieceLocation$MikroORM from '../../entities/room/character/piece/mikro-orm';
import { __ } from '../../../@shared/collection';
import { NumMaxParam } from '../../entities/room/character/numParam/mikro-orm';
import { Partici } from '../../entities/room/participant/mikro-orm';
import { GlobalRoom } from '../../entities/room/global';
import { InMemoryConnectionManager } from '../../../connection/main';

const timeout = 20000;

const PostgreSQL = {
    dbName: 'test',
    clientUrl: 'postgresql://test:test@localhost:5432',
};

const SQLite = { dbName: './test.sqlite3' };

const clientId = (i?: number) => `CLIENT_ID${i ?? ''}`;

type RoomValueOperation = Omit<GraphQL.RoomOperationValue, | 'boards' | 'characters' | 'bgms' | 'paramNames' | 'participants'>;

type IntegratedTestStrategy = {
    operateByCreator: boolean;
    // setupStateでは、原則として/(One|Many)To(One|Many)/が付いたプロパティを変更してはならない。
    source: {
        serverOperation?: GlobalRoom.DownOperationType;
        roomValue?: {
            setupState: (baseState: $MikroORM.Room) => void;
            operation: RoomValueOperation;
        };
        character?: {
            setupState: (state: Character$MikroORM.Chara, em: EM) => void;
            operation: Character$GraphQL.CharacterOperation;
        };
    };
    test: {
        // 'id'ならば、operationが恒等のときのみテスト成功となる。
        operation: ((params: { operatedByMe: GraphQL.RoomOperationValue; operatedByAnother: GraphQL.RoomOperationValue }) => void) | 'id';
        state: (params: { createdByMe: GraphQL.RoomGetState; createdByAnother: GraphQL.RoomGetState }) => void;
    };
}

const resetDatabase = async (em: EM): Promise<void> => {
    for (const room of await em.find($MikroORM.Room, {})) {
        await $MikroORM.deleteRoom(em, room);
    }
    for (const user of await em.find(User$MikroORM, {})) {
        em.remove(user);
    }
    await em.flush();
};

const createResolverContext = (orm: ORM, uid: string): ResolverContext => ({
    decodedIdToken: {
        isError: false,
        value: {
            uid,
            firebase: {
                sign_in_provider: 'DUMMY_SIGN_IN_PROVIDER' // 適当な値
            }
        },
    },
    promiseQueue: new PromiseQueue({}),
    connectionManager: new InMemoryConnectionManager(),
    createEm: () => orm.em.fork(),
});

const setupRoomAndUsersAndParticipants = ({ em, setupRoom }: { em: EM; setupRoom?: (room: $MikroORM.Room) => void }) => {
    const roomName = 'ROOM_NAME';
    const creatorUserUid = 'CREATOR_ID';
    const creatorName = 'CREATOR_NAME';
    // nonCreatorは、creatorではないがoperateすることがあるユーザー。
    // anotherUserは、creatorではないしoperateにも関わらないユーザー。nonCreatorと区別するほうがコードがわかりやすくなるのでわけている。
    // これらは名前がわかりにくいのでリネームするほうがよさそうか。
    const nonCreatorUserUid = 'NON_CREATOR_ID';
    const nonCreatorName = 'NON_CREATOR_NAME';
    const anotherUserUid = 'ANOTHER_USER_ID';
    const anotherName = 'ANOTHER_USER_NAME';

    const room = new $MikroORM.Room({
        name: roomName,
        createdBy: creatorUserUid,
        publicChannel1Name: 'メイン',
        publicChannel2Name: 'メイン2',
        publicChannel3Name: 'メイン3',
        publicChannel4Name: 'メイン4',
        publicChannel5Name: 'メイン5',
        publicChannel6Name: 'メイン6',
        publicChannel7Name: 'メイン7',
        publicChannel8Name: 'メイン8',
        publicChannel9Name: 'メイン9',
        publicChannel10Name: 'メイン10',
    });
    if (setupRoom != null) {
        setupRoom(room);
    }

    // 現状はとりあえず全員がParticipantRole.Masterのケースのみを考えている。
    const creatorUser = new User$MikroORM({ userUid: creatorUserUid });
    const creatorParticipant = new Partici({ name: creatorName, role: ParticipantRole.Master, user: creatorUser, room });
    creatorUser.isEntry = true;
    em.persist(creatorParticipant);
    const nonCreatorUser = new User$MikroORM({ userUid: nonCreatorUserUid });
    const nonCreatorParticipant = new Partici({ name: nonCreatorName, role: ParticipantRole.Master, user: nonCreatorUser, room });
    nonCreatorUser.isEntry = true;
    em.persist(nonCreatorParticipant);
    const anotherUser = new User$MikroORM({ userUid: anotherUserUid });
    const anotherParticipant = new Partici({ name: anotherName, role: ParticipantRole.Master, user: anotherUser, room });
    anotherUser.isEntry = true;
    em.persist(anotherParticipant);
    room.particis.add(creatorParticipant, nonCreatorParticipant, anotherParticipant);
    em.persist([room]);

    return {
        room,
        creator: {
            userUid: creatorUserUid,
            name: creatorName,
        },
        nonCreator: {
            userUid: nonCreatorUserUid,
            name: nonCreatorName,
        },
        anotherUser: {
            userUid: anotherUserUid,
            name: anotherName,
        },
    };
};

const operateThenGetRoomTestCore = async (strategy: IntegratedTestStrategy, orm: ORM) => {
    const requestId = 'REQUEST_ID';

    try {
        const em = orm.em.fork();

        await resetDatabase(em);

        const createRoomResult = setupRoomAndUsersAndParticipants({ em, setupRoom: strategy.source.roomValue?.setupState });
        const roomPrevRevision = createRoomResult.room.revision;

        let character: { entity: Character$MikroORM.Chara; operation: Character$GraphQL.UpdateCharacterOperation } | null = null;
        if (strategy.source.character) {
            const stateId = v4();
            const characterState = new Character$MikroORM.Chara({
                createdBy: createRoomResult.creator.userUid,
                stateId,
                isPrivate: false,
                name: '',
                room: createRoomResult.room,
            });
            strategy.source.character.setupState(characterState, em);
            em.persist(characterState);
            character = {
                entity: characterState,
                operation: {
                    id: stateId,
                    createdBy: createRoomResult.creator.userUid,
                    operation: strategy.source.character.operation,
                }
            };
        }

        await em.flush();

        const operateBy = strategy.operateByCreator ? createRoomResult.creator.userUid : createRoomResult.nonCreator.userUid;

        const roomResolver = new RoomResolver();
        const operateResult = await roomResolver.operateCore({
            args: {
                id: createRoomResult.room.id,
                prevRevision: roomPrevRevision,
                requestId,
                operation: {
                    clientId: clientId(),
                    value: {
                        ...strategy.source.roomValue?.operation,
                        boards: {
                            replace: [],
                            update: [],
                        },
                        characters: {
                            replace: [],
                            update: character == null ? [] : [character.operation]
                        },
                        bgms: {
                            replace: [],
                            update: [],
                        },
                        paramNames: {
                            replace: [],
                            update: [],
                        },
                        participants: {
                            update: [],
                        }
                    }
                }
            },
            context: createResolverContext(orm, operateBy),
            globalEntryPhrase: undefined,
        });

        if ('failureType' in operateResult.result) {
            throw `OperateRoomFailureType is not expected. failureType is ${operateResult.result.failureType}`;
        }

        if (strategy.test.operation === 'id') {
            expect(operateResult.type).toBe('id');
            if (operateResult.type !== 'id') {
                throw 'This must not happen';
            }
            expect(operateResult.result.requestId).toBe(requestId);
            return;
        }

        if (operateResult.type !== 'success') {
            // type guard. always fail
            expect(operateResult.type).toBe('success');
            return;
        }

        expect(operateResult.result.operation.operatedBy?.clientId).toBe(clientId());

        strategy.test.operation({
            operatedByMe: operateResult.result.operation.value,
            operatedByAnother: operateResult.roomOperationPayload.generateOperation(createRoomResult.anotherUser.userUid).value,
        });

        const getRoomByCreator = await roomResolver.getRoomCore({
            args: {
                id: createRoomResult.room.id,
            },
            context: createResolverContext(orm, createRoomResult.creator.userUid),
            globalEntryPhrase: undefined,
        });
        if (!('room' in getRoomByCreator)) {
            throw 'getRoomByCreator is not "success"';
        }
        const getRoomByAnother = await roomResolver.getRoomCore({
            args: {
                id: createRoomResult.room.id,
            },
            context: createResolverContext(orm, createRoomResult.anotherUser.userUid),
            globalEntryPhrase: undefined,
        });
        if (!('room' in getRoomByAnother)) {
            throw 'getRoomByAnother is not "success"';
        }
        strategy.test.state({
            createdByMe: getRoomByCreator.room,
            createdByAnother: getRoomByAnother.room,
        });
    } finally {
        // これがないとテストが終わらずエラーが起こる。
        await orm.close();
    }
};

const operateThenGetRoomTest = async (strategy: IntegratedTestStrategy) => {
    const psql = await createPostgreSQL(PostgreSQL);
    const sqlite = await createSQLite(SQLite);

    await operateThenGetRoomTestCore(strategy, psql);
    await operateThenGetRoomTestCore(strategy, sqlite);
};

// describeを使うことで、テストが並列ではなく上から順に走る模様。

describe('operate then getRoom', () => {
    beforeAll(async () => {
        const psql = await createPostgreSQL(PostgreSQL);
        try {
            const migrator = psql.getMigrator();
            const migrations = await migrator.getPendingMigrations();
            if (migrations && migrations.length > 0) {
                await migrator.up();
            }
        }
        finally {
            await psql.close();
        }
        const sqlite = await createSQLite(SQLite);
        try {
            const migrator = sqlite.getMigrator();
            const migrations = await migrator.getPendingMigrations();
            if (migrations && migrations.length > 0) {
                await migrator.up();
            }
        }
        finally {
            await sqlite.close();
        }
    }, timeout);


    it('updates room.name', async (): Promise<void> => {
        const oldRoomName = 'ROOM_NAME(old)';
        const newRoomName = 'ROOM_NAME(new)';

        const testCore = async ({ operateByCreator }: { operateByCreator: boolean }) => {
            await operateThenGetRoomTest({
                operateByCreator,
                source: {
                    roomValue: {
                        setupState: state => {
                            state.name = oldRoomName;
                        },
                        operation: { name: { newValue: newRoomName } },
                    }
                },
                test: {
                    operation: ({ operatedByMe, operatedByAnother }) => {
                        expect(operatedByMe.name?.newValue).toBe(newRoomName);

                        expect(operatedByMe.name?.newValue).toEqual(operatedByAnother.name?.newValue);
                    },
                    state: ({ createdByMe, createdByAnother }) => {
                        expect(createdByMe.name).toBe(newRoomName);

                        expect(createdByAnother.name).toBe(newRoomName);
                    }
                }
            });
        };

        await testCore({ operateByCreator: true });
        await testCore({ operateByCreator: false });
    }, timeout);


    it('updates character.name when not private', async (): Promise<void> => {
        const oldCharacterName = 'CHARACTER_NAME(old)';
        const newCharacterName = 'CHARACTER_NAME(new)';

        const testCore = async ({ operateByCreator }: { operateByCreator: boolean }) => {
            await operateThenGetRoomTest({
                operateByCreator,
                source: {
                    character: {
                        setupState: character => {
                            character.isPrivate = false;
                            character.name = oldCharacterName;
                        },
                        operation: {
                            name: { newValue: newCharacterName },
                            pieces: { replace: [], update: [] },
                            tachieLocations: { replace: [], update: [] },
                            boolParams: { update: [] },
                            numParams: { update: [] },
                            numMaxParams: { update: [] },
                            strParams: { update: [] },
                        },
                    }
                },
                test: {
                    operation: ({ operatedByMe, operatedByAnother }) => {
                        expect(__(operatedByMe.characters.update).single().operation.name?.newValue).toBe(newCharacterName);
                        expect(operatedByMe.characters.replace.length).toBe(0);

                        expect(operatedByAnother).toEqual(operatedByMe);
                    },
                    state: ({ createdByMe, createdByAnother }) => {
                        expect(__(createdByMe.characters).single().value.name).toBe(newCharacterName);

                        expect(__(createdByMe.characters).single().value.name).toEqual(createdByAnother.characters[0].value.name);
                    }
                }
            });
        };

        await testCore({ operateByCreator: true });
        await testCore({ operateByCreator: false });
    }, timeout);


    it('updates my character.name when private', async (): Promise<void> => {
        const oldCharacterName = 'CHARACTER_NAME(old)';
        const newCharacterName = 'CHARACTER_NAME(new)';

        await operateThenGetRoomTest({
            operateByCreator: true,
            source: {
                character: {
                    setupState: character => {
                        character.isPrivate = true;
                        character.name = oldCharacterName;
                    },
                    operation: {
                        name: { newValue: newCharacterName },
                        pieces: { replace: [], update: [] },
                        tachieLocations: { replace: [], update: [] },
                        boolParams: { update: [] },
                        numParams: { update: [] },
                        numMaxParams: { update: [] },
                        strParams: { update: [] },
                    },
                }
            },
            test: {
                operation: ({ operatedByMe, operatedByAnother }) => {
                    expect(__(operatedByMe.characters.update).single().operation.name?.newValue).toBe(newCharacterName);
                    expect(operatedByMe.characters.replace.length).toBe(0);

                    expect(operatedByAnother.characters.update.length).toBe(0);
                    expect(operatedByAnother.characters.replace.length).toBe(0);
                },
                state: ({ createdByMe, createdByAnother }) => {
                    expect(__(createdByMe.characters).single().value.name).toBe(newCharacterName);

                    expect(createdByAnother.characters.length).toBe(0);
                }
            }
        });
    }, timeout);


    it('updates other\'s character.name when private', async (): Promise<void> => {
        const oldCharacterName = 'CHARACTER_NAME(old)';
        const newCharacterName = 'CHARACTER_NAME(new)';

        await operateThenGetRoomTest({
            operateByCreator: false,
            source: {
                character: {
                    setupState: character => {
                        character.isPrivate = true;
                        character.name = oldCharacterName;
                    },
                    operation: {
                        name: { newValue: newCharacterName },
                        pieces: { replace: [], update: [] },
                        tachieLocations: { replace: [], update: [] },
                        boolParams: { update: [] },
                        numParams: { update: [] },
                        numMaxParams: { update: [] },
                        strParams: { update: [] },
                    },
                }
            },
            test: {
                operation: 'id',
                state: ({ createdByMe, createdByAnother }) => {
                    expect(createdByMe.characters.length).toBe(0);
                    expect(createdByAnother.characters.length).toBe(0);
                }
            }
        });
    }, timeout);


    it('adds→updates→removes character pieces', async (): Promise<void> => {
        const testCore = async (orm: ORM) => {
            const requestId = 'REQUEST_ID';

            try {
                const em = orm.em.fork();

                await resetDatabase(em);

                const createRoomResult = setupRoomAndUsersAndParticipants({ em });
                const roomPrevRevision = createRoomResult.room.revision;

                const characterStateId = v4();
                const characterState = new Character$MikroORM.Chara({
                    createdBy: createRoomResult.creator.userUid,
                    stateId: characterStateId,
                    isPrivate: false,
                    name: '',
                    room: createRoomResult.room,
                });
                em.persist(characterState);

                const boardStateId = v4();
                const boardState = new Board$MikroORM.Board({
                    createdBy: createRoomResult.creator.userUid,
                    stateId: boardStateId,
                    cellRowCount: 0,
                    cellColumnCount: 0,
                    cellOffsetX: 0,
                    cellOffsetY: 0,
                    cellWidth: 0,
                    cellHeight: 0,
                    name: '',
                    room: createRoomResult.room,
                });
                em.persist(boardState);

                await em.flush();

                const roomResolver = new RoomResolver();

                // **** execute add operation ****
                const operateResult1 = await roomResolver.operateCore({
                    args: {
                        id: createRoomResult.room.id,
                        prevRevision: roomPrevRevision,
                        requestId,
                        operation: {
                            clientId: clientId(),
                            value: {
                                boards: {
                                    replace: [],
                                    update: [],
                                },
                                characters: {
                                    replace: [],
                                    update: [{
                                        id: characterStateId,
                                        createdBy: characterState.createdBy,
                                        operation: {
                                            pieces: {
                                                replace: [{
                                                    boardId: boardStateId,
                                                    boardCreatedBy: boardState.createdBy,
                                                    newValue: {
                                                        isPrivate: false,
                                                        x: 11,
                                                        y: 0,
                                                        w: 0,
                                                        h: 0,
                                                        isCellMode: false,
                                                        cellX: 0,
                                                        cellY: 0,
                                                        cellW: 0,
                                                        cellH: 0,
                                                    }
                                                }],
                                                update: [],
                                            },
                                            tachieLocations: { replace: [], update: [] },
                                            boolParams: { update: [] },
                                            numParams: { update: [] },
                                            numMaxParams: { update: [] },
                                            strParams: { update: [] },
                                        }
                                    }]
                                },
                                bgms: {
                                    replace: [],
                                    update: [],
                                },
                                paramNames: {
                                    replace: [],
                                    update: [],
                                },
                                participants: {
                                    update: [],
                                }
                            }
                        }
                    },
                    context: createResolverContext(orm, createRoomResult.creator.userUid),
                    globalEntryPhrase: undefined,
                });

                // **** test add operation ****
                if (operateResult1.type !== 'success') {
                    expect(operateResult1.type).toBe('success');
                    throw 'Guard';
                }

                expect(operateResult1.result.operation.revisionTo).toBe(roomPrevRevision + 1);

                expect(operateResult1.result.operation.value.characters.replace.length).toBe(0);
                expect(operateResult1.result.operation.value.characters.update.length).toBe(1);
                const update1 = operateResult1.result.operation.value.characters.update[0];
                expect(update1.operation.pieces.replace.length).toBe(1);
                expect(update1.operation.pieces.update.length).toBe(0);
                const pieceLocation1 = update1.operation.pieces.replace[0];
                expect(pieceLocation1.boardCreatedBy).toBe(boardState.createdBy);
                expect(pieceLocation1.boardId).toBe(boardStateId);
                expect(pieceLocation1.newValue?.isPrivate).toBe(false);
                expect(pieceLocation1.newValue?.x).toBe(11);

                const subscription1 = operateResult1.roomOperationPayload.generateOperation(createRoomResult.anotherUser.userUid);
                expect(operateResult1.result.operation.value).toEqual(subscription1.value);

                // **** execute update operation ****
                const operateResult2 = await roomResolver.operateCore({
                    args: {
                        id: createRoomResult.room.id,
                        prevRevision: roomPrevRevision + 1,
                        requestId,
                        operation: {
                            clientId: clientId(),
                            value: {
                                boards: {
                                    replace: [],
                                    update: [],
                                },
                                characters: {
                                    replace: [],
                                    update: [{
                                        id: characterStateId,
                                        createdBy: characterState.createdBy,
                                        operation: {
                                            pieces: {
                                                replace: [],
                                                update: [{
                                                    boardId: boardStateId,
                                                    boardCreatedBy: boardState.createdBy,
                                                    operation: {
                                                        x: { newValue: 12 }
                                                    }
                                                }],
                                            },
                                            tachieLocations: { replace: [], update: [] },
                                            boolParams: { update: [] },
                                            numParams: { update: [] },
                                            numMaxParams: { update: [] },
                                            strParams: { update: [] },
                                        }
                                    }]
                                },
                                bgms: {
                                    replace: [],
                                    update: [],
                                },
                                paramNames: {
                                    replace: [],
                                    update: [],
                                },
                                participants: {
                                    update: [],
                                },
                            }
                        }
                    },
                    context: createResolverContext(orm, createRoomResult.creator.userUid),
                    globalEntryPhrase: undefined,
                });

                // **** test update operation ****
                if (operateResult2.type !== 'success') {
                    expect(operateResult2.type).toBe('success');
                    throw 'Guard';
                }

                expect(operateResult2.result.operation.revisionTo).toBe(roomPrevRevision + 2);

                expect(operateResult2.result.operation.value.characters.replace.length).toBe(0);
                expect(operateResult2.result.operation.value.characters.update.length).toBe(1);
                const update2 = operateResult2.result.operation.value.characters.update[0];
                expect(update2.operation.pieces.replace.length).toBe(0);
                expect(update2.operation.pieces.update.length).toBe(1);
                const pieceLocation2 = update2.operation.pieces.update[0];
                expect(pieceLocation2.operation.x?.newValue).toBe(12);

                const subscription2 = operateResult2.roomOperationPayload.generateOperation(createRoomResult.anotherUser.userUid);
                expect(operateResult2.result.operation.value).toEqual(subscription2.value);

                // **** execute remove operation ****
                const operateResult3 = await roomResolver.operateCore({
                    args: {
                        id: createRoomResult.room.id,
                        prevRevision: roomPrevRevision + 2,
                        requestId,
                        operation: {
                            clientId: clientId(),
                            value: {
                                boards: {
                                    replace: [],
                                    update: [],
                                },
                                characters: {
                                    replace: [],
                                    update: [{
                                        id: characterStateId,
                                        createdBy: characterState.createdBy,
                                        operation: {
                                            pieces: {
                                                replace: [{
                                                    boardId: boardStateId,
                                                    boardCreatedBy: boardState.createdBy,
                                                    newValue: undefined,
                                                }],
                                                update: [],
                                            },
                                            tachieLocations: { replace: [], update: [] },
                                            boolParams: { update: [] },
                                            numParams: { update: [] },
                                            numMaxParams: { update: [] },
                                            strParams: { update: [] },
                                        }
                                    }],
                                },
                                bgms: {
                                    replace: [],
                                    update: [],
                                },
                                paramNames: {
                                    replace: [],
                                    update: [],
                                },
                                participants: {
                                    update: [],
                                }
                            }
                        }
                    },
                    context: createResolverContext(orm, createRoomResult.creator.userUid),
                    globalEntryPhrase: undefined,
                });

                // **** test remove operation ****
                if (operateResult3.type !== 'success') {
                    expect(operateResult3.type).toBe('success');
                    throw 'Guard';
                }

                expect(operateResult3.result.operation.revisionTo).toBe(roomPrevRevision + 3);

                expect(operateResult3.result.operation.value.characters.replace.length).toBe(0);
                expect(operateResult3.result.operation.value.characters.update.length).toBe(1);
                const update3 = operateResult3.result.operation.value.characters.update[0];
                expect(update3.operation.pieces.replace.length).toBe(1);
                expect(update3.operation.pieces.update.length).toBe(0);
                const pieceLocation3 = update3.operation.pieces.replace[0];
                expect(pieceLocation3.newValue).toBeUndefined();

                const subscription3 = operateResult3.roomOperationPayload.generateOperation(createRoomResult.anotherUser.userUid);
                expect(operateResult3.result.operation.value).toEqual(subscription3.value);
            } finally {
                await orm.close();
            }
        };

        const psql = await createPostgreSQL(PostgreSQL);
        const sqlite = await createSQLite(SQLite);

        await testCore(psql);
        await testCore(sqlite);
    }, timeout);


    it('adds numMaxParam', async (): Promise<void> => {
        const key = '1' as const;
        const newValue = 100;

        await operateThenGetRoomTest({
            operateByCreator: false,
            source: {
                character: {
                    setupState: () => {
                        return;
                    },
                    operation: {
                        pieces: { replace: [], update: [] },
                        tachieLocations: { replace: [], update: [] },
                        boolParams: { update: [] },
                        numParams: { update: [] },
                        numMaxParams: {
                            update: [
                                { key, operation: { value: { newValue } } }
                            ]
                        },
                        strParams: { update: [] },
                    },
                }
            },
            test: {
                operation: ({ operatedByMe, operatedByAnother }) => {
                    expect(operatedByMe.characters.replace.length).toBe(0);
                    const numMaxParamsUpdates = __(operatedByMe.characters.update).single().operation.numMaxParams.update;
                    const numMaxParamsUpdate = __(numMaxParamsUpdates).single();
                    expect(numMaxParamsUpdate.key).toBe(key);
                    expect(numMaxParamsUpdate.operation.value?.newValue).toBe(newValue);

                    expect(operatedByMe).toEqual(operatedByAnother);
                },
                state: ({ createdByMe, createdByAnother }) => {
                    const numMaxParams = __(createdByMe.characters).single().value.numMaxParams;
                    const numMaxParam = __(numMaxParams).single();
                    expect(numMaxParam.value.value).toBe(newValue);

                    expect(numMaxParam.value.value).toEqual(__(__(createdByAnother.characters).single().value.numMaxParams).single().value.value);
                }
            }
        });
    }, timeout);


    it('removes numMaxParam.value', async (): Promise<void> => {
        const key = '1' as const;
        const oldValue = 100;

        await operateThenGetRoomTest({
            operateByCreator: false,
            source: {
                character: {
                    setupState: (character, em) => {
                        const numMaxParam = new NumMaxParam({ key, isValuePrivate: false, value: oldValue, chara: character });
                        em.persist(numMaxParam);
                    },
                    operation: {
                        pieces: { replace: [], update: [] },
                        tachieLocations: { replace: [], update: [] },
                        boolParams: { update: [] },
                        numParams: { update: [] },
                        numMaxParams: {
                            update: [
                                { key, operation: { value: { newValue: undefined } } }
                            ]
                        },
                        strParams: { update: [] },
                    },
                }
            },
            test: {
                operation: ({ operatedByMe, operatedByAnother }) => {
                    expect(operatedByMe.characters.replace.length).toBe(0);
                    const numMaxParamsUpdates = __(operatedByMe.characters.update).single().operation.numMaxParams.update;
                    const numMaxParamsUpdate = __(numMaxParamsUpdates).single();
                    expect(numMaxParamsUpdate.key).toBe(key);
                    expect(numMaxParamsUpdate.operation.value).not.toBeUndefined();
                    expect(numMaxParamsUpdate.operation.value?.newValue).toBeUndefined();

                    expect(operatedByMe).toEqual(operatedByAnother);
                },
                state: ({ createdByMe, createdByAnother }) => {
                    const numMaxParams = __(createdByMe.characters).single().value.numMaxParams;
                    const numMaxParam = __(numMaxParams).single();
                    expect(numMaxParam.value.value).toBeUndefined();

                    expect(numMaxParam.value.value).toEqual(__(__(createdByAnother.characters).single().value.numMaxParams).single().value.value);
                }
            }
        });
    }, timeout);


    it('tries to add PieceLocation but the board does not exist', async (): Promise<void> => {
        const testCore = async (orm: ORM) => {
            const requestId = 'REQUEST_ID';
            const nonExistBoardId = 'INVALID_BOARD_ID';

            try {
                const em = orm.em.fork();

                await resetDatabase(em);

                const createRoomResult = setupRoomAndUsersAndParticipants({ em });
                const roomPrevRevision = createRoomResult.room.revision;

                const characterStateId = v4();
                const characterState = new Character$MikroORM.Chara({
                    createdBy: createRoomResult.creator.userUid,
                    stateId: characterStateId,
                    isPrivate: false,
                    name: '',
                    room: createRoomResult.room,
                });
                em.persist(characterState);

                const boardStateId = v4();
                const boardState = new Board$MikroORM.Board({
                    createdBy: createRoomResult.creator.userUid,
                    stateId: boardStateId,
                    cellRowCount: 0,
                    cellColumnCount: 0,
                    cellOffsetX: 0,
                    cellOffsetY: 0,
                    cellWidth: 0,
                    cellHeight: 0,
                    name: '',
                    room: createRoomResult.room,
                });
                em.persist(boardState);

                await em.flush();

                const roomResolver = new RoomResolver();

                // **** execute operation ****
                const operateResult1 = await roomResolver.operateCore({
                    args: {
                        id: createRoomResult.room.id,
                        prevRevision: roomPrevRevision,
                        requestId,
                        operation: {
                            clientId: clientId(),
                            value: {
                                boards: {
                                    replace: [],
                                    update: [],
                                },
                                characters: {
                                    replace: [],
                                    update: [{
                                        id: characterStateId,
                                        createdBy: characterState.createdBy,
                                        operation: {
                                            pieces: {
                                                replace: [{
                                                    boardId: nonExistBoardId,
                                                    boardCreatedBy: boardState.createdBy,
                                                    newValue: {
                                                        isPrivate: false,
                                                        x: 11,
                                                        y: 0,
                                                        w: 0,
                                                        h: 0,
                                                        isCellMode: false,
                                                        cellX: 0,
                                                        cellY: 0,
                                                        cellW: 0,
                                                        cellH: 0,
                                                    }
                                                }],
                                                update: [],
                                            },
                                            tachieLocations: { replace: [], update: [] },
                                            boolParams: { update: [] },
                                            numParams: { update: [] },
                                            numMaxParams: { update: [] },
                                            strParams: { update: [] },
                                        }
                                    }]
                                },
                                bgms: {
                                    replace: [],
                                    update: [],
                                },
                                paramNames: {
                                    replace: [],
                                    update: [],
                                },
                                participants: {
                                    update: [],
                                },
                            }
                        }
                    },
                    context: createResolverContext(orm, createRoomResult.creator.userUid),
                    globalEntryPhrase: undefined,
                });

                expect(operateResult1.type).toBe('id');
            } finally {
                await orm.close();
            }
        };

        const psql = await createPostgreSQL(PostgreSQL);
        const sqlite = await createSQLite(SQLite);

        await testCore(psql);
        await testCore(sqlite);
    }, timeout);


    it('transforms - first: remove, second: update', async (): Promise<void> => {
        const testCore = async (orm: ORM) => {
            const requestId = 'REQUEST_ID';
            const characterName0 = 'NAME(0)';
            const characterName2 = 'NAME(2)';

            try {
                const em = orm.em.fork();

                await resetDatabase(em);

                const createRoomResult = setupRoomAndUsersAndParticipants({ em });
                const roomFirstRevision = createRoomResult.room.revision;

                const characterStateId = v4();
                const characterState = new Character$MikroORM.Chara({
                    createdBy: createRoomResult.creator.userUid,
                    stateId: characterStateId,
                    isPrivate: false,
                    name: characterName0,
                    room: createRoomResult.room,
                });
                em.persist(characterState);

                await em.flush();

                const roomResolver = new RoomResolver();

                // **** execute operation 1 ****
                await roomResolver.operateCore({
                    args: {
                        id: createRoomResult.room.id,
                        prevRevision: roomFirstRevision,
                        requestId,
                        operation: {
                            clientId: clientId(),
                            value: {
                                boards: {
                                    replace: [],
                                    update: [],
                                },
                                characters: {
                                    replace: [{
                                        id: characterStateId,
                                        createdBy: createRoomResult.creator.userUid,
                                        newValue: undefined,
                                    }],
                                    update: [],
                                },
                                bgms: {
                                    replace: [],
                                    update: [],
                                },
                                paramNames: {
                                    replace: [],
                                    update: [],
                                },
                                participants: {
                                    update: [],
                                }
                            }
                        }
                    },
                    context: createResolverContext(orm, createRoomResult.creator.userUid),
                    globalEntryPhrase: undefined,
                });

                // **** execute operation 2 ****
                const actual = await roomResolver.operateCore({
                    args: {
                        id: createRoomResult.room.id,
                        prevRevision: roomFirstRevision,
                        requestId,
                        operation: {
                            clientId: clientId(),
                            value: {
                                boards: {
                                    replace: [],
                                    update: [],
                                },
                                characters: {
                                    replace: [],
                                    update: [{
                                        id: characterStateId,
                                        createdBy: createRoomResult.creator.userUid,
                                        operation: {
                                            name: { newValue: characterName2 },
                                            pieces: {
                                                replace: [],
                                                update: [],
                                            },
                                            tachieLocations: { replace: [], update: [] },
                                            boolParams: { update: [] },
                                            numParams: { update: [] },
                                            numMaxParams: { update: [] },
                                            strParams: { update: [] },
                                        },
                                    }],
                                },
                                bgms: {
                                    replace: [],
                                    update: [],
                                },
                                paramNames: {
                                    replace: [],
                                    update: [],
                                },
                                participants: {
                                    update: [],
                                }
                            }
                        }
                    },
                    context: createResolverContext(orm, createRoomResult.nonCreator.userUid),
                    globalEntryPhrase: undefined,
                });

                // **** test ****
                if (actual.type !== 'id') {
                    expect(actual.type).toBe('id');
                    throw 'Guard';
                }
            } finally {
                await orm.close();
            }
        };

        const psql = await createPostgreSQL(PostgreSQL);
        const sqlite = await createSQLite(SQLite);

        await testCore(psql);
        await testCore(sqlite);
    }, timeout);


    it('transforms - first: update, second: update', async (): Promise<void> => {
        const testCore = async (orm: ORM) => {
            const requestId = 'REQUEST_ID';
            const characterName0 = 'NAME(0)';
            const characterName1 = 'NAME(1)';
            const characterName2 = 'NAME(2)';

            try {
                const em = orm.em.fork();

                await resetDatabase(em);

                const createRoomResult = setupRoomAndUsersAndParticipants({ em });
                const roomFirstRevision = createRoomResult.room.revision;

                const characterStateId = v4();
                const characterState = new Character$MikroORM.Chara({
                    createdBy: createRoomResult.creator.userUid,
                    stateId: characterStateId,
                    isPrivate: false,
                    name: characterName0,
                    room: createRoomResult.room,
                });
                em.persist(characterState);

                await em.flush();

                const roomResolver = new RoomResolver();

                // **** execute operation 1 ****
                await roomResolver.operateCore({
                    args: {
                        id: createRoomResult.room.id,
                        prevRevision: roomFirstRevision,
                        requestId,
                        operation: {
                            clientId: clientId(),
                            value: {
                                boards: {
                                    replace: [],
                                    update: [],
                                },
                                characters: {
                                    replace: [],
                                    update: [{
                                        id: characterStateId,
                                        createdBy: createRoomResult.creator.userUid,
                                        operation: {
                                            name: { newValue: characterName1 },
                                            pieces: {
                                                replace: [],
                                                update: [],
                                            },
                                            tachieLocations: { replace: [], update: [] },
                                            boolParams: { update: [] },
                                            numParams: { update: [] },
                                            numMaxParams: { update: [] },
                                            strParams: { update: [] },
                                        },
                                    }],
                                },
                                bgms: {
                                    replace: [],
                                    update: [],
                                },
                                paramNames: {
                                    replace: [],
                                    update: [],
                                },
                                participants: {
                                    update: [],
                                }
                            }
                        }
                    },
                    context: createResolverContext(orm, createRoomResult.creator.userUid),
                    globalEntryPhrase: undefined,
                });

                // **** execute operation 2 ****
                const actual = await roomResolver.operateCore({
                    args: {
                        id: createRoomResult.room.id,
                        prevRevision: roomFirstRevision,
                        requestId,
                        operation: {
                            clientId: clientId(),
                            value: {
                                boards: {
                                    replace: [],
                                    update: [],
                                },
                                characters: {
                                    replace: [],
                                    update: [{
                                        id: characterStateId,
                                        createdBy: createRoomResult.creator.userUid,
                                        operation: {
                                            name: { newValue: characterName2 },
                                            pieces: {
                                                replace: [],
                                                update: [],
                                            },
                                            tachieLocations: { replace: [], update: [] },
                                            boolParams: { update: [] },
                                            numParams: { update: [] },
                                            numMaxParams: { update: [] },
                                            strParams: { update: [] },
                                        },
                                    }],
                                },
                                bgms: {
                                    replace: [],
                                    update: [],
                                },
                                paramNames: {
                                    replace: [],
                                    update: [],
                                },
                                participants: {
                                    update: [],
                                }
                            }
                        }
                    },
                    context: createResolverContext(orm, createRoomResult.nonCreator.userUid),
                    globalEntryPhrase: undefined,
                });

                // **** test ****
                if (actual.type !== 'id') {
                    expect(actual.type).toBe('id');
                    throw 'Guard';
                }
            } finally {
                await orm.close();
            }
        };

        const psql = await createPostgreSQL(PostgreSQL);
        const sqlite = await createSQLite(SQLite);

        await testCore(psql);
        await testCore(sqlite);
    }, timeout);


    it('transforms - first: remove, second: remove', async (): Promise<void> => {
        const testCore = async (orm: ORM) => {
            const requestId = 'REQUEST_ID';
            const characterName0 = 'NAME(0)';

            try {
                const em = orm.em.fork();

                await resetDatabase(em);

                const createRoomResult = setupRoomAndUsersAndParticipants({ em });
                const roomFirstRevision = createRoomResult.room.revision;

                const characterStateId = v4();
                const characterState = new Character$MikroORM.Chara({
                    createdBy: createRoomResult.creator.userUid,
                    stateId: characterStateId,
                    isPrivate: false,
                    name: characterName0,
                    room: createRoomResult.room,
                });
                em.persist(characterState);

                await em.flush();

                const roomResolver = new RoomResolver();

                // **** execute operation 1 ****
                await roomResolver.operateCore({
                    args: {
                        id: createRoomResult.room.id,
                        prevRevision: roomFirstRevision,
                        requestId,
                        operation: {
                            clientId: clientId(),
                            value: {
                                boards: {
                                    replace: [],
                                    update: [],
                                },
                                characters: {
                                    replace: [{
                                        id: characterStateId,
                                        createdBy: createRoomResult.creator.userUid,
                                        newValue: undefined,
                                    }],
                                    update: [],
                                },
                                bgms: {
                                    replace: [],
                                    update: [],
                                },
                                paramNames: {
                                    replace: [],
                                    update: [],
                                },
                                participants: {
                                    update: [],
                                }
                            }
                        }
                    },
                    context: createResolverContext(orm, createRoomResult.creator.userUid),
                    globalEntryPhrase: undefined,
                });

                // **** execute operation 2 ****
                const actual = await roomResolver.operateCore({
                    args: {
                        id: createRoomResult.room.id,
                        prevRevision: roomFirstRevision,
                        requestId,
                        operation: {
                            clientId: clientId(),
                            value: {
                                boards: {
                                    replace: [],
                                    update: [],
                                },
                                characters: {
                                    replace: [{
                                        id: characterStateId,
                                        createdBy: createRoomResult.creator.userUid,
                                        newValue: undefined,
                                    }],
                                    update: [],
                                },
                                bgms: {
                                    replace: [],
                                    update: [],
                                },
                                paramNames: {
                                    replace: [],
                                    update: [],
                                },
                                participants: {
                                    update: [],
                                }
                            }
                        }
                    },
                    context: createResolverContext(orm, createRoomResult.nonCreator.userUid),
                    globalEntryPhrase: undefined,
                });

                // **** test ****
                if (actual.type !== 'id') {
                    expect(actual.type).toBe('id');
                    throw 'Guard';
                }
            } finally {
                await orm.close();
            }
        };

        const psql = await createPostgreSQL(PostgreSQL);
        const sqlite = await createSQLite(SQLite);

        await testCore(psql);
        await testCore(sqlite);
    }, timeout);
});

