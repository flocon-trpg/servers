export type Ok<TValue> = {
    isError: false;
    value: TValue;
}

export type Error<TError> = {
    isError: true;
    error: TError;
}

export type Result<TValue> = Ok<TValue> | Error<string>;
export type CustomResult<TValue, TError> = Ok<TValue> | Error<TError>;

export const ResultModule = {
    ok: <TValue>(value: TValue): Ok<TValue> => ({ isError: false, value }),
    error: <TError>(error: TError): Error<TError> => ({ isError: true, error }),
    get: <TValue>(source: Result<TValue>): TValue => {
        if (source.isError) {
            throw 'not hasValue';
        }
        return source.value;
    },
};

export class ResultBinder<T> {
    public constructor(private _source: Result<T>) { }

    public map<TNext, TResult>(next: Result<TNext>, binder: (source: T, next: TNext) => TResult): ResultBinder<TResult> {
        if (this._source.isError === true) {
            return new ResultBinder(this._source);
        }
        if (next.isError === true) {
            return new ResultBinder(next);
        }
        return new ResultBinder(ResultModule.ok(binder(this._source.value, next.value)));
    }

    public get result(): Result<T> {
        return this._source;
    }

    public static create<T>(source: T): ResultBinder<T> {
        return new ResultBinder(ResultModule.ok(source));
    }
}