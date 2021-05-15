import { Field, InputType, ObjectType } from 'type-graphql';
import { TextUpOperationUnit } from '../../Operations';

@ObjectType()
@InputType('StateIdStringPairInput')
export class StateIdStringPair {
    @Field()
    public stateId!: string;

    @Field()
    public value!: string;
}

@ObjectType()
@InputType('StateIdStringPairReplaceOperationInput')
export class StateIdStringPairReplaceOperation {
    @Field({ nullable: true })
    public newValue?: string;
}


@ObjectType()
@InputType('StateIdStringPairOperationInput')
export class StateIdStringPairOperation {
    @Field()
    public stateId!: string;

    // updateとreplaceのどちらか一方のみがnon-nullish

    @Field(() => [TextUpOperationUnit], { nullable: true })
    public update?: TextUpOperationUnit[]

    @Field({ nullable: true })
    public replace?: StateIdStringPairReplaceOperation;
}