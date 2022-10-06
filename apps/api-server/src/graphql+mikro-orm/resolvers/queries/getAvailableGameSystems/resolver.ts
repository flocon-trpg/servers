import { Field, ObjectType, Query, Resolver } from 'type-graphql';
import { listAvailableGameSystems } from '../../../../messageAnalyzer/main';

@ObjectType()
class AvailableGameSystem {
    @Field()
    public id!: string;

    @Field()
    public sortKey!: string;

    @Field()
    public name!: string;
}

@ObjectType()
class GetAvailableGameSystemsResult {
    @Field(() => [AvailableGameSystem])
    public value!: AvailableGameSystem[];
}

@Resolver()
export class GetAvailableGameSystemsResolver {
    @Query(() => GetAvailableGameSystemsResult)
    public async getAvailableGameSystems(): Promise<GetAvailableGameSystemsResult> {
        return {
            value: listAvailableGameSystems(),
        };
    }
}
