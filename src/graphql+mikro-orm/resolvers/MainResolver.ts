import { Arg, Ctx, Mutation, PubSub, PubSubEngine, Resolver, Root, Subscription } from 'type-graphql';
import { ResolverContext } from '../utils/Contexts';
import { EntryToServerResultType } from '../../enums/EntryToServerResultType';
import { checkSignIn, NotSignIn } from './utils/helpers';
import { queueLimitReached } from '../../utils/PromiseQueue';
import { serverTooBusyMessage } from './utils/messages';
import { User } from '../entities/user/mikro-orm';
import { Pong } from '../entities/pong/graphql';
import { PONG } from '../utils/Topics';
import { loadServerConfigAsMain } from '../../config';
import { EntryToServerResult } from '../results/EntryToServerResult';


export type PongPayload = {
    value: number;
    createdBy?: string;
}

@Resolver()
export class MainResolver {
    @Mutation(() => EntryToServerResult)
    async entryToServer(@Arg('phrase', () => String ,{ nullable: true }) phrase: string | null | undefined, @Ctx() context: ResolverContext): Promise<EntryToServerResult> {
        const queue = async () => {
            const em = context.createEm();

            const globalEntryPhrase = loadServerConfigAsMain().globalEntryPhrase;
            const decodedIdToken = checkSignIn(context);
            if (decodedIdToken === NotSignIn) {
                return {
                    type: EntryToServerResultType.NotSignIn
                };
            }

            let user = await em.findOne(User, { userUid: decodedIdToken.uid });
            if (user == null) {
                user = new User({ userUid: decodedIdToken.uid });
                user.isEntry = false;
                em.persist(user);
            }
            if (user.isEntry) {
                return {
                    type: EntryToServerResultType.AlreadyEntried,
                };
            }
            if (globalEntryPhrase == null) {
                user.isEntry = true;
                await em.flush();
                return {
                    type: phrase == null ? EntryToServerResultType.Success : EntryToServerResultType.NoPhraseRequired,
                };
            }

            if (phrase !== globalEntryPhrase) {
                return {
                    type: EntryToServerResultType.WrongPhrase,
                };
            }

            user.isEntry = true;
            await em.flush();
            return {
                type: EntryToServerResultType.Success,
            };
        };

        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        return result.value;
    }

    @Mutation(() => Pong, { description: 'for test' })
    public async ping(@Arg('value') value: number, @Ctx() context: ResolverContext, @PubSub() pubSub: PubSubEngine): Promise<Pong> {
        const createdBy = context.decodedIdToken?.isError === false ? context.decodedIdToken.value.uid : undefined;
        const payload: PongPayload = { value, createdBy };
        pubSub.publish(PONG, payload);
        return payload;
    }

    @Subscription(() => Pong, { topics: PONG, description: 'for test' })
    public pong(@Root() payload: PongPayload): Pong {
        return payload;
    }
}