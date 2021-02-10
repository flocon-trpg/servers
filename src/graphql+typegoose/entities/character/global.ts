import { Result, ResultModule } from '../../../@shared/Result';
import { ReplaceBooleanDownOperation, ReplaceBooleanDownOperationModule, ReplaceBooleanTwoWayOperation, ReplaceBooleanTwoWayOperationModule, ReplaceNullableFilePathDownOperation, ReplaceNullableFilePathDownOperationModule, ReplaceNullableFilePathTwoWayOperation, ReplaceNullableFilePathTwoWayOperationModule, ReplaceStringDownOperation, ReplaceStringDownOperationModule, ReplaceStringTwoWayOperation, ReplaceStringTwoWayOperationModule } from '../../Operations';
import * as GraphQL from './graphql';
import * as $MikroORM from './mikro-orm';
import * as DualKeyMapOperations from '../../dualKeyMapOperations';
import * as MapOperations from '../../mapOperations';
import * as ParamMapOperations from '../../paramMapOperations';
import { undefinedForAll } from '../../../utils/helpers';
import { Collection, Reference } from '@mikro-orm/core';
import { Room, RoomOp } from '../room/mikro-orm';
import { PieceLocationsDownOperation, PieceLocationsTwoWayOperation, PieceLocationsState, RestoredPieceLocations } from './pieceLocation/global';
import * as BoolParam$Global from './boolParam/global';
import * as NumParam$Global from './numParam/global';
import * as StrParam$Global from './strParam/global';
import * as PieceLocation$Global from './pieceLocation/global';
import { PieceLocationsOperation } from './pieceLocation/graphql';
import { FilePath } from '../filePath/global';
import { CompositeKey, createStateMap, ReadonlyStateMap } from '../../../@shared/StateMap';
import { DualKeyMap, DualKeyMapSource } from '../../../@shared/DualKeyMap';
import { BoolParamsDownOperation, BoolParamsState, BoolParamsTwoWayOperation, RestoredBoolParams } from './boolParam/global';
import { BoolParamsOperation } from './boolParam/graphql';
import { NumParamsDownOperation, NumParamsState, NumParamsTwoWayOperation, RestoredNumParams } from './numParam/global';
import { RestoredStrParams, StrParamsDownOperation, StrParamsState, StrParamsTwoWayOperation } from './strParam/global';
import { NumParamsOperation } from './numParam/graphql';
import { StrParamsOperation } from './strParam/graphql';
import { BoolParam } from './boolParam/mikro-orm';
import { NumMaxParam, NumParam } from './numParam/mikro-orm';
import { StrParam } from './strParam/mikro-orm';

type CharacterStateType = {
    isPrivate: boolean;
    name: string;
    image?: FilePath;
}

type CharacterDownOperationType = {
    isPrivate?: ReplaceBooleanDownOperation;
    name?: ReplaceStringDownOperation;
    image?: ReplaceNullableFilePathDownOperation;
}

type CharacterTwoWayOperationType = {
    isPrivate?: ReplaceBooleanTwoWayOperation;
    name?: ReplaceStringTwoWayOperation;
    image?: ReplaceNullableFilePathTwoWayOperation;
}

class CharacterState {
    private constructor(private readonly params: {
        object: CharacterStateType;
        boolParams: BoolParamsState;
        numParams: NumParamsState;
        numMaxParams: NumParamsState;
        strParams: StrParamsState;
        pieceLocations: PieceLocationsState;
    }) {

    }

    public static createFromGraphQL(state: GraphQL.CharacterValueState) {
        const result = new CharacterState({
            object: state,
            boolParams: BoolParamsState.createFromGraphQL(state.boolParams),
            numParams: NumParamsState.createFromGraphQL(state.numParams),
            numMaxParams: NumParamsState.createFromGraphQL(state.numMaxParams),
            strParams: StrParamsState.createFromGraphQL(state.strParams),
            pieceLocations: PieceLocationsState.createFromGraphQL(state.pieceLocations)
        });
        return result.clone();
    }

    public static async createFromMikroORM(entity: $MikroORM.Chara | $MikroORM.RemoveCharaOp) {
        const image: FilePath | undefined = (() => {
            if (entity.imagePath != null && entity.imageSourceType != null) {
                return { path: entity.imagePath, sourceType: entity.imageSourceType };
            }
            return undefined;
        })();


        let boolParams: BoolParamsState;
        let numParams: NumParamsState;
        let numMaxParams: NumParamsState;
        let strParams: StrParamsState;
        let pieceLocations: PieceLocationsState;
        if (entity instanceof $MikroORM.Chara) {
            boolParams = BoolParamsState.createFromMikroORM(await entity.boolParams.loadItems());
            numParams = NumParamsState.createFromMikroORM(await entity.numParams.loadItems());
            numMaxParams = NumParamsState.createFromMikroORM(await entity.numMaxParams.loadItems());
            strParams = StrParamsState.createFromMikroORM(await entity.strParams.loadItems());
            pieceLocations = PieceLocationsState.createFromMikroORM(await entity.pieceLocs.loadItems());
        } else if (entity instanceof $MikroORM.RemoveCharaOp) {
            boolParams = BoolParamsState.createFromMikroORM(await entity.removedBoolParam.loadItems());
            numParams = NumParamsState.createFromMikroORM(await entity.removedNumParam.loadItems());
            numMaxParams = NumParamsState.createFromMikroORM(await entity.removedNumMaxParam.loadItems());
            strParams = StrParamsState.createFromMikroORM(await entity.removedStrParam.loadItems());
            pieceLocations = PieceLocationsState.createFromMikroORM(await entity.removedPieceLoc.loadItems());
        } else {
            throw 'not Chara instance';
        }

        const object: CharacterStateType = {
            ...entity,
            image,
        };
        return new CharacterState({
            object,
            boolParams,
            numParams,
            numMaxParams,
            strParams,
            pieceLocations
        });
    }

    public static restore({ downOperation, nextState }: { downOperation?: CharacterDownOperation; nextState: CharacterState }): Result<RestoredCharacter> {
        if (downOperation === undefined) {
            return ResultModule.ok(new RestoredCharacter({ prevState: nextState, nextState }));
        }
        const prevState = nextState.clone();
        const twoWayOperationCore: CharacterTwoWayOperationType = {};

        const boolParamsState = BoolParamsState.restore({ downOperation: downOperation.boolParams, nextState: nextState.boolParams });
        if (boolParamsState.isError) {
            return boolParamsState;
        }

        const numParamsState = NumParamsState.restore({ downOperation: downOperation.numParams, nextState: nextState.numParams });
        if (numParamsState.isError) {
            return numParamsState;
        }

        const numMaxParamsState = NumParamsState.restore({ downOperation: downOperation.numMaxParams, nextState: nextState.numMaxParams });
        if (numMaxParamsState.isError) {
            return numMaxParamsState;
        }

        const strParamsState = StrParamsState.restore({ downOperation: downOperation.strParams, nextState: nextState.strParams });
        if (strParamsState.isError) {
            return strParamsState;
        }

        const pieceLocations = PieceLocationsState.restore({ downOperation: downOperation.pieceLocations, nextState: nextState.pieceLocations });
        if (pieceLocations.isError) {
            return pieceLocations;
        }

        if (downOperation.valueProps.isPrivate !== undefined) {
            prevState.params.object.isPrivate = downOperation.valueProps.isPrivate.oldValue;
            twoWayOperationCore.isPrivate = { ...downOperation.valueProps.isPrivate, newValue: nextState.object.isPrivate };
        }

        if (downOperation.valueProps.name !== undefined) {
            prevState.params.object.name = downOperation.valueProps.name.oldValue;
            twoWayOperationCore.name = { ...downOperation.valueProps.name, newValue: nextState.object.name };
        }

        if (downOperation.valueProps.image !== undefined) {
            prevState.params.object.image = downOperation.valueProps.image.oldValue ?? undefined;
            twoWayOperationCore.image = { oldValue: downOperation.valueProps.image.oldValue ?? undefined, newValue: nextState.object.image };
        }

        const twoWayOperation = new CharacterTwoWayOperation({
            valueProps: twoWayOperationCore,
            boolParams: boolParamsState.value.twoWayOperation ?? BoolParamsTwoWayOperation.createEmpty(),
            numParams: numParamsState.value.twoWayOperation ?? NumParamsTwoWayOperation.createEmpty(),
            numMaxParams: numMaxParamsState.value.twoWayOperation ?? NumParamsTwoWayOperation.createEmpty(),
            strParams: strParamsState.value.twoWayOperation ?? StrParamsTwoWayOperation.createEmpty(),
            pieceLocations: pieceLocations.value.twoWayOperation ?? PieceLocationsTwoWayOperation.createEmpty()
        });
        return ResultModule.ok(new RestoredCharacter({ prevState, nextState, twoWayOperation }));
    }

    public get object(): Readonly<CharacterStateType> {
        return this.params.object;
    }

    public get boolParams() {
        return this.params.boolParams;
    }

    public get numParams() {
        return this.params.numParams;
    }

    public get numMaxParams() {
        return this.params.numMaxParams;
    }

    public get strParams() {
        return this.params.strParams;
    }

    public get pieceLocations(): PieceLocationsState {
        return this.params.pieceLocations;
    }

    public clone(): CharacterState {
        return new CharacterState({
            object: { ...this.object },
            boolParams: this.boolParams.clone(),
            numParams: this.numParams.clone(),
            numMaxParams: this.numMaxParams.clone(),
            strParams: this.strParams.clone(),
            pieceLocations: this.pieceLocations.clone(),
        });
    }

    public applyBack(operation: CharacterDownOperation): CharacterState {
        const result = new CharacterState({
            object: { ...this.object },
            boolParams: this.boolParams.applyBack(operation.boolParams),
            numParams: this.numParams.applyBack(operation.numParams),
            numMaxParams: this.numMaxParams.applyBack(operation.numMaxParams),
            strParams: this.strParams.applyBack(operation.strParams),
            pieceLocations: this.pieceLocations.applyBack(operation.pieceLocations),
        });

        if (operation.valueProps.isPrivate !== undefined) {
            result.params.object.isPrivate = operation.valueProps.isPrivate.oldValue;
        }
        if (operation.valueProps.name !== undefined) {
            result.params.object.name = operation.valueProps.name.oldValue;
        }
        if (operation.valueProps.image !== undefined) {
            result.params.object.image = operation.valueProps.image.oldValue ?? undefined;
        }

        return result;
    }

    private setToCharacterBase({
        characterBase,
    }: {
        characterBase: $MikroORM.CharaBase;
    }) {
        characterBase.imagePath = this.params.object.image?.path;
        characterBase.imageSourceType = this.params.object.image?.sourceType;
    }

    public toMikroORMCharacter({
        createdBy,
        stateId,
    }: {
        createdBy: string;
        stateId: string;
    }): $MikroORM.Chara {
        const result = new $MikroORM.Chara({ ...this.params.object, createdBy, stateId });
        this.setToCharacterBase({ characterBase: result });
        for (const [key, value] of this.pieceLocations.readonlyStateMap) {
            result.pieceLocs.add(value.toMikroORMPieceLocation({ boardId: key.id, boardCreatedBy: key.createdBy }));
        }
        return result;
    }

    public toMikroORMRemoveCharacterOperation({
        createdBy,
        stateId,
    }: {
        createdBy: string;
        stateId: string;
    }): $MikroORM.RemoveCharaOp {
        const result = new $MikroORM.RemoveCharaOp({ ...this.params.object, createdBy, stateId });
        this.setToCharacterBase({ characterBase: result });
        for (const [key, value] of this.pieceLocations.readonlyStateMap) {
            result.removedPieceLoc.add(value.toMikroORMRemovedPieceLocation({ boardId: key.id, boardCreatedBy: key.createdBy }));
        }
        return result;
    }

    public toGraphQL({ id, createdBy, createdByMe }: { id: string; createdBy: string; createdByMe: boolean }): GraphQL.CharacterState | undefined {
        if (!createdByMe && this.object.isPrivate) {
            return undefined;
        }

        return {
            createdBy,
            id,
            value: {
                ...this.object,
                boolParams: this.params.boolParams.toGraphQL({ createdByMe }),
                numParams: this.params.numParams.toGraphQL({ createdByMe }),
                numMaxParams: this.params.numMaxParams.toGraphQL({ createdByMe }),
                strParams: this.params.strParams.toGraphQL({ createdByMe }),
                pieceLocations: this.params.pieceLocations.toGraphQL({ createdByMe }),
            },
        };
    }
}

export class CharactersState {
    public constructor(private readonly _readonlyStateMap: ReadonlyStateMap<CharacterState>) { }

    public static async create(source: ($MikroORM.Chara | $MikroORM.RemoveCharaOp)[]): Promise<CharactersState> {
        const core = createStateMap<CharacterState>();
        for (const character of source) {
            core.set({ createdBy: character.createdBy, id: character.stateId }, await CharacterState.createFromMikroORM(character));
        }
        return new CharactersState(core);
    }

    public static restore({ downOperation, nextState }: { downOperation?: CharactersDownOperation; nextState: CharactersState }): Result<RestoredCharacters> {
        if (downOperation === undefined) {
            return ResultModule.ok(new RestoredCharacters({ prevState: nextState, nextState }));
        }
        const restored = DualKeyMapOperations.restore({
            nextState: nextState.readonlyStateMap.dualKeyMap,
            downOperation: downOperation.readonlyStateMap,
            innerRestore: params => {
                const restored = CharacterState.restore(params);
                if (restored.isError) {
                    return restored;
                }
                return ResultModule.ok({ prevState: restored.value.prevState, twoWayOperation: restored.value.twoWayOperation });
            }
        });
        if (restored.isError) {
            return restored;
        }
        return ResultModule.ok(new RestoredCharacters({
            prevState: new CharactersState(createStateMap(restored.value.prevState)),
            nextState: nextState,
            twoWayOperation: new CharactersTwoWayOperation(restored.value.twoWayOperation),
        }));
    }

    public get readonlyStateMap(): ReadonlyStateMap<CharacterState> {
        return this._readonlyStateMap;
    }

    public clone(): CharactersState {
        return new CharactersState(this.readonlyStateMap.clone());
    }

    public toGraphQL({ deliverTo }: { deliverTo: string }): GraphQL.CharacterState[] {
        return [...this._readonlyStateMap].flatMap(([key, state]) => {
            const result = state.toGraphQL({ id: key.id, createdBy: key.createdBy, createdByMe: key.createdBy === deliverTo });
            return result === undefined ? [] : [result];
        });
    }
}

class CharacterDownOperation {
    private constructor(private readonly params: {
        object: CharacterDownOperationType;
        boolParams: BoolParamsDownOperation;
        numParams: NumParamsDownOperation;
        numMaxParams: NumParamsDownOperation;
        strParams: StrParamsDownOperation;
        pieceLocations: PieceLocationsDownOperation;
    }) { }

    public static async create(entity: $MikroORM.UpdateCharaOp): Promise<Result<CharacterDownOperation>> {
        const object: CharacterDownOperationType = {};

        const boolParams = await BoolParamsDownOperation.create({
            update: entity.updateBoolParamOps
        });
        if (boolParams.isError) {
            return boolParams;
        }

        const numParams = await NumParamsDownOperation.create({
            update: entity.updateNumParamOps
        });
        if (numParams.isError) {
            return numParams;
        }

        const numMaxParams = await NumParamsDownOperation.create({
            update: entity.updateNumMaxParamOps
        });
        if (numMaxParams.isError) {
            return numMaxParams;
        }

        const strParams = await StrParamsDownOperation.create({
            update: entity.updateStrParamOps
        });
        if (strParams.isError) {
            return strParams;
        }

        const pieceLocations = await PieceLocationsDownOperation.create({
            add: entity.addPieceLocOps,
            remove: entity.removePieceLocOps,
            update: entity.updatePieceLocOps
        });
        if (pieceLocations.isError) {
            return pieceLocations;
        }

        object.image = ReplaceNullableFilePathDownOperationModule.validate(entity.image);

        object.isPrivate = entity.isPrivate === undefined ? undefined : { oldValue: entity.isPrivate };
        object.name = entity.name === undefined ? undefined : { oldValue: entity.name };

        return ResultModule.ok(new CharacterDownOperation({
            object,
            boolParams: boolParams.value,
            numParams: numParams.value,
            numMaxParams: numMaxParams.value,
            strParams: strParams.value,
            pieceLocations: pieceLocations.value,
        }));
    }

    public get valueProps(): Readonly<CharacterDownOperationType> {
        return this.params.object;
    }

    public get boolParams() {
        return this.params.boolParams;
    }

    public get numParams() {
        return this.params.numParams;
    }

    public get numMaxParams() {
        return this.params.numMaxParams;
    }

    public get strParams() {
        return this.params.strParams;
    }

    public get pieceLocations(): PieceLocationsDownOperation {
        return this.params.pieceLocations;
    }

    public compose(second: CharacterDownOperation): Result<CharacterDownOperation> {
        const boolParams = this.params.boolParams.compose(second.params.boolParams);
        if (boolParams.isError) {
            return boolParams;
        }

        const numParams = this.params.numParams.compose(second.params.numParams);
        if (numParams.isError) {
            return numParams;
        }

        const numMaxParams = this.params.numMaxParams.compose(second.params.numMaxParams);
        if (numMaxParams.isError) {
            return numMaxParams;
        }

        const strParams = this.params.strParams.compose(second.params.strParams);
        if (strParams.isError) {
            return strParams;
        }

        const pieceLocations = this.params.pieceLocations.compose(second.params.pieceLocations);
        if (pieceLocations.isError) {
            return pieceLocations;
        }

        const valueProps: CharacterDownOperationType = {
            image: ReplaceNullableFilePathDownOperationModule.compose(this.valueProps.image, second.valueProps.image),
            isPrivate: ReplaceBooleanDownOperationModule.compose(this.valueProps.isPrivate, second.valueProps.isPrivate),
            name: ReplaceStringDownOperationModule.compose(this.valueProps.name, second.valueProps.name),
        };

        return ResultModule.ok(new CharacterDownOperation({
            object: valueProps,
            boolParams: boolParams.value,
            numParams: numParams.value,
            numMaxParams: numMaxParams.value,
            strParams: strParams.value,
            pieceLocations: pieceLocations.value,
        }));
    }
}

export class CharactersDownOperation {
    private constructor(private readonly core: DualKeyMapOperations.DualKeyMapDownOperation<string, string, CharacterState, CharacterDownOperation>) { }

    public static async create({
        add,
        remove,
        update
    }: {
        add: Collection<$MikroORM.AddCharaOp>;
        remove: Collection<$MikroORM.RemoveCharaOp>;
        update: Collection<$MikroORM.UpdateCharaOp>;
    }): Promise<Result<CharactersDownOperation>> {
        const downOperation = await DualKeyMapOperations.createDownOperationFromMikroORM({
            toDualKey: state => ResultModule.ok({ first: state.createdBy, second: state.stateId }),
            add,
            remove,
            update,
            getState: async state => {
                const result = await CharacterState.createFromMikroORM(state);
                return ResultModule.ok(result);
            },
            getOperation: async operation => {
                return CharacterDownOperation.create(operation);
            },
        });
        if (downOperation.isError) {
            return downOperation;
        }
        return ResultModule.ok(new CharactersDownOperation(downOperation.value));
    }

    public compose(second: CharactersDownOperation): Result<CharactersDownOperation> {
        const composed = DualKeyMapOperations.composeDownOperation({
            first: this.core,
            second: second.core,
            innerApplyBack: ({ downOperation, nextState }) => {
                return ResultModule.ok(nextState.applyBack(downOperation));
            },
            innerCompose: ({ first, second }) => first.compose(second),
        });
        if (composed.isError) {
            return composed;
        }
        return ResultModule.ok(new CharactersDownOperation(composed.value));
    }

    public get readonlyStateMap(): DualKeyMapOperations.ReadonlyDualKeyMapDownOperation<string, string, CharacterState, CharacterDownOperation> {
        return this.core;
    }
}

class CharacterTwoWayOperation {
    public constructor(private readonly params: {
        valueProps: CharacterTwoWayOperationType;
        boolParams: BoolParamsTwoWayOperation;
        numParams: NumParamsTwoWayOperation;
        numMaxParams: NumParamsTwoWayOperation;
        strParams: StrParamsTwoWayOperation;
        pieceLocations: PieceLocationsTwoWayOperation;
    }) {

    }

    public get valueProps(): Readonly<CharacterTwoWayOperationType> {
        return this.params.valueProps;
    }

    public async apply(entity: $MikroORM.Chara) {
        await ParamMapOperations.apply({
            toKey: state => state.key,
            state: entity.boolParams,
            operation: this.params.boolParams.readonlyMapAsStringKey,
            create: async ({ key, operation }) => {
                const result = new BoolParam({
                    key,
                    isValuePrivate: false,
                });
                operation.apply(result);
                return result;
            },
            update: async ({ state, operation }) => {
                operation.apply(state);
            },
        });

        await ParamMapOperations.apply({
            toKey: state => state.key,
            state: entity.numParams,
            operation: this.params.numParams.readonlyMapAsStringKey,
            create: async ({ key, operation }) => {
                const result = new NumParam({
                    key,
                    isValuePrivate: false,
                });
                operation.apply(result);
                return result;
            },
            update: async ({ state, operation }) => {
                operation.apply(state);
            },
        });

        await ParamMapOperations.apply({
            toKey: state => state.key,
            state: entity.numMaxParams,
            operation: this.params.numMaxParams.readonlyMapAsStringKey,
            create: async ({ key, operation }) => {
                const result = new NumMaxParam({
                    key,
                    isValuePrivate: false,
                });
                operation.apply(result);
                return result;
            },
            update: async ({ state, operation }) => {
                operation.apply(state);
            },
        });

        await ParamMapOperations.apply({
            toKey: state => state.key,
            state: entity.strParams,
            operation: this.params.strParams.readonlyMapAsStringKey,
            create: async ({ key, operation }) => {
                const result = new StrParam({
                    key,
                    isValuePrivate: false,
                    value: '',
                });
                operation.apply(result);
                return result;
            },
            update: async ({ state, operation }) => {
                operation.apply(state);
            },
        });

        await DualKeyMapOperations.apply({
            toDualKey: state => ({ first: state.boardCreatedBy, second: state.boardId }),
            state: entity.pieceLocs,
            operation: this.params.pieceLocations.readonlyStateMap.dualKeyMap,
            create: async ({ key, state }) => {
                return state.toMikroORMPieceLocation({ boardCreatedBy: key.first, boardId: key.second });
            },
            update: async ({ state, operation }) => {
                operation.apply(state);
            },
            delete: async () => true,
        });

        if (this.params.valueProps.image !== undefined) {
            entity.imagePath = this.params.valueProps.image.newValue?.path;
            entity.imageSourceType = this.params.valueProps.image.newValue?.sourceType;
        }

        if (this.params.valueProps.isPrivate !== undefined) {
            entity.isPrivate = this.params.valueProps.isPrivate.newValue;
        }
        if (this.params.valueProps.name !== undefined) {
            entity.name = this.params.valueProps.name.newValue;
        }
    }

    public toMikroORM({
        createdBy,
        stateId,
    }: {
        createdBy: string;
        stateId: string;
    }): $MikroORM.UpdateCharaOp {
        const result = new $MikroORM.UpdateCharaOp({ createdBy, stateId });

        this.boolParams.setToMikroORM(result);
        this.numParams.setToMikroORM(result);
        this.numMaxParams.setMaxValueToMikroORM(result);
        this.strParams.setToMikroORM(result);
        this.pieceLocations.setToMikroORM(result);

        if (this.valueProps.image !== undefined) {
            result.image = this.valueProps.image;
        }
        if (this.valueProps.isPrivate !== undefined) {
            result.isPrivate = this.valueProps.isPrivate.oldValue;
        }
        if (this.valueProps.name !== undefined) {
            result.name = this.valueProps.name.oldValue;
        }

        return result;
    }

    public get boolParams() {
        return this.params.boolParams;
    }

    public get numParams() {
        return this.params.numParams;
    }

    public get numMaxParams() {
        return this.params.numMaxParams;
    }

    public get strParams() {
        return this.params.strParams;
    }

    public get pieceLocations(): PieceLocationsTwoWayOperation {
        return this.params.pieceLocations;
    }

    public toGraphQL({
        boolParams,
        numParams,
        numMaxParams,
        strParams,
        pieceLocations,
    }: {
        boolParams: BoolParamsOperation;
        numParams: NumParamsOperation;
        numMaxParams: NumParamsOperation;
        strParams: StrParamsOperation;
        pieceLocations: PieceLocationsOperation;
    }): GraphQL.CharacterOperation {
        const result: GraphQL.CharacterOperation = {
            ...this.valueProps,
            boolParams,
            numParams,
            numMaxParams,
            strParams,
            pieceLocations,
        };
        return result;
    }
}

export class CharactersTwoWayOperation {
    public constructor(private readonly operations: DualKeyMapOperations.ReadonlyDualKeyMapTwoWayOperation<string, string, CharacterState, CharacterTwoWayOperation>) {

    }

    public static createEmpty(): CharactersTwoWayOperation {
        return new CharactersTwoWayOperation(new DualKeyMap());
    }

    public get readonlyStateMap(): DualKeyMapOperations.ReadonlyDualKeyMapTwoWayOperation<string, string, CharacterState, CharacterTwoWayOperation> {
        return this.operations;
    }

    public get isId(): boolean {
        return this.readonlyStateMap.isEmpty;
    }

    public setToMikroORM(entity: RoomOp): void {
        this.readonlyStateMap.forEach((operation, key) => {
            if (operation.type === DualKeyMapOperations.update) {
                const updateOperation = operation.operation.toMikroORM({
                    createdBy: key.first,
                    stateId: key.second,
                });
                entity.updateCharacterOps.add(updateOperation);
                return;
            }
            if (operation.operation.oldValue === undefined) {
                const element = new $MikroORM.AddCharaOp({ createdBy: key.first, stateId: key.second });
                entity.addCharacterOps.add(element);
                return;
            }

            const removeOperation = operation.operation.oldValue.toMikroORMRemoveCharacterOperation({
                createdBy: key.first,
                stateId: key.second,
            });
            entity.removeCharacterOps.add(removeOperation);
        });
    }

    public async apply({
        entity,
    }: {
        entity: Collection<$MikroORM.Chara>;
    }): Promise<void> {
        await DualKeyMapOperations.apply({
            toDualKey: state => ({ first: state.createdBy, second: state.stateId }),
            state: entity,
            operation: this.readonlyStateMap,
            create: async params => {
                return params.state.toMikroORMCharacter({ createdBy: params.key.first, stateId: params.key.second });
            },
            update: async params => {
                params.operation.apply(params.state);
            },
            delete: async () => true,
        });
    }

    public toJSON(): string {
        return JSON.stringify(this.operations);
    }
}

class RestoredCharacter {
    // Make sure these:
    // - apply(prevState, twoWayOperation.up) = nextState
    // - apply(nextState, twoWayOperation.down) = prevState
    public constructor(private readonly params: { prevState: CharacterState; nextState: CharacterState; twoWayOperation?: CharacterTwoWayOperation }) { }

    public transform({ clientOperation, createdByMe }: { clientOperation: GraphQL.CharacterOperation; createdByMe: boolean }): Result<CharacterTwoWayOperation | undefined> {
        if (this.params.nextState.object.isPrivate && !createdByMe) {
            return ResultModule.ok(undefined);
        }

        const twoWayOperationCore: CharacterTwoWayOperationType = {};

        const boolParams = new RestoredBoolParams({
            prevState: this.prevState.boolParams,
            nextState: this.nextState.boolParams,
            twoWayOperation: this.twoWayOperation?.boolParams
        }).transform({ clientOperation: clientOperation.boolParams, createdByMe });
        if (boolParams.isError) {
            return boolParams;
        }

        const numParams = new RestoredNumParams({
            prevState: this.prevState.numParams,
            nextState: this.nextState.numParams,
            twoWayOperation: this.twoWayOperation?.numParams
        }).transform({ clientOperation: clientOperation.numParams, createdByMe });
        if (numParams.isError) {
            return numParams;
        }

        const numMaxParams = new RestoredNumParams({
            prevState: this.prevState.numMaxParams,
            nextState: this.nextState.numMaxParams,
            twoWayOperation: this.twoWayOperation?.numMaxParams
        }).transform({ clientOperation: clientOperation.numMaxParams, createdByMe });
        if (numMaxParams.isError) {
            return numMaxParams;
        }

        const strParams = new RestoredStrParams({
            prevState: this.prevState.strParams,
            nextState: this.nextState.strParams,
            twoWayOperation: this.twoWayOperation?.strParams
        }).transform({ clientOperation: clientOperation.strParams, createdByMe });
        if (strParams.isError) {
            return strParams;
        }

        const pieceLocations = new RestoredPieceLocations({
            prevState: this.prevState.pieceLocations,
            nextState: this.nextState.pieceLocations,
            twoWayOperation: this.twoWayOperation?.pieceLocations
        }).transform({ clientOperation: clientOperation.pieceLocations, createdByMe });
        if (pieceLocations.isError) {
            return pieceLocations;
        }

        twoWayOperationCore.image = ReplaceNullableFilePathTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.image,
            second: clientOperation.image === undefined ? undefined : { newValue: clientOperation.image.newValue },
            prevState: this.params.prevState.object.image,
        });

        twoWayOperationCore.isPrivate = ReplaceBooleanTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.isPrivate,
            second: clientOperation.isPrivate,
            prevState: this.params.prevState.object.isPrivate,
        });
        twoWayOperationCore.name = ReplaceStringTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.name,
            second: clientOperation.name,
            prevState: this.params.prevState.object.name,
        });

        if (undefinedForAll(twoWayOperationCore)
            && pieceLocations.value.isId
            && boolParams.value.isId
            && numParams.value.isId
            && numMaxParams.value.isId
            && strParams.value.isId) {
            return ResultModule.ok(undefined);
        }

        return ResultModule.ok(new CharacterTwoWayOperation({
            valueProps: twoWayOperationCore,
            boolParams: boolParams.value,
            strParams: strParams.value,
            numParams: numParams.value,
            numMaxParams: numMaxParams.value,
            pieceLocations: pieceLocations.value
        }));
    }

    public get prevState(): CharacterState {
        return this.params.prevState;
    }

    public get nextState(): CharacterState {
        return this.params.nextState;
    }

    public get twoWayOperation(): CharacterTwoWayOperation | undefined {
        return this.params.twoWayOperation;
    }
}

export class RestoredCharacters {
    // Make sure these:
    // - apply(prevState, twoWayOperation.up) = nextState
    // - apply(nextState, twoWayOperation.down) = prevState
    public constructor(private readonly params: { prevState: CharactersState; nextState: CharactersState; twoWayOperation?: CharactersTwoWayOperation }) { }

    public transform({ clientOperation, operatedBy }: { clientOperation: GraphQL.CharactersOperation; operatedBy: string }): Result<CharactersTwoWayOperation> {
        const second = DualKeyMapOperations.createUpOperationFromGraphQL({
            replace: clientOperation.replace,
            update: clientOperation.update,
            getState: x => x.newValue,
            getOperation: x => x.operation,
            createDualKey: x => ResultModule.ok({ first: x.createdBy, second: x.id })
        });
        if (second.isError) {
            return second;
        }
        const transformed = DualKeyMapOperations.transform({
            first: this.params.twoWayOperation?.readonlyStateMap,
            second: second.value,
            prevState: this.params.prevState.readonlyStateMap.dualKeyMap,
            nextState: this.params.nextState.readonlyStateMap.dualKeyMap,
            innerTransform: params => {
                const restored = new RestoredCharacter({ ...params, twoWayOperation: params.first });
                return restored.transform({ clientOperation: params.second, createdByMe: operatedBy === params.key.first });
            },
            toServerState: clientState => {
                return CharacterState.createFromGraphQL(clientState);
            },
            protectedValuePolicy: {
                cancelRemove: ({ key, nextState }) => nextState.object.isPrivate && operatedBy !== key.first
            }
        });

        if (transformed.isError) {
            return transformed;
        }
        return ResultModule.ok(new CharactersTwoWayOperation(transformed.value));
    }

    public get prevState(): CharactersState {
        return this.params.prevState;
    }

    public get nextState(): CharactersState {
        return this.params.nextState;
    }

    public get twoWayOperation(): CharactersTwoWayOperation | undefined {
        return this.params.twoWayOperation;
    }
}

// Make sure these:
// - apply(prevState, twoWayOperation.up) = nextState
// - apply(nextState, twoWayOperation.down) = prevState
export const toGraphQLOperation = (params: {
    prevState: CharactersState;
    nextState: CharactersState;
    twoWayOperation: CharactersTwoWayOperation;
    createdByMe: boolean;
}): GraphQL.CharactersOperation => {

    return DualKeyMapOperations.toGraphQLWithState({
        source: params.twoWayOperation.readonlyStateMap,
        prevState: params.prevState.readonlyStateMap.dualKeyMap,
        nextState: params.nextState.readonlyStateMap.dualKeyMap,
        isPrivate: state => !params.createdByMe && state.object.isPrivate,
        toReplaceOperation: ({ nextState, key }) => ({
            createdBy: key.first,
            id: key.second,
            newValue: nextState?.toGraphQL({ createdBy: key.first, id: key.second, createdByMe: params.createdByMe })?.value
        }),
        toUpdateOperation: ({ prevState, nextState, operation, key }) => {
            const boolParams = BoolParam$Global.toGraphQLOperation({
                prevState: prevState.boolParams,
                nextState: nextState.boolParams,
                twoWayOperation: operation.boolParams,
                createdByMe: params.createdByMe,
            });
            const numParams = NumParam$Global.toGraphQLOperation({
                prevState: prevState.numParams,
                nextState: nextState.numParams,
                twoWayOperation: operation.numParams,
                createdByMe: params.createdByMe,
            });
            const numMaxParams = NumParam$Global.toGraphQLOperation({
                prevState: prevState.numMaxParams,
                nextState: nextState.numMaxParams,
                twoWayOperation: operation.numMaxParams,
                createdByMe: params.createdByMe,
            });
            const strParams = StrParam$Global.toGraphQLOperation({
                prevState: prevState.strParams,
                nextState: nextState.strParams,
                twoWayOperation: operation.strParams,
                createdByMe: params.createdByMe,
            });
            const pieceLocations = PieceLocation$Global.toGraphQLOperation({
                prevState: prevState.pieceLocations,
                nextState: nextState.pieceLocations,
                twoWayOperation: operation.pieceLocations,
                createdByMe: params.createdByMe,
            });
            return {
                createdBy: key.first, id: key.second, operation: operation.toGraphQL({
                    boolParams,
                    numParams,
                    numMaxParams,
                    strParams,
                    pieceLocations
                })
            };
        },
    });
};