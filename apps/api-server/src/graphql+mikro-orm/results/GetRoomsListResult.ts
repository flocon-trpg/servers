import { Field, ObjectType, createUnionType } from 'type-graphql';
import { GetRoomFailureType } from '../../enums/GetRoomFailureType';
import { RoomAsListItem } from '../entities/roomAsListItem/graphql';

@ObjectType()
export class GetRoomsListSuccessResult {
    @Field(() => [RoomAsListItem])
    public rooms!: RoomAsListItem[];
}

@ObjectType()
export class GetRoomsListFailureResult {
    @Field(() => GetRoomFailureType)
    public failureType!: GetRoomFailureType;
}

export const GetRoomsListResult = createUnionType({
    name: 'GetRoomsListResult',
    types: () => [GetRoomsListSuccessResult, GetRoomsListFailureResult] as const,
    resolveType: value => {
        if ('rooms' in value) {
            return GetRoomsListSuccessResult;
        }
        if ('failureType' in value) {
            return GetRoomsListFailureResult;
        }
        return undefined;
    },
});
