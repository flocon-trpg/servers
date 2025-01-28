import { Args, Query, Resolver } from '@nestjs/graphql';
import { helpMessage } from '../../utils/messageAnalyzer';

@Resolver()
export class GetDiceHelpMessageResolver {
    @Query(() => String, { nullable: true })
    public async getDiceHelpMessage(
        @Args('gameSystemId') gameSystemId: string,
    ): Promise<string | null> {
        return await helpMessage(gameSystemId).catch(err => {
            if (err instanceof Error) {
                if (err.message === 'GameSystem is not found') {
                    return null;
                }
            }
            throw err;
        });
    }
}
