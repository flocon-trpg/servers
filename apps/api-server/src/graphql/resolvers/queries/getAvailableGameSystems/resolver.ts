import { Field, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { listAvailableGameSystems } from '../../utils/messageAnalyzer';

@ObjectType()
class AvailableGameSystem {
    // ID の名前は単に id とせず例えば gameSystemId とする方針にしている(理由は、例えば Room の ID の場合、Room 以外にも ID がある場合は Room の ID は roomId とするしかないが、そうすることで統一性が薄れるため、roomId でなるべく統一している)が、bcdice の戻り値からあまり改変させたくないのでこれは特例で id としている。
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
