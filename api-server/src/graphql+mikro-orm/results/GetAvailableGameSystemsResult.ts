import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class AvailableGameSystem {
    @Field()
    public id!: string;

    @Field()
    public sortKey!: string;

    @Field()
    public name!: string;
}

@ObjectType()
export class GetAvailableGameSystemsResult {
    @Field(() => [AvailableGameSystem])
    public value!: AvailableGameSystem[];
}
