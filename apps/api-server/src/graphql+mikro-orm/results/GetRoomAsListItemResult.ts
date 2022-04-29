import { Field, ObjectType, createUnionType } from 'type-graphql';
import { GetRoomFailureType } from '../../enums/GetRoomFailureType';
import { RoomAsListItem } from '../entities/roomAsListItem/graphql';

@ObjectType()
export class GetRoomAsListItemSuccessResult {
    @Field(() => RoomAsListItem)
    public room!: RoomAsListItem;
}

@ObjectType()
export class GetRoomAsListItemFailureResult {
    @Field(() => GetRoomFailureType)
    public failureType!: GetRoomFailureType;
}

export const GetRoomAsListItemResult = createUnionType({
    name: 'GetRoomAsListItemResult',
    types: () => [GetRoomAsListItemSuccessResult, GetRoomAsListItemFailureResult] as const,
    resolveType: value => {
        if ('room' in value) {
            return GetRoomAsListItemSuccessResult;
        }
        if ('failureType' in value) {
            return GetRoomAsListItemFailureResult;
        }
        return undefined;
    },
});
