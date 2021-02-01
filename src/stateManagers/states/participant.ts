import { ParticipantFragment } from '../../generated/graphql';

export type State = Omit<ParticipantFragment, '__typename'>;