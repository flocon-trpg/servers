import * as NumberPieceValueLog from './log-v1';

export const decode = (source: unknown): NumberPieceValueLog.Main => {
    const result = NumberPieceValueLog.exactMain.decode(source);
    if (result._tag === 'Left') {
        throw new Error('decode failure');
    }
    return result.right;
};

export const parse = (source: string): NumberPieceValueLog.Main => {
    return decode(JSON.parse(source));
};

export const exact = (source: NumberPieceValueLog.Main): NumberPieceValueLog.Main => {
    return NumberPieceValueLog.exactMain.encode(source);
};
