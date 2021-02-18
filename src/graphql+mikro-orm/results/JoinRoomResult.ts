import { createUnionType, Field, ObjectType } from 'type-graphql';
import { JoinRoomFailureType } from '../../enums/JoinRoomFailureType';
import { ParticipantsOperation } from '../entities/participant/graphql';

@ObjectType()
export class JoinRoomSuccessResult {
    @Field({ nullable: true })
    public operation?: ParticipantsOperation
}

@ObjectType()
export class JoinRoomFailureResult {
    @Field(() => JoinRoomFailureType)
    public failureType!: JoinRoomFailureType;
}

export const JoinRoomResult = createUnionType({
    name: 'JoinRoomResult',
    types: () => [JoinRoomSuccessResult, JoinRoomFailureResult] as const,
    resolveType: value => {
        if ('operation' in value) {
            return JoinRoomSuccessResult;
        }
        if ('failureType' in value) {
            return JoinRoomFailureResult;
        }
        return undefined;
    }
});