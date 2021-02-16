import { Field, ObjectType, InputType } from 'type-graphql';
import { ReplaceBooleanUpOperation, ReplaceNumberUpOperation } from '../../Operations';

@ObjectType()
@InputType('FoobarValueStateInput')
export class FoobarValueState {
    @Field()
    public isPrivate!: boolean;

    @Field()
    public hoge!: number;
}

@ObjectType()
export class FoobarState {
    @Field()
    public createdBy!: string;

    @Field()
    public id!: string

    @Field()
    public value!: FoobarValueState
}

@ObjectType()
@InputType('FoobarOperationInput')
export class FoobarOperation {
    @Field({ nullable: true })
    public isPrivate?: ReplaceBooleanUpOperation;

    @Field({ nullable: true })
    public hoge?: ReplaceNumberUpOperation;
}

@ObjectType()
@InputType('ReplaceFoobarOperationInput')
export class ReplaceFoobarOperation {
    @Field()
    public createdBy!: string;

    @Field()
    public id!: string;

    @Field({ nullable: true })
    public newValue?: FoobarValueState;
}

@ObjectType()
@InputType('UpdateFoobarOperationInput')
export class UpdateFoobarOperation {
    @Field()
    public createdBy!: string;

    @Field()
    public id!: string;

    @Field()
    public operation!: FoobarOperation;
}

@ObjectType()
@InputType('FoobarsOperationInput')
export class FoobarsOperation {
    @Field(() => [ReplaceFoobarOperation])
    public replace!: ReplaceFoobarOperation[];

    @Field(() => [UpdateFoobarOperation])
    public update!: UpdateFoobarOperation[];
}