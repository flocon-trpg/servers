import { Field, ObjectType } from 'type-graphql';
import { DeleteRoomFailureType } from '../../enums/DeleteRoomFailureType';

@ObjectType()
export class DeleteRoomResult {
    @Field(() => DeleteRoomFailureType, { nullable: true })
    public failureType?: DeleteRoomFailureType;
}
