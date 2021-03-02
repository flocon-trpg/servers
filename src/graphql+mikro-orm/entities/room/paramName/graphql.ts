import { Field, ObjectType, InputType } from 'type-graphql';
import { RoomParameterNameType } from '../../../../enums/RoomParameterNameType';
import { ReplaceStringUpOperation, TextUpOperationUnit } from '../../../Operations';

@ObjectType()
@InputType('ParamNameValueStateInput')
export class ParamNameValueState {
    @Field()
    public name!: string;
}

@ObjectType()
export class ParamNameState {
    @Field()
    public key!: string

    @Field(() => RoomParameterNameType)
    public type!: RoomParameterNameType

    @Field()
    public value!: ParamNameValueState
}

@ObjectType()
@InputType('ParamNameOperationInput')
export class ParamNameOperation {
    @Field({ nullable: true })
    public name?: ReplaceStringUpOperation;
}

@ObjectType()
@InputType('ReplaceParamNameOperationInput')
export class ReplaceParamNameOperation {
    @Field()
    public key!: string

    @Field(() => RoomParameterNameType)
    public type!: RoomParameterNameType

    @Field({ nullable: true })
    public newValue?: ParamNameValueState;
}

@ObjectType()
@InputType('UpdateParamNameOperationInput')
export class UpdateParamNameOperation {
    @Field()
    public key!: string

    @Field(() => RoomParameterNameType)
    public type!: RoomParameterNameType

    @Field()
    public operation!: ParamNameOperation;
}

@ObjectType()
@InputType('ParamNamesOperationInput')
export class ParamNamesOperation {
    @Field(() => [ReplaceParamNameOperation])
    public replace!: ReplaceParamNameOperation[];

    @Field(() => [UpdateParamNameOperation])
    public update!: UpdateParamNameOperation[];
}