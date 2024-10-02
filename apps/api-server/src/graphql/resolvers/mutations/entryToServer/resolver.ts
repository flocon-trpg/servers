import { Arg, Ctx, Field, Mutation, ObjectType, Resolver, UseMiddleware } from 'type-graphql';
import { User } from '../../../../entities/user/entity';
import { BaasType } from '../../../../enums/BaasType';
import { EntryToServerResultType } from '../../../../enums/EntryToServerResultType';
import { ResolverContext } from '../../../../types';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { NotSignIn, checkSignIn, comparePassword } from '../../utils/utils';

@ObjectType()
class EntryToServerResult {
    @Field(() => EntryToServerResultType)
    public type!: EntryToServerResultType;
}

@Resolver()
export class EntryToServerResolver {
    @Mutation(() => EntryToServerResult)
    @UseMiddleware(QueueMiddleware)
    public async entryToServer(
        @Arg('password', () => String, { nullable: true }) password: string | null | undefined,
        @Ctx() context: ResolverContext,
    ): Promise<EntryToServerResult> {
        const em = context.em;

        const serverConfig = context.serverConfig;
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return {
                type: EntryToServerResultType.NotSignIn,
            };
        }

        let user = await em.findOne(User, { userUid: decodedIdToken.uid });
        if (user == null) {
            user = new User({ userUid: decodedIdToken.uid, baasType: BaasType.Firebase });
            user.isEntry = false;
            em.persist(user);
        }
        if (user.isEntry) {
            return {
                type: EntryToServerResultType.AlreadyEntried,
            };
        }
        if (serverConfig.entryPassword == null) {
            user.isEntry = true;
            await em.flush();
            return {
                type:
                    password == null
                        ? EntryToServerResultType.Success
                        : EntryToServerResultType.NoPasswordRequired,
            };
        }

        if (password == null || !(await comparePassword(password, serverConfig.entryPassword))) {
            return {
                type: EntryToServerResultType.WrongPassword,
            };
        }

        user.isEntry = true;
        await em.flush();
        return {
            type: EntryToServerResultType.Success,
        };
    }
}
