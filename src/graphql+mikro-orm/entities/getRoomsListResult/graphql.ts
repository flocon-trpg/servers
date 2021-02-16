import { createUnionType, Field, ObjectType } from 'type-graphql';
import { GetRoomsListFailureType } from '../../../enums/GetRoomsListFailureType';
import { RoomAsListItem } from '../roomAsListItem/graphql';

@ObjectType()
export class GetRoomsListSuccessResult {
    @Field(() => [RoomAsListItem])
    public rooms!: RoomAsListItem[];
}

@ObjectType()
export class GetRoomsListFailureResult {
    @Field(() => GetRoomsListFailureType)
    public failureType!: GetRoomsListFailureType;
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
    }
});