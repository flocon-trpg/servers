import { Resolver, Root, Subscription } from 'type-graphql';
import { Pong } from '../../../objects/pong';
import { PongPayload } from './payload';
import { PONG } from './topics';

@Resolver()
export class PongResolver {
    @Subscription(() => Pong, {
        topics: PONG,
        description:
            'GraphQL の動作テストに用いられます。3rd-party の Web サーバーを作成する際は利用しなくて構いません。',
    })
    public pong(@Root() payload: PongPayload): Pong {
        return payload;
    }
}
