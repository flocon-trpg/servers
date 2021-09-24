/*
Participantとは、そのRoomに入っているユーザーのこと。通常は、Player、Spectatorなどのroleを持っている。
Participantのstateには、roleやname（その部屋でのユーザーの表示名）といったデータはもちろん、そのParticipantが作成したBoard、Characterなどのstateも保持される。
Board、Characterを保持するのがRoomなどではなくParticipantなのは、BoardやCharacterなどは作成者が誰かを保持する必要があり、キーがuserUidであるParticipantで保存するほうが都合がよく構成も綺麗になるため。
*/

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

export const Player = 'Player';
export const Spectator = 'Spectator';
export const Master = 'Master';

const participantRole = t.union([t.literal(Player), t.literal(Spectator), t.literal(Master)]);
export type ParticipantRole = t.TypeOf<typeof participantRole>;

export const dbState = t.type({
    $v: t.literal(1),

    boards: record(t.string, Board.state),
    characters: record(t.string, Character.state),
    imagePieceValues: record(t.string, ImagePieceValue.state),
});

export type DbState = t.TypeOf<typeof dbState>;

export const state = t.intersection([
    dbState,
    t.type({
        name: maybe(t.string),
        role: maybe(participantRole),
    }),
]);

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, {
    name: t.type({ oldValue: maybe(t.string) }),
    role: t.type({ oldValue: maybe(participantRole) }),

    boards: record(t.string, recordDownOperationElementFactory(Board.state, Board.downOperation)),
    characters: record(
        t.string,
        recordDownOperationElementFactory(Character.state, Character.downOperation)
    ),
    imagePieceValues: record(
        t.string,
        recordDownOperationElementFactory(ImagePieceValue.state, ImagePieceValue.downOperation)
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, {
    name: t.type({ newValue: maybe(t.string) }),
    role: t.type({ newValue: maybe(participantRole) }),

    boards: record(t.string, recordUpOperationElementFactory(Board.state, Board.upOperation)),
    characters: record(
        t.string,
        recordUpOperationElementFactory(Character.state, Character.upOperation)
    ),
    imagePieceValues: record(
        t.string,
        recordUpOperationElementFactory(ImagePieceValue.state, ImagePieceValue.upOperation)
    ),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 1;

    name?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<string>>;
    role?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<ParticipantRole>>;

    boards?: RecordOperation.RecordTwoWayOperation<Board.State, Board.TwoWayOperation>;
    characters?: RecordOperation.RecordTwoWayOperation<Character.State, Character.TwoWayOperation>;
    imagePieceValues?: RecordOperation.RecordTwoWayOperation<
        ImagePieceValue.State,
        ImagePieceValue.TwoWayOperation
    >;
};
