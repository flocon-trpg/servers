import { DualKeyMap } from '@flocon-trpg/utils';
import { Args, Field, InputType, Mutation, Resolver } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { File } from '../../../../mikro-orm/entities/file/entity';
import { FileTag } from '../../../../mikro-orm/entities/fileTag/entity';
import { User } from '../../../../mikro-orm/entities/user/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';

// addとremoveは、fileTagのidを指定することでそのタグが追加/削除される。
@InputType()
class EditFileTagActionInput {
    @Field()
    public filename!: string;

    @Field(() => [String])
    public add!: string[];

    @Field(() => [String])
    public remove!: string[];
}

@InputType()
class EditFileTagsInput {
    @Field(() => [EditFileTagActionInput])
    public actions!: EditFileTagActionInput[];
}

@Resolver(() => Boolean)
export class EditFileTagsResolver {
    public constructor(private readonly mikroOrmService: MikroOrmService) {}

    @Mutation(() => Boolean, {
        deprecationReason: 'Use screenname to group files by folders instead.',
    })
    @Auth(ENTRY)
    public async editFileTags(
        @Args('input') input: EditFileTagsInput,
        @AuthData() auth: AuthDataType,
    ): Promise<boolean> {
        const em = await this.mikroOrmService.forkEmForMain();
        const map = new DualKeyMap<string, string, number>();
        input.actions.forEach(action => {
            action.add.forEach(a => {
                const value = map.get({ first: action.filename, second: a });
                map.set({ first: action.filename, second: a }, (value ?? 0) + 1);
            });
            action.remove.forEach(r => {
                const value = map.get({ first: action.filename, second: r });
                map.set({ first: action.filename, second: r }, (value ?? 0) - 1);
            });
        });
        for (const [filename, actions] of map.toMap()) {
            let fileEntity: File | null = null;
            for (const [fileTagId, action] of actions) {
                if (action === 0) {
                    continue;
                }
                if (fileEntity == null) {
                    fileEntity = await em.findOne(File, {
                        filename,
                        createdBy: { userUid: auth.user.userUid },
                    });
                }
                if (fileEntity == null) {
                    break;
                }
                const fileTag = await em.findOne(FileTag, { id: fileTagId });
                if (fileTag == null) {
                    continue;
                }
                if (0 < action) {
                    fileEntity.fileTags.add(fileTag);
                    fileTag.files.add(fileEntity);
                } else {
                    fileEntity.fileTags.remove(fileTag);
                    fileTag.files.remove(fileEntity);
                }
            }
        }
        await em.flush();
        return true;
    }
}
