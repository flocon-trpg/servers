import { Field, ObjectType, Query, Resolver, createUnionType } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { DefaultDeckTemplate, defaultDeckTemplates } from '../../../objects/defaultDeckTemplate';

@ObjectType()
class GetDefaultDeckTemplatesListSuccessResult {
    @Field(() => [DefaultDeckTemplate])
    public deckTemplates!: DefaultDeckTemplate[];
}

const GetDefaultDeckTemplatesListResult = createUnionType({
    name: 'GetDefaultDeckTemplatesListResult',
    types: () => [GetDefaultDeckTemplatesListSuccessResult] as const,
    resolveType: value => {
        if ('deckTemplates' in value) {
            return GetDefaultDeckTemplatesListSuccessResult;
        }
        return undefined;
    },
});

@Resolver()
export class GetDefaultDeckTemplatesListResolver {
    @Query(() => GetDefaultDeckTemplatesListResult)
    @Auth(ENTRY)
    public async getDefaultDeckTemplatesList(): Promise<typeof GetDefaultDeckTemplatesListResult> {
        return {
            deckTemplates: defaultDeckTemplates,
        };
    }
}
