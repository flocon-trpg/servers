import * as MyNumberValueLog from './log-v1';

export const decode = (source: unknown): MyNumberValueLog.Main => {
    const result = MyNumberValueLog.exactMain.decode(source);
    if (result._tag === 'Left') {
        throw new Error('decode failure');
    }
    return result.right;
};

export const parse = (source: string): MyNumberValueLog.Main => {
    return decode(JSON.parse(source));
};

export const exact = (source: MyNumberValueLog.Main): MyNumberValueLog.Main => {
    return MyNumberValueLog.exactMain.encode(source);
};
