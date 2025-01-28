import { Args, Field, Mutation, ObjectType, Resolver } from '@nestjs/graphql';
import { AuthStatus } from '../../../../auth/auth-status.decorator';
import { AuthStatusData, AuthStatusDataType } from '../../../../auth/auth.guard';
import { BaasType } from '../../../../enums/BaasType';
import { EntryToServerResultType } from '../../../../enums/EntryToServerResultType';
import { User } from '../../../../mikro-orm/entities/user/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { ServerConfigService } from '../../../../server-config/server-config.service';
import { comparePassword } from '../../utils/utils';

@ObjectType()
class EntryToServerResult {
    @Field(() => EntryToServerResultType)
    public type!: EntryToServerResultType;
}

@Resolver(() => EntryToServerResult)
export class EntryWithPasswordResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly serverConfigService: ServerConfigService,
    ) {}

    // ENTRY 以上の権限が必要な GraphQL の operation を実行する場合は、事前にこの mutation を実行して entry してもらう必要がある。
    // 当初は「そのような operation が実行されるとき、entryPassword が設定されていない場合は entryToServer mutation を事前に実行していなくても自動的に entry される」という仕様にすることも考えたが、それは却下した。理由は、その仕様の場合は「User を find して、存在しなかったら User を INSERT する」というクリティカルセクションが存在することになるため、タイミングによっては User の INSERT 等でエラーが発生する可能性がある。データ不整合はおそらく起こらないためクライアント側はもしかすると許容可能な範囲内かもしれないが、E2E テストのときに問題になる。
    @AuthStatus(true)
    @Mutation(() => EntryToServerResult, {
        description:
            'エントリーを試みます。エントリーパスワードが設定されている場合は password を渡す必要があります。エントリーしているかどうかの確認にも用いることができ、その際は password は渡す必要はありません。',
    })
    public async entryToServer(
        @Args('password', { type: () => String, nullable: true })
        password: string | null | undefined,
        @AuthStatusData() authStatus: AuthStatusDataType,
    ): Promise<EntryToServerResult> {
        if (authStatus.isError) {
            throw authStatus.error;
        }
        const em = await this.mikroOrmService.forkEmForMain();
        const user = authStatus.value.user;
        let userEntity: User;
        if (user == null) {
            // `em.create` calls `em.persist` automatically - https://mikro-orm.io/docs/guide/relationships#creating-entity-graph
            userEntity = em.create(User, {
                userUid: authStatus.value.userUid,
                baasType: BaasType.Firebase,
                isEntry: false,
            });
        } else {
            if (user.isEntry) {
                return {
                    type: EntryToServerResultType.AlreadyEntried,
                };
            }
            // AuthGuard によって該当する User が存在することが保証されているので、通常は fail することはない。ただし、Flocon の API サーバーの非同期処理はほとんど排他制御を行っていないので、もし User を削除するコードがどこかにある場合はタイミングによっては fail する可能性があるが、それは許容している。
            userEntity = await em.findOneOrFail(User, { userUid: user.userUid });
        }

        const serverConfig = this.serverConfigService.getValueForce();
        if (serverConfig.entryPassword == null) {
            if (!userEntity.isEntry) {
                userEntity.isEntry = true;
                await em.flush();
            }
            return {
                type: EntryToServerResultType.Success,
            };
        }

        if (password == null) {
            return {
                type: EntryToServerResultType.PasswordRequired,
            };
        }
        if (!(await comparePassword(password, serverConfig.entryPassword))) {
            return {
                type: EntryToServerResultType.WrongPassword,
            };
        }

        userEntity.isEntry = true;
        await em.flush();
        return {
            type: EntryToServerResultType.Success,
        };
    }
}
