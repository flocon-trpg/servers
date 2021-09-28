import * as DiePieceValueLog from './log';

export const decode = (source: unknown): DiePieceValueLog.Type => {
    const result = DiePieceValueLog.exactType.decode(source);
    if (result._tag === 'Left') {
        throw new Error('decode failure');
    }
    return result.right;
};

export const parse = (source: string): DiePieceValueLog.Type => {
    return decode(JSON.parse(source));
};

export const exact = (source: DiePieceValueLog.Type): DiePieceValueLog.Type => {
    return DiePieceValueLog.exactType.encode(source);
};
