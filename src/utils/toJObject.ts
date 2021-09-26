import { FValue } from '../scriptValue';

// 単にsource?.toJObject() と書くと、source === nullのときにnullではなくundefinedとなってしまう。これでは困る場面があるため、この関数を定義している。
export const toJObject = (source: FValue) => {
    if (source == null) {
        return source;
    }
    return source.toJObject();
};
