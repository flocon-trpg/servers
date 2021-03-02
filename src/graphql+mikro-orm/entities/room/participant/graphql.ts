import { Field, InputType, ObjectType } from 'type-graphql';
import { ParticipantRole } from '../../../../enums/ParticipantRole';
import { ReplaceNullableParticipantRoleUpOperation, ReplaceStringUpOperation } from '../../../Operations';
import { MyNumberValueState, MyNumberValuesOperation } from './myValue/number/graphql';

// roleなどはクライアント側から直接変更できないようにさせうため、Inputでは定義していない。

@ObjectType()
export class ParticipantValueState {
    @Field()
    public name!: string;

    // 退室したParticipantでも名前が表示されたほうが便利な場面もあると思われるので、nullableにしている。
    @Field(() => ParticipantRole, { nullable: true })
    public role?: ParticipantRole;

    @Field(() => [MyNumberValueState])
    public myNumberValues!: MyNumberValueState[];
}

@ObjectType()
export class ParticipantState {
    @Field()
    public userUid!: string

    @Field()
    public value!: ParticipantValueState
}

@ObjectType()
export class ParticipantOperation {
    @Field({ nullable: true })
    public name?: ReplaceStringUpOperation;

    @Field({ nullable: true })
    public role?: ReplaceNullableParticipantRoleUpOperation;

    @Field(() => MyNumberValuesOperation)
    public myNumberValues!: MyNumberValuesOperation;
}

@InputType()
export class ParticipantOperationInput {
    // roleがないのは、roleを変える際にフレーズが必要になることがあるため。roleを変更したい場合は別の独立したmutationを用いる。
    // nameがないのは、nameを変更するためには、roleと同様に別の独立したmutationを用いるように過去に実装していて、それを流用しているため。ただし、ParticipantOperationInputを用いる形に仕様変更しても実用上は問題ないはず。

    @Field(() => MyNumberValuesOperation)
    public myNumberValues!: MyNumberValuesOperation;
}

@ObjectType()
export class ReplaceParticipantOperation {
    @Field()
    public userUid!: string

    @Field({ nullable: true })
    public newValue?: ParticipantValueState
}

@ObjectType()
export class UpdateParticipantOperation {
    @Field()
    public userUid!: string;

    @Field()
    public operation!: ParticipantOperation;
}

@InputType()
export class UpdateParticipantOperationInput {
    @Field()
    public userUid!: string;

    @Field()
    public operation!: ParticipantOperationInput;
}
@ObjectType()
export class ParticipantsOperation {
    @Field(() => [ReplaceParticipantOperation])
    public replace!: ReplaceParticipantOperation[]

    @Field(() => [UpdateParticipantOperation])
    public update!: UpdateParticipantOperation[]
}

@InputType()
export class ParticipantsOperationInput {
    @Field(() => [UpdateParticipantOperationInput])
    public update!: UpdateParticipantOperationInput[]
}