import { Field, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { Auth, LOGIN } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { ServerConfigService } from '../../../../server-config/server-config.service';

@ObjectType()
export class Roles {
    @Field()
    public admin!: boolean;
}

@Resolver()
export class GetMyRolesResolver {
    public constructor(private readonly serverConfigService: ServerConfigService) {}

    @Query(() => Roles, {
        description: 'since v0.7.2',
    })
    @Auth(LOGIN)
    public async getMyRoles(@AuthData() auth: AuthDataType): Promise<Roles> {
        return {
            admin: this.serverConfigService.getValueForce().admins.includes(auth.user.userUid),
        };
    }
}
