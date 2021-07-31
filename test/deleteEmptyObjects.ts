import _ from 'lodash';

export const isEmpty = (source: Record<string, unknown>): boolean => {
    for (const key in source) {
        const value = source[key];
        if (value !== undefined) {
            return false;
        }
    }
    return true;
};

// # 行われること1
// 値がない、もしくはすべての値がundefinedであるRecordをundefinedに変換する。
// これにより、例えば { a: {} } のようなDualKeyRecordを {} と等しいとみなすことができるようになる。
// # 行われること2
// nullをundefinedに変換する。
export const toTestableObject = (source: unknown): any => {
    switch (typeof source) {
        case 'object': {
            if (source == null) {
                return undefined;
            }
            if (_.isDate(source)) {
                return source;
            }
            const record = source as Record<string, unknown>;
            const result: Record<string, unknown> = {};
            for (const key in record) {
                result[key] = toTestableObject(record[key]);
            }
            if (isEmpty(result)) {
                return undefined;
            }
            return result;
        }
        default:
            return source;
    }
};
