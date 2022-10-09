import { Arg, Authorized, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { ENTRY } from '../../../../utils/roles';
import { FileTag } from '../../../../entities/fileTag/entity';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { ensureAuthorizedUser } from '../../utils/utils';
import { ResolverContext } from '../../../../types';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';

@Resolver()
export class DeleteFileTagResolver {
    @Mutation(() => Boolean, {
        deprecationReason: 'Use screenname to group files by folders instead.',
    })
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async deleteFileTag(
        @Ctx() context: ResolverContext,
        @Arg('tagId') tagId: string
    ): Promise<boolean> {
        const user = ensureAuthorizedUser(context);
        // 他人のFileTagならば、IDが一致していても取得していない
        const fileTagToDelete = await context.em.findOne(FileTag, { user, id: tagId });
        if (fileTagToDelete == null) {
            return false;
        }
        fileTagToDelete.files.getItems().forEach(x => context.em.remove(x));
        fileTagToDelete.files.removeAll();
        context.em.remove(fileTagToDelete);
        await context.em.flush();
        return true;
    }
}
