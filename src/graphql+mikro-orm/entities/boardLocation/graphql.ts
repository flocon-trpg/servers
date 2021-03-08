import { Field, InputType, ObjectType } from 'type-graphql';
import { ReplaceBooleanUpOperation, ReplaceNumberUpOperation } from '../../Operations';

@ObjectType()
@InputType('BoardLocationValueStateInput')
export class BoardLocationValueState {
    @Field()
    public isPrivate!: boolean;

    @Field()
    public x!: number;

    @Field()
    public y!: number;

    @Field()
    public w!: number;

    @Field()
    public h!: number;
}

@ObjectType()
@InputType('BoardLocationStateInput')
export class BoardLocationState {
    @Field()
    public boardId!: string

    @Field()
    public boardCreatedBy!: string

    @Field()
    public value!: BoardLocationValueState
}

@ObjectType()
@InputType('BoardLocationOperationInput')
export class BoardLocationOperation {
    @Field({ nullable: true })
    public isPrivate?: ReplaceBooleanUpOperation;

    @Field({ nullable: true })
    public x?: ReplaceNumberUpOperation;

    @Field({ nullable: true })
    public y?: ReplaceNumberUpOperation;

    @Field({ nullable: true })
    public w?: ReplaceNumberUpOperation;

    @Field({ nullable: true })
    public h?: ReplaceNumberUpOperation;
}

@ObjectType()
@InputType('ReplaceBoardLocationOperationInput')
export class ReplaceBoardLocationOperation {
    @Field()
    public boardId!: string;

    @Field()
    public boardCreatedBy!: string

    @Field({ nullable: true })
    public newValue?: BoardLocationValueState;
}

@ObjectType()
@InputType('UpdateBoardLocationOperationInput')
export class UpdateBoardLocationOperation {
    @Field()
    public boardId!: string;

    @Field()
    public boardCreatedBy!: string

    @Field()
    public operation!: BoardLocationOperation;
}

@ObjectType()
@InputType('BoardLocationsOperationInput')
export class BoardLocationsOperation {
    @Field(() => [ReplaceBoardLocationOperation])
    public replace!: ReplaceBoardLocationOperation[];

    @Field(() => [UpdateBoardLocationOperation])
    public update!: UpdateBoardLocationOperation[];
}