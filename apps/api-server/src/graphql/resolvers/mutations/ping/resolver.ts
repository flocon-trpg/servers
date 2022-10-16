import { Arg, Ctx, Mutation, PubSub, PubSubEngine, Resolver } from 'type-graphql';
import { ResolverContext } from '../../../../types';
import { Pong } from '../../../objects/pong';
import { PongPayload } from '../../subsciptions/pong/payload';
import { PONG } from '../../subsciptions/pong/topics';

@Resolver()
export class PingResolver {
    @Mutation(() => Pong, { description: 'for test' })
    public async ping(
        @Arg('value') value: number,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<Pong> {
        const createdBy =
            context.decodedIdToken?.isError === false
                ? context.decodedIdToken.value.uid
                : undefined;
        const payload: PongPayload = { value, createdBy };
        await pubSub.publish(PONG, payload);
        return payload;
    }
}
