import { Field, ObjectType } from 'type-graphql';
import { LeaveRoomFailureType } from '../../enums/LeaveRoomFailureType';

@ObjectType()
export class LeaveRoomResult {
    @Field(() => LeaveRoomFailureType, { nullable: true })
    public failureType?: LeaveRoomFailureType
}