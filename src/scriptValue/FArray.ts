import { ScriptError } from '../ScriptError';
import { beginCast } from './cast';
import { FFunction } from './FFunction';
import { FNumber } from './FNumber';
import { FType } from './FType';
import { FValue } from './FValue';
import { AstInfo, FObjectBase, GetParams, SetParams } from './types';

export class FArray implements FObjectBase {
    protected constructor(
        private readonly source: unknown[],
        private readonly convert: (value: unknown) => FValue,
        private readonly convertBack: (value: FValue, astInfo: AstInfo | undefined) => unknown
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
            x => x
        );
    }

    public get type(): typeof FType.Array {
        return FType.Array;
    }

    public iterate(): FValue[] {
        return this.source.map(x => this.convert(x));
    }

    private static isValidIndex(index: string): boolean {
        return index === '0' || /^[1-9][0-9]*$/.test(index);
    }

    public get({ property, astInfo }: GetParams): FValue {
        const index = beginCast(property, astInfo).addString().addNumber().cast().toString();
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
                    const raw = this.iterate().filter((value, index) =>
                        predicate([value, new FNumber(index)])?.toJObject()
                    );
                    return FArray.create(raw);
                });
            case 'map':
                return new FFunction(({ args, isNew }) => {
                    FArray.prepareInstanceMethod(isNew, astInfo);
                    const mapping = beginCast(args[0], astInfo).addFunction().cast()(false);
                    const raw = this.iterate().map((value, index) =>
                        mapping([value, new FNumber(index)])
                    );
                    return FArray.create(raw);
                });
            case 'push':
                return new FFunction(({ args, isNew }) => {
                    FArray.prepareInstanceMethod(isNew, astInfo);
                    const newValue = this.convertBack(args[0], astInfo);
                    this.source.push(newValue);
                    return undefined;
                });
        }
        return undefined;
    }

    public set({ property, newValue, astInfo }: SetParams): void {
        const index = beginCast(property, astInfo).addNumber().addString().toString();
        if (FArray.isValidIndex(index)) {
            this.source[index as unknown as number] = this.convertBack(newValue, astInfo);
            return;
        }
        throw new ScriptError(`"${index}" is not supported`, astInfo?.range);
    }

    public toPrimitiveAsString(): string {
        return this.iterate()
            .map(x => x?.toPrimitiveAsString())
            .toString();
    }

    public toPrimitiveAsNumber(): number {
        return +this.iterate().map(x => x?.toPrimitiveAsNumber());
    }

    // 正確な型が表現できないのでunknown[]としている
    public toJObject(): unknown[] {
        return this.iterate().map(x => (x == null ? x : x.toJObject()));
    }
}

export class FTypedArray<T> extends FArray {
    public constructor(
        source: T[],
        convert: (value: T) => FValue,
        convertBack: (value: FValue, astInfo: AstInfo | undefined) => T
    ) {
        super(source, value => convert(value as T), convertBack);
    }
}
