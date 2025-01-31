import { Args, ArgsType, Field, Query, Resolver } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { DeckTemplate as DeckTemplateEntity } from '../../../../mikro-orm/entities/deckTemplate/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { CustomDeckTemplate } from '../../../objects/customDeckTemplate';

@ArgsType()
class GetCustomDeckTemplateArgs {
    @Field()
    public id!: string;
}

@Resolver()
export class GetCustomDeckTemplateResolver {
    public constructor(private readonly mikroOrmService: MikroOrmService) {}

    @Query(() => CustomDeckTemplate, { nullable: true })
    @Auth(ENTRY)
    public async getCustomDeckTemplate(
        @Args() args: GetCustomDeckTemplateArgs,
    ): Promise<CustomDeckTemplate | null> {
        const em = await this.mikroOrmService.forkEmForMain();

        const entity = await em.findOne(DeckTemplateEntity, {
            id: args.id,
        });
        if (entity == null) {
            return null;
        }
        return {
            ...entity,
            createdAt: entity.createdAt?.getTime(),
            valueJson: JSON.stringify(entity.value),
        };
    }
}
