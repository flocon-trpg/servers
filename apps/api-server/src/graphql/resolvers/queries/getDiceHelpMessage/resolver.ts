import { Arg, Query, Resolver } from 'type-graphql';
import { helpMessage } from '../../utils/messageAnalyzer';

@Resolver()
export class GetDiceHelpMessageResolver {
    @Query(() => String, { nullable: true })
    public async getDiceHelpMessage(@Arg('id') id: string): Promise<string | null> {
        return await helpMessage(id).catch(err => {
            if (err instanceof Error) {
                if (err.message === 'GameSystem is not found') {
                    return null;
                }
            }
            throw err;
        });
    }
}
