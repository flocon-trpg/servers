import { Result } from '@kizahasi/result';

export type ParseError = {
    ja: string;
};

const parseStringToBooleanCore = (source: string): Result<boolean, ParseError> => {
    switch (source.trim().toLowerCase()) {
        case 'true':
        case '1':
        case 'yes':
        case 'on':
            return Result.ok(true);
        case 'false':
        case '0':
        case 'no':
        case 'off':
            return Result.ok(false);
        default:
            return Result.error({
                ja: `"${source}" を真偽値に変換できませんでした。真として使用できる値は true, 1, yes, on で、偽として使用できる値は false, 0, no, off です。`,
            });
    }
};

type ValueType<T> = Exclude<T, string> | (T extends string ? boolean : never);

export const parseStringToBoolean = <T extends string | null | undefined>(
    source: T
): Result<ValueType<T>, ParseError> => {
    if (source == null) {
        return Result.ok(source as ValueType<T>);
    }
    return parseStringToBooleanCore(source) as Result<ValueType<T>, ParseError>;
};
