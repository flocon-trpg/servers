import {
    Arg,
    Authorized,
    Ctx,
    Field,
    InputType,
    Mutation,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { ENTRY } from '../../../../roles';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { ResolverContext } from '../../../utils/Contexts';
import { File } from '../../../entities/file/mikro-orm';
import { FilePermissionType } from '../../../../enums/FilePermissionType';
import { ensureAuthorizedUser } from '../../utils';

@InputType()
class RenameFileInput {
    @Field()
    public filename!: string;

    @Field()
    public newScreenname!: string;
}

@Resolver()
export class RenameFilesResolver {
    @Mutation(() => [String])
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async renameFiles(
        @Arg('input', () => [RenameFileInput]) input: RenameFileInput[],
        @Ctx() context: ResolverContext
    ): Promise<string[]> {
        const result: string[] = [];
        const user = ensureAuthorizedUser(context);
        for (const elem of input) {
            const file = await context.em.findOne(File, { filename: elem.filename });
            if (file == null) {
                continue;
            }
            if (
                file.createdBy.userUid !== user.userUid &&
                file.renamePermission !== FilePermissionType.Entry
            ) {
                continue;
            }
            file.screenname = elem.newScreenname;
            result.push(elem.filename);
        }
        await context.em.flush();
        return result;
    }
}
