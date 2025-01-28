import { ref } from '@mikro-orm/core';
import { Args, Field, Mutation, ObjectType, Resolver } from '@nestjs/graphql';
import e from 'express';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { FileTag as FileTagEntity } from '../../../../mikro-orm/entities/fileTag/entity';
import { User } from '../../../../mikro-orm/entities/user/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';

@ObjectType()
export class FileTag {
    @Field()
    public id!: string;

    @Field()
    public name!: string;
}

@Resolver(() => FileTag)
export class CreateFileTagResolver {
    public constructor(private readonly mikroOrmService: MikroOrmService) {}

    @Mutation(() => FileTag, {
        nullable: true,
        deprecationReason: 'Use screenname to group files by folders instead.',
    })
    @Auth(ENTRY)
    public async createFileTag(
        @Args('tagName') tagName: string,
        @AuthData() auth: AuthDataType,
    ): Promise<FileTag | null> {
        const maxTagsCount = 10;

        const em = await this.mikroOrmService.forkEmForMain();
        const user = auth.user;
        const tagsCount = await em.count(FileTagEntity, { user: { userUid: user.userUid } });
        if (maxTagsCount <= tagsCount) {
            return null;
        }
        const newFileTag = em.create(FileTagEntity, {
            name: tagName,
            // HACK: mikro-orm では本来 entity の id のみで構わないが、テストが失敗するので User を find している。詳細は User クラスのコメントを参照。
            user: await em.findOneOrFail(User, { userUid: user.userUid }),
        });
        // `em.create` calls `em.persist` automatically, so flush is enough - https://mikro-orm.io/docs/guide/relationships#creating-entity-graph
        await em.flush();
        return {
            id: newFileTag.id,
            name: newFileTag.name,
        };
    }
}
