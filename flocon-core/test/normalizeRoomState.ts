import _ from 'lodash';

const isEmpty = (source: Record<string, unknown>): boolean => {
    for (const key in source) {
        const value = source[key];
        if (value !== undefined) {
            return false;
        }
    }
    return true;
};

const isDefaultSimpleParam = (source: Record<string, unknown>) => {
    if (
        _.isEqual(source, {
            $v: 1,
            $r: 1,
            isValuePrivate: false,
            value: null,
        })
    ) {
        return true;
    }
    return _.isEqual(source, {
        $v: 1,
        $r: 1,
        isValuePrivate: false,
        value: undefined,
    });
};

const isDefaultStrParam = (source: Record<string, unknown>) => {
    return _.isEqual(source, {
        $v: 1,
        $r: 1,
        isValuePrivate: false,
        value: '',
    });
};

const isDefaultParam = (source: Record<string, unknown>) => {
    if (isDefaultSimpleParam(source)) {
        return true;
    }
    if (isDefaultStrParam(source)) {
        return true;
    }
    return false;
};

/*
# 行われること1
値がない、もしくはすべての値がundefinedであるRecordをundefinedに変換する。
これにより、例えば { a: {} } のようなDualKeyRecordを {} と等しいとみなすことができるようになる。

# 行われること2
キャラクターのパラメーター値（e.g. strParam）がデフォルト値の場合、undefinedに変換する。これは、undefinedは自動的に何らかのデフォルト値に変換されることがあるため。
レコード内の場所は見ずに、ただ単に値がデフォルト値のどれかに等しいかのみ見る。

# 行われること3
nullをundefinedに変換する。
*/
export const normalizeRoomState = (source: unknown): any => {
    switch (typeof source) {
        case 'object': {
            if (source == null) {
                return undefined;
            }
            if (_.isDate(source)) {
                return source;
            }
            const record = source as Record<string, unknown>;
            if (isDefaultParam(record)) {
                return undefined;
            }
            const result: Record<string, unknown> = {};
            for (const key in record) {
                result[key] = normalizeRoomState(record[key]);
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
