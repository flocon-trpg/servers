import { Field, ObjectType, InputType } from 'type-graphql';
import { ReplaceBooleanUpOperation, ReplaceNullableNumberUpOperation, ReplaceNumberUpOperation } from '../../../../Operations';

// NumParamとNumMaxParam兼用

@ObjectType()
@InputType('NumParamValueStateInput')
export class NumParamValueState {
    @Field()
    public isValuePrivate!: boolean;

    @Field({ nullable: true })
    public value?: number;
}

@ObjectType()
@InputType('NumParamStateInput')
export class NumParamState {
    @Field()
    public key!: string

    @Field()
    public value!: NumParamValueState
}

@ObjectType()
@InputType('NumParamOperationInput')
export class NumParamOperation {
    @Field({ nullable: true })
    public isValuePrivate?: ReplaceBooleanUpOperation;

    @Field({ nullable: true })
    public value?: ReplaceNullableNumberUpOperation;
}

@ObjectType()
@InputType('UpdateNumParamOperationInput')
export class UpdateNumParamOperation {
    @Field()
    public key!: string;

    @Field()
    public operation!: NumParamOperation;
}

@ObjectType()
@InputType('NumParamsOperationInput')
export class NumParamsOperation {
    @Field(() => [UpdateNumParamOperation])
    public update!: UpdateNumParamOperation[];
}