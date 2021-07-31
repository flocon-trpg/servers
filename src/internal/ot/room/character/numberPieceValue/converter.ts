import * as NumberPieceValueLog from './log-v1';

export const decode = (source: unknown): NumberPieceValueLog.Type => {
    const result = NumberPieceValueLog.exactType.decode(source);
    if (result._tag === 'Left') {
        throw new Error('decode failure');
    }
    return result.right;
};

export const parse = (source: string): NumberPieceValueLog.Type => {
    return decode(JSON.parse(source));
};

export const exact = (source: NumberPieceValueLog.Type): NumberPieceValueLog.Type => {
    return NumberPieceValueLog.exactType.encode(source);
};
