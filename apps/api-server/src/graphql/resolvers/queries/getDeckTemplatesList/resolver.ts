import {
    Authorized,
    Ctx,
    Field,
    ObjectType,
    Query,
    Resolver,
    UseMiddleware,
    createUnionType,
} from 'type-graphql';
import { DeckTemplate } from '../../../../entities/deckTemplate/entity';
import { PermissionType } from '../../../../enums/PermissionType';
import { ResolverContext } from '../../../../types';
import { ENTRY } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { DeckTemplateAsListItem } from '../../../objects/deckTemplate';
import { ensureAuthorizedUser } from '../../utils/utils';

@ObjectType()
class GetDeckTemplatesListSuccessResult {
    @Field(() => [DeckTemplateAsListItem])
    public deckTemplates!: DeckTemplateAsListItem[];
}

const GetDeckTemplatesListResult = createUnionType({
    name: 'GetDeckTemplatesListResult',
    types: () => [GetDeckTemplatesListSuccessResult] as const,
    resolveType: value => {
        if ('deckTemplates' in value) {
            return GetDeckTemplatesListSuccessResult;
        }
        return undefined;
    },
});

@Resolver()
export class GetDeckTemplatesListResolver {
    @Query(() => GetDeckTemplatesListResult)
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async getDeckTemplatesList(
        @Ctx() context: ResolverContext
    ): Promise<typeof GetDeckTemplatesListResult> {
        const em = context.em;
        const authorizedUserUid = ensureAuthorizedUser(context).userUid;

        // TODO: すべてを取得しているので重い。pagingに対応させる。
        const deckTemplateEntities = await em.find(DeckTemplate, {
            $or: [
                { listPermission: PermissionType.Entry },
                { createdBy: { userUid: authorizedUserUid } },
            ],
        });
        const deckTemplates: DeckTemplateAsListItem[] = [];
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
