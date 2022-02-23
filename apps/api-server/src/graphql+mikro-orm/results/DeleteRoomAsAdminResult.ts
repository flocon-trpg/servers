import { Field, ObjectType } from 'type-graphql';
import { DeleteRoomAsAdminFailureType } from '../../enums/DeleteRoomAsAdminFailureType';

@ObjectType()
export class DeleteRoomAsAdminResult {
    @Field(() => DeleteRoomAsAdminFailureType, { nullable: true })
    public failureType?: DeleteRoomAsAdminFailureType;
}
