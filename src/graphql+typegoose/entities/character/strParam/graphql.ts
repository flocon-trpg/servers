import { Field, ObjectType, InputType } from 'type-graphql';
import { ReplaceBooleanUpOperation, ReplaceNumberUpOperation, TextUpOperationUnit } from '../../../Operations';

@ObjectType()
@InputType('StrParamValueStateInput')
export class StrParamValueState {
    @Field()
    public isValuePrivate!: boolean;

    @Field()
    public value!: string;
}

@ObjectType()
@InputType('StrParamStateInput')
export class StrParamState {
    @Field()
    public key!: string

    @Field()
    public value!: StrParamValueState
}

@ObjectType()
@InputType('StrParamOperationInput')
export class StrParamOperation {
    @Field({ nullable: true })
    public isValuePrivate?: ReplaceBooleanUpOperation;

    @Field(() => [TextUpOperationUnit], { nullable: true })
    public value?: TextUpOperationUnit[];
}

@ObjectType()
@InputType('UpdateStrParamOperationInput')
export class UpdateStrParamOperation {
    @Field()
    public key!: string;

    @Field()
    public operation!: StrParamOperation;
}

@ObjectType()
@InputType('StrParamsOperationInput')
export class StrParamsOperation {
    @Field(() => [UpdateStrParamOperation])
    public update!: UpdateStrParamOperation[];
}