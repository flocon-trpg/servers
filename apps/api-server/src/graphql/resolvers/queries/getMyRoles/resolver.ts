import { Authorized, Ctx, Field, ObjectType, Query, Resolver } from 'type-graphql';
import { ADMIN, getRoles } from '../../../../utils/roles';
import { ResolverContext } from '../../../../types';
import { NotSignIn } from '../../utils/utils';

@ObjectType()
export class Roles {
    @Field()
    public admin!: boolean;
}

@Resolver()
export class GetMyRolesResolver {
    @Query(() => Roles, {
        description: 'since v0.7.2',
    })
    @Authorized()
    public async getMyRoles(@Ctx() context: ResolverContext): Promise<Roles> {
        const roles = getRoles({ context, isEntry: false });
        if (roles === NotSignIn) {
            throw new Error('This should not happen');
        }
        return {
            admin: roles.value.has(ADMIN),
        };
    }
}
