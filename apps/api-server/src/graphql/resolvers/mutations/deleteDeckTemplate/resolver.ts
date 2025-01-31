import { Args, ArgsType, Field, Mutation, Resolver } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { PermissionType } from '../../../../enums/PermissionType';
import { DeckTemplate as DeckTemplateEntity } from '../../../../mikro-orm/entities/deckTemplate/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';

@ArgsType()
class DeleteCustomDeckTemplateArgs {
    @Field()
    public deckTemplateId!: string;
}

@Resolver()
export class DeleteCustomDeckTemplateResolver {
    public constructor(private readonly mikroOrmService: MikroOrmService) {}

    @Mutation(() => Boolean)
    @Auth(ENTRY)
    public async deleteDeckTemplate(
        @Args() args: DeleteCustomDeckTemplateArgs,
        @AuthData() auth: AuthDataType,
    ): Promise<boolean> {
        const em = await this.mikroOrmService.forkEmForMain();
        const found = await em.findOne(DeckTemplateEntity, {
            id: args.deckTemplateId,
            $or: [
                { createdBy: { userUid: auth.user.userUid } },
                { deletePermission: PermissionType.Entry },
            ],
        });
        if (found == null) {
            return false;
        }
        await em.removeAndFlush(found);
        return true;
    }
}
