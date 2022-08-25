import {
    Args,
    ArgsType,
    Authorized,
    Ctx,
    Field,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { DeckTemplate as DeckTemplateEntity } from '../../../../entities/deckTemplate/entity';
import { ResolverContext } from '../../../../types';
import { ENTRY } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { DeckTemplate } from '@/graphql/objects/deckTemplate';

@ArgsType()
class GetDeckTemplateArgs {
    @Field()
    public id!: string;
}

@Resolver()
export class GetDeckTemplateResolver {
    @Query(() => DeckTemplate, { nullable: true })
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async getDeckTemplate(
        @Args() args: GetDeckTemplateArgs,
        @Ctx() context: ResolverContext
    ): Promise<DeckTemplate | null> {
        const em = context.em;

        const entity = await em.findOne(DeckTemplateEntity, {
            id: args.id,
        });
        if (entity == null) {
            return null;
        }
        return {
            ...entity,
            createdAt: entity.createdAt?.getTime(),
            valueJson: JSON.stringify(entity.value),
        };
    }
}
