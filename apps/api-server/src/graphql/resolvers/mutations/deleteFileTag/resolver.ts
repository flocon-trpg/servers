import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { FileTag } from '../../../../mikro-orm/entities/fileTag/entity';
import { User } from '../../../../mikro-orm/entities/user/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';

@Resolver(() => Boolean)
export class DeleteFileTagResolver {
    public constructor(private readonly mikroOrmService: MikroOrmService) {}

    @Mutation(() => Boolean, {
        deprecationReason: 'Use screenname to group files by folders instead.',
    })
    @Auth(ENTRY)
    public async deleteFileTag(
        @Args('tagId') tagId: string,
        @AuthData() auth: AuthDataType,
    ): Promise<boolean> {
        const em = await this.mikroOrmService.forkEmForMain();
        const user = await em.findOneOrFail(User, { userUid: auth.user.userUid });
        // 他人のFileTagならば、IDが一致していても取得していない
        const fileTagToDelete = await em.findOne(FileTag, { user, id: tagId });
        if (fileTagToDelete == null) {
            return false;
        }
        fileTagToDelete.files.getItems().forEach(x => em.remove(x));
        fileTagToDelete.files.removeAll();
        em.remove(fileTagToDelete);
        await em.flush();
        return true;
    }
}
