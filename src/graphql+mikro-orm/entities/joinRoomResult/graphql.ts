import { Field, ObjectType, createUnionType } from 'type-graphql';
import { JoinRoomFailureType } from '../../../enums/JoinRoomFailureType';
import { ParticipantRole } from '../../../enums/ParticipantRole';
import { ParticipantsOperation } from '../participant/graphql';
import { RoomGetState } from '../room/graphql';

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