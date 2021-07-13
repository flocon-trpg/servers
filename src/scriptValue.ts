// prototype汚染を防ぐため、オブジェクトをラップしたclass（SBoolean, SNumberなど）を定義している

import { mapToRecord } from '@kizahasi/util';
import { Option } from '@kizahasi/option';

type FObjectBase = {
    get(property: FValue): FValue;
    set(property: FValue, newValue: FValue): void;
    toPrimitiveAsNumber(): number;
    toPrimitiveAsString(): string;
    toPrimitiveAsDefault?(): number | string;
};

export namespace FType {
    export const Boolean = 'Boolean';
    export const Number = 'Number';
    export const String = 'String';
    export const Array = 'Array';
    export const Record = 'Record';
    export const Function = 'Function';
}

const tryToPropertyName = (value: FValue): string | undefined => {
    switch (value?.type) {
        case FType.Number:
        case FType.String:
            return value.raw.toString();
        default:
            return undefined;
    }
};

export const toTypeName = (value: FValue) => {
    if (value === null) {
        return 'null';
    }
    if (value === undefined) {
        return 'undefined';
    }
    return value.type;
};

const toNumberOrUndefined = (value: FValue): number | undefined => {
    if (value === undefined) {
        return undefined;
    }
    if (value?.type !== FType.Number) {
        throw new Error(`Expected type is Number or undefined, but actually ${toTypeName(value)}`);
    }
    return value.raw;
};

const toNumberOrString = (value: FValue): number | string => {
    switch (value?.type) {
        case FType.Number:
        case FType.String:
            break;
        default:
            throw new Error(`Expected type is Number or String, but actually ${toTypeName(value)}`);
    }
    return value.raw;
};

const toFunction = (value: FValue): ((args: FValue[]) => FValue) => {
    switch (value?.type) {
        case FType.Function:
            return (args: FValue[]) => value.exec(args, false);
        default:
            throw new Error(`Expected type is Number or String, but actually ${toTypeName(value)}`);
    }
};

export class FBoolean implements FObjectBase {
    public constructor(public readonly raw: boolean) {}

    public get type(): typeof FType.Boolean {
        return FType.Boolean;
    }

    public get(property: FValue): FValue {
        const propertyName = tryToPropertyName(property);
        switch (propertyName) {
            case 'toString':
                return new FFunction(() => {
                    return new FString(this.raw.toString());
                });
            default:
                return undefined;
        }
    }

    public set(): void {
        throw new Error('You cannot set any value to Boolean');
    }

    public toPrimitiveAsString() {
        return this.raw.toString();
    }

    public toPrimitiveAsNumber() {
        return +this.raw;
    }

    public toJObject(): boolean {
        return this.raw;
    }
}

export class FNumber implements FObjectBase {
    public constructor(public readonly raw: number) {}

    public get type(): typeof FType.Number {
        return FType.Number;
    }

    public get(property: FValue): FValue {
        const propertyName = tryToPropertyName(property);
        switch (propertyName) {
            // TODO: もっと実装する
            case 'toString':
                return new FFunction(args => {
                    const radix = args[0];
                    return new FString(this.raw.toString(toNumberOrUndefined(radix)));
                });
            default:
                return undefined;
        }
    }

    public set(): void {
        throw new Error('You cannot set any value to Number');
    }

    public toPrimitiveAsString() {
        return this.raw.toString();
    }

    public toPrimitiveAsNumber() {
        return +this.raw;
    }

    public toJObject() {
        return this.raw;
    }
}

export class FString implements FObjectBase {
    public constructor(public readonly raw: string) {}

    public get type(): typeof FType.String {
        return FType.String;
    }

    public get(property: FValue): FValue {
        const propertyName = tryToPropertyName(property);
        switch (propertyName) {
            // TODO: もっと実装する
            case 'toString':
                return new FFunction(() => {
                    return new FString(this.raw.toString());
                });
            default:
                return undefined;
        }
    }

    public set(): void {
        throw new Error('You cannot set any value to String');
    }

    public toPrimitiveAsString() {
        return this.raw.toString();
    }

    public toPrimitiveAsNumber() {
        return +this.raw;
    }

    public toJObject() {
        return this.raw;
    }
}

export class FArray implements FObjectBase {
    public constructor(public readonly raw: FValue[]) {}

    public get type(): typeof FType.Array {
        return FType.Array;
    }

    private static isValidIndex(index: string): boolean {
        return index === '0' || /^[1-9][0-9]*$/.test(index);
    }

    public get(property: FValue): FValue {
        const index = toNumberOrString(property).toString();
        if (FArray.isValidIndex(index)) {
            return this.raw[index as unknown as number];
        }
        const propertyName = index;
        switch (propertyName) {
            case 'filter':
                return new FFunction(args => {
                    const predicate = toFunction(args[0]);
                    const raw = this.raw.filter((value, index, array) =>
                        predicate([value, new FNumber(index), new FArray(array)])?.toJObject()
                    );
                    return new FArray(raw);
                });
        }
        throw new Error(`"${index}" is an invalid index`);
    }

    public set(property: FValue, newValue: FValue): void {
        const index = toNumberOrString(property).toString();
        if (FArray.isValidIndex(index)) {
            this.raw[index as unknown as number] = newValue;
            return;
        }
        throw new Error(`"${index}" is an invalid index`);
    }

    public toPrimitiveAsString(): string {
        return this.raw.map(x => x?.toPrimitiveAsString()).toString();
    }

    public toPrimitiveAsNumber(): number {
        return +this.raw.map(x => x?.toPrimitiveAsNumber());
    }

    // 正確な型が表現できないのでunknown[]としている
    public toJObject(): unknown[] {
        return this.raw.map(x => (x == null ? x : x.toJObject()));
    }
}

// Mapに変換することで、外界から受け取ったオブジェクトに対する破壊的な操作を起こせないようにしている。
export class FObject implements FObjectBase {
    private readonly raw: Map<string, FValue>;

    public constructor(base?: FObject) {
        if (base != null) {
            this.raw = new Map(base.raw);
        } else {
            this.raw = new Map();
        }
    }

    public get type(): typeof FType.Record {
        return FType.Record;
    }

    protected onGetting(key: string | number): Option<FValue> {
        return Option.none();
    }

    public get(property: FValue): FValue {
        const key = toNumberOrString(property);
        const onGettingResult = this.onGetting(key);
        if (!onGettingResult.isNone) {
            return onGettingResult.value;
        }
        return this.raw.get(key.toString());
    }

    // setを拒否したい場合は何かをthrowする。
    protected onSetting(key: string | number, newValue: FValue): void {
        return;
    }

    public set(property: FValue, newValue: FValue): void {
        const key = toNumberOrString(property);
        this.onSetting(key, newValue);
        this.raw.set(key.toString(), newValue);
    }

    public toPrimitiveAsString() {
        return {}.toString();
    }

    public toPrimitiveAsNumber() {
        return +{};
    }

    public toJObject() {
        const result = new Map<string, unknown>();
        this.raw.forEach((value, key) => {
            result.set(key, value?.toJObject());
        });
        return mapToRecord(result);
    }
}

export class FFunction implements FObjectBase {
    public constructor(private func: (args: FValue[], isNew: boolean) => FValue) {}

    public get type(): typeof FType.Function {
        return FType.Function;
    }

    public exec(args: FValue[], isNew: boolean): FValue {
        return this.func(args, isNew);
    }

    protected onGetting(key: string | number): Option<FValue> {
        return Option.none();
    }

    public get(property: FValue): FValue {
        const key = toNumberOrString(property);
        const onGettingResult = this.onGetting(key);
        if (!onGettingResult.isNone) {
            return onGettingResult.value;
        }
        // TODO: 実装する。ただし、実装するものは注意して選んだほうがいい（結果としてどれも実装しないことになるかも）。
        return undefined;
    }

    public set(): void {
        throw new Error('You cannot set any value to Function');
    }

    public toPrimitiveAsString() {
        return (() => {
            return;
        }).toString();
    }

    public toPrimitiveAsNumber() {
        return +(() => {
            return;
        });
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    public toJObject(): Function {
        return () => {
            throw new Error('Not supported');
        };
    }
}

export type FValue = null | undefined | FBoolean | FNumber | FString | FArray | FObject | FFunction;

const self = 'self';
const globalThis = 'globalThis';

// keyが'self'か'globalThis'のときは自分自身を返すSRecord
// baseでkeyが'self'か'globalThis'である要素は全て無視される
export class FGlobalRecord extends FObject {
    public constructor(base?: FObject) {
        super(base);
    }

    protected override onGetting(key: string | number) {
        const keyAsString = key.toString();
        if (keyAsString === self || keyAsString === globalThis) {
            return Option.some(this);
        }
        return Option.none();
    }

    protected override onSetting(key: string | number) {
        const keyAsString = key.toString();
        if (keyAsString === self || keyAsString === globalThis) {
            throw new Error(`Assignment to '${keyAsString}' is not supported`);
        }
    }
}

export function createFValue(source: unknown): FValue {
    if (source === null) {
        return null;
    }
    if (source === undefined) {
        return undefined;
    }
    switch (typeof source) {
        case 'boolean':
            return new FBoolean(source);
        case 'number':
            return new FNumber(source);
        case 'string':
            return new FString(source);
        case 'function':
            // eslint-disable-next-line prefer-spread
            return new FFunction(args => source.apply(null, args));
        default:
            break;
    }
    if (
        source instanceof FArray ||
        source instanceof FBoolean ||
        source instanceof FFunction ||
        source instanceof FNumber ||
        source instanceof FObject ||
        source instanceof FString
    ) {
        return source;
    }
    if (Array.isArray(source)) {
        return new FArray(source.map(x => createFValue(x)));
    }
    return createFObject(source as Record<string, unknown>);
}

// __proto__ のチェックなどは行われない
function createFObject(source: Record<string, unknown>): FObject {
    const result = new FObject();
    for (const key in source) {
        result.set(new FString(key), createFValue(source[key]));
    }
    return result;
}

// keyが'self'か'globalThis'である要素は無視されることに注意
export function createFGlobalRecord(source: Record<string, unknown>): FGlobalRecord {
    return new FGlobalRecord(createFObject(source));
}

// https://ja.javascript.info/object-toprimitive
const toPrimitive = (value: FValue, hint: 'default' | 'string' | 'number') => {
    if (value == null) {
        return value;
    }

    if (hint === 'string') {
        return value.toPrimitiveAsString();
    }

    if (hint === 'number') {
        return value.toPrimitiveAsNumber();
    }

    const obj: FObjectBase = value;
    if (obj.toPrimitiveAsDefault == null) {
        return obj.toPrimitiveAsNumber();
    }

    return obj.toPrimitiveAsDefault();
};

export const eqeqeq = (x: FValue, y: FValue): boolean => {
    if (x === null) {
        return y === null;
    }
    if (x === undefined) {
        return y === undefined;
    }
    switch (x.type) {
        case FType.Boolean:
        case FType.Number:
        case FType.String:
            if (y?.type !== x.type) {
                return false;
            }
            return x.raw === y.raw;
        default:
            return x === y;
    }
};

// 例えばxとyがObjectのときは x === y で比較されるため、「toPrimitiveで変換してから==で比較」という作戦は使えない。そのため、ここで専用の関数を定義している。
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Equality_comparisons_and_sameness
export const eqeq = (x: FValue, y: FValue): boolean => {
    if (x == null) {
        return y == null;
    }
    if (y == null) {
        return false;
    }

    switch (x.type) {
        case FType.Boolean:
        case FType.Number:
        case FType.String:
            switch (y.type) {
                case FType.Boolean:
                case FType.Number:
                case FType.String:
                    // eslint-disable-next-line eqeqeq
                    return x.raw == y.raw;
                default:
                    // eslint-disable-next-line eqeqeq
                    return x.raw == toPrimitive(y, 'default');
            }
        default:
            switch (y.type) {
                case FType.Boolean:
                case FType.Number:
                case FType.String:
                    // eslint-disable-next-line eqeqeq
                    return toPrimitive(x, 'default') == y.raw;
                default:
                    return x === y;
            }
    }
};

const compare = <T>(
    left: FValue,
    right: FValue,
    hint: 'default' | 'string' | 'number',
    comparer: (left: unknown, right: unknown) => T
): T => {
    return comparer(toPrimitive(left, hint), toPrimitive(right, hint));
};

export const compareToNumber = (
    left: FValue,
    right: FValue,
    hint: 'default' | 'string' | 'number',
    comparer: (left: any, right: any) => number
) => {
    return new FNumber(compare(left, right, hint, comparer));
};

export const compareToBoolean = (
    left: FValue,
    right: FValue,
    hint: 'default' | 'string' | 'number',
    comparer: (left: any, right: any) => boolean
) => {
    return new FBoolean(compare(left, right, hint, comparer));
};

export const compareToNumberOrString = (
    left: FValue,
    right: FValue,
    hint: 'default',
    comparer: (left: any, right: any) => number | string
) => {
    const r = compare(left, right, hint, comparer);
    if (typeof r === 'number') {
        return new FNumber(r);
    }
    return new FString(r);
};

// https://developer.mozilla.org/ja/docs/Glossary/Falsy
export const isTruthy = (value: FValue): boolean => {
    if (value == null) {
        return false;
    }
    switch (value.type) {
        case FType.Boolean:
        case FType.Number:
        case FType.String:
            if (value.raw) {
                return true;
            } else {
                return false;
            }
        default:
            return true;
    }
};
