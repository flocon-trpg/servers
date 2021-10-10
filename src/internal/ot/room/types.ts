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
import { createOperation } from '../util/createOperation';
import { record } from '../util/record';
import { CompositeKey, compositeKey } from '../compositeKey/types';
import { Maybe, maybe } from '../../maybe';

export const stateBase = t.type({
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
        $v: t.literal(2),
        participants: record(t.string, Participant.dbState),
    }),
]);

export type DbState = t.TypeOf<typeof dbState>;

export const dbStateV1 = t.intersection([
    stateBase,
    t.type({
        $v: t.literal(1),
        participants: record(t.string, Participant.dbStateV1),
    }),
]);

export type DbStateV1 = t.TypeOf<typeof dbStateV1>;

export const state = t.intersection([
    stateBase,
    t.type({
        $v: t.literal(2),
        createdBy: t.string,
        name: t.string,
        participants: record(t.string, Participant.state),
    }),
]);

// nameはDBから頻繁に取得されると思われる値なので独立させている。
export type State = t.TypeOf<typeof state>;

export const stateV1 = t.intersection([
    stateBase,
    t.type({
        $v: t.literal(1),
        createdBy: t.string,
        name: t.string,
        participants: record(t.string, Participant.stateV1),
    }),
]);

// nameはDBから頻繁に取得されると思われる値なので独立させている。
export type StateV1 = t.TypeOf<typeof stateV1>;

const downOperationBase = {
    activeBoardKey: t.type({ oldValue: maybe(compositeKey) }),
    bgms: record(t.string, recordDownOperationElementFactory(Bgm.state, Bgm.downOperation)),
    boolParamNames: record(
        t.string,
        recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)
    ),
    memos: record(t.string, recordDownOperationElementFactory(Memo.state, Memo.downOperation)),
    name: TextOperation.downOperation,
    numParamNames: record(
        t.string,
        recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)
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
    strParamNames: record(
        t.string,
        recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)
    ),
};

export const downOperation = createOperation(2, {
    ...downOperationBase,
    participants: record(
        t.string,
        recordDownOperationElementFactory(Participant.state, Participant.downOperation)
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const downOperationV1 = createOperation(1, {
    ...downOperationBase,
    participants: record(
        t.string,
        recordDownOperationElementFactory(Participant.stateV1, Participant.downOperationV1)
    ),
});

export type DownOperationV1 = t.TypeOf<typeof downOperationV1>;

const upOperationBase = {
    activeBoardKey: t.type({ newValue: maybe(compositeKey) }),
    bgms: record(t.string, recordUpOperationElementFactory(Bgm.state, Bgm.upOperation)),
    boolParamNames: record(
        t.string,
        recordUpOperationElementFactory(ParamNames.state, ParamNames.upOperation)
    ),
    memos: record(t.string, recordUpOperationElementFactory(Memo.state, Memo.upOperation)),
    name: TextOperation.upOperation,
    numParamNames: record(
        t.string,
        recordUpOperationElementFactory(ParamNames.state, ParamNames.upOperation)
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
    strParamNames: record(
        t.string,
        recordUpOperationElementFactory(ParamNames.state, ParamNames.upOperation)
    ),
};

export const upOperation = createOperation(2, {
    ...upOperationBase,
    participants: record(
        t.string,
        recordUpOperationElementFactory(Participant.state, Participant.upOperation)
    ),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export const upOperationV1 = createOperation(1, {
    ...upOperationBase,
    participants: record(
        t.string,
        recordUpOperationElementFactory(Participant.stateV1, Participant.upOperationV1)
    ),
});

export type UpOperationV1 = t.TypeOf<typeof upOperationV1>;

export type TwoWayOperation = {
    $v: 2;

    activeBoardKey?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<CompositeKey>>;
    bgms?: RecordOperation.RecordTwoWayOperation<Bgm.State, Bgm.TwoWayOperation>;
    boolParamNames?: RecordOperation.RecordTwoWayOperation<
        ParamNames.State,
        ParamNames.TwoWayOperation
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
    strParamNames?: RecordOperation.RecordTwoWayOperation<
        ParamNames.State,
        ParamNames.TwoWayOperation
    >;
};
