// Participantとは、そのRoomに入っているユーザーのこと。通常は、Player、Spectatorなどのroleを持っている。

// nameはJSONのあるエンティティとは別に保存される想定であるため、nameが見つからないもしくは一時的に取得できないという状況がありうる。そのため、maybeを付けており、TextOperationではなくReplaceOperationとして定義している。ReplaceOperationは文字数が多いと非効率化するため、maxLength100Stringとしている。

import * as t from 'io-ts';
import * as ReplaceOperation from '../../util/replaceOperation';
import { createOperation } from '../../util/createOperation';
import { Maybe, maybe } from '../../../maybe';
import { MaxLength100String, maxLength100String } from '../../../maxLengthString';

export const Player = 'Player';
export const Spectator = 'Spectator';
export const Master = 'Master';

const participantRole = t.union([t.literal(Player), t.literal(Spectator), t.literal(Master)]);
export type ParticipantRole = t.TypeOf<typeof participantRole>;

export const dbState = t.type({
    $v: t.literal(2),
    $r: t.literal(1),
    name: maybe(maxLength100String),
    role: maybe(participantRole),
});

export type DbState = t.TypeOf<typeof dbState>;

export const state = dbState;
export type State = DbState;

export const downOperation = createOperation(2, 1, {
    name: t.type({ oldValue: maybe(maxLength100String) }),
    role: t.type({ oldValue: maybe(participantRole) }),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(2, 1, {
    name: t.type({ newValue: maybe(maxLength100String) }),
    role: t.type({ newValue: maybe(participantRole) }),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 2;
    $r: 1;

    name?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<MaxLength100String>>;
    role?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<ParticipantRole>>;
};
