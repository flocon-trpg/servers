import { Field, ObjectType } from 'type-graphql';
import { ChangeParticipantNameFailureType } from '../../enums/ChangeParticipantNameFailureType';

@ObjectType()
export class ChangeParticipantNameResult {
    @Field(() => ChangeParticipantNameFailureType, { nullable: true })
    public failureType?: ChangeParticipantNameFailureType;
}
