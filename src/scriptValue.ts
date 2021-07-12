// prototype汚染を防ぐため、オブジェクトをラップしたclass（SBoolean, SNumberなど）を定義している

import { mapToRecord } from '@kizahasi/util';
import { Option } from '@kizahasi/option';

type SObjectBase = {
    get(property: SValue): SValue;
    set(property: SValue, newValue: SValue): void;
    toPrimitiveAsNumber(): number;
    toPrimitiveAsString(): string;
    toPrimitiveAsDefault?(): number | string;
};

export namespace SType {
    export const Boolean = 'Boolean';
    export const Number = 'Number';
    export const String = 'String';
    export const Array = 'Array';
    export const Record = 'Record';
    export const Function = 'Function';
}

const tryToPropertyName = (value: SValue): string | undefined => {
    switch (value?.type) {
        case SType.Number:
        case SType.String:
            return value.raw.toString();
        default:
            return undefined;
    }
};

export const toTypeName = (value: SValue) => {
    if (value === null) {
        return 'null';
    }
    if (value === undefined) {
        return 'undefined';
    }
    return value.type;
};

const toNumberOrUndefined = (value: SValue): number | undefined => {
    if (value === undefined) {
        return undefined;
    }
    if (value?.type !== SType.Number) {
        throw new Error(
            `Expected type is Number or undefined, but actually ${toTypeName(
                value
            )}`
        );
    }
    return value.raw;
};

const toNumberOrString = (value: SValue): number | string => {
    switch (value?.type) {
        case SType.Number:
        case SType.String:
            break;
        default:
            throw new Error(
                `Expected type is Number or String, but actually ${toTypeName(
                    value
                )}`
            );
    }
    return value.raw;
};

const toFunction = (value: SValue): ((args: SValue[]) => SValue) => {
    switch (value?.type) {
        case SType.Function:
            return (args: SValue[]) => value.exec(args, false);
        default:
            throw new Error(
                `Expected type is Number or String, but actually ${toTypeName(
                    value
                )}`
            );
    }
};

export class SBoolean implements SObjectBase {
    public constructor(public readonly raw: boolean) {}

    public get type(): typeof SType.Boolean {
        return SType.Boolean;
    }

    public get(property: SValue): SValue {
        const propertyName = tryToPropertyName(property);
        switch (propertyName) {
            case 'toString':
                return new SFunction(() => {
                    return new SString(this.raw.toString());
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

export class SNumber implements SObjectBase {
    public constructor(public readonly raw: number) {}

    public get type(): typeof SType.Number {
        return SType.Number;
    }

    public get(property: SValue): SValue {
        const propertyName = tryToPropertyName(property);
        switch (propertyName) {
            // TODO: もっと実装する
            case 'toString':
                return new SFunction(args => {
                    const radix = args[0];
                    return new SString(
                        this.raw.toString(toNumberOrUndefined(radix))
                    );
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

export class SString implements SObjectBase {
    public constructor(public readonly raw: string) {}

    public get type(): typeof SType.String {
        return SType.String;
    }

    public get(property: SValue): SValue {
        const propertyName = tryToPropertyName(property);
        switch (propertyName) {
            // TODO: もっと実装する
            case 'toString':
                return new SFunction(() => {
                    return new SString(this.raw.toString());
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

export class SArray implements SObjectBase {
    public constructor(public readonly raw: SValue[]) {}

    public get type(): typeof SType.Array {
        return SType.Array;
    }

    private static isValidIndex(index: string): boolean {
        return index === '0' || /^[1-9][0-9]*$/.test(index);
    }

    public get(property: SValue): SValue {
        const index = toNumberOrString(property).toString();
        if (SArray.isValidIndex(index)) {
            return this.raw[index as unknown as number];
        }
        const propertyName = index;
        switch (propertyName) {
            case 'filter':
                return new SFunction(args => {
                    const predicate = toFunction(args[0]);
                    const raw = this.raw.filter((value, index, array) =>
                        predicate([
                            value,
                            new SNumber(index),
                            new SArray(array),
                        ])?.toJObject()
                    );
                    return new SArray(raw);
                });
        }
        throw new Error(`"${index}" is an invalid index`);
    }

    public set(property: SValue, newValue: SValue): void {
        const index = toNumberOrString(property).toString();
        if (SArray.isValidIndex(index)) {
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

export class SObject implements SObjectBase {
    private readonly raw = new Map<string, SValue>();

    public constructor(base?: SObject) {
        if (base != null) {
            this.raw = new Map(base.raw);
        }
    }

    public get type(): typeof SType.Record {
        return SType.Record;
    }

    protected onGetting(key: string | number): Option<SValue> {
        return Option.none();
    }

    public get(property: SValue): SValue {
        const key = toNumberOrString(property);
        const onGettingResult = this.onGetting(key);
        if (!onGettingResult.isNone) {
            return onGettingResult.value;
        }
        return this.raw.get(key.toString());
    }

    // setを拒否したい場合は何かをthrowする。
    protected onSetting(key: string | number, newValue: SValue): void {
        return;
    }

    public set(property: SValue, newValue: SValue): void {
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

export class SFunction implements SObjectBase {
    public constructor(
        private func: (args: SValue[], isNew: boolean) => SValue
    ) {}

    public get type(): typeof SType.Function {
        return SType.Function;
    }

    public exec(args: SValue[], isNew: boolean): SValue {
        return this.func(args, isNew);
    }

    protected onGetting(key: string | number): Option<SValue> {
        return Option.none();
    }

    public get(property: SValue): SValue {
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

export type SValue =
    | null
    | undefined
    | SBoolean
    | SNumber
    | SString
    | SArray
    | SObject
    | SFunction;

const self = 'self';
const globalThis = 'globalThis';

// keyが'self'か'globalThis'のときは自分自身を返すSRecord
// baseでkeyが'self'か'globalThis'である要素は全て無視される
export class SGlobalRecord extends SObject {
    public constructor(base?: SObject) {
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

function createSValue(source: unknown): SValue {
    if (source === null) {
        return null;
    }
    if (source === undefined) {
        return undefined;
    }
    switch (typeof source) {
        case 'boolean':
            return new SBoolean(source);
        case 'number':
            return new SNumber(source);
        case 'string':
            return new SString(source);
        case 'function':
            // eslint-disable-next-line prefer-spread
            return new SFunction(args => source.apply(null, args));
        default:
            break;
    }
    if (
        source instanceof SArray ||
        source instanceof SBoolean ||
        source instanceof SFunction ||
        source instanceof SNumber ||
        source instanceof SObject ||
        source instanceof SString
    ) {
        return source;
    }
    if (Array.isArray(source)) {
        return new SArray(source.map(x => createSValue(x)));
    }
    return createSRecord(source as Record<string, unknown>);
}

// __proto__ のチェックなどは行われない
function createSRecord(source: Record<string, unknown>): SObject {
    const result = new SObject();
    for (const key in source) {
        result.set(new SString(key), createSValue(source[key]));
    }
    return result;
}

// keyが'self'か'globalThis'である要素は無視されることに注意
export function createSGlobalRecord(
    source: Record<string, unknown>
): SGlobalRecord {
    return new SGlobalRecord(createSRecord(source));
}

// https://ja.javascript.info/object-toprimitive
const toPrimitive = (value: SValue, hint: 'default' | 'string' | 'number') => {
    if (value == null) {
        return value;
    }

    if (hint === 'string') {
        return value.toPrimitiveAsString();
    }

    if (hint === 'number') {
        return value.toPrimitiveAsNumber();
    }

    const obj: SObjectBase = value;
    if (obj.toPrimitiveAsDefault == null) {
        return obj.toPrimitiveAsNumber();
    }

    return obj.toPrimitiveAsDefault();
};

export const eqeqeq = (x: SValue, y: SValue): boolean => {
    if (x === null) {
        return y === null;
    }
    if (x === undefined) {
        return y === undefined;
    }
    switch (x.type) {
        case SType.Boolean:
        case SType.Number:
        case SType.String:
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
export const eqeq = (x: SValue, y: SValue): boolean => {
    if (x == null) {
        return y == null;
    }
    if (y == null) {
        return false;
    }

    switch (x.type) {
        case SType.Boolean:
        case SType.Number:
        case SType.String:
            switch (y.type) {
                case SType.Boolean:
                case SType.Number:
                case SType.String:
                    // eslint-disable-next-line eqeqeq
                    return x.raw == y.raw;
                default:
                    // eslint-disable-next-line eqeqeq
                    return x.raw == toPrimitive(y, 'default');
            }
        default:
            switch (y.type) {
                case SType.Boolean:
                case SType.Number:
                case SType.String:
                    // eslint-disable-next-line eqeqeq
                    return toPrimitive(x, 'default') == y.raw;
                default:
                    return x === y;
            }
    }
};

const compare = <T>(
    left: SValue,
    right: SValue,
    hint: 'default' | 'string' | 'number',
    comparer: (left: unknown, right: unknown) => T
): T => {
    return comparer(toPrimitive(left, hint), toPrimitive(right, hint));
};

export const compareToNumber = (
    left: SValue,
    right: SValue,
    hint: 'default' | 'string' | 'number',
    comparer: (left: any, right: any) => number
) => {
    return new SNumber(compare(left, right, hint, comparer));
};

export const compareToBoolean = (
    left: SValue,
    right: SValue,
    hint: 'default' | 'string' | 'number',
    comparer: (left: any, right: any) => boolean
) => {
    return new SBoolean(compare(left, right, hint, comparer));
};

export const compareToNumberOrString = (
    left: SValue,
    right: SValue,
    hint: 'default',
    comparer: (left: any, right: any) => number | string
) => {
    const r = compare(left, right, hint, comparer);
    if (typeof r === 'number') {
        return new SNumber(r);
    }
    return new SString(r);
};

// https://developer.mozilla.org/ja/docs/Glossary/Falsy
export const isTruthy = (value: SValue): boolean => {
    if (value == null) {
        return false;
    }
    switch (value.type) {
        case SType.Boolean:
        case SType.Number:
        case SType.String:
            if (value.raw) {
                return true;
            } else {
                return false;
            }
        default:
            return true;
    }
};
