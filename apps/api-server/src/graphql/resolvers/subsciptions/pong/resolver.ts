import { Resolver, Root, Subscription } from 'type-graphql';
import { Pong } from '../../../objects/pong';
import { PongPayload } from './payload';
import { PONG } from './topics';

@Resolver()
export class PongResolver {
    @Subscription(() => Pong, { topics: PONG, description: 'for test' })
    public pong(@Root() payload: PongPayload): Pong {
        return payload;
    }
}
