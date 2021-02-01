import { Field, ObjectType } from 'type-graphql';
import { ParticipantRole } from '../../../enums/ParticipantRole';

@ObjectType()
export class Participant {
    @Field()
    public userUid!: string;

    @Field()
    public name!: string;

    @Field({ nullable: true })
    public role?: ParticipantRole
}