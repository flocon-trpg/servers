import { Reference } from '@mikro-orm/core';
import {
    Arg,
    Authorized,
    Ctx,
    Field,
    Mutation,
    ObjectType,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { ENTRY } from '../../../../roles';
import { FileTag as FileTagEntity } from '../../../entities/fileTag/mikro-orm';
import { User } from '../../../entities/user/mikro-orm';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { ResolverContext } from '../../../utils/Contexts';
import { ensureAuthorizedUser } from '../../utils';

@ObjectType()
export class FileTag {
    @Field()
    public id!: string;

    @Field()
    public name!: string;
}

@Resolver()
export class CreateFileTagResolver {
    @Mutation(() => FileTag, {
        nullable: true,
        deprecationReason: 'Use screenname to group files by folders instead.',
    })
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async createFileTag(
        @Ctx() context: ResolverContext,
        @Arg('tagName') tagName: string
    ): Promise<FileTag | null> {
        const maxTagsCount = 10;

        const user = ensureAuthorizedUser(context);
        const tagsCount = await context.em.count(FileTagEntity, { user });
        if (maxTagsCount <= tagsCount) {
            return null;
        }
        const newFileTag = new FileTagEntity({ name: tagName });
        newFileTag.name = tagName;
        newFileTag.user = Reference.create<User, 'userUid'>(user);
        await context.em.persistAndFlush(newFileTag);
        return {
            id: newFileTag.id,
            name: newFileTag.name,
        };
    }
}
