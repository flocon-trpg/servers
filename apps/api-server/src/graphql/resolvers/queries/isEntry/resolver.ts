import { Authorized, Ctx, Query, Resolver, UseMiddleware } from 'type-graphql';
import { BaasType } from '../../../../enums/BaasType';
import { ResolverContext } from '../../../../types';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { checkEntry, ensureUserUid } from '../../utils/utils';

@Resolver()
export class IsEntryResolver {
    @Query(() => Boolean)
    @Authorized()
    @UseMiddleware(RateLimitMiddleware(1))
    public async isEntry(@Ctx() context: ResolverContext): Promise<boolean> {
        const userUid = ensureUserUid(context);
        return await checkEntry({
            em: context.em,
            userUid,
            baasType: BaasType.Firebase,
            serverConfig: context.serverConfig,
        });
    }
}
