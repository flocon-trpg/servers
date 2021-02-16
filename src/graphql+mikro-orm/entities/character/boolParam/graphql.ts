import { Field, ObjectType, InputType } from 'type-graphql';
import { ReplaceBooleanUpOperation, ReplaceNullableBooleanUpOperation, ReplaceNumberUpOperation } from '../../../Operations';

@ObjectType()
@InputType('BoolParamValueStateInput')
export class BoolParamValueState {
    @Field()
    public isValuePrivate!: boolean;

    @Field({ nullable: true })
    public value?: boolean;
}

@ObjectType()
@InputType('BoolParamStateInput')
export class BoolParamState {
    @Field()
    public key!: string

    @Field()
    public value!: BoolParamValueState
}

@ObjectType()
@InputType('BoolParamOperationInput')
export class BoolParamOperation {
    @Field({ nullable: true })
    public isValuePrivate?: ReplaceBooleanUpOperation;

    @Field({ nullable: true })
    public value?: ReplaceNullableBooleanUpOperation;
}

@ObjectType()
@InputType('UpdateBoolParamOperationInput')
export class UpdateBoolParamOperation {
    @Field()
    public key!: string;

    @Field()
    public operation!: BoolParamOperation;
}

@ObjectType()
@InputType('BoolParamsOperationInput')
export class BoolParamsOperation {
    @Field(() => [UpdateBoolParamOperation])
    public update!: UpdateBoolParamOperation[];
}