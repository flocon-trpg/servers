import * as t from 'io-ts';
import * as Bgm from './bgm/types';
import * as Memo from './memo/types';
import * as ParamNames from './paramName/types';
import * as Participant from './participant/types';
import * as RecordOperation from '../util/recordOperation';
import {
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../util/recordOperationElement';
import * as ReplaceOperation from '../util/replaceOperation';
import * as TextOperation from '../util/textOperation';
import * as NullableTextOperation from '../util/nullableTextOperation';
import { createOperation } from '../util/createOperation';
import { record } from '../util/record';
import { Maybe, maybe } from '../../maybe';
import * as Board from './board/types';
import * as Character from './character/types';
import * as DicePieceValue from './dicePieceValue/types';
import * as ImagePieceValue from './imagePieceValue/types';
import * as RollCall from './rollCall/types';
import * as StringPieceValue from './stringPieceValue/types';

const stateBase = t.type({
    activeBoardId: maybe(t.string),
    bgms: record(t.string, Bgm.state), // keyはStrIndex5
    boolParamNames: record(t.string, ParamNames.state), //keyはStrIndex20
    boards: record(t.string, Board.state), // keyはランダムなID
    characters: record(t.string, Character.state), // keyはランダムなID
    characterTag1Name: maybe(t.string),
    characterTag2Name: maybe(t.string),
    characterTag3Name: maybe(t.string),
    characterTag4Name: maybe(t.string),
    characterTag5Name: maybe(t.string),
    characterTag6Name: maybe(t.string),
    characterTag7Name: maybe(t.string),
    characterTag8Name: maybe(t.string),
    characterTag9Name: maybe(t.string),
    characterTag10Name: maybe(t.string),
    dicePieceValues: record(t.string, DicePieceValue.state), // keyはランダムなID
    imagePieceValues: record(t.string, ImagePieceValue.state), // keyはランダムなID
    memos: record(t.string, Memo.state), // keyはランダムなID
    numParamNames: record(t.string, ParamNames.state), //keyはStrIndex20
    publicChannel1Name: t.string,
    publicChannel2Name: t.string,
    publicChannel3Name: t.string,
    publicChannel4Name: t.string,
    publicChannel5Name: t.string,
    publicChannel6Name: t.string,
    publicChannel7Name: t.string,
    publicChannel8Name: t.string,
    publicChannel9Name: t.string,
    publicChannel10Name: t.string,
    rollCalls: record(t.string, RollCall.state), // keyは現在は'1'のみを使える
    stringPieceValues: record(t.string, StringPieceValue.state), //keyはStrIndex20
    strParamNames: record(t.string, ParamNames.state), //keyはStrIndex20
});

export const dbState = t.intersection([
    stateBase,
    t.type({
        $v: t.literal(2),
        $r: t.literal(1),
    }),
]);

export type DbState = t.TypeOf<typeof dbState>;

// nameとcreatedByはDBから頻繁に取得されると思われる値なので独立させている。
export const state = t.intersection([
    stateBase,
    t.type({
        $v: t.literal(2),
        $r: t.literal(1),
        createdBy: t.string,
        name: t.string,
        participants: record(t.string, Participant.state),
    }),
]);

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(2, 1, {
    activeBoardId: t.type({ oldValue: maybe(t.string) }),
    bgms: record(t.string, recordDownOperationElementFactory(Bgm.state, Bgm.downOperation)),
    boards: record(t.string, recordDownOperationElementFactory(Board.state, Board.downOperation)),
    boolParamNames: record(
        t.string,
        recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)
    ),
    characters: record(
        t.string,
        recordDownOperationElementFactory(Character.state, Character.downOperation)
    ),
    characterTag1Name: NullableTextOperation.downOperation,
    characterTag2Name: NullableTextOperation.downOperation,
    characterTag3Name: NullableTextOperation.downOperation,
    characterTag4Name: NullableTextOperation.downOperation,
    characterTag5Name: NullableTextOperation.downOperation,
    characterTag6Name: NullableTextOperation.downOperation,
    characterTag7Name: NullableTextOperation.downOperation,
    characterTag8Name: NullableTextOperation.downOperation,
    characterTag9Name: NullableTextOperation.downOperation,
    characterTag10Name: NullableTextOperation.downOperation,
    dicePieceValues: record(
        t.string,
        recordDownOperationElementFactory(DicePieceValue.state, DicePieceValue.downOperation)
    ),
    imagePieceValues: record(
        t.string,
        recordDownOperationElementFactory(ImagePieceValue.state, ImagePieceValue.downOperation)
    ),
    memos: record(t.string, recordDownOperationElementFactory(Memo.state, Memo.downOperation)),
    name: TextOperation.downOperation,
    numParamNames: record(
        t.string,
        recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)
    ),
    participants: record(
        t.string,
        recordDownOperationElementFactory(Participant.state, Participant.downOperation)
    ),
    publicChannel1Name: TextOperation.downOperation,
    publicChannel2Name: TextOperation.downOperation,
    publicChannel3Name: TextOperation.downOperation,
    publicChannel4Name: TextOperation.downOperation,
    publicChannel5Name: TextOperation.downOperation,
    publicChannel6Name: TextOperation.downOperation,
    publicChannel7Name: TextOperation.downOperation,
    publicChannel8Name: TextOperation.downOperation,
    publicChannel9Name: TextOperation.downOperation,
    publicChannel10Name: TextOperation.downOperation,
    rollCalls: record(
        t.string,
        recordDownOperationElementFactory(RollCall.state, RollCall.downOperation)
    ),
    stringPieceValues: record(
        t.string,
        recordDownOperationElementFactory(StringPieceValue.state, StringPieceValue.downOperation)
    ),
    strParamNames: record(
        t.string,
        recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(2, 1, {
    activeBoardId: t.type({ newValue: maybe(t.string) }),
    bgms: record(t.string, recordUpOperationElementFactory(Bgm.state, Bgm.upOperation)),
    boolParamNames: record(
        t.string,
        recordUpOperationElementFactory(ParamNames.state, ParamNames.upOperation)
    ),
    boards: record(t.string, recordUpOperationElementFactory(Board.state, Board.upOperation)),
    characters: record(
        t.string,
        recordUpOperationElementFactory(Character.state, Character.upOperation)
    ),
    characterTag1Name: NullableTextOperation.upOperation,
    characterTag2Name: NullableTextOperation.upOperation,
    characterTag3Name: NullableTextOperation.upOperation,
    characterTag4Name: NullableTextOperation.upOperation,
    characterTag5Name: NullableTextOperation.upOperation,
    characterTag6Name: NullableTextOperation.upOperation,
    characterTag7Name: NullableTextOperation.upOperation,
    characterTag8Name: NullableTextOperation.upOperation,
    characterTag9Name: NullableTextOperation.upOperation,
    characterTag10Name: NullableTextOperation.upOperation,
    dicePieceValues: record(
        t.string,
        recordUpOperationElementFactory(DicePieceValue.state, DicePieceValue.upOperation)
    ),
    imagePieceValues: record(
        t.string,
        recordUpOperationElementFactory(ImagePieceValue.state, ImagePieceValue.upOperation)
    ),
    memos: record(t.string, recordUpOperationElementFactory(Memo.state, Memo.upOperation)),
    name: TextOperation.upOperation,
    numParamNames: record(
        t.string,
        recordUpOperationElementFactory(ParamNames.state, ParamNames.upOperation)
    ),
    participants: record(
        t.string,
        recordUpOperationElementFactory(Participant.state, Participant.upOperation)
    ),
    publicChannel1Name: TextOperation.upOperation,
    publicChannel2Name: TextOperation.upOperation,
    publicChannel3Name: TextOperation.upOperation,
    publicChannel4Name: TextOperation.upOperation,
    publicChannel5Name: TextOperation.upOperation,
    publicChannel6Name: TextOperation.upOperation,
    publicChannel7Name: TextOperation.upOperation,
    publicChannel8Name: TextOperation.upOperation,
    publicChannel9Name: TextOperation.upOperation,
    publicChannel10Name: TextOperation.upOperation,
    rollCalls: record(
        t.string,
        recordUpOperationElementFactory(RollCall.state, RollCall.upOperation)
    ),
    stringPieceValues: record(
        t.string,
        recordUpOperationElementFactory(StringPieceValue.state, StringPieceValue.upOperation)
    ),
    strParamNames: record(
        t.string,
        recordUpOperationElementFactory(ParamNames.state, ParamNames.upOperation)
    ),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 2;
    $r: 1;

    activeBoardId?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<string>>;
    bgms?: RecordOperation.RecordTwoWayOperation<Bgm.State, Bgm.TwoWayOperation>;
    boolParamNames?: RecordOperation.RecordTwoWayOperation<
        ParamNames.State,
        ParamNames.TwoWayOperation
    >;
    boards?: RecordOperation.RecordTwoWayOperation<Board.State, Board.TwoWayOperation>;
    characters?: RecordOperation.RecordTwoWayOperation<Character.State, Character.TwoWayOperation>;
    characterTag1Name?: NullableTextOperation.TwoWayOperation;
    characterTag2Name?: NullableTextOperation.TwoWayOperation;
    characterTag3Name?: NullableTextOperation.TwoWayOperation;
    characterTag4Name?: NullableTextOperation.TwoWayOperation;
    characterTag5Name?: NullableTextOperation.TwoWayOperation;
    characterTag6Name?: NullableTextOperation.TwoWayOperation;
    characterTag7Name?: NullableTextOperation.TwoWayOperation;
    characterTag8Name?: NullableTextOperation.TwoWayOperation;
    characterTag9Name?: NullableTextOperation.TwoWayOperation;
    characterTag10Name?: NullableTextOperation.TwoWayOperation;
    dicePieceValues?: RecordOperation.RecordTwoWayOperation<
        DicePieceValue.State,
        DicePieceValue.TwoWayOperation
    >;
    imagePieceValues?: RecordOperation.RecordTwoWayOperation<
        ImagePieceValue.State,
        ImagePieceValue.TwoWayOperation
    >;
    memos?: RecordOperation.RecordTwoWayOperation<Memo.State, Memo.TwoWayOperation>;
    name?: TextOperation.TwoWayOperation;
    numParamNames?: RecordOperation.RecordTwoWayOperation<
        ParamNames.State,
        ParamNames.TwoWayOperation
    >;
    participants?: RecordOperation.RecordTwoWayOperation<
        Participant.State,
        Participant.TwoWayOperation
    >;
    publicChannel1Name?: TextOperation.TwoWayOperation;
    publicChannel2Name?: TextOperation.TwoWayOperation;
    publicChannel3Name?: TextOperation.TwoWayOperation;
    publicChannel4Name?: TextOperation.TwoWayOperation;
    publicChannel5Name?: TextOperation.TwoWayOperation;
    publicChannel6Name?: TextOperation.TwoWayOperation;
    publicChannel7Name?: TextOperation.TwoWayOperation;
    publicChannel8Name?: TextOperation.TwoWayOperation;
    publicChannel9Name?: TextOperation.TwoWayOperation;
    publicChannel10Name?: TextOperation.TwoWayOperation;
    rollCalls?: RecordOperation.RecordTwoWayOperation<RollCall.State, RollCall.TwoWayOperation>;
    stringPieceValues?: RecordOperation.RecordTwoWayOperation<
        StringPieceValue.State,
        StringPieceValue.TwoWayOperation
    >;
    strParamNames?: RecordOperation.RecordTwoWayOperation<
        ParamNames.State,
        ParamNames.TwoWayOperation
    >;
};
