import { Field, ObjectType } from 'type-graphql';
import { PromoteFailureType } from '../../enums/PromoteFailureType';

@ObjectType()
export class PromoteResult {
    @Field(() => PromoteFailureType, { nullable: true })
    public failureType?: PromoteFailureType;
}
