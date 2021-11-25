import * as t from 'io-ts';
import {
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../../util/recordOperationElement';
import { FilePath, filePath } from '../../filePath/types';
import * as TextOperation from '../../util/textOperation';
import * as Piece from '../../piece/types';
import * as BoardLocation from '../../boardLocation/types';
import * as ReplaceOperation from '../../util/replaceOperation';
import { RecordTwoWayOperation } from '../../util/recordOperation';
import * as BoolParam from './boolParam/types';
import * as Command from './command/types';
import * as NumParam from './numParam/types';
import * as StrParam from './strParam/types';
import { createOperation } from '../../util/createOperation';
import { record, StringKeyRecord } from '../../util/record';
import { Maybe, maybe } from '../../../maybe';

// boolParams, numParams, numMaxParams, strParams: keyはstrIndex20などの固定キーを想定。
// pieces, tachieLocations: 誰でも作成できる値。keyはboardのkey。

// キャラクター全体非公開機能との兼ね合いがあるため、piecesとtachieLocationsをRoom.Stateに置くのは綺麗ではない。
export const state = t.type({
    $v: t.literal(2),
    $r: t.literal(1),

    ownerParticipantId: maybe(t.string),

    image: maybe(filePath),
    isPrivate: t.boolean,
    memo: t.string,
    name: t.string,
    chatPalette: t.string,
    privateVarToml: t.string,
    tachieImage: maybe(filePath),

    boolParams: record(t.string, BoolParam.state),
    numParams: record(t.string, NumParam.state),
    numMaxParams: record(t.string, NumParam.state),
    strParams: record(t.string, StrParam.state),
    pieces: record(t.string, Piece.state),
    privateCommands: record(t.string, Command.state),
    tachieLocations: record(t.string, BoardLocation.state),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(2, 1, {
    ownerParticipantId: t.type({ oldValue: maybe(t.string) }),

    image: t.type({ oldValue: maybe(filePath) }),
    isPrivate: t.type({ oldValue: t.boolean }),
    memo: TextOperation.downOperation,
    name: TextOperation.downOperation,
    chatPalette: TextOperation.downOperation,
    privateVarToml: TextOperation.downOperation,
    tachieImage: t.type({ oldValue: maybe(filePath) }),

    boolParams: record(t.string, BoolParam.downOperation),
    numParams: record(t.string, NumParam.downOperation),
    numMaxParams: record(t.string, NumParam.downOperation),
    strParams: record(t.string, StrParam.downOperation),
    pieces: record(t.string, recordDownOperationElementFactory(Piece.state, Piece.downOperation)),
    privateCommands: record(
        t.string,
        recordDownOperationElementFactory(Command.state, Command.downOperation)
    ),
    tachieLocations: record(
        t.string,
        recordDownOperationElementFactory(BoardLocation.state, BoardLocation.downOperation)
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(2, 1, {
    image: t.type({ newValue: maybe(filePath) }),
    isPrivate: t.type({ newValue: t.boolean }),

    ownerParticipantId: t.type({ newValue: maybe(t.string) }),

    memo: TextOperation.upOperation,
    name: TextOperation.upOperation,
    chatPalette: TextOperation.upOperation,
    privateVarToml: TextOperation.upOperation,
    tachieImage: t.type({ newValue: maybe(filePath) }),

    boolParams: record(t.string, BoolParam.upOperation),
    numParams: record(t.string, NumParam.upOperation),
    numMaxParams: record(t.string, NumParam.upOperation),
    strParams: record(t.string, StrParam.upOperation),
    pieces: record(t.string, recordUpOperationElementFactory(Piece.state, Piece.upOperation)),
    privateCommands: record(
        t.string,
        recordUpOperationElementFactory(Command.state, Command.upOperation)
    ),
    tachieLocations: record(
        t.string,
        recordUpOperationElementFactory(BoardLocation.state, BoardLocation.upOperation)
    ),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 2;
    $r: 1;

    ownerParticipantId?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<string>>;

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
    pieces?: RecordTwoWayOperation<Piece.State, Piece.TwoWayOperation>;
    privateCommands?: RecordTwoWayOperation<Command.State, Command.TwoWayOperation>;
    tachieLocations?: RecordTwoWayOperation<BoardLocation.State, BoardLocation.TwoWayOperation>;
};
