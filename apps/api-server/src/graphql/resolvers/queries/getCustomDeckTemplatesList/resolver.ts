import { Field, ObjectType, Query, Resolver, createUnionType } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { PermissionType } from '../../../../enums/PermissionType';
import { DeckTemplate } from '../../../../mikro-orm/entities/deckTemplate/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { CustomDeckTemplateAsListItem } from '../../../objects/customDeckTemplate';

@ObjectType()
class GetCustomDeckTemplatesListSuccessResult {
    @Field(() => [CustomDeckTemplateAsListItem])
    public deckTemplates!: CustomDeckTemplateAsListItem[];
}

const GetCustomDeckTemplatesListResult = createUnionType({
    name: 'GetCustomDeckTemplatesListResult',
    types: () => [GetCustomDeckTemplatesListSuccessResult] as const,
    resolveType: value => {
        if ('deckTemplates' in value) {
            return GetCustomDeckTemplatesListSuccessResult;
        }
        return undefined;
    },
});

@Resolver()
export class GetCustomDeckTemplatesListResolver {
    public constructor(private readonly mikroOrmService: MikroOrmService) {}

    @Query(() => GetCustomDeckTemplatesListResult)
    @Auth(ENTRY)
    public async getCustomDeckTemplatesList(
        @AuthData() auth: AuthDataType,
    ): Promise<typeof GetCustomDeckTemplatesListResult> {
        const em = await this.mikroOrmService.forkEmForMain();

        // TODO: すべてを取得しているので重い。pagenationに対応させる。
        const deckTemplateEntities = await em.find(DeckTemplate, {
            $or: [
                { listPermission: PermissionType.Entry },
                { createdBy: { userUid: auth.user.userUid } },
            ],
        });
        const deckTemplates: CustomDeckTemplateAsListItem[] = [];
        for (const deckTemplate of deckTemplateEntities) {
            deckTemplates.push({
                ...deckTemplate,
                createdAt: deckTemplate.createdAt?.getTime(),
            });
        }
        return {
            deckTemplates,
        };
    }
}
