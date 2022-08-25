import { deckTemplateTemplate, state } from '@flocon-trpg/core';
import { Reference } from '@mikro-orm/core';
import {
    Args,
    ArgsType,
    Authorized,
    Ctx,
    Field,
    Mutation,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { DeckTemplate as DeckTemplateEntity } from '../../../../entities/deckTemplate/entity';
import { User } from '../../../../entities/user/entity';
import { PermissionType } from '../../../../enums/PermissionType';
import { ResolverContext } from '../../../../types';
import { ENTRY } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { DeckTemplate as DeckTemplateObject } from '../../../objects/deckTemplate';
import { ensureAuthorizedUser } from '../../utils/utils';

@ArgsType()
class CreateDeckTemplateArgs {
    @Field({
        description:
            'DeckTemplateのState。@flocon-trpg/coreのstate(deckTemplateTemplate).decode(...)でdecodeできる。',
    })
    public valueJson!: string;
}

@Resolver()
export class CreateDeckTemplateResolver {
    @Mutation(() => DeckTemplateObject)
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async createDeckTemplate(
        @Args() args: CreateDeckTemplateArgs,
        @Ctx() context: ResolverContext
    ): Promise<DeckTemplateObject> {
        const user = ensureAuthorizedUser(context);
        const decoded = state(deckTemplateTemplate, { exact: true }).decode(args.valueJson);
        if (decoded._tag === 'Left') {
            throw new Error('valueJson could not be decoded.');
        }
        const em = context.em.fork();
        const listPermission = PermissionType.Entry;
        const deletePermission = PermissionType.Private;
        const updatePermission = PermissionType.Private;
        const newEntity = new DeckTemplateEntity({
            createdBy: Reference.create<User, 'userUid'>(user),
            value: decoded.right,
            listPermission,
            deletePermission,
            updatePermission,
        });
        await em.persistAndFlush(newEntity);
        return {
            id: newEntity.id,
            valueJson: JSON.stringify(decoded.right),
            listPermission,
            deletePermission,
            updatePermission,
        };
    }
}
