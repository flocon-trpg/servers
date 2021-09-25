import * as StringPieceValueLog from './log';

export const decode = (source: unknown): StringPieceValueLog.Type => {
    const result = StringPieceValueLog.exactType.decode(source);
    if (result._tag === 'Left') {
        throw new Error('decode failure');
    }
    return result.right;
};

export const parse = (source: string): StringPieceValueLog.Type => {
    return decode(JSON.parse(source));
};

export const exact = (source: StringPieceValueLog.Type): StringPieceValueLog.Type => {
    return StringPieceValueLog.exactType.encode(source);
};
