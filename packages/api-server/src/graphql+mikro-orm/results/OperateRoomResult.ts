import { createUnionType, Field, ObjectType } from 'type-graphql';
import { OperateRoomFailureType } from '../../enums/OperateRoomFailureType';
import { RoomOperation } from '../entities/room/graphql';
import { RoomAsListItem } from '../entities/roomAsListItem/graphql';

@ObjectType()
export class OperateRoomSuccessResult {
    @Field()
    public operation!: RoomOperation;
}

@ObjectType()
export class OperateRoomIdResult {
    @Field()
    public requestId!: string;
}

@ObjectType()
export class OperateRoomNonJoinedResult {
    @Field()
    public roomAsListItem!: RoomAsListItem;
}

@ObjectType()
export class OperateRoomFailureResult {
    @Field(() => OperateRoomFailureType)
    public failureType!: OperateRoomFailureType;
}

export const OperateRoomResult = createUnionType({
    name: 'OperateRoomResult',
    types: () =>
        [
            OperateRoomSuccessResult,
            OperateRoomFailureResult,
            OperateRoomNonJoinedResult,
            OperateRoomIdResult,
        ] as const,
    resolveType: value => {
        if ('operation' in value) {
            return OperateRoomSuccessResult;
        }
        if ('failureType' in value) {
            return OperateRoomFailureResult;
        }
        if ('roomAsListItem' in value) {
            return OperateRoomNonJoinedResult;
        }
        if ('requestId' in value) {
            return OperateRoomIdResult;
        }
        return undefined;
    },
});
