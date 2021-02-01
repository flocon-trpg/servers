import { Field, ObjectType } from 'type-graphql';
import { LeaveRoomFailureType } from '../../../enums/LeaveRoomFailureType';
import { ParticipantRole } from '../../../enums/ParticipantRole';

@ObjectType()
export class LeaveRoomResult {
    @Field(() => LeaveRoomFailureType, { nullable: true })
    public failureType?: LeaveRoomFailureType
}