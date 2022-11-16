import * as DiePieceValueLog from './log';

export const decode = (source: unknown): DiePieceValueLog.Type => {
    return DiePieceValueLog.type.parse(source);
};

export const parse = (source: string): DiePieceValueLog.Type => {
    return decode(JSON.parse(source));
};
