import {
    Args,
    ArgsType,
    Authorized,
    Ctx,
    Field,
    Mutation,
    ObjectType,
    Resolver,
    UseMiddleware,
    createUnionType,
} from 'type-graphql';
import { ENTRY } from '../../../../roles';
import { queueLimitReached } from '../../../../utils/promiseQueue';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { ResolverContext } from '../../../utils/Contexts';
import { serverTooBusyMessage } from '../../messages';
import * as Room$MikroORM from '../../../entities/room/mikro-orm';
import { UpdateBookmarkFailureType } from '../../../../enums/UpdateBookmarkFailureType';
import { ensureAuthorizedUser } from '../../utils';

@ArgsType()
class UpdateBookmarkArgs {
    @Field()
    public roomId!: string;

    @Field()
    public newValue!: boolean;
}

@ObjectType()
class UpdateBookmarkSuccessResult {
    @Field()
    public prevValue!: boolean;

    @Field()
    public currentValue!: boolean;
}

@ObjectType()
class UpdateBookmarkFailureResult {
    @Field(() => UpdateBookmarkFailureType)
    public failureType!: UpdateBookmarkFailureType;
}

export const UpdateBookmarkResult = createUnionType({
    name: 'UpdateBookmarkResult',
    types: () => [UpdateBookmarkSuccessResult, UpdateBookmarkFailureResult] as const,
    resolveType: value => {
        if ('currentValue' in value) {
            return UpdateBookmarkSuccessResult;
        }
        if ('failureType' in value) {
            return UpdateBookmarkFailureResult;
        }
        return undefined;
    },
});

@Resolver()
export class UpdateBookmarkResolver {
    @Mutation(() => UpdateBookmarkResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async updateBookmark(
        @Args() args: UpdateBookmarkArgs,
        @Ctx() context: ResolverContext
    ): Promise<typeof UpdateBookmarkResult> {
        const queue = async (): Promise<typeof UpdateBookmarkResult> => {
            const em = context.em;
            const authorizedUser = ensureAuthorizedUser(context);
            const room = await em.findOne(Room$MikroORM.Room, { id: args.roomId });
            if (room == null) {
                return {
                    failureType: UpdateBookmarkFailureType.NotFound,
                };
            }
            await authorizedUser.bookmarkedRooms.init();
            const isBookmarked = authorizedUser.bookmarkedRooms.contains(room);
            if (args.newValue) {
                if (isBookmarked) {
                    return { prevValue: isBookmarked, currentValue: isBookmarked };
                }
            } else {
                if (!isBookmarked) {
                    return { prevValue: isBookmarked, currentValue: isBookmarked };
                }
            }

            if (args.newValue) {
                authorizedUser.bookmarkedRooms.add(room);
            } else {
                authorizedUser.bookmarkedRooms.remove(room);
            }

            await em.flush();
            return { prevValue: isBookmarked, currentValue: args.newValue };
        };

        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        return result.value;
    }
}
