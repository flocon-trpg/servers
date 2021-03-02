import { Field, InputType, ObjectType } from 'type-graphql';
import { ReplaceBooleanUpOperation, ReplaceNullableNumberUpOperation, ReplaceNumberUpOperation } from '../../../../../Operations';
import { PiecesOperation, PieceState } from '../../../../piece/graphql';

@ObjectType()
@InputType('MyNumberValueStateValueInput')
export class MyNumberValueStateValue {
    @Field()
    public isValuePrivate!: boolean;

    @Field({ nullable: true })
    public valueRangeMin?: number;

    @Field({ nullable: true })
    public valueRangeMax?: number;

    // 自分が作成したケースだけを考えた場合はnullableである必要はないが、isValuePrivateの存在を考えてnullableにしている。自分の作成したものと自分以外が作成したものでGraphQL objectの定義をわけることも考えられるが、コードが肥大化を避けるため却下。
    @Field({ nullable: true })
    public value?: number;

    @Field(() => [PieceState])
    public pieces!: PieceState[];
}

@ObjectType()
@InputType('MyNumberValueStateInput')
export class MyNumberValueState {
    @Field()
    public stateId!: string

    @Field()
    public value!: MyNumberValueStateValue
}

@ObjectType()
@InputType('MyNumberValueOperationInput')
export class MyNumberValueOperation {
    @Field(() => ReplaceBooleanUpOperation, { nullable: true })
    public isValuePrivate?: ReplaceBooleanUpOperation;

    @Field(() => ReplaceNullableNumberUpOperation, { nullable: true })
    public valueRangeMin?: ReplaceNullableNumberUpOperation;

    @Field(() => ReplaceNullableNumberUpOperation, { nullable: true })
    public valueRangeMax?: ReplaceNullableNumberUpOperation;

    @Field(() => ReplaceNumberUpOperation, { nullable: true })
    public value?: ReplaceNumberUpOperation;

    @Field(() => PiecesOperation)
    public pieces!: PiecesOperation;
}

@ObjectType()
@InputType('ReplaceMyNumberValueOperationInput')
export class ReplaceMyNumberValueOperation {
    @Field()
    public stateId!: string

    @Field({ nullable: true })
    public newValue?: MyNumberValueStateValue
}

@ObjectType()
@InputType('UpdateMyNumberValueOperationInput')
export class UpdateMyNumberValueOperation {
    @Field()
    public stateId!: string;

    @Field()
    public operation!: MyNumberValueOperation;
}

@ObjectType()
@InputType('MyNumberValuesOperationInput')
export class MyNumberValuesOperation {
    @Field(() => [ReplaceMyNumberValueOperation])
    public replace!: ReplaceMyNumberValueOperation[]

    @Field(() => [UpdateMyNumberValueOperation])
    public update!: UpdateMyNumberValueOperation[]
}