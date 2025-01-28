import {
    Args,
    ArgsType,
    Field,
    Mutation,
    ObjectType,
    Resolver,
    createUnionType,
} from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { UpdateBookmarkFailureType } from '../../../../enums/UpdateBookmarkFailureType';
import * as Room$MikroORM from '../../../../mikro-orm/entities/room/entity';
import { User } from '../../../../mikro-orm/entities/user/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';

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
    public constructor(private readonly mikroOrmService: MikroOrmService) {}

    @Mutation(() => UpdateBookmarkResult)
    @Auth(ENTRY)
    public async updateBookmark(
        @Args() args: UpdateBookmarkArgs,
        @AuthData() auth: AuthDataType,
    ): Promise<typeof UpdateBookmarkResult> {
        const em = await this.mikroOrmService.forkEmForMain();
        const authorizedUser = await em.findOneOrFail(User, { userUid: auth.user.userUid });
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
    }
}
