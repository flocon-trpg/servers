
import { ParticipantRole } from '../../../enums/ParticipantRole';
import { Participant as GraphQLParticipant } from './graphql';
import { Participant as MikroORMParticipant } from './mikro-orm';

export const toGraphQL = ({
    source,
    userUid
}: {
    source: { role: ParticipantRole; name: string };
    userUid: string;
}): { role: ParticipantRole; name: string; userUid: string } => {
    return { ...source, userUid };
};