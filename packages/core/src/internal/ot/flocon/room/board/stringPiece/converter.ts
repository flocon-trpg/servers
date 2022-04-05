import * as StringPieceValueLog from './log';

export const decode = (source: unknown): StringPieceValueLog.Type => {
    const result = StringPieceValueLog.type.decode(source);
    if (result._tag === 'Left') {
        throw new Error('decode failure');
    }
    return result.right;
};

export const parse = (source: string): StringPieceValueLog.Type => {
    return decode(JSON.parse(source));
};
