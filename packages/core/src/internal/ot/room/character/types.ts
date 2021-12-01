import * as t from 'io-ts';
import {
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../../util/recordOperationElement';
import { FilePath, filePath } from '../../filePath/types';
import * as TextOperation from '../../util/textOperation';
import * as CharacterPiece from './characterPiece/types';
import * as PortraitPiece from './portraitPiece/types';
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
// pieces, portraitPositions: 誰でも作成できる値。keyはboardのkey。

// キャラクター全体非公開機能との兼ね合いがあるため、piecesとportraitPositionsをRoom.Stateに置くのは綺麗ではない。
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
    portraitImage: maybe(filePath),

    hasTag1: t.boolean,
    hasTag2: t.boolean,
    hasTag3: t.boolean,
    hasTag4: t.boolean,
    hasTag5: t.boolean,
    hasTag6: t.boolean,
    hasTag7: t.boolean,
    hasTag8: t.boolean,
    hasTag9: t.boolean,
    hasTag10: t.boolean,

    boolParams: record(t.string, BoolParam.state),
    numParams: record(t.string, NumParam.state),
    numMaxParams: record(t.string, NumParam.state),
    strParams: record(t.string, StrParam.state),
    pieces: record(t.string, CharacterPiece.state),
    privateCommands: record(t.string, Command.state),
    portraitPieces: record(t.string, PortraitPiece.state),
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
    portraitImage: t.type({ oldValue: maybe(filePath) }),

    hasTag1: t.type({ oldValue: t.boolean }),
    hasTag2: t.type({ oldValue: t.boolean }),
    hasTag3: t.type({ oldValue: t.boolean }),
    hasTag4: t.type({ oldValue: t.boolean }),
    hasTag5: t.type({ oldValue: t.boolean }),
    hasTag6: t.type({ oldValue: t.boolean }),
    hasTag7: t.type({ oldValue: t.boolean }),
    hasTag8: t.type({ oldValue: t.boolean }),
    hasTag9: t.type({ oldValue: t.boolean }),
    hasTag10: t.type({ oldValue: t.boolean }),

    boolParams: record(t.string, BoolParam.downOperation),
    numParams: record(t.string, NumParam.downOperation),
    numMaxParams: record(t.string, NumParam.downOperation),
    strParams: record(t.string, StrParam.downOperation),
    pieces: record(
        t.string,
        recordDownOperationElementFactory(CharacterPiece.state, CharacterPiece.downOperation)
    ),
    privateCommands: record(
        t.string,
        recordDownOperationElementFactory(Command.state, Command.downOperation)
    ),
    portraitPieces: record(
        t.string,
        recordDownOperationElementFactory(PortraitPiece.state, PortraitPiece.downOperation)
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
    portraitImage: t.type({ newValue: maybe(filePath) }),

    hasTag1: t.type({ newValue: t.boolean }),
    hasTag2: t.type({ newValue: t.boolean }),
    hasTag3: t.type({ newValue: t.boolean }),
    hasTag4: t.type({ newValue: t.boolean }),
    hasTag5: t.type({ newValue: t.boolean }),
    hasTag6: t.type({ newValue: t.boolean }),
    hasTag7: t.type({ newValue: t.boolean }),
    hasTag8: t.type({ newValue: t.boolean }),
    hasTag9: t.type({ newValue: t.boolean }),
    hasTag10: t.type({ newValue: t.boolean }),

    boolParams: record(t.string, BoolParam.upOperation),
    numParams: record(t.string, NumParam.upOperation),
    numMaxParams: record(t.string, NumParam.upOperation),
    strParams: record(t.string, StrParam.upOperation),
    pieces: record(
        t.string,
        recordUpOperationElementFactory(CharacterPiece.state, CharacterPiece.upOperation)
    ),
    privateCommands: record(
        t.string,
        recordUpOperationElementFactory(Command.state, Command.upOperation)
    ),
    portraitPieces: record(
        t.string,
        recordUpOperationElementFactory(PortraitPiece.state, PortraitPiece.upOperation)
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
    portraitImage?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<FilePath>>;

    hasTag1?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    hasTag2?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    hasTag3?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    hasTag4?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    hasTag5?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    hasTag6?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    hasTag7?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    hasTag8?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    hasTag9?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    hasTag10?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;

    boolParams?: StringKeyRecord<BoolParam.TwoWayOperation>;
    numParams?: StringKeyRecord<NumParam.TwoWayOperation>;
    numMaxParams?: StringKeyRecord<NumParam.TwoWayOperation>;
    strParams?: StringKeyRecord<StrParam.TwoWayOperation>;
    pieces?: RecordTwoWayOperation<CharacterPiece.State, CharacterPiece.TwoWayOperation>;
    privateCommands?: RecordTwoWayOperation<Command.State, Command.TwoWayOperation>;
    portraitPieces?: RecordTwoWayOperation<PortraitPiece.State, PortraitPiece.TwoWayOperation>;
};
