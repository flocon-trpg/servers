import { Args, Field, InputType, Mutation, Resolver } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { FilePermissionType } from '../../../../enums/FilePermissionType';
import { File } from '../../../../mikro-orm/entities/file/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';

@InputType()
class RenameFileInput {
    @Field()
    public filename!: string;

    @Field()
    public newScreenname!: string;
}

@Resolver(() => [String])
export class RenameFilesResolver {
    public constructor(private readonly mikroOrmService: MikroOrmService) {}

    @Mutation(() => [String])
    @Auth(ENTRY)
    public async renameFiles(
        @Args('input', { type: () => [RenameFileInput] }) input: RenameFileInput[],
        @AuthData() auth: AuthDataType,
    ): Promise<string[]> {
        const em = await this.mikroOrmService.forkEmForMain();
        const result: string[] = [];
        const userUid = auth.user.userUid;
        for (const elem of input) {
            const file = await em.findOne(File, { filename: elem.filename });
            if (file == null) {
                continue;
            }
            const createdByUserUid = await file.createdBy.loadProperty('userUid');
            if (
                createdByUserUid !== userUid &&
                file.renamePermission !== FilePermissionType.Entry
            ) {
                continue;
            }
            file.screenname = elem.newScreenname;
            result.push(elem.filename);
        }
        await em.flush();
        return result;
    }
}
