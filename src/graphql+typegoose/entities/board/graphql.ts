import { Field, ObjectType, InputType } from 'type-graphql';
import { ReplaceNullableFilePathUpOperation, ReplaceNullableNumberUpOperation, ReplaceNumberUpOperation, ReplaceStringUpOperation } from '../../Operations';
import { FilePath } from '../filePath/graphql';

@ObjectType()
@InputType('BoardValueStateInput')
export class BoardValueState {
    @Field()
    public name!: string;

    @Field()
    public cellWidth!: number;

    @Field()
    public cellHeight!: number;

    @Field()
    public cellRowCount!: number;

    @Field()
    public cellColumnCount!: number;

    @Field()
    public cellOffsetX!: number;

    @Field()
    public cellOffsetY!: number;

    @Field(() => FilePath, { nullable: true })
    public backgroundImage?: FilePath;

    @Field()
    public backgroundImageZoom!: number;
}

@ObjectType()
export class BoardState {
    @Field()
    public id!: string

    @Field()
    public createdBy!: string

    @Field()
    public value!: BoardValueState
}

@ObjectType()
@InputType('BoardOperationInput')
export class BoardOperation {
    @Field({ nullable: true })
    public name?: ReplaceStringUpOperation;

    @Field({ nullable: true })
    public cellWidth?: ReplaceNumberUpOperation;

    @Field({ nullable: true })
    public cellHeight?: ReplaceNumberUpOperation;

    @Field({ nullable: true })
    public cellRowCount?: ReplaceNumberUpOperation;

    @Field({ nullable: true })
    public cellColumnCount?: ReplaceNumberUpOperation;

    @Field({ nullable: true })
    public cellOffsetX?: ReplaceNumberUpOperation;

    @Field({ nullable: true })
    public cellOffsetY?: ReplaceNumberUpOperation;

    @Field({ nullable: true })
    public backgroundImage?: ReplaceNullableFilePathUpOperation;

    @Field({ nullable: true })
    public backgroundImageZoom?: ReplaceNumberUpOperation;
}

@ObjectType()
@InputType('ReplaceBoardOperationInput')
export class ReplaceBoardOperation {
    @Field()
    public id!: string

    @Field()
    public createdBy!: string

    @Field({ nullable: true })
    public newValue?: BoardValueState
}

@ObjectType()
@InputType('UpdateBoardOperationInput')
export class UpdateBoardOperation {
    @Field()
    public id!: string;

    @Field()
    public createdBy!: string;

    @Field()
    public operation!: BoardOperation;
}

@ObjectType()
@InputType('BoardsOperationInput')
export class BoardsOperation {
    @Field(() => [ReplaceBoardOperation])
    public replace!: ReplaceBoardOperation[]

    @Field(() => [UpdateBoardOperation])
    public update!: UpdateBoardOperation[]
}