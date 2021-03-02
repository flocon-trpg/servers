import { Field, InputType, ObjectType } from 'type-graphql';
import { ReplaceBooleanUpOperation, ReplaceNumberUpOperation } from '../../Operations';

@ObjectType()
@InputType('PieceValueStateInput')
export class PieceValueState {
    @Field()
    public isPrivate!: boolean;

    @Field()
    public isCellMode!: boolean;

    // x, y, w, h は isCellMode === false のときに使われる値

    @Field()
    public x!: number;

    @Field()
    public y!: number;

    @Field()
    public w!: number;

    @Field()
    public h!: number;

    // cellX, cellY, cellW, cellH は isCellMode === true のときに使われる値
    // cellX, cellY, cellW, cellH は通常は整数。(cellX, cellY) = (0, 0) は一番左上のセルを表す。(cellW, cellH) = (1, 1) だとセル1つの大きさと等しい。cellW > 1 || cellH > 1 （ただしcellW ≧ 1 && cellH ≧ 1）ならば複数のセルにまたがる。

    @Field()
    public cellX!: number;

    @Field()
    public cellY!: number;

    @Field()
    public cellW!: number;

    @Field()
    public cellH!: number;
}

@ObjectType()
@InputType('PieceStateInput')
export class PieceState {
    @Field()
    public boardId!: string

    @Field()
    public boardCreatedBy!: string

    @Field()
    public value!: PieceValueState
}

@ObjectType()
@InputType('PieceOperationInput')
export class PieceOperation {
    @Field({ nullable: true })
    public isPrivate?: ReplaceBooleanUpOperation;

    @Field({ nullable: true })
    public isCellMode?: ReplaceBooleanUpOperation;

    @Field({ nullable: true })
    public x?: ReplaceNumberUpOperation;

    @Field({ nullable: true })
    public y?: ReplaceNumberUpOperation;

    @Field({ nullable: true })
    public w?: ReplaceNumberUpOperation;

    @Field({ nullable: true })
    public h?: ReplaceNumberUpOperation;

    @Field({ nullable: true })
    public cellX?: ReplaceNumberUpOperation;

    @Field({ nullable: true })
    public cellY?: ReplaceNumberUpOperation;

    @Field({ nullable: true })
    public cellW?: ReplaceNumberUpOperation;

    @Field({ nullable: true })
    public cellH?: ReplaceNumberUpOperation;
}

@ObjectType()
@InputType('ReplacePieceOperationInput')
export class ReplacePieceOperation {
    @Field()
    public boardId!: string;

    @Field()
    public boardCreatedBy!: string

    @Field({ nullable: true })
    public newValue?: PieceValueState;
}

@ObjectType()
@InputType('UpdatePieceOperationInput')
export class UpdatePieceOperation {
    @Field()
    public boardId!: string;

    @Field()
    public boardCreatedBy!: string

    @Field()
    public operation!: PieceOperation;
}

@ObjectType()
@InputType('PiecesOperationInput')
export class PiecesOperation {
    @Field(() => [ReplacePieceOperation])
    public replace!: ReplacePieceOperation[];

    @Field(() => [UpdatePieceOperation])
    public update!: UpdatePieceOperation[];
}