import { DownError, ScalarError, TwoWayError, UpError } from './util/type';

type OtErrorParam = Exclude<ScalarError | UpError | DownError | TwoWayError, string>;

export class OtError extends Error {
    public readonly otError: OtErrorParam;
    constructor(content: OtErrorParam) {
        // TODO: よりわかりやすいメッセージを表示する
        const message: string = content.type;
        super(message);
        this.otError = content;
        this.name = 'OtError';
    }
}

export const toOtError = (content: OtErrorParam | string): Error => {
    if (typeof content === 'string') {
        return new Error(content);
    }
    return new OtError(content);
};
