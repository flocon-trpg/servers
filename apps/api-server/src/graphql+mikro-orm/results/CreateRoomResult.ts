import { Field, ObjectType, createUnionType } from 'type-graphql';
import { CreateRoomFailureType } from '../../enums/CreateRoomFailureType';
import { RoomGetState } from '../entities/room/graphql';

@ObjectType()
export class CreateRoomSuccessResult {
    @Field()
    public id!: string;

    @Field()
    public room!: RoomGetState;
}

@ObjectType()
export class CreateRoomFailureResult {
    @Field(() => CreateRoomFailureType)
    public failureType!: CreateRoomFailureType;
}

export const CreateRoomResult = createUnionType({
    name: 'CreateRoomResult',
    types: () => [CreateRoomSuccessResult, CreateRoomFailureResult] as const,
    resolveType: value => {
        if ('room' in value) {
            return CreateRoomSuccessResult;
        }
        if ('failureType' in value) {
            return CreateRoomFailureResult;
        }
        return undefined;
    },
});
