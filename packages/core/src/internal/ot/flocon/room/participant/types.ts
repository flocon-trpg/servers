// Participantとは、そのRoomに入っているユーザーのこと。通常は、Player、Spectatorなどのroleを持っている。

// nameはJSONのあるエンティティとは別に保存される想定であるため、nameが見つからないもしくは一時的に取得できないという状況がありうる。そのため、maybeを付けており、TextOperationではなくReplaceOperationとして定義している。ReplaceOperationは文字数が多いと非効率化するため、maxLength100Stringとしている。

import { z } from 'zod';
import { maxLength100String } from '../../../../maxLengthString';
import { maybe } from '../../../../maybe';
import { createObjectValueTemplate, createReplaceValueTemplate } from '../../../generator/types';

export const Player = 'Player';
export const Spectator = 'Spectator';
export const Master = 'Master';

const participantRole = z.union([z.literal(Player), z.literal(Spectator), z.literal(Master)]);
export type ParticipantRole = z.TypeOf<typeof participantRole>;

export const template = createObjectValueTemplate(
    {
        name: createReplaceValueTemplate(maybe(maxLength100String)),
        role: createReplaceValueTemplate(maybe(participantRole)),
    },
    2,
    1
);
