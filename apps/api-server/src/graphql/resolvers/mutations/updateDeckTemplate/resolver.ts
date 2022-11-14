import { deckTemplateTemplate, state } from '@flocon-trpg/core';
import {
    Args,
    ArgsType,
    Authorized,
    Ctx,
    Field,
    Mutation,
    ObjectType,
    Resolver,
    UseMiddleware,
    createUnionType,
} from 'type-graphql';
import { DeckTemplate as DeckTemplateEntity } from '../../../../entities/deckTemplate/entity';
import { ResolverContext } from '../../../../types';
import { ENTRY } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { DeckTemplate as DeckTemplateObject } from '../../../objects/deckTemplate';
import { ensureAuthorizedUser } from '../../utils/utils';
import { PermissionType } from '@/enums/PermissionType';
import { UpdateDeckTemplateFailureType } from '@/enums/UpdateDeckTemplateFailureType';

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
    @Mutation(() => UpdateDeckTemplateResult)
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async updateDeckTemplate(
        @Args() args: UpdateDeckTemplateArgs,
        @Ctx() context: ResolverContext
    ): Promise<typeof UpdateDeckTemplateResult> {
        const user = ensureAuthorizedUser(context);
        const decoded = state(deckTemplateTemplate, { exact: true }).decode(args.valueJson);
        if (decoded._tag === 'Left') {
            throw new Error('valueJson could not be decoded.');
        }
        const em = context.em.fork();
        const found = await em.findOne(DeckTemplateEntity, {
            id: args.deckTemplateId,
            $or: [{ createdBy: user }, { updatePermission: PermissionType.Entry }],
        });
        if (found == null) {
            return {
                failureType: UpdateDeckTemplateFailureType.NotFound,
            };
        }
        found.value = decoded.right;
        await em.flush();
        return {
            currentValue: {
                id: found.id,
                valueJson: JSON.stringify(decoded.right),
                listPermission: found.listPermission,
                deletePermission: found.deletePermission,
                updatePermission: found.updatePermission,
            },
        };
    }
}
