import { DualKeyMap } from '@flocon-trpg/utils';
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
import { ENTRY } from '../../../../utils/roles';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { File } from '../../../../entities/file/entity';
import { FileTag } from '../../../../entities/fileTag/entity';
import { ensureAuthorizedUser } from '../../utils/utils';
import { ResolverContext } from '../../../../types';

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

@Resolver()
export class EditFileTagsResolver {
    @Mutation(() => Boolean, {
        deprecationReason: 'Use screenname to group files by folders instead.',
    })
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async editFileTags(
        @Arg('input') input: EditFileTagsInput,
        @Ctx() context: ResolverContext
    ): Promise<boolean> {
        const user = ensureAuthorizedUser(context);
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
                    fileEntity = await context.em.findOne(File, {
                        filename,
                        createdBy: { userUid: user.userUid },
                    });
                }
                if (fileEntity == null) {
                    break;
                }
                const fileTag = await context.em.findOne(FileTag, { id: fileTagId });
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
        await context.em.flush();
        return true;
    }
}
