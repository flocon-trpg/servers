import { Result, ResultModule } from '../../../@shared/Result';
import { ReplaceStringDownOperation, ReplaceStringDownOperationModule, ReplaceStringTwoWayOperation, ReplaceStringTwoWayOperationModule } from '../../Operations';
import * as Bgm$Global from './bgm/global';
import * as ParamName$Global from './paramName/global';
import * as Board$Global from '../board/global';
import * as Character$Global from '../character/global';
import * as Participant$GraphQL from '../participant/graphql';
import * as Participant$MikroORM from '../participant/mikro-orm';
import * as Participant$Global from '../participant/global';
import * as GraphQL from './graphql';
import * as $MikroORM from './mikro-orm';
import { undefinedForAll } from '../../../utils/helpers';
import { EM } from '../../../utils/types';
import { __ } from '../../../@shared/collection';

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

type RoomType = {
    name: string;
}

type RoomDownOperationType = {
    name?: ReplaceStringDownOperation;
}

type MutableRoomTwoWayOperation = {
    name?: ReplaceStringTwoWayOperation;
}

export class RoomDownOperation {
    private constructor(private readonly params: {
        boards: Board$Global.BoardsDownOperation;
        characters: Character$Global.CharactersDownOperation;
        bgms: Bgm$Global.RoomBgmsDownOperation;
        paramNames: ParamName$Global.ParamNamesDownOperation;
        valueProps: RoomDownOperationType;
    }) { }

    public static async create(entity: $MikroORM.RoomOp): Promise<Result<RoomDownOperation>> {
        const bgms = await Bgm$Global.RoomBgmsDownOperation.create({
            add: entity.addRoomBgmOps,
            remove: entity.removeRoomBgmOps,
            update: entity.updateRoomBgmOps,
        });
        if (bgms.isError) {
            return bgms;
        }

        const paramNames = await ParamName$Global.ParamNamesDownOperation.create({
            add: entity.addParamNameOps,
            remove: entity.removeParamNameOps,
            update: entity.updateParamNameOps,
        });
        if (paramNames.isError) {
            return paramNames;
        }

        const boards = await Board$Global.BoardsDownOperation.create({
            add: entity.addBoardOps,
            remove: entity.removeBoardOps,
            update: entity.updateBoardOps,
        });
        if (boards.isError) {
            return boards;
        }

        const characters = await Character$Global.CharactersDownOperation.create({
            add: entity.addCharacterOps,
            remove: entity.removeCharacterOps,
            update: entity.updateCharacterOps,
        });
        if (characters.isError) {
            return characters;
        }

        const valueProps: RoomDownOperationType = {
        };

        valueProps.name = entity.name === undefined ? undefined : { oldValue: entity.name };

        return ResultModule.ok(new RoomDownOperation({
            boards: boards.value,
            characters: characters.value,
            bgms: bgms.value,
            paramNames: paramNames.value,
            valueProps,
        }));
    }

    public static async findRange(em: EM, roomId: string, revisionRange: { from: number; expectedTo?: number }): Promise<Result<RoomDownOperation | undefined>> {
        const operationEntities = await em.find($MikroORM.RoomOp, { room: { id: roomId }, prevRevision: { $gte: revisionRange.from } });
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
        const operationResult = await RoomDownOperation.create(sortedOperationEntities[0]);
        if (operationResult.isError) {
            return operationResult;
        }
        let operation = operationResult.value;

        let isFirst = false;
        for (const model of sortedOperationEntities) {
            if (isFirst) {
                isFirst = true;
                continue;
            }
            const second = await RoomDownOperation.create(model);
            if (second.isError) {
                return second;
            }
            const composed = operation.compose(second.value);
            if (composed.isError) {
                return composed;
            }
            operation = composed.value;
        }
        return ResultModule.ok(operation);
    }

    public get boards(): Board$Global.BoardsDownOperation {
        return this.params.boards;
    }

    public get characters(): Character$Global.CharactersDownOperation {
        return this.params.characters;
    }

    public get bgms() {
        return this.params.bgms;
    }

    public get paramNames() {
        return this.params.paramNames;
    }

    public get valueProps(): Readonly<RoomDownOperationType> {
        return this.params.valueProps;
    }

    private compose(second: RoomDownOperation): Result<RoomDownOperation> {
        const boards = this.params.boards.compose(second.params.boards);
        if (boards.isError) {
            return boards;
        }
        const characters = this.params.characters.compose(second.params.characters);
        if (characters.isError) {
            return characters;
        }
        const bgms = this.params.bgms.compose(second.params.bgms);
        if (bgms.isError) {
            return bgms;
        }
        const paramNames = this.params.paramNames.compose(second.params.paramNames);
        if (paramNames.isError) {
            return paramNames;
        }
        const valueProps: RoomDownOperationType = {
            name: ReplaceStringDownOperationModule.compose(this.valueProps.name, second.valueProps.name),
        };

        return ResultModule.ok(new RoomDownOperation({
            boards: boards.value,
            characters: characters.value,
            bgms: bgms.value,
            paramNames: paramNames.value,
            valueProps,
        }));
    }
}

export class RoomState {
    public constructor(private readonly params: {
        roomValue: RoomType;
        boards: Board$Global.BoardsState;
        characters: Character$Global.CharactersState;
        bgms: Bgm$Global.RoomBgmsState;
        paramNames: ParamName$Global.ParamNamesState;
    }) { }

    public static async create(entity: $MikroORM.Room): Promise<RoomState> {
        const roomValue: RoomType = {
            ...entity,
        };

        return new RoomState({
            roomValue,
            boards: Board$Global.BoardsState.create(await entity.boards.loadItems()),
            characters: await Character$Global.CharactersState.create(await entity.characters.loadItems()),
            bgms: Bgm$Global.RoomBgmsState.create(await entity.roomBgms.loadItems()),
            paramNames: ParamName$Global.ParamNamesState.create(await entity.paramNames.loadItems()),
        });
    }

    public static restore({ downOperation, nextState }: { downOperation?: RoomDownOperation; nextState: RoomState }): Result<RestoredRoom> {
        if (downOperation === undefined) {
            return ResultModule.ok(new RestoredRoom({ prevState: nextState, nextState }));
        }
        const prevRoomValueState = { ...nextState.roomValue };
        const twoWayOperationCore: MutableRoomTwoWayOperation = {
        };

        if (downOperation.valueProps.name !== undefined) {
            prevRoomValueState.name = downOperation.valueProps.name.oldValue;
            twoWayOperationCore.name = { ...downOperation.valueProps.name, newValue: nextState.roomValue.name };
        }

        const prevBoardsState = Board$Global.BoardsState.restore({ downOperation: downOperation.boards, nextState: nextState.boards });
        if (prevBoardsState.isError) {
            return prevBoardsState;
        }

        const prevCharactersState = Character$Global.CharactersState.restore({ downOperation: downOperation.characters, nextState: nextState.characters });
        if (prevCharactersState.isError) {
            return prevCharactersState;
        }

        const prevBgmsState = Bgm$Global.RoomBgmsState.restore({ downOperation: downOperation.bgms, nextState: nextState.bgms });
        if (prevBgmsState.isError) {
            return prevBgmsState;
        }

        const prevParamNamesState = ParamName$Global.ParamNamesState.restore({ downOperation: downOperation.paramNames, nextState: nextState.paramNames });
        if (prevParamNamesState.isError) {
            return prevParamNamesState;
        }

        return ResultModule.ok(new RestoredRoom({
            prevState: new RoomState({
                roomValue: prevRoomValueState,
                boards: prevBoardsState.value.prevState,
                characters: prevCharactersState.value.prevState,
                bgms: prevBgmsState.value.prevState,
                paramNames: prevParamNamesState.value.prevState,
            }),
            nextState,
            twoWayOperation: new RoomTwoWayOperation({
                valueProps: twoWayOperationCore,
                boards: prevBoardsState.value.twoWayOperation ?? Board$Global.BoardsTwoWayOperation.createEmpty(),
                characters: prevCharactersState.value.twoWayOperation ?? Character$Global.CharactersTwoWayOperation.createEmpty(),
                bgms: prevBgmsState.value.twoWayOperation ?? Bgm$Global.RoomBgmsTwoWayOperation.createEmpty(),
                paramNames: prevParamNamesState.value.twoWayOperation ?? ParamName$Global.ParamNamesTwoWayOperation.createEmpty(),
            })
        }));
    }

    public get boards(): Board$Global.BoardsState {
        return this.params.boards;
    }

    public get characters(): Character$Global.CharactersState {
        return this.params.characters;
    }

    public get bgms() {
        return this.params.bgms;
    }

    public get paramNames() {
        return this.params.paramNames;
    }

    public get roomValue(): Readonly<RoomType> {
        return this.params.roomValue;
    }

    public clone(): RoomState {
        return new RoomState({
            roomValue: { ...this.params.roomValue },
            boards: this.params.boards.clone(),
            characters: this.params.characters.clone(),
            bgms: this.params.bgms.clone(),
            paramNames: this.params.paramNames.clone(),
        });
    }

    public async toGraphQL({ revision, deliverTo }: { revision: number; deliverTo: string }): Promise<GraphQL.RoomGetState> {
        return {
            ...this.params.roomValue,
            revision,
            boards: this.params.boards.toGraphQL(),
            characters: this.params.characters.toGraphQL({ deliverTo }),
            bgms: this.params.bgms.toGraphQL(),
            paramNames: this.params.paramNames.toGraphQL(),
        };
    }
}

type RoomTwoWayOperationParameters = {
    valueProps: MutableRoomTwoWayOperation;
    boards: Board$Global.BoardsTwoWayOperation;
    characters: Character$Global.CharactersTwoWayOperation;
    bgms: Bgm$Global.RoomBgmsTwoWayOperation;
    paramNames: ParamName$Global.ParamNamesTwoWayOperation;
}

export class RoomTwoWayOperation {
    public constructor(private readonly params: RoomTwoWayOperationParameters) {

    }

    public get valueProps(): Readonly<MutableRoomTwoWayOperation> {
        return this.params.valueProps;
    }

    public get boards(): Board$Global.BoardsTwoWayOperation {
        return this.params.boards;
    }

    public get characters(): Character$Global.CharactersTwoWayOperation {
        return this.params.characters;
    }

    public get bgms() {
        return this.params.bgms;
    }

    public get paramNames() {
        return this.params.paramNames;
    }

    private toMikroORM(params: { prevRevision: number }): $MikroORM.RoomOp {
        const result = new $MikroORM.RoomOp(params);
        this.params.boards.setToMikroORM(result);
        this.params.characters.setToMikroORM(result);
        this.params.bgms.setToMikroORM(result);
        this.params.paramNames.setToMikroORM(result);
        if (this.valueProps.name !== undefined) {
            result.name = this.valueProps.name.oldValue;
        }
        return result;
    }

    private async apply(entity: $MikroORM.Room): Promise<void> {
        await this.boards.apply({ entity: entity.boards });
        await this.characters.apply({ entity: entity.characters });
        await this.bgms.apply({ entity: entity.roomBgms });
        await this.paramNames.apply({ entity: entity.paramNames });
        if (this.valueProps.name !== undefined) {
            entity.name = this.valueProps.name.newValue;
        }
    }

    public async applyAndCreateOperation(params: {
        em: EM;
        entity: $MikroORM.Room;
    }): Promise<GraphQLOperationGenerator> {
        const prevRevision = params.entity.roomRevision;
        const prevState = await RoomState.create(params.entity);
        await this.apply(params.entity);
        params.entity.roomRevision = prevRevision + 1;
        const operation = this.toMikroORM({ prevRevision });
        params.entity.roomOperations.add(operation);
        const nextState = await RoomState.create(params.entity);
        return new GraphQLOperationGenerator({ prevState, nextState, twoWayOperation: this, currentRevision: prevRevision + 1 });
    }
}

export class RestoredRoom {
    // Make sure these:
    // - apply(prevState, twoWayOperation.up) = nextState
    // - apply(nextState, twoWayOperation.down) = prevState
    public constructor(private readonly params: { prevState: RoomState; nextState: RoomState; twoWayOperation?: RoomTwoWayOperation }) { }

    // ユーザーが行おうとしているRoomOperationValueをtransformする。
    public transform({ clientOperation, operatedBy }: { clientOperation: GraphQL.RoomOperationValue; operatedBy: string }): Result<RoomTwoWayOperation | undefined> {
        const boards = new Board$Global.RestoredBoards({
            prevState: this.params.prevState.boards,
            nextState: this.params.nextState.boards,
            twoWayOperation: this.params.twoWayOperation?.boards,
        });
        const transformedBoards = boards.transform({ clientOperation: clientOperation.boards });
        if (transformedBoards.isError) {
            return transformedBoards;
        }

        const characters = new Character$Global.RestoredCharacters({
            prevState: this.params.prevState.characters,
            nextState: this.params.nextState.characters,
            twoWayOperation: this.params.twoWayOperation?.characters,
        });
        const transformedCharacters = characters.transform({ clientOperation: clientOperation.characters, operatedBy });
        if (transformedCharacters.isError) {
            return transformedCharacters;
        }

        const bgms = new Bgm$Global.RestoredRoomBgms({
            prevState: this.params.prevState.bgms,
            nextState: this.params.nextState.bgms,
            twoWayOperation: this.params.twoWayOperation?.bgms,
        });
        const transformedBgms = bgms.transform({ clientOperation: clientOperation.bgms });
        if (transformedBgms.isError) {
            return transformedBgms;
        }

        const paramNames = new ParamName$Global.RestoredParamNames({
            prevState: this.params.prevState.paramNames,
            nextState: this.params.nextState.paramNames,
            twoWayOperation: this.params.twoWayOperation?.paramNames,
        });
        const transformedParamNames = paramNames.transform({ clientOperation: clientOperation.paramNames });
        if (transformedParamNames.isError) {
            return transformedParamNames;
        }

        const twoWayOperationCore: MutableRoomTwoWayOperation = {};

        twoWayOperationCore.name = ReplaceStringTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.name,
            second: clientOperation.name,
            prevState: this.params.prevState.roomValue.name
        });

        if (undefinedForAll(twoWayOperationCore) && transformedBoards.value.isId && transformedCharacters.value.isId && transformedBgms.value.isId && transformedParamNames.value.isId) {
            return ResultModule.ok(undefined);
        }

        return ResultModule.ok(new RoomTwoWayOperation({
            valueProps: twoWayOperationCore,
            boards: transformedBoards.value,
            characters: transformedCharacters.value,
            bgms: transformedBgms.value,
            paramNames: transformedParamNames.value,
        }));
    }

    public get prevState(): RoomState {
        return this.params.prevState;
    }

    public get nextState(): RoomState {
        return this.params.nextState;
    }
}

export class GraphQLOperationGenerator {
    // Make sure these:
    // - apply(prevState, twoWayOperation.up) = nextState
    // - apply(nextState, twoWayOperation.down) = prevState
    public constructor(private readonly params: { prevState: RoomState; nextState: RoomState; twoWayOperation: RoomTwoWayOperation; currentRevision: number }) { }

    public get currentRevision(): number {
        return this.params.currentRevision;
    }

    public toGraphQLOperation(params: { operatedBy: string; deliverTo: string; nextRevision: number }): GraphQL.RoomOperation {
        const boards = Board$Global.toGraphQLOperation({
            prevState: this.params.prevState.boards,
            nextState: this.params.nextState.boards,
            twoWayOperation: this.params.twoWayOperation.boards,
        });
        const characters = Character$Global.toGraphQLOperation({
            prevState: this.params.prevState.characters,
            nextState: this.params.nextState.characters,
            twoWayOperation: this.params.twoWayOperation.characters,
            createdByMe: params.operatedBy === params.deliverTo,
        });
        const bgms = Bgm$Global.toGraphQLOperation({
            prevState: this.params.prevState.bgms,
            nextState: this.params.nextState.bgms,
            twoWayOperation: this.params.twoWayOperation.bgms,
        });
        const paramNames = ParamName$Global.toGraphQLOperation({
            prevState: this.params.prevState.paramNames,
            nextState: this.params.nextState.paramNames,
            twoWayOperation: this.params.twoWayOperation.paramNames,
        });
        const operationValue: GraphQL.RoomOperationValue = {
            boards,
            characters,
            bgms,
            paramNames,
        };

        operationValue.name = this.params.twoWayOperation.valueProps.name;

        return {
            __tstype: GraphQL.roomOperation,
            revisionTo: params.nextRevision,
            operatedBy: params.operatedBy,
            value: operationValue
        };
    }
}