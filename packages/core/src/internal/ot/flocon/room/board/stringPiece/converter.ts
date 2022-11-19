import * as StringPieceValueLog from './log';

export const decode = (source: unknown): StringPieceValueLog.Type => {
    return StringPieceValueLog.type.parse(source);
};

export const parse = (source: string): StringPieceValueLog.Type => {
    return decode(JSON.parse(source));
};
