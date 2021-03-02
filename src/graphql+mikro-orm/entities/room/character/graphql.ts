import { ID, Field, ObjectType, InputType } from 'type-graphql';
import { ReplaceBooleanUpOperation, ReplaceNullableBooleanUpOperation, ReplaceNullableFilePathUpOperation, ReplaceNullableNumberUpOperation, ReplaceStringUpOperation, TextUpOperationUnit } from '../../../Operations';
import { BoolParamsOperation, BoolParamState } from './boolParam/graphql';
import { FilePath } from '../../filePath/graphql';
import { NumParamsOperation, NumParamState } from './numParam/graphql';
import { PieceState, PiecesOperation } from '../../piece/graphql';
import { StrParamsOperation, StrParamState } from './strParam/graphql';

@ObjectType()
@InputType('CharacterValueStateInput')
export class CharacterValueState {
    @Field()
    public isPrivate!: boolean;

    @Field()
    public name!: string;

    @Field(() => FilePath, { nullable: true })
    public image?: FilePath;


    @Field(() => [BoolParamState])
    public boolParams!: BoolParamState[];

    @Field(() => [NumParamState])
    public numParams!: NumParamState[];

    @Field(() => [NumParamState])
    public numMaxParams!: NumParamState[];

    @Field(() => [StrParamState])
    public strParams!: StrParamState[];

    @Field(() => [PieceState])
    public pieces!: PieceState[];
}

@ObjectType()
export class CharacterState {
    @Field()
    public id!: string

    @Field()
    public createdBy!: string

    @Field()
    public value!: CharacterValueState
}

@ObjectType()
@InputType('CharacterOperationInput')
export class CharacterOperation {
    @Field({ nullable: true })
    public isPrivate?: ReplaceBooleanUpOperation;

    @Field({ nullable: true })
    public name?: ReplaceStringUpOperation;

    @Field({ nullable: true })
    public image?: ReplaceNullableFilePathUpOperation;

    @Field()
    public boolParams!: BoolParamsOperation;
    
    @Field()
    public numParams!: NumParamsOperation;

    @Field()
    public numMaxParams!: NumParamsOperation;

    @Field()
    public strParams!: StrParamsOperation;

    @Field()
    public pieces!: PiecesOperation;
}

@ObjectType()
@InputType('ReplaceCharacterOperationInput')
export class ReplaceCharacterOperation {
    @Field()
    public id!: string;

    @Field()
    public createdBy!: string;

    @Field({ nullable: true })
    public newValue?: CharacterValueState;
}

@ObjectType()
@InputType('UpdateCharacterOperationInput')
export class UpdateCharacterOperation {
    @Field()
    public id!: string;

    @Field()
    public createdBy!: string;

    @Field()
    public operation!: CharacterOperation;
}

@ObjectType()
@InputType('CharactersOperationInput')
export class CharactersOperation {
    @Field(() => [ReplaceCharacterOperation])
    public replace!: ReplaceCharacterOperation[];

    @Field(() => [UpdateCharacterOperation])
    public update!: UpdateCharacterOperation[];
}