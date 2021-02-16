import { Field, ObjectType } from 'type-graphql';
import { ParticipantRole } from '../../../enums/ParticipantRole';
import { ReplaceStringUpOperation } from '../../Operations';

// server→clientの通信はあるがclient→serverの通信はないため、Inputは定義していない。

@ObjectType()
export class ParticipantValueState {
    @Field()
    public name!: string;

    // 退室したParticipantでも名前が表示されたほうが便利な場面もあると思われるので、nullableにしている。
    @Field(() => ParticipantRole, { nullable: true })
    public role?: ParticipantRole;
}

@ObjectType()
export class ParticipantState {
    @Field()
    public userUid!: string

    @Field()
    public value!: ParticipantValueState
}

@ObjectType()
export class ParticipantsGetState {
    @Field()
    public revision!: number


    @Field(() => [ParticipantState])
    public participants!: ParticipantState[];
}

@ObjectType()
export class ReplaceNullableParticipantRoleUpOperation {
    @Field(() => ParticipantRole, { nullable: true })
    public newValue?: ParticipantRole;
}

@ObjectType()
export class ParticipantOperation {
    @Field({ nullable: true })
    public name?: ReplaceStringUpOperation;

    @Field({ nullable: true })
    public role?: ReplaceNullableParticipantRoleUpOperation;
}

@ObjectType()
export class ReplaceParticipantOperation {
    @Field()
    public userUid!: string

    // removeは、roleがundefinedになることによって表現されるため、newValueがundefinedになることはない。
    @Field()
    public newValue!: ParticipantValueState
}

@ObjectType()
export class UpdateParticipantOperation {
    @Field()
    public userUid!: string;

    @Field()
    public operation!: ParticipantOperation;
}

export const participantsOperation = 'ParticipantsOperation';

@ObjectType()
export class ParticipantsOperation {
    public __tstype!: typeof participantsOperation;

    @Field()
    public operatedBy!: string;

    @Field()
    public revisionTo!: number;

    @Field(() => [ReplaceParticipantOperation])
    public replace!: ReplaceParticipantOperation[]

    @Field(() => [UpdateParticipantOperation])
    public update!: UpdateParticipantOperation[]
}