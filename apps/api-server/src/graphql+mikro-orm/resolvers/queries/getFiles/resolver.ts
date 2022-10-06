import {
    Arg,
    Authorized,
    Ctx,
    Field,
    InputType,
    ObjectType,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { FilePermissionType } from '../../../../enums/FilePermissionType';
import { ENTRY } from '../../../../roles';
import { FileItem } from '../../../entities/file/graphql';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { ResolverContext } from '../../../utils/Contexts';
import { File } from '../../../entities/file/mikro-orm';
import { FileListType } from '../../../../enums/FileListType';
import { ensureAuthorizedUser } from '../../utils';

@InputType()
class GetFilesInput {
    @Field(() => [String], {
        description:
            'FileTagのidを指定することで、指定したタグが付いているファイルのみを抽出して表示する。例えばidがx,yの3つのタグが付いているファイルは、[]や[x]や[x,y]と指定した場合にマッチするが、[x,y,z]と指定された場合は除外される。',
    })
    public fileTagIds!: string[];
}

@ObjectType()
class GetFilesResult {
    @Field(() => [FileItem])
    public files!: FileItem[];
}

@Resolver()
export class GetFilesResolver {
    @Query(() => GetFilesResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async getFiles(
        @Arg('input') input: GetFilesInput,
        @Ctx() context: ResolverContext
    ): Promise<GetFilesResult> {
        const user = ensureAuthorizedUser(context);
        const fileTagsFilter = input.fileTagIds.map(
            id =>
                ({
                    fileTags: {
                        id,
                    },
                } as const)
        );
        const files = await context.em.find(File, {
            $and: [
                ...fileTagsFilter,
                {
                    $or: [
                        { listPermission: FilePermissionType.Entry },
                        { createdBy: { userUid: user.userUid } },
                    ],
                },
            ],
        });
        return {
            files: files.map(file => ({
                ...file,
                screenname: file.screenname ?? 'null',
                createdBy: file.createdBy.userUid,
                createdAt: file.createdAt?.getTime(),
                listType:
                    file.listPermission === FilePermissionType.Private
                        ? FileListType.Unlisted
                        : FileListType.Public,
            })),
        };
    }
}
