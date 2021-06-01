import * as DiePieceValueLog from './log-v1';

export const decode = (source: unknown): DiePieceValueLog.Main => {
    const result = DiePieceValueLog.exactMain.decode(source);
    if (result._tag === 'Left') {
        throw new Error('decode failure');
    }
    return result.right;
};

export const parse = (source: string): DiePieceValueLog.Main => {
    return decode(JSON.parse(source));
};

export const exact = (source: DiePieceValueLog.Main): DiePieceValueLog.Main => {
    return DiePieceValueLog.exactMain.encode(source);
};
