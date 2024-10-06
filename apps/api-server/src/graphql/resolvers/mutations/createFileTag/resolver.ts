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
import { FileTag as FileTagEntity } from '../../../../entities/fileTag/entity';
import { ResolverContext } from '../../../../types';
import { ENTRY } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { ensureAuthorizedUser } from '../../utils/utils';

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
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async createFileTag(
        @Ctx() context: ResolverContext,
        @Arg('tagName') tagName: string,
    ): Promise<FileTag | null> {
        const maxTagsCount = 10;

        const user = ensureAuthorizedUser(context);
        const tagsCount = await context.em.count(FileTagEntity, { user });
        if (maxTagsCount <= tagsCount) {
            return null;
        }
        const newFileTag = context.em.create(FileTagEntity, { name: tagName, user: user });
        await context.em.persistAndFlush(newFileTag);
        return {
            id: newFileTag.id,
            name: newFileTag.name,
        };
    }
}
