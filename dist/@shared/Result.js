"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultBinder = exports.ResultModule = void 0;
exports.ResultModule = {
    ok: (value) => ({ isError: false, value }),
    error: (error) => ({ isError: true, error }),
    get: (source) => {
        if (source.isError) {
            throw 'not hasValue';
        }
        return source.value;
    },
};
class ResultBinder {
    constructor(_source) {
        this._source = _source;
    }
    map(next, binder) {
        if (this._source.isError === true) {
            return new ResultBinder(this._source);
        }
        if (next.isError === true) {
            return new ResultBinder(next);
        }
        return new ResultBinder(exports.ResultModule.ok(binder(this._source.value, next.value)));
    }
    get result() {
        return this._source;
    }
    static create(source) {
        return new ResultBinder(exports.ResultModule.ok(source));
    }
}
exports.ResultBinder = ResultBinder;
