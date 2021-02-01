import { createUnionType, Field, ObjectType } from 'type-graphql';
import { GetRoomFailureType } from '../../../enums/GetRoomFailureType';
import { ParticipantRole } from '../../../enums/ParticipantRole';
import { RoomGetState, RoomOperation } from '../room/graphql';
import { RoomAsListItem } from '../roomAsListItem/graphql';

@ObjectType()
export class GetJoinedRoomResult {
    @Field(() => ParticipantRole)
    public role!: ParticipantRole

    @Field()
    public room!: RoomGetState;
}

@ObjectType()
export class GetNonJoinedRoomResult {
    @Field()
    public roomAsListItem!: RoomAsListItem;
}

@ObjectType()
export class GetRoomFailureResult {
    @Field(() => GetRoomFailureType)
    public failureType!: GetRoomFailureType;
}

export const GetRoomResult = createUnionType({
    name: 'GetRoomResult',
    types: () => [GetJoinedRoomResult, GetNonJoinedRoomResult, GetRoomFailureResult] as const,
    resolveType: value => {
        if ('room' in value) {
            return GetJoinedRoomResult;
        }
        if ('roomAsListItem' in value) {
            return GetNonJoinedRoomResult;
        }
        if ('failureType' in value) {
            return GetRoomFailureResult;
        }
        return undefined;
    }
});