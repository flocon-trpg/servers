/*
Participantとは、そのRoomに入っているユーザーのこと。通常は、Player、Spectatorなどのroleを持っている。
Participantのstateには、roleやname（その部屋でのユーザーの表示名）といったデータはもちろん、そのParticipantが作成したBoard、Characterなどのstateも保持される。
Board、Characterを保持するのがRoomなどではなくParticipantなのは、BoardやCharacterなどは作成者が誰かを保持する必要があり、キーがuserUidであるParticipantで保存するほうが都合がよく構成も綺麗になるため。
*/

// nameはJSONのあるエンティティとは別に保存される想定であるため、nameが見つからないもしくは一時的に取得できないという状況がありうる。そのため、maybeを付けており、TextOperationではなくReplaceOperationとして定義している。ReplaceOperationは文字数が多いと非効率化するため、maxLength100Stringとしている。

import * as t from 'io-ts';
import * as ReplaceOperation from '../../util/replaceOperation';
import { createOperation } from '../../util/createOperation';
import { record } from '../../util/record';
import {
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../../util/recordOperationElement';
import * as RecordOperation from '../../util/recordOperation';
import { Maybe, maybe } from '../../../maybe';
import * as Board from './board/types';
import * as Character from './character/types';
import * as ImagePieceValue from './imagePieceValue/types';
import { MaxLength100String, maxLength100String } from '../../../maxLengthString';

export const Player = 'Player';
export const Spectator = 'Spectator';
export const Master = 'Master';

const participantRole = t.union([t.literal(Player), t.literal(Spectator), t.literal(Master)]);
export type ParticipantRole = t.TypeOf<typeof participantRole>;

export const dbState = t.type({
    $v: t.literal(1),
    $r: t.literal(2),

    boards: record(t.string, Board.state),
    characters: record(t.string, Character.state),
    imagePieceValues: record(t.string, ImagePieceValue.state),
});

export type DbState = t.TypeOf<typeof dbState>;

export const dbStateRev1 = t.type({
    $v: t.literal(1),
    $r: t.literal(1),

    boards: record(t.string, Board.state),
    characters: record(t.string, Character.stateRev1),
    imagePieceValues: record(t.string, ImagePieceValue.state),
});

export type DbStateRev1 = t.TypeOf<typeof dbStateRev1>;

export const state = t.intersection([
    dbState,
    t.type({
        name: maybe(maxLength100String),
        role: maybe(participantRole),
    }),
]);

export type State = t.TypeOf<typeof state>;

export const stateRev1 = t.intersection([
    dbStateRev1,
    t.type({
        name: maybe(maxLength100String),
        role: maybe(participantRole),
    }),
]);

export type StateRev1 = t.TypeOf<typeof stateRev1>;

const downOperationBase = {
    name: t.type({ oldValue: maybe(maxLength100String) }),
    role: t.type({ oldValue: maybe(participantRole) }),

    boards: record(t.string, recordDownOperationElementFactory(Board.state, Board.downOperation)),
    imagePieceValues: record(
        t.string,
        recordDownOperationElementFactory(ImagePieceValue.state, ImagePieceValue.downOperation)
    ),
};

export const downOperation = createOperation(1, 2, {
    ...downOperationBase,
    characters: record(
        t.string,
        recordDownOperationElementFactory(Character.state, Character.downOperation)
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const downOperationRev1 = createOperation(1, 1, {
    ...downOperationBase,
    characters: record(
        t.string,
        recordDownOperationElementFactory(Character.state, Character.downOperationRev1)
    ),
});

export type DownOperationRev1 = t.TypeOf<typeof downOperationRev1>;

const upOperationBase = {
    name: t.type({ newValue: maybe(maxLength100String) }),
    role: t.type({ newValue: maybe(participantRole) }),

    boards: record(t.string, recordUpOperationElementFactory(Board.state, Board.upOperation)),
    imagePieceValues: record(
        t.string,
        recordUpOperationElementFactory(ImagePieceValue.state, ImagePieceValue.upOperation)
    ),
};

export const upOperation = createOperation(1, 2, {
    ...upOperationBase,
    characters: record(
        t.string,
        recordUpOperationElementFactory(Character.state, Character.upOperation)
    ),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export const upOperationRev1 = createOperation(1, 1, {
    ...upOperationBase,
    characters: record(
        t.string,
        recordUpOperationElementFactory(Character.state, Character.upOperationRev1)
    ),
});

export type UpOperationRev1 = t.TypeOf<typeof upOperationRev1>;

export type TwoWayOperation = {
    $v: 1;
    $r: 2;

    name?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<MaxLength100String>>;
    role?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<ParticipantRole>>;

    boards?: RecordOperation.RecordTwoWayOperation<Board.State, Board.TwoWayOperation>;
    characters?: RecordOperation.RecordTwoWayOperation<Character.State, Character.TwoWayOperation>;
    imagePieceValues?: RecordOperation.RecordTwoWayOperation<
        ImagePieceValue.State,
        ImagePieceValue.TwoWayOperation
    >;
};
