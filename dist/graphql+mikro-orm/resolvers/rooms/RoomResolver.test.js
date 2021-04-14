"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ParticipantRole_1 = require("../../../enums/ParticipantRole");
const $MikroORM = __importStar(require("../../entities/room/mikro-orm"));
const mikro_orm_1 = require("../../../mikro-orm");
const mikro_orm_2 = require("../../entities/user/mikro-orm");
const uuid_1 = require("uuid");
const PromiseQueue_1 = require("../../../utils/PromiseQueue");
const RoomResolver_1 = require("./RoomResolver");
const Board$MikroORM = __importStar(require("../../entities/room/board/mikro-orm"));
const Character$MikroORM = __importStar(require("../../entities/room/character/mikro-orm"));
const collection_1 = require("../../../@shared/collection");
const mikro_orm_3 = require("../../entities/room/character/numParam/mikro-orm");
const mikro_orm_4 = require("../../entities/room/participant/mikro-orm");
const timeout = 20000;
const PostgreSQL = {
    dbName: 'test',
    clientUrl: 'postgresql://test:test@localhost:5432',
};
const SQLite = { dbName: './test.sqlite3' };
const resetDatabase = async (em) => {
    for (const room of await em.find($MikroORM.Room, {})) {
        await $MikroORM.deleteRoom(em, room);
    }
    for (const user of await em.find(mikro_orm_2.User, {})) {
        em.remove(user);
    }
    await em.flush();
};
const createResolverContext = (orm, uid) => ({
    decodedIdToken: {
        isError: false,
        value: {
            uid,
            firebase: {
                sign_in_provider: 'DUMMY_SIGN_IN_PROVIDER'
            }
        },
    },
    promiseQueue: new PromiseQueue_1.PromiseQueue({}),
    createEm: () => orm.em.fork(),
});
const setupRoomAndUsersAndParticipants = ({ em, setupRoom }) => {
    const roomName = 'ROOM_NAME';
    const creatorUserUid = 'CREATOR_ID';
    const creatorName = 'CREATOR_NAME';
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
    const creatorUser = new mikro_orm_2.User({ userUid: creatorUserUid });
    const creatorParticipant = new mikro_orm_4.Partici({ name: creatorName, role: ParticipantRole_1.ParticipantRole.Master, user: creatorUser, room });
    creatorUser.isEntry = true;
    em.persist(creatorParticipant);
    const nonCreatorUser = new mikro_orm_2.User({ userUid: nonCreatorUserUid });
    const nonCreatorParticipant = new mikro_orm_4.Partici({ name: nonCreatorName, role: ParticipantRole_1.ParticipantRole.Master, user: nonCreatorUser, room });
    nonCreatorUser.isEntry = true;
    em.persist(nonCreatorParticipant);
    const anotherUser = new mikro_orm_2.User({ userUid: anotherUserUid });
    const anotherParticipant = new mikro_orm_4.Partici({ name: anotherName, role: ParticipantRole_1.ParticipantRole.Master, user: anotherUser, room });
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
const operateThenGetRoomTestCore = async (strategy, orm) => {
    var _a, _b;
    const requestId = 'REQUEST_ID';
    try {
        const em = orm.em.fork();
        await resetDatabase(em);
        const createRoomResult = setupRoomAndUsersAndParticipants({ em, setupRoom: (_a = strategy.source.roomValue) === null || _a === void 0 ? void 0 : _a.setupState });
        const roomPrevRevision = createRoomResult.room.revision;
        let character = null;
        if (strategy.source.character) {
            const stateId = uuid_1.v4();
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
        const roomResolver = new RoomResolver_1.RoomResolver();
        const operateResult = await roomResolver.operateCore({
            args: {
                id: createRoomResult.room.id,
                prevRevision: roomPrevRevision,
                requestId,
                operation: {
                    value: Object.assign(Object.assign({}, (_b = strategy.source.roomValue) === null || _b === void 0 ? void 0 : _b.operation), { boards: {
                            replace: [],
                            update: [],
                        }, characters: {
                            replace: [],
                            update: character == null ? [] : [character.operation]
                        }, bgms: {
                            replace: [],
                            update: [],
                        }, paramNames: {
                            replace: [],
                            update: [],
                        }, participants: {
                            update: [],
                        } })
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
            return;
        }
        if (operateResult.type !== 'success') {
            expect(operateResult.type).toBe('success');
            return;
        }
        strategy.test.operation({
            operatedByMe: operateResult.result.operation.value,
            operatedByAnother: operateResult.payload.generateOperation(createRoomResult.anotherUser.userUid).value,
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
    }
    finally {
        await orm.close();
    }
};
const operateThenGetRoomTest = async (strategy) => {
    const psql = await mikro_orm_1.createPostgreSQL(PostgreSQL);
    const sqlite = await mikro_orm_1.createSQLite(SQLite);
    await operateThenGetRoomTestCore(strategy, psql);
    await operateThenGetRoomTestCore(strategy, sqlite);
};
describe('operate then getRoom', () => {
    beforeAll(async () => {
        const psql = await mikro_orm_1.createPostgreSQL(PostgreSQL);
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
        const sqlite = await mikro_orm_1.createSQLite(SQLite);
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
    it('updates room.name', async () => {
        const oldRoomName = 'ROOM_NAME(old)';
        const newRoomName = 'ROOM_NAME(new)';
        const testCore = async ({ operateByCreator }) => {
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
                        var _a, _b, _c;
                        expect((_a = operatedByMe.name) === null || _a === void 0 ? void 0 : _a.newValue).toBe(newRoomName);
                        expect((_b = operatedByMe.name) === null || _b === void 0 ? void 0 : _b.newValue).toEqual((_c = operatedByAnother.name) === null || _c === void 0 ? void 0 : _c.newValue);
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
    it('updates character.name when not private', async () => {
        const oldCharacterName = 'CHARACTER_NAME(old)';
        const newCharacterName = 'CHARACTER_NAME(new)';
        const testCore = async ({ operateByCreator }) => {
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
                        var _a;
                        expect((_a = collection_1.__(operatedByMe.characters.update).single().operation.name) === null || _a === void 0 ? void 0 : _a.newValue).toBe(newCharacterName);
                        expect(operatedByMe.characters.replace.length).toBe(0);
                        expect(operatedByAnother).toEqual(operatedByMe);
                    },
                    state: ({ createdByMe, createdByAnother }) => {
                        expect(collection_1.__(createdByMe.characters).single().value.name).toBe(newCharacterName);
                        expect(collection_1.__(createdByMe.characters).single().value.name).toEqual(createdByAnother.characters[0].value.name);
                    }
                }
            });
        };
        await testCore({ operateByCreator: true });
        await testCore({ operateByCreator: false });
    }, timeout);
    it('updates my character.name when private', async () => {
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
                    var _a;
                    expect((_a = collection_1.__(operatedByMe.characters.update).single().operation.name) === null || _a === void 0 ? void 0 : _a.newValue).toBe(newCharacterName);
                    expect(operatedByMe.characters.replace.length).toBe(0);
                    expect(operatedByAnother.characters.update.length).toBe(0);
                    expect(operatedByAnother.characters.replace.length).toBe(0);
                },
                state: ({ createdByMe, createdByAnother }) => {
                    expect(collection_1.__(createdByMe.characters).single().value.name).toBe(newCharacterName);
                    expect(createdByAnother.characters.length).toBe(0);
                }
            }
        });
    }, timeout);
    it('updates other\'s character.name when private', async () => {
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
    it('adds→updates→removes character pieces', async () => {
        const testCore = async (orm) => {
            var _a, _b, _c;
            const requestId = 'REQUEST_ID';
            try {
                const em = orm.em.fork();
                await resetDatabase(em);
                const createRoomResult = setupRoomAndUsersAndParticipants({ em });
                const roomPrevRevision = createRoomResult.room.revision;
                const characterStateId = uuid_1.v4();
                const characterState = new Character$MikroORM.Chara({
                    createdBy: createRoomResult.creator.userUid,
                    stateId: characterStateId,
                    isPrivate: false,
                    name: '',
                    room: createRoomResult.room,
                });
                em.persist(characterState);
                const boardStateId = uuid_1.v4();
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
                const roomResolver = new RoomResolver_1.RoomResolver();
                const operateResult1 = await roomResolver.operateCore({
                    args: {
                        id: createRoomResult.room.id,
                        prevRevision: roomPrevRevision,
                        requestId,
                        operation: {
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
                expect((_a = pieceLocation1.newValue) === null || _a === void 0 ? void 0 : _a.isPrivate).toBe(false);
                expect((_b = pieceLocation1.newValue) === null || _b === void 0 ? void 0 : _b.x).toBe(11);
                const subscription1 = operateResult1.payload.generateOperation(createRoomResult.anotherUser.userUid);
                expect(operateResult1.result.operation.value).toEqual(subscription1.value);
                const operateResult2 = await roomResolver.operateCore({
                    args: {
                        id: createRoomResult.room.id,
                        prevRevision: roomPrevRevision + 1,
                        requestId,
                        operation: {
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
                expect((_c = pieceLocation2.operation.x) === null || _c === void 0 ? void 0 : _c.newValue).toBe(12);
                const subscription2 = operateResult2.payload.generateOperation(createRoomResult.anotherUser.userUid);
                expect(operateResult2.result.operation.value).toEqual(subscription2.value);
                const operateResult3 = await roomResolver.operateCore({
                    args: {
                        id: createRoomResult.room.id,
                        prevRevision: roomPrevRevision + 2,
                        requestId,
                        operation: {
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
                const subscription3 = operateResult3.payload.generateOperation(createRoomResult.anotherUser.userUid);
                expect(operateResult3.result.operation.value).toEqual(subscription3.value);
            }
            finally {
                await orm.close();
            }
        };
        const psql = await mikro_orm_1.createPostgreSQL(PostgreSQL);
        const sqlite = await mikro_orm_1.createSQLite(SQLite);
        await testCore(psql);
        await testCore(sqlite);
    }, timeout);
    it('adds numMaxParam', async () => {
        const key = '1';
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
                    var _a;
                    expect(operatedByMe.characters.replace.length).toBe(0);
                    const numMaxParamsUpdates = collection_1.__(operatedByMe.characters.update).single().operation.numMaxParams.update;
                    const numMaxParamsUpdate = collection_1.__(numMaxParamsUpdates).single();
                    expect(numMaxParamsUpdate.key).toBe(key);
                    expect((_a = numMaxParamsUpdate.operation.value) === null || _a === void 0 ? void 0 : _a.newValue).toBe(newValue);
                    expect(operatedByMe).toEqual(operatedByAnother);
                },
                state: ({ createdByMe, createdByAnother }) => {
                    const numMaxParams = collection_1.__(createdByMe.characters).single().value.numMaxParams;
                    const numMaxParam = collection_1.__(numMaxParams).single();
                    expect(numMaxParam.value.value).toBe(newValue);
                    expect(numMaxParam.value.value).toEqual(collection_1.__(collection_1.__(createdByAnother.characters).single().value.numMaxParams).single().value.value);
                }
            }
        });
    }, timeout);
    it('removes numMaxParam.value', async () => {
        const key = '1';
        const oldValue = 100;
        await operateThenGetRoomTest({
            operateByCreator: false,
            source: {
                character: {
                    setupState: (character, em) => {
                        const numMaxParam = new mikro_orm_3.NumMaxParam({ key, isValuePrivate: false, value: oldValue, chara: character });
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
                    var _a;
                    expect(operatedByMe.characters.replace.length).toBe(0);
                    const numMaxParamsUpdates = collection_1.__(operatedByMe.characters.update).single().operation.numMaxParams.update;
                    const numMaxParamsUpdate = collection_1.__(numMaxParamsUpdates).single();
                    expect(numMaxParamsUpdate.key).toBe(key);
                    expect(numMaxParamsUpdate.operation.value).not.toBeUndefined();
                    expect((_a = numMaxParamsUpdate.operation.value) === null || _a === void 0 ? void 0 : _a.newValue).toBeUndefined();
                    expect(operatedByMe).toEqual(operatedByAnother);
                },
                state: ({ createdByMe, createdByAnother }) => {
                    const numMaxParams = collection_1.__(createdByMe.characters).single().value.numMaxParams;
                    const numMaxParam = collection_1.__(numMaxParams).single();
                    expect(numMaxParam.value.value).toBeUndefined();
                    expect(numMaxParam.value.value).toEqual(collection_1.__(collection_1.__(createdByAnother.characters).single().value.numMaxParams).single().value.value);
                }
            }
        });
    }, timeout);
    it('tries to add PieceLocation but the board does not exist', async () => {
        const testCore = async (orm) => {
            const requestId = 'REQUEST_ID';
            const nonExistBoardId = 'INVALID_BOARD_ID';
            try {
                const em = orm.em.fork();
                await resetDatabase(em);
                const createRoomResult = setupRoomAndUsersAndParticipants({ em });
                const roomPrevRevision = createRoomResult.room.revision;
                const characterStateId = uuid_1.v4();
                const characterState = new Character$MikroORM.Chara({
                    createdBy: createRoomResult.creator.userUid,
                    stateId: characterStateId,
                    isPrivate: false,
                    name: '',
                    room: createRoomResult.room,
                });
                em.persist(characterState);
                const boardStateId = uuid_1.v4();
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
                const roomResolver = new RoomResolver_1.RoomResolver();
                const operateResult1 = await roomResolver.operateCore({
                    args: {
                        id: createRoomResult.room.id,
                        prevRevision: roomPrevRevision,
                        requestId,
                        operation: {
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
            }
            finally {
                await orm.close();
            }
        };
        const psql = await mikro_orm_1.createPostgreSQL(PostgreSQL);
        const sqlite = await mikro_orm_1.createSQLite(SQLite);
        await testCore(psql);
        await testCore(sqlite);
    }, timeout);
    it('transforms - first: remove, second: update', async () => {
        const testCore = async (orm) => {
            const requestId = 'REQUEST_ID';
            const characterName0 = 'NAME(0)';
            const characterName2 = 'NAME(2)';
            try {
                const em = orm.em.fork();
                await resetDatabase(em);
                const createRoomResult = setupRoomAndUsersAndParticipants({ em });
                const roomFirstRevision = createRoomResult.room.revision;
                const characterStateId = uuid_1.v4();
                const characterState = new Character$MikroORM.Chara({
                    createdBy: createRoomResult.creator.userUid,
                    stateId: characterStateId,
                    isPrivate: false,
                    name: characterName0,
                    room: createRoomResult.room,
                });
                em.persist(characterState);
                await em.flush();
                const roomResolver = new RoomResolver_1.RoomResolver();
                await roomResolver.operateCore({
                    args: {
                        id: createRoomResult.room.id,
                        prevRevision: roomFirstRevision,
                        requestId,
                        operation: {
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
                const actual = await roomResolver.operateCore({
                    args: {
                        id: createRoomResult.room.id,
                        prevRevision: roomFirstRevision,
                        requestId,
                        operation: {
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
                if (actual.type !== 'id') {
                    expect(actual.type).toBe('id');
                    throw 'Guard';
                }
            }
            finally {
                await orm.close();
            }
        };
        const psql = await mikro_orm_1.createPostgreSQL(PostgreSQL);
        const sqlite = await mikro_orm_1.createSQLite(SQLite);
        await testCore(psql);
        await testCore(sqlite);
    }, timeout);
    it('transforms - first: update, second: update', async () => {
        const testCore = async (orm) => {
            const requestId = 'REQUEST_ID';
            const characterName0 = 'NAME(0)';
            const characterName1 = 'NAME(1)';
            const characterName2 = 'NAME(2)';
            try {
                const em = orm.em.fork();
                await resetDatabase(em);
                const createRoomResult = setupRoomAndUsersAndParticipants({ em });
                const roomFirstRevision = createRoomResult.room.revision;
                const characterStateId = uuid_1.v4();
                const characterState = new Character$MikroORM.Chara({
                    createdBy: createRoomResult.creator.userUid,
                    stateId: characterStateId,
                    isPrivate: false,
                    name: characterName0,
                    room: createRoomResult.room,
                });
                em.persist(characterState);
                await em.flush();
                const roomResolver = new RoomResolver_1.RoomResolver();
                await roomResolver.operateCore({
                    args: {
                        id: createRoomResult.room.id,
                        prevRevision: roomFirstRevision,
                        requestId,
                        operation: {
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
                const actual = await roomResolver.operateCore({
                    args: {
                        id: createRoomResult.room.id,
                        prevRevision: roomFirstRevision,
                        requestId,
                        operation: {
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
                if (actual.type !== 'id') {
                    expect(actual.type).toBe('id');
                    throw 'Guard';
                }
            }
            finally {
                await orm.close();
            }
        };
        const psql = await mikro_orm_1.createPostgreSQL(PostgreSQL);
        const sqlite = await mikro_orm_1.createSQLite(SQLite);
        await testCore(psql);
        await testCore(sqlite);
    }, timeout);
    it('transforms - first: remove, second: remove', async () => {
        const testCore = async (orm) => {
            const requestId = 'REQUEST_ID';
            const characterName0 = 'NAME(0)';
            try {
                const em = orm.em.fork();
                await resetDatabase(em);
                const createRoomResult = setupRoomAndUsersAndParticipants({ em });
                const roomFirstRevision = createRoomResult.room.revision;
                const characterStateId = uuid_1.v4();
                const characterState = new Character$MikroORM.Chara({
                    createdBy: createRoomResult.creator.userUid,
                    stateId: characterStateId,
                    isPrivate: false,
                    name: characterName0,
                    room: createRoomResult.room,
                });
                em.persist(characterState);
                await em.flush();
                const roomResolver = new RoomResolver_1.RoomResolver();
                await roomResolver.operateCore({
                    args: {
                        id: createRoomResult.room.id,
                        prevRevision: roomFirstRevision,
                        requestId,
                        operation: {
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
                const actual = await roomResolver.operateCore({
                    args: {
                        id: createRoomResult.room.id,
                        prevRevision: roomFirstRevision,
                        requestId,
                        operation: {
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
                if (actual.type !== 'id') {
                    expect(actual.type).toBe('id');
                    throw 'Guard';
                }
            }
            finally {
                await orm.close();
            }
        };
        const psql = await mikro_orm_1.createPostgreSQL(PostgreSQL);
        const sqlite = await mikro_orm_1.createSQLite(SQLite);
        await testCore(psql);
        await testCore(sqlite);
    }, timeout);
});
