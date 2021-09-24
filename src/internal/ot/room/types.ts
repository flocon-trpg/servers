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
import { createOperation } from '../util/createOperation';
import { record } from '../util/record';
import { CompositeKey, compositeKey } from '../compositeKey/types';
import { Maybe, maybe } from '../../maybe';

const replaceStringDownOperation = t.type({ oldValue: t.string });
const replaceStringUpOperation = t.type({ newValue: t.string });

export const stateBase = t.type({
    $v: t.literal(1),

    activeBoardKey: maybe(compositeKey),
    bgms: record(t.string, Bgm.state), // keyはStrIndex5
    boolParamNames: record(t.string, ParamNames.state), //keyはStrIndex20
    memos: record(t.string, Memo.state),
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
    strParamNames: record(t.string, ParamNames.state), //keyはStrIndex20
});

export const dbState = t.intersection([
    stateBase,
    t.type({
        participants: record(t.string, Participant.dbState),
    }),
]);

export type DbState = t.TypeOf<typeof dbState>;

export const state = t.intersection([
    stateBase,
    t.type({
        createdBy: t.string,
        name: t.string,
        participants: record(t.string, Participant.state),
    }),
]);

// nameはDBから頻繁に取得されると思われる値なので独立させている。
export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, {
    activeBoardKey: t.type({ oldValue: maybe(compositeKey) }),
    bgms: record(t.string, recordDownOperationElementFactory(Bgm.state, Bgm.downOperation)),
    boolParamNames: record(
        t.string,
        recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)
    ),
    memos: record(t.string, recordDownOperationElementFactory(Memo.state, Memo.downOperation)),
    name: replaceStringDownOperation,
    numParamNames: record(
        t.string,
        recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)
    ),
    participants: record(
        t.string,
        recordDownOperationElementFactory(Participant.state, Participant.downOperation)
    ),
    publicChannel1Name: replaceStringDownOperation,
    publicChannel2Name: replaceStringDownOperation,
    publicChannel3Name: replaceStringDownOperation,
    publicChannel4Name: replaceStringDownOperation,
    publicChannel5Name: replaceStringDownOperation,
    publicChannel6Name: replaceStringDownOperation,
    publicChannel7Name: replaceStringDownOperation,
    publicChannel8Name: replaceStringDownOperation,
    publicChannel9Name: replaceStringDownOperation,
    publicChannel10Name: replaceStringDownOperation,
    strParamNames: record(
        t.string,
        recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, {
    activeBoardKey: t.type({ newValue: maybe(compositeKey) }),
    bgms: record(t.string, recordUpOperationElementFactory(Bgm.state, Bgm.upOperation)),
    boolParamNames: record(
        t.string,
        recordUpOperationElementFactory(ParamNames.state, ParamNames.upOperation)
    ),
    memos: record(t.string, recordUpOperationElementFactory(Memo.state, Memo.upOperation)),
    name: replaceStringUpOperation,
    numParamNames: record(
        t.string,
        recordUpOperationElementFactory(ParamNames.state, ParamNames.upOperation)
    ),
    participants: record(
        t.string,
        recordUpOperationElementFactory(Participant.state, Participant.upOperation)
    ),
    publicChannel1Name: replaceStringUpOperation,
    publicChannel2Name: replaceStringUpOperation,
    publicChannel3Name: replaceStringUpOperation,
    publicChannel4Name: replaceStringUpOperation,
    publicChannel5Name: replaceStringUpOperation,
    publicChannel6Name: replaceStringUpOperation,
    publicChannel7Name: replaceStringUpOperation,
    publicChannel8Name: replaceStringUpOperation,
    publicChannel9Name: replaceStringUpOperation,
    publicChannel10Name: replaceStringUpOperation,
    strParamNames: record(
        t.string,
        recordUpOperationElementFactory(ParamNames.state, ParamNames.upOperation)
    ),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 1;

    activeBoardKey?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<CompositeKey>>;
    bgms?: RecordOperation.RecordTwoWayOperation<Bgm.State, Bgm.TwoWayOperation>;
    boolParamNames?: RecordOperation.RecordTwoWayOperation<
        ParamNames.State,
        ParamNames.TwoWayOperation
    >;
    memos?: RecordOperation.RecordTwoWayOperation<Memo.State, Memo.TwoWayOperation>;
    name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    numParamNames?: RecordOperation.RecordTwoWayOperation<
        ParamNames.State,
        ParamNames.TwoWayOperation
    >;
    participants?: RecordOperation.RecordTwoWayOperation<
        Participant.State,
        Participant.TwoWayOperation
    >;
    publicChannel1Name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel2Name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel3Name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel4Name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel5Name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel6Name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel7Name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel8Name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel9Name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel10Name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    strParamNames?: RecordOperation.RecordTwoWayOperation<
        ParamNames.State,
        ParamNames.TwoWayOperation
    >;
};
