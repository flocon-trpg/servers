import { deckTemplateTemplate, state } from '@flocon-trpg/core';
import { Reference } from '@mikro-orm/core';
import { Args, ArgsType, Field, Mutation, Resolver } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { PermissionType } from '../../../../enums/PermissionType';
import { DeckTemplate as DeckTemplateEntity } from '../../../../mikro-orm/entities/deckTemplate/entity';
import { User } from '../../../../mikro-orm/entities/user/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { CustomDeckTemplate } from '../../../objects/customDeckTemplate';

@ArgsType()
class CreateCustomDeckTemplateArgs {
    @Field({
        description:
            'DeckTemplateのState。@flocon-trpg/coreのstate(deckTemplateTemplate).parse(...)でdecodeできる。',
    })
    public valueJson!: string;
}

@Resolver()
export class CreateCustomDeckTemplateResolver {
    public constructor(private readonly mikroOrmService: MikroOrmService) {}

    @Mutation(() => CustomDeckTemplate)
    @Auth(ENTRY)
    public async createCustomDeckTemplate(
        @Args() args: CreateCustomDeckTemplateArgs,
        @AuthData() auth: AuthDataType,
    ): Promise<CustomDeckTemplate> {
        const decoded = state(deckTemplateTemplate).safeParse(args.valueJson);
        if (!decoded.success) {
            throw new Error(decoded.error.message);
        }
        const em = await this.mikroOrmService.forkEmForMain();
        const listPermission = PermissionType.Entry;
        const deletePermission = PermissionType.Private;
        const updatePermission = PermissionType.Private;
        const newEntity = new DeckTemplateEntity({
            createdBy: Reference.createFromPK(User, [auth.user.userUid]),
            value: decoded.data,
            listPermission,
            deletePermission,
            updatePermission,
        });
        await em.persistAndFlush(newEntity);
        return {
            id: newEntity.id,
            valueJson: JSON.stringify(decoded.data),
            listPermission,
            deletePermission,
            updatePermission,
        };
    }
}
