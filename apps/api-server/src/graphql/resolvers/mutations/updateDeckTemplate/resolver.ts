import { deckTemplateTemplate, state } from '@flocon-trpg/core';
import {
    Args,
    ArgsType,
    Field,
    Mutation,
    ObjectType,
    Resolver,
    createUnionType,
} from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { PermissionType } from '../../../../enums/PermissionType';
import { UpdateDeckTemplateFailureType } from '../../../../enums/UpdateDeckTemplateFailureType';
import { DeckTemplate as DeckTemplateEntity } from '../../../../mikro-orm/entities/deckTemplate/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { CustomDeckTemplate as DeckTemplateObject } from '../../../objects/customDeckTemplate';

@ArgsType()
class UpdateDeckTemplateArgs {
    @Field({
        description:
            'DeckTemplateのState。@flocon-trpg/coreのstate(deckTemplateTemplate).decode(...)でdecodeできる。',
    })
    public valueJson!: string;

    @Field()
    public deckTemplateId!: string;
}

@ObjectType()
class UpdateDeckTemplateSuccessResult {
    @Field(() => DeckTemplateObject)
    public currentValue!: DeckTemplateObject;
}

@ObjectType()
class UpdateDeckTemplateFailureResult {
    @Field(() => UpdateDeckTemplateFailureType)
    public failureType!: UpdateDeckTemplateFailureType;
}

const UpdateDeckTemplateResult = createUnionType({
    name: 'UpdateDeckTemplateResult',
    types: () => [UpdateDeckTemplateSuccessResult, UpdateDeckTemplateFailureResult] as const,
    resolveType: value => {
        if ('currentValue' in value) {
            return UpdateDeckTemplateSuccessResult;
        }
        if ('failureType' in value) {
            return UpdateDeckTemplateFailureResult;
        }
        return undefined;
    },
});

@Resolver()
export class UpdateDeckTemplateResolver {
    public constructor(private readonly mikroOrmService: MikroOrmService) {}

    @Mutation(() => UpdateDeckTemplateResult)
    @Auth(ENTRY)
    public async updateDeckTemplate(
        @Args() args: UpdateDeckTemplateArgs,
        @AuthData() auth: AuthDataType,
    ): Promise<typeof UpdateDeckTemplateResult> {
        const decoded = state(deckTemplateTemplate).safeParse(args.valueJson);
        if (!decoded.success) {
            throw new Error(decoded.error.message);
        }
        const em = await this.mikroOrmService.forkEmForMain();
        const found = await em.findOne(DeckTemplateEntity, {
            id: args.deckTemplateId,
            $or: [
                { createdBy: { userUid: auth.user.userUid } },
                { updatePermission: PermissionType.Entry },
            ],
        });
        if (found == null) {
            return {
                failureType: UpdateDeckTemplateFailureType.NotFound,
            };
        }
        found.value = decoded.data;
        await em.flush();
        return {
            currentValue: {
                id: found.id,
                valueJson: JSON.stringify(decoded.data),
                listPermission: found.listPermission,
                deletePermission: found.deletePermission,
                updatePermission: found.updatePermission,
            },
        };
    }
}
