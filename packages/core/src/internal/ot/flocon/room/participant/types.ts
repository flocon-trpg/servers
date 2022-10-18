// Participantとは、そのRoomに入っているユーザーのこと。通常は、Player、Spectatorなどのroleを持っている。

// nameはJSONのあるエンティティとは別に保存される想定であるため、nameが見つからないもしくは一時的に取得できないという状況がありうる。そのため、maybeを付けており、TextOperationではなくReplaceOperationとして定義している。ReplaceOperationは文字数が多いと非効率化するため、maxLength100Stringとしている。

import * as t from 'io-ts';
import { maxLength100String } from '../../../../maxLengthString';
import { maybe } from '../../../../maybe';
import { createObjectValueTemplate, createReplaceValueTemplate } from '../../../generator';

export const Player = 'Player';
export const Spectator = 'Spectator';
export const Master = 'Master';

const participantRole = t.union([t.literal(Player), t.literal(Spectator), t.literal(Master)]);
export type ParticipantRole = t.TypeOf<typeof participantRole>;

export const template = createObjectValueTemplate(
    {
        name: createReplaceValueTemplate(maybe(maxLength100String)),
        role: createReplaceValueTemplate(maybe(participantRole)),
    },
    2,
    1
);
