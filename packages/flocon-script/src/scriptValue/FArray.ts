import { ScriptError } from '../ScriptError';
import { mapIterator } from '../utils/mapIterator';
import { FFunction } from './FFunction';
import { FIterator } from './FIterator';
import { FNumber } from './FNumber';
import { FType } from './FType';
import { FValue } from './FValue';
import { beginCast } from './cast';
import { toPropertyName } from './toPropertyName';
import { tryToPropertyName } from './tryToPropertyName';
import { AstInfo, FObjectBase, GetParams, SetParams } from './types';

export class FArray implements FObjectBase {
    protected constructor(
        private readonly source: unknown[],
        private readonly convert: (value: unknown) => FValue,
        private readonly convertBack: (value: FValue, astInfo: AstInfo | undefined) => unknown,
    ) {}

    private static prepareInstanceMethod(isNew: boolean, astInfo: AstInfo | undefined) {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }

    public static create(source: FValue[]): FArray {
        return new FArray(
            source,
            x => x as FValue,
            x => x,
        );
    }

    public get type(): typeof FType.Array {
        return FType.Array;
    }

    public toJArray(): FValue[] {
        return this.source.map(x => this.convert(x));
    }

    public iterate(): IterableIterator<FValue> {
        return mapIterator(this.source[Symbol.iterator](), x => this.convert(x));
    }

    private static isValidIndex(index: string | symbol | undefined): boolean {
        if (index == null || typeof index === 'symbol') {
            return false;
        }
        return index === '0' || /^[1-9][0-9]*$/.test(index);
    }

    public get({ property, astInfo }: GetParams): FValue {
        const index = tryToPropertyName(property);
        if (FArray.isValidIndex(index)) {
            const found = this.source[index as unknown as number];
            if (found === undefined) {
                return undefined;
            }
            return this.convert(found);
        }
        const propertyName = index;
        switch (propertyName) {
            case 'filter':
                return new FFunction(({ args, isNew }) => {
                    FArray.prepareInstanceMethod(isNew, astInfo);
                    const predicate = beginCast(args[0], astInfo).addFunction().cast()(false);
                    const raw = this.toJArray().filter((value, index) =>
                        predicate([value, new FNumber(index)])?.toJObject(),
                    );
                    return FArray.create(raw);
                });
            case 'find':
                return new FFunction(({ args, isNew }) => {
                    FArray.prepareInstanceMethod(isNew, astInfo);
                    const predicate = beginCast(args[0], astInfo).addFunction().cast()(false);
                    const raw = this.toJArray().find((value, index) =>
                        predicate([value, new FNumber(index)])?.toJObject(),
                    );
                    return raw;
                });
            case 'forEach':
                return new FFunction(({ args, isNew }) => {
                    FArray.prepareInstanceMethod(isNew, astInfo);
                    const callbackfn = beginCast(args[0], astInfo).addFunction().cast()(false);
                    this.toJArray().forEach((value, index) =>
                        callbackfn([value, new FNumber(index)]),
                    );
                    return undefined;
                });
            case 'map':
                return new FFunction(({ args, isNew }) => {
                    FArray.prepareInstanceMethod(isNew, astInfo);
                    const mapping = beginCast(args[0], astInfo).addFunction().cast()(false);
                    const raw = this.toJArray().map((value, index) =>
                        mapping([value, new FNumber(index)]),
                    );
                    return FArray.create(raw);
                });
            case 'pop':
                return new FFunction(({ isNew }) => {
                    FArray.prepareInstanceMethod(isNew, astInfo);
                    const result = this.source.pop();
                    return this.convert(result);
                });
            case 'push':
                return new FFunction(({ args, isNew }) => {
                    FArray.prepareInstanceMethod(isNew, astInfo);
                    args.forEach(arg => {
                        const newValue = this.convertBack(arg, astInfo);
                        this.source.push(newValue);
                    });
                    return new FNumber(this.source.length);
                });
            case 'shift':
                return new FFunction(({ isNew }) => {
                    FArray.prepareInstanceMethod(isNew, astInfo);
                    const result = this.source.shift();
                    return this.convert(result);
                });
            case 'unshift':
                return new FFunction(({ args, isNew }) => {
                    FArray.prepareInstanceMethod(isNew, astInfo);
                    args.reduceRight<void>((seed, arg) => {
                        const newValue = this.convertBack(arg, astInfo);
                        this.source.unshift(newValue);
                    }, undefined);
                    return new FNumber(this.source.length);
                });
            case Symbol.iterator:
                return new FFunction(({ isNew }) => {
                    FArray.prepareInstanceMethod(isNew, astInfo);
                    const source = this.source[Symbol.iterator]();
                    return FIterator.create(mapIterator(source, x => this.convert(x)));
                });
            default:
                break;
        }
        return undefined;
    }

    public set({ property, newValue, astInfo }: SetParams): void {
        const index = toPropertyName(property, astInfo);
        if (FArray.isValidIndex(index)) {
            this.source[index as unknown as number] = this.convertBack(newValue, astInfo);
            return;
        }
        throw new ScriptError(
            `"${typeof index === 'symbol' ? 'symbol' : index}" is not supported`,
            astInfo?.range,
        );
    }

    public toPrimitiveAsString(): string {
        return this.toJArray()
            .map(x => x?.toPrimitiveAsString())
            .toString();
    }

    public toPrimitiveAsNumber(): number {
        return +this.toJArray().map(x => x?.toPrimitiveAsNumber());
    }

    // 正確な型が表現できないのでunknown[]としている
    public toJObject(): unknown[] {
        return this.toJArray().map(x => (x == null ? x : x.toJObject()));
    }
}

export class FTypedArray<T> extends FArray {
    public constructor(
        source: T[],
        convert: (value: T) => FValue,
        convertBack: (value: FValue, astInfo: AstInfo | undefined) => T,
    ) {
        super(source, value => convert(value as T), convertBack);
    }
}
