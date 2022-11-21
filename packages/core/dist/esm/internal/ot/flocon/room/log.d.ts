import { State } from '../../generator';
import * as DicePieceLog from './board/dicePiece/log';
import * as StringPieceLog from './board/stringPiece/log';
import * as RoomTypes from './types';
type DicePieceLogType = {
    boardId: string;
    stateId: string;
    value: DicePieceLog.Type;
};
type StringPieceLogType = {
    boardId: string;
    stateId: string;
    value: StringPieceLog.Type;
};
export declare const createLogs: ({ prevState, nextState, }: {
    prevState: State<typeof RoomTypes.template>;
    nextState: State<typeof RoomTypes.template>;
}) => {
    dicePieceLogs: DicePieceLogType[];
    stringPieceLogs: StringPieceLogType[];
} | undefined;
export {};
//# sourceMappingURL=log.d.ts.map