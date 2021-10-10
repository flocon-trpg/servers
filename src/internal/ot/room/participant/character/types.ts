import * as t from 'io-ts';
import {
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../../../util/recordOperationElement';
import { FilePath, filePath } from '../../../filePath/types';
import * as TextOperation from '../../../util/textOperation';
import * as Piece from '../../../piece/types';
import * as BoardLocation from '../../../boardLocation/types';
import * as DicePieceValue from './dicePieceValue/types';
import * as NumberPieceValue from './numberPieceValue/types';
import * as StringPieceValue from './stringPieceValue/types';
import * as ReplaceOperation from '../../../util/replaceOperation';
import * as RecordOperation from '../../../util/recordOperation';
import { RecordTwoWayOperation } from '../../../util/recordOperation';
import { DualKeyRecordTwoWayOperation } from '../../../util/dualKeyRecordOperation';
import * as BoolParam from './boolParam/types';
import * as Command from './command/types';
import * as NumParam from './numParam/types';
import * as StrParam from './strParam/types';
import { createOperation } from '../../../util/createOperation';
import { record, StringKeyRecord } from '../../../util/record';
import { Maybe, maybe } from '../../../../maybe';

// boolParams, numParams, numMaxParams, strParams: keyはstrIndex20などの固定キーを想定。
// privateCommands, dicePieceValues, numberPieceValues: キーはランダムな文字列。キャラクターに紐付いた値であり、なおかつキャラクターの作成者しか値を作成できない。
// pieces, tachieLocations: 誰でも作成できる値。第一キーはuserUid、第二キーはランダムな文字列。

const stateBase = t.type({
    image: maybe(filePath),
    isPrivate: t.boolean,
    memo: t.string,
    name: t.string,
    chatPalette: t.string,
    privateCommand: t.string,
    privateVarToml: t.string,
    tachieImage: maybe(filePath),

    boolParams: record(t.string, BoolParam.state),
    numParams: record(t.string, NumParam.state),
    numMaxParams: record(t.string, NumParam.state),
    strParams: record(t.string, StrParam.state),
    pieces: record(t.string, record(t.string, Piece.state)),
    privateCommands: record(t.string, Command.state),
    tachieLocations: record(t.string, record(t.string, BoardLocation.state)),
    dicePieceValues: record(t.string, DicePieceValue.state),
});

export const state = t.intersection([
    stateBase,
    t.type({
        $v: t.literal(2),

        stringPieceValues: record(t.string, StringPieceValue.state),
    }),
]);

export type State = t.TypeOf<typeof state>;

export const stateV1 = t.intersection([
    stateBase,
    t.type({
        $v: t.literal(1),

        numberPieceValues: record(t.string, NumberPieceValue.state),
    }),
]);

export type StateV1 = t.TypeOf<typeof stateV1>;

const downOperationBase = {
    image: t.type({ oldValue: maybe(filePath) }),
    isPrivate: t.type({ oldValue: t.boolean }),
    memo: TextOperation.downOperation,
    name: TextOperation.downOperation,
    chatPalette: TextOperation.downOperation,
    privateCommand: TextOperation.downOperation,
    privateVarToml: TextOperation.downOperation,
    tachieImage: t.type({ oldValue: maybe(filePath) }),

    boolParams: record(t.string, BoolParam.downOperation),
    numParams: record(t.string, NumParam.downOperation),
    numMaxParams: record(t.string, NumParam.downOperation),
    strParams: record(t.string, StrParam.downOperation),
    pieces: record(
        t.string,
        record(t.string, recordDownOperationElementFactory(Piece.state, Piece.downOperation))
    ),
    privateCommands: record(
        t.string,
        recordDownOperationElementFactory(Command.state, Command.downOperation)
    ),
    tachieLocations: record(
        t.string,
        record(
            t.string,
            recordDownOperationElementFactory(BoardLocation.state, BoardLocation.downOperation)
        )
    ),
    dicePieceValues: record(
        t.string,
        recordDownOperationElementFactory(DicePieceValue.state, DicePieceValue.downOperation)
    ),
};

export const downOperation = createOperation(2, {
    ...downOperationBase,
    stringPieceValues: record(
        t.string,
        recordDownOperationElementFactory(StringPieceValue.state, StringPieceValue.downOperation)
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const downOperationV1 = createOperation(1, {
    ...downOperationBase,
    numberPieceValues: record(
        t.string,
        recordDownOperationElementFactory(NumberPieceValue.state, NumberPieceValue.downOperation)
    ),
});

export type DownOperationV1 = t.TypeOf<typeof downOperationV1>;

const upOperationBase = {
    image: t.type({ newValue: maybe(filePath) }),
    isPrivate: t.type({ newValue: t.boolean }),
    memo: TextOperation.upOperation,
    name: TextOperation.upOperation,
    chatPalette: TextOperation.upOperation,
    privateCommand: TextOperation.upOperation,
    privateVarToml: TextOperation.upOperation,
    tachieImage: t.type({ newValue: maybe(filePath) }),

    boolParams: record(t.string, BoolParam.upOperation),
    numParams: record(t.string, NumParam.upOperation),
    numMaxParams: record(t.string, NumParam.upOperation),
    strParams: record(t.string, StrParam.upOperation),
    pieces: record(
        t.string,
        record(t.string, recordUpOperationElementFactory(Piece.state, Piece.upOperation))
    ),
    privateCommands: record(
        t.string,
        recordUpOperationElementFactory(Command.state, Command.upOperation)
    ),
    tachieLocations: record(
        t.string,
        record(
            t.string,
            recordUpOperationElementFactory(BoardLocation.state, BoardLocation.upOperation)
        )
    ),
    dicePieceValues: record(
        t.string,
        recordUpOperationElementFactory(DicePieceValue.state, DicePieceValue.upOperation)
    ),
};

export const upOperation = createOperation(2, {
    ...upOperationBase,
    stringPieceValues: record(
        t.string,
        recordUpOperationElementFactory(StringPieceValue.state, StringPieceValue.upOperation)
    ),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export const upOperationV1 = createOperation(1, {
    ...upOperationBase,
    numberPieceValues: record(
        t.string,
        recordUpOperationElementFactory(NumberPieceValue.state, NumberPieceValue.upOperation)
    ),
});

export type UpOperationV1 = t.TypeOf<typeof upOperationV1>;

export type TwoWayOperation = {
    $v: 2;

    image?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<FilePath>>;
    isPrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    memo?: TextOperation.TwoWayOperation;
    name?: TextOperation.TwoWayOperation;
    chatPalette?: TextOperation.TwoWayOperation;
    privateCommand?: TextOperation.TwoWayOperation;
    privateVarToml?: TextOperation.TwoWayOperation;
    tachieImage?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<FilePath>>;

    boolParams?: StringKeyRecord<BoolParam.TwoWayOperation>;
    numParams?: StringKeyRecord<NumParam.TwoWayOperation>;
    numMaxParams?: StringKeyRecord<NumParam.TwoWayOperation>;
    strParams?: StringKeyRecord<StrParam.TwoWayOperation>;
    pieces?: DualKeyRecordTwoWayOperation<Piece.State, Piece.TwoWayOperation>;
    privateCommands?: RecordTwoWayOperation<Command.State, Command.TwoWayOperation>;
    tachieLocations?: DualKeyRecordTwoWayOperation<
        BoardLocation.State,
        BoardLocation.TwoWayOperation
    >;
    dicePieceValues?: RecordOperation.RecordTwoWayOperation<
        DicePieceValue.State,
        DicePieceValue.TwoWayOperation
    >;
    stringPieceValues?: RecordOperation.RecordTwoWayOperation<
        StringPieceValue.State,
        StringPieceValue.TwoWayOperation
    >;
};
