import { Args, Field, InputType, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { FileListType } from '../../../../enums/FileListType';
import { FilePermissionType } from '../../../../enums/FilePermissionType';
import { File } from '../../../../mikro-orm/entities/file/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { FileItem } from '../../../objects/fileItem';

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
    public constructor(private readonly mikroOrmService: MikroOrmService) {}

    @Query(() => GetFilesResult)
    @Auth(ENTRY)
    public async getFiles(
        @Args('input') input: GetFilesInput,
        @AuthData() auth: AuthDataType,
    ): Promise<GetFilesResult> {
        const em = await this.mikroOrmService.forkEmForMain();
        const userUid = auth.user.userUid;
        const fileTagsFilter = input.fileTagIds.map(
            id =>
                ({
                    fileTags: {
                        id,
                    },
                }) as const,
        );
        const files = await em.find(File, {
            $and: [
                ...fileTagsFilter,
                {
                    $or: [{ listPermission: FilePermissionType.Entry }, { createdBy: { userUid } }],
                },
            ],
        });
        const filePromises = files.map(async file => ({
            ...file,
            screenname: file.screenname ?? 'null',
            createdBy: await file.createdBy.loadProperty('userUid'),
            createdAt: file.createdAt?.getTime(),
            listType:
                file.listPermission === FilePermissionType.Private
                    ? FileListType.Unlisted
                    : FileListType.Public,
        }));
        return {
            files: await Promise.all(filePromises),
        };
    }
}
