import { DualKeyMap, ReadonlyDualKeyMap } from '../../../@shared/DualKeyMap';
import { StrIndex100, StrIndex5 } from '../../../@shared/indexes';
import { Result, ResultModule } from '../../../@shared/Result';
import { RoomParameterNameType } from '../../../enums/RoomParameterNameType';
import { undefinedForAll } from '../../../utils/helpers';
import { ReadonlyDualKeyMapDownOperation, ReadonlyDualKeyMapTwoWayOperation, ReadonlyDualKeyMapUpOperation } from '../../dualKeyMapOperations';
import { ReadonlyMapDownOperation, ReadonlyMapTwoWayOperation, ReadonlyMapUpOperation } from '../../mapOperations';
import { ReplaceStringDownOperation, ReplaceStringDownOperationModule, ReplaceStringTwoWayOperation, ReplaceStringTwoWayOperationModule, ReplaceStringUpOperation } from '../../Operations';
import { GlobalBoard } from './board/global';
import { GlobalCharacter } from './character/global';
import { DualKeyMapTransformer, MapTransformer, TransformerFactory } from '../global';
import { GlobalParticipant } from './participant/global';
import { GlobalBgm } from './bgm/global';
import { RoomGetState, RoomOperationInput, RoomOperationValue } from './graphql';
import { Room, RoomOp } from './mikro-orm';
import { GlobalParamName } from './paramName/global';
import { RequestedBy, server } from '../../Types';
import { EM } from '../../../utils/types';
import { Reference } from '@mikro-orm/core';

type IsSequentialResult<T> = {
    type: 'DuplicateElement';
} | {
    type: 'EmptyArray';
} | {
    type: 'Sequential';
    minIndex: number;
    maxIndex: number;
} | {
    type: 'NotSequential';
    minIndex: number;
    maxIndex: number;
    takeUntilSequential: { index: number; value: T }[];
}

const isSequential = <T>(array: T[], getIndex: (elem: T) => number): IsSequentialResult<T> => {
    const sorted = array.map(value => ({ index: getIndex(value), value })).sort((x, y) => x.index - y.index);
    if (sorted.length === 0) {
        return { type: 'EmptyArray' };
    }
    const takeUntilSequential: { index: number; value: T }[] = [];
    const minIndex = sorted[0].index;
    let maxIndex = minIndex;
    let previousElement: { index: number; value: T } | null = null;
    for (const elem of sorted) {
        if (previousElement != null) {
            if (elem.index === previousElement.index) {
                return { type: 'DuplicateElement' };
            }
            if (elem.index - previousElement.index !== 1) {
                return {
                    type: 'NotSequential',
                    minIndex,
                    maxIndex,
                    takeUntilSequential,
                };
            }
        }
        maxIndex = elem.index;
        previousElement = elem;
        takeUntilSequential.push(elem);
    }
    return {
        type: 'Sequential',
        minIndex,
        maxIndex,
    };
};

export namespace GlobalRoom {
    type StateTypeValue = {
        name: string;
        createdBy: string;
    }

    export type StateType = StateTypeValue & {
        bgms: ReadonlyMap<StrIndex5, GlobalBgm.StateType>;
        boards: ReadonlyDualKeyMap<string, string, GlobalBoard.StateType>;
        characters: ReadonlyDualKeyMap<string, string, GlobalCharacter.StateType>;
        paramNames: ReadonlyDualKeyMap<RoomParameterNameType, StrIndex100, GlobalParamName.StateType>;
        participants: ReadonlyMap<string, GlobalParticipant.StateType>;
    }

    type DownOperationTypeValue = {
        name?: ReplaceStringDownOperation;
    }

    export type DownOperationType = DownOperationTypeValue & {
        bgms: ReadonlyMapDownOperation<StrIndex5, GlobalBgm.StateType, GlobalBgm.DownOperationType>;
        boards: ReadonlyDualKeyMapDownOperation<string, string, GlobalBoard.StateType, GlobalBoard.DownOperationType>;
        characters: ReadonlyDualKeyMapDownOperation<string, string, GlobalCharacter.StateType, GlobalCharacter.DownOperationType>;
        paramNames: ReadonlyDualKeyMapDownOperation<RoomParameterNameType, StrIndex100, GlobalParamName.StateType, GlobalParamName.DownOperationType>;
        participants: ReadonlyMapDownOperation<string, GlobalParticipant.StateType, GlobalParticipant.DownOperationType>;
    }

    type UpOperationTypeValue = {
        name?: ReplaceStringUpOperation;
    }

    export type UpOperationType = UpOperationTypeValue & {
        bgms: ReadonlyMapUpOperation<StrIndex5, GlobalBgm.StateType, GlobalBgm.UpOperationType>;
        boards: ReadonlyDualKeyMapUpOperation<string, string, GlobalBoard.StateType, GlobalBoard.UpOperationType>;
        characters: ReadonlyDualKeyMapUpOperation<string, string, GlobalCharacter.StateType, GlobalCharacter.UpOperationType>;
        paramNames: ReadonlyDualKeyMapUpOperation<RoomParameterNameType, StrIndex100, GlobalParamName.StateType, GlobalParamName.UpOperationType>;
        participants: ReadonlyMapUpOperation<string, GlobalParticipant.StateType, GlobalParticipant.UpOperationType>;
    }

    type TwoWayOperationTypeValue = {
        name?: ReplaceStringTwoWayOperation;
    }

    export type TwoWayOperationType = TwoWayOperationTypeValue & {
        bgms: ReadonlyMapTwoWayOperation<StrIndex5, GlobalBgm.StateType, GlobalBgm.TwoWayOperationType>;
        boards: ReadonlyDualKeyMapTwoWayOperation<string, string, GlobalBoard.StateType, GlobalBoard.TwoWayOperationType>;
        characters: ReadonlyDualKeyMapTwoWayOperation<string, string, GlobalCharacter.StateType, GlobalCharacter.TwoWayOperationType>;
        paramNames: ReadonlyDualKeyMapTwoWayOperation<RoomParameterNameType, StrIndex100, GlobalParamName.StateType, GlobalParamName.TwoWayOperationType>;
        participants: ReadonlyMapTwoWayOperation<string, GlobalParticipant.StateType, GlobalParticipant.TwoWayOperationType>;
    }

    export namespace MikroORM {
        export namespace ToGlobal {
            export const state = async (entity: Room): Promise<StateType> => {
                const bgms = GlobalBgm.MikroORM.ToGlobal.stateMany(await entity.roomBgms.loadItems());
                const boards = GlobalBoard.MikroORM.ToGlobal.stateMany(await entity.boards.loadItems());
                const characters = await GlobalCharacter.MikroORM.ToGlobal.stateMany(await entity.characters.loadItems());
                const paramNames = GlobalParamName.MikroORM.ToGlobal.stateMany(await entity.paramNames.loadItems());
                const participants = await GlobalParticipant.MikroORM.ToGlobal.stateMany(await entity.particis.loadItems());

                return {
                    ...entity,
                    bgms,
                    boards,
                    characters,
                    paramNames,
                    participants,
                };
            };

            export const downOperation = async ({
                op,
            }: {
                op: RoomOp;
            }): Promise<Result<DownOperationType>> => {
                const bgms = await GlobalBgm.MikroORM.ToGlobal.downOperationMany({
                    add: op.addRoomBgmOps,
                    remove: op.removeRoomBgmOps,
                    update: op.updateRoomBgmOps,
                });
                if (bgms.isError) {
                    return bgms;
                }

                const boards = await GlobalBoard.MikroORM.ToGlobal.downOperationMany({
                    add: op.addBoardOps,
                    remove: op.removeBoardOps,
                    update: op.updateBoardOps,
                });
                if (boards.isError) {
                    return boards;
                }

                const characters = await GlobalCharacter.MikroORM.ToGlobal.downOperationMany({
                    add: op.addCharacterOps,
                    remove: op.removeCharacterOps,
                    update: op.updateCharacterOps,
                });
                if (characters.isError) {
                    return characters;
                }

                const paramNames = await GlobalParamName.MikroORM.ToGlobal.downOperationMany({
                    add: op.addParamNameOps,
                    remove: op.removeParamNameOps,
                    update: op.updateParamNameOps,
                });
                if (paramNames.isError) {
                    return paramNames;
                }

                const participants = await GlobalParticipant.MikroORM.ToGlobal.downOperationMany({
                    add: op.addParticiOps,
                    remove: op.removeParticiOps,
                    update: op.updateParticiOps,
                });
                if (participants.isError) {
                    return participants;
                }

                return ResultModule.ok({
                    bgms: bgms.value,
                    boards: boards.value,
                    characters: characters.value,
                    paramNames: paramNames.value,
                    participants: participants.value,
                    name: op.name == null ? undefined : { oldValue: op.name },
                });
            };

            export const downOperationMany = async ({
                em,
                roomId,
                revisionRange,
            }: {
                em: EM;
                roomId: string;
                revisionRange: { from: number; expectedTo?: number };
            }) => {
                const operationEntities = await em.find(RoomOp, { room: { id: roomId }, prevRevision: { $gte: revisionRange.from } });
                const isSequentialResult = isSequential(operationEntities, o => o.prevRevision);
                if (isSequentialResult.type === 'NotSequential') {
                    return ResultModule.error('Database error. There are missing operations. Multiple server apps edit same database simultaneously?');
                }
                if (isSequentialResult.type === 'DuplicateElement') {
                    return ResultModule.error('Database error. There are duplicate operations. Multiple server apps edit same database simultaneously?');
                }
                if (isSequentialResult.type === 'EmptyArray') {
                    return ResultModule.ok(undefined);
                }
                if (isSequentialResult.minIndex !== revisionRange.from) {
                    return ResultModule.error('revision out of range(too small)');
                }
                if (revisionRange.expectedTo !== undefined) {
                    if (isSequentialResult.maxIndex !== (revisionRange.expectedTo - 1)) {
                        return ResultModule.error('Database error. Revision of latest operation is not same as revision of state. Multiple server apps edit same database simultaneously?');
                    }
                }

                const sortedOperationEntities = operationEntities.sort((x, y) => x.prevRevision - y.prevRevision);
                const operationResult = await MikroORM.ToGlobal.downOperation({ op: sortedOperationEntities[0] });
                if (operationResult.isError) {
                    return operationResult;
                }
                let operation: DownOperationType | undefined = operationResult.value;

                let isFirst = false;
                for (const model of sortedOperationEntities) {
                    if (isFirst) {
                        isFirst = true;
                        continue;
                    }
                    const second = await MikroORM.ToGlobal.downOperation({ op: model });
                    if (second.isError) {
                        return second;
                    }
                    if (operation === undefined) {
                        operation = second.value;
                        continue;
                    }
                    // composeLooseではoperatedByは使われていないはずなので、適当な値を渡している。
                    const composed = transformerFactory({ type: server }).composeLoose({ key: null, first: operation, second: second.value });
                    if (composed.isError) {
                        return composed;
                    }
                    operation = composed.value;
                }
                return ResultModule.ok(operation);
            };
        }
    }

    export namespace Global {
        export namespace ToGraphQL {
            export const state = ({ source, requestedBy }: { source: StateType; requestedBy: RequestedBy }): Omit<RoomGetState, 'revision' | 'createdBy'> => {
                const bgms = GlobalBgm.Global.ToGraphQL.stateMany({ source: source.bgms });
                const boards = GlobalBoard.Global.ToGraphQL.stateMany({ source: source.boards });
                const characters = GlobalCharacter.Global.ToGraphQL.stateMany({ source: source.characters, requestedBy });
                const paramNames = GlobalParamName.Global.ToGraphQL.stateMany({ source: source.paramNames });
                const participants = GlobalParticipant.Global.ToGraphQL.stateMany({ source: source.participants, requestedBy });

                return {
                    name: source.name,
                    bgms,
                    boards,
                    characters,
                    paramNames,
                    participants,
                };
            };

            export const operation = ({
                operation,
                prevState,
                nextState,
                requestedBy,
            }: {
                operation: TwoWayOperationType;
                prevState: StateType;
                nextState: StateType;
                requestedBy: RequestedBy;
            }): RoomOperationValue => {
                const bgms = GlobalBgm.Global.ToGraphQL.operation({ operation: operation.bgms });
                const boards = GlobalBoard.Global.ToGraphQL.operation({ operation: operation.boards });
                const characters = GlobalCharacter.Global.ToGraphQL.operation({ operation: operation.characters, prevState: prevState.characters, nextState: nextState.characters, requestedBy });
                const paramNames = GlobalParamName.Global.ToGraphQL.operation({ operation: operation.paramNames });
                const participants = GlobalParticipant.Global.ToGraphQL.operation({ operation: operation.participants, prevState: prevState.participants, nextState: nextState.participants, requestedBy });

                return {
                    name: operation.name,
                    bgms,
                    boards,
                    characters,
                    paramNames,
                    participants,
                };
            };
        }

        export const emptyTwoWayOperation = (): Readonly<TwoWayOperationType> => ({
            bgms: new Map(),
            boards: new DualKeyMap(),
            characters: new DualKeyMap(),
            paramNames: new DualKeyMap(),
            participants: new Map(),
        });

        export const applyToEntity = async ({
            em,
            target,
            operation,
        }: {
            em: EM;
            target: Room;
            operation: TwoWayOperationType;
        }) => {
            const prevRevision = target.revision;
            target.revision += 1;
            const op = new RoomOp({ prevRevision });
            op.room = Reference.create<Room>(target);

            await GlobalBgm.Global.applyToEntity({ em, parent: target, parentOp: op, operation: operation.bgms });
            await GlobalBoard.Global.applyToEntity({ em, parent: target, parentOp: op, operation: operation.boards });
            await GlobalCharacter.Global.applyToEntity({ em, parent: target, parentOp: op, operation: operation.characters });
            await GlobalParamName.Global.applyToEntity({ em, parent: target, parentOp: op, operation: operation.paramNames });
            await GlobalParticipant.Global.applyToEntity({ em, parent: target, parentOp: op, operation: operation.participants });

            if (operation.name != null) {
                target.name = operation.name.newValue;
                op.name = operation.name.oldValue;
            }

            em.persist(op);
        };
    }

    export namespace GraphQL {
        export namespace ToGlobal {
            export const upOperation = (source: RoomOperationInput): Result<UpOperationType> => {
                const bgms = GlobalBgm.GraphQL.ToGlobal.upOperationMany(source.value.bgms);
                if (bgms.isError) {
                    return bgms;
                }
                const boards = GlobalBoard.GraphQL.ToGlobal.upOperationMany(source.value.boards);
                if (boards.isError) {
                    return boards;
                }
                const characters = GlobalCharacter.GraphQL.ToGlobal.upOperationMany(source.value.characters);
                if (characters.isError) {
                    return characters;
                }
                const paramNames = GlobalParamName.GraphQL.ToGlobal.upOperationMany(source.value.paramNames);
                if (paramNames.isError) {
                    return paramNames;
                }
                const participants = GlobalParticipant.GraphQL.ToGlobal.upOperationManyFromInput(source.value.participants);
                if (participants.isError) {
                    return participants;
                }

                return ResultModule.ok({
                    name: source.value.name,
                    bgms: bgms.value,
                    boards: boards.value,
                    characters: characters.value,
                    paramNames: paramNames.value,
                    participants: participants.value,
                });
            };
        }
    }

    const bgmTransformer = GlobalBgm.transformerFactory;
    const bgmsTransformer = new MapTransformer(bgmTransformer);
    const boardTransformer = GlobalBoard.transformerFactory;
    const boardsTransformer = new DualKeyMapTransformer(boardTransformer);
    const createCharacterTransformer = (operatedBy: RequestedBy) => GlobalCharacter.transformerFactory(operatedBy);
    const createCharactersTransformer = (operatedBy: RequestedBy) => new DualKeyMapTransformer(createCharacterTransformer(operatedBy));
    const paramNameTransformer = GlobalParamName.transformerFactory;
    const paramNamesTransformer = new DualKeyMapTransformer(paramNameTransformer);
    const createParticipantTransformer = (operatedBy: RequestedBy) => GlobalParticipant.transformerFactory(operatedBy);
    const createParticipantsTransformer = (operatedBy: RequestedBy) => new MapTransformer(createParticipantTransformer(operatedBy));

    export const transformerFactory = (operatedBy: RequestedBy): TransformerFactory<null, StateType, StateType, DownOperationType, UpOperationType, TwoWayOperationType> => ({
        composeLoose: ({ first, second }) => {
            const bgms = bgmsTransformer.composeLoose({
                first: first.bgms,
                second: second.bgms,
            });
            if (bgms.isError) {
                return bgms;
            }

            const boards = boardsTransformer.composeLoose({
                first: first.boards,
                second: second.boards,
            });
            if (boards.isError) {
                return boards;
            }

            const characters = createCharactersTransformer(operatedBy).composeLoose({
                first: first.characters,
                second: second.characters,
            });
            if (characters.isError) {
                return characters;
            }

            const paramNames = paramNamesTransformer.composeLoose({
                first: first.paramNames,
                second: second.paramNames,
            });
            if (paramNames.isError) {
                return paramNames;
            }

            const participants = createParticipantsTransformer(operatedBy).composeLoose({
                first: first.participants,
                second: second.participants,
            });
            if (participants.isError) {
                return participants;
            }

            const valueProps: DownOperationType = {
                name: ReplaceStringDownOperationModule.compose(first.name, second.name),
                bgms: bgms.value ?? new Map(),
                boards: boards.value ?? new DualKeyMap(),
                characters: characters.value ?? new DualKeyMap(),
                paramNames: paramNames.value ?? new DualKeyMap(),
                participants: participants.value ?? new Map(),
            };
            return ResultModule.ok(valueProps);
        },
        restore: ({ nextState, downOperation }) => {
            if (downOperation === undefined) {
                return ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
            }

            const bgms = bgmsTransformer.restore({
                nextState: nextState.bgms,
                downOperation: downOperation.bgms,
            });
            if (bgms.isError) {
                return bgms;
            }

            const boards = boardsTransformer.restore({
                nextState: nextState.boards,
                downOperation: downOperation.boards,
            });
            if (boards.isError) {
                return boards;
            }

            const characters = createCharactersTransformer(operatedBy).restore({
                nextState: nextState.characters,
                downOperation: downOperation.characters,
            });
            if (characters.isError) {
                return characters;
            }

            const paramNames = paramNamesTransformer.restore({
                nextState: nextState.paramNames,
                downOperation: downOperation.paramNames,
            });
            if (paramNames.isError) {
                return paramNames;
            }

            const participants = createParticipantsTransformer(operatedBy).restore({
                nextState: nextState.participants,
                downOperation: downOperation.participants,
            });
            if (participants.isError) {
                return participants;
            }

            const prevState: StateType = {
                ...nextState,
                bgms: bgms.value.prevState,
                boards: boards.value.prevState,
                characters: characters.value.prevState,
                paramNames: paramNames.value.prevState,
                participants: participants.value.prevState,
            };
            const twoWayOperation: TwoWayOperationType = {
                bgms: bgms.value.twoWayOperation,
                boards: boards.value.twoWayOperation,
                characters: characters.value.twoWayOperation,
                paramNames: paramNames.value.twoWayOperation,
                participants: participants.value.twoWayOperation,
            };

            if (downOperation.name !== undefined) {
                prevState.name = downOperation.name.oldValue;
                twoWayOperation.name = { ...downOperation.name, newValue: nextState.name };
            }

            return ResultModule.ok({ prevState, twoWayOperation });
        },
        transform: ({ prevState, currentState, clientOperation, serverOperation }) => {
            const bgms = bgmsTransformer.transform({
                prevState: prevState.bgms,
                currentState: currentState.bgms,
                clientOperation: clientOperation.bgms,
                serverOperation: serverOperation?.bgms ?? new Map(),
            });
            if (bgms.isError) {
                return bgms;
            }

            const boards = boardsTransformer.transform({
                prevState: prevState.boards,
                currentState: currentState.boards,
                clientOperation: clientOperation.boards,
                serverOperation: serverOperation?.boards ?? new DualKeyMap(),
            });
            if (boards.isError) {
                return boards;
            }

            const characters = createCharactersTransformer(operatedBy).transform({
                prevState: prevState.characters,
                currentState: currentState.characters,
                clientOperation: clientOperation.characters,
                serverOperation: serverOperation?.characters ?? new DualKeyMap(),
            });
            if (characters.isError) {
                return characters;
            }

            const paramNames = paramNamesTransformer.transform({
                prevState: prevState.paramNames,
                currentState: currentState.paramNames,
                clientOperation: clientOperation.paramNames,
                serverOperation: serverOperation?.paramNames ?? new DualKeyMap(),
            });
            if (paramNames.isError) {
                return paramNames;
            }

            const participants = createParticipantsTransformer(operatedBy).transform({
                prevState: prevState.participants,
                currentState: currentState.participants,
                clientOperation: clientOperation.participants,
                serverOperation: serverOperation?.participants ?? new Map(),
            });
            if (participants.isError) {
                return participants;
            }

            const twoWayOperation: TwoWayOperationTypeValue = {};

            twoWayOperation.name = ReplaceStringTwoWayOperationModule.transform({
                first: serverOperation?.name,
                second: clientOperation.name,
                prevState: prevState.name,
            });

            if (undefinedForAll(twoWayOperation) && bgms.value.size === 0 && boards.value.size === 0 && characters.value.size === 0 && paramNames.value.size === 0 && participants.value.size === 0) {
                return ResultModule.ok(undefined);
            }

            return ResultModule.ok({
                ...twoWayOperation,
                bgms: bgms.value,
                boards: boards.value,
                characters: characters.value,
                paramNames: paramNames.value,
                participants: participants.value,
            });
        },
        diff: ({ prevState, nextState }) => {
            const bgms = bgmsTransformer.diff({
                prevState: prevState.bgms,
                nextState: nextState.bgms,
            });
            const boards = boardsTransformer.diff({
                prevState: prevState.boards,
                nextState: nextState.boards,
            });
            const characters = createCharactersTransformer(operatedBy).diff({
                prevState: prevState.characters,
                nextState: nextState.characters,
            });
            const paramNames = paramNamesTransformer.diff({
                prevState: prevState.paramNames,
                nextState: nextState.paramNames,
            });
            const participants = createParticipantsTransformer(operatedBy).diff({
                prevState: prevState.participants,
                nextState: nextState.participants,
            });
            const resultType: TwoWayOperationTypeValue = {};
            if (prevState.name !== nextState.name) {
                resultType.name = { oldValue: prevState.name, newValue: nextState.name };
            }
            if (undefinedForAll(resultType) && bgms.size === 0 && boards.size === 0 && characters.size === 0 && paramNames.size === 0 && participants.size === 0) {
                return undefined;
            }
            return { ...resultType, bgms, boards, characters, paramNames, participants };
        },
        applyBack: ({ downOperation, nextState }) => {
            const bgms = bgmsTransformer.applyBack({
                downOperation: downOperation.bgms,
                nextState: nextState.bgms,
            });
            if (bgms.isError) {
                return bgms;
            }

            const boards = boardsTransformer.applyBack({
                downOperation: downOperation.boards,
                nextState: nextState.boards,
            });
            if (boards.isError) {
                return boards;
            }

            const characters = createCharactersTransformer(operatedBy).applyBack({
                downOperation: downOperation.characters,
                nextState: nextState.characters,
            });
            if (characters.isError) {
                return characters;
            }

            const paramNames = paramNamesTransformer.applyBack({
                downOperation: downOperation.paramNames,
                nextState: nextState.paramNames,
            });
            if (paramNames.isError) {
                return paramNames;
            }

            const participants = createParticipantsTransformer(operatedBy).applyBack({
                downOperation: downOperation.participants,
                nextState: nextState.participants,
            });
            if (participants.isError) {
                return participants;
            }

            const result: StateType = {
                ...nextState,
                bgms: bgms.value,
                boards: boards.value,
                characters: characters.value,
                paramNames: paramNames.value,
                participants: participants.value,
            };

            if (downOperation.name !== undefined) {
                result.name = downOperation.name.oldValue;
            }

            return ResultModule.ok(result);
        },
        toServerState: ({ clientState }) => clientState,
        protectedValuePolicy: {}
    });
}