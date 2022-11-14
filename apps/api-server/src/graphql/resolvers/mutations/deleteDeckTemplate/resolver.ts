import {
    Args,
    ArgsType,
    Authorized,
    Ctx,
    Field,
    Mutation,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { DeckTemplate as DeckTemplateEntity } from '../../../../entities/deckTemplate/entity';
import { PermissionType } from '../../../../enums/PermissionType';
import { ResolverContext } from '../../../../types';
import { ENTRY } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { DeckTemplate as DeckTemplateObject } from '../../../objects/deckTemplate';
import { ensureAuthorizedUser } from '../../utils/utils';

@ArgsType()
class DeleteDeckTemplateArgs {
    @Field()
    public deckTemplateId!: string;
}

@Resolver()
export class DeleteDeckTemplateResolver {
    @Mutation(() => Boolean)
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async deleteDeckTemplate(
        @Args() args: DeleteDeckTemplateArgs,
        @Ctx() context: ResolverContext
    ): Promise<boolean> {
        const user = ensureAuthorizedUser(context);
        const em = context.em.fork();
        const found = await em.findOne(DeckTemplateEntity, {
            id: args.deckTemplateId,
            $or: [{ createdBy: user }, { deletePermission: PermissionType.Entry }],
        });
        if (found == null) {
            return false;
        }
        await em.removeAndFlush(found);
        return true;
    }
}
