import { ScriptError } from '../ScriptError';
import { mapIterator } from '../utils/mapIterator';
import { FArray } from './FArray';
import { FBoolean } from './FBoolean';
import { FFunction } from './FFunction';
import { FNumber } from './FNumber';
import { FObject } from './FObject';
import { FType } from './FType';
import { FValue } from './FValue';
import { beginCast } from './cast';
import { toFValue } from './toFValue';
import { AstInfo, GetCoreParams, SetCoreParams } from './types';

type Key = string | number | boolean | symbol | null | undefined;

export class FMap extends FObject {
    protected constructor(
        private readonly source: Map<Key, unknown>,
        private readonly convertValue: (value: unknown) => FValue,
        private readonly convertValueBack: (value: FValue, astInfo: AstInfo | undefined) => unknown,
    ) {
        super();
    }

    private static prepareInstanceMethod(isNew: boolean, astInfo: AstInfo | undefined) {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }

    public static create(source: Map<Key, FValue>): FMap {
        return new FMap(
            source,
            x => x as FValue,
            x => x,
        );
    }

    private convertKeyBack(source: FValue, astInfo: AstInfo | undefined) {
        return beginCast(source, astInfo)
            .addBoolean()
            .addNumber()
            .addString()
            .addSymbol()
            .addNull()
            .addUndefined()
            .cast();
    }

    public get type(): typeof FType.Object {
        return FType.Object;
    }

    public override getCore(params: GetCoreParams): FValue {
        const { key, astInfo } = params;
        switch (key) {
            case 'clear':
                return new FFunction(({ isNew }) => {
                    FMap.prepareInstanceMethod(isNew, astInfo);
                    this.source.clear();
                    return undefined;
                });
            case 'delete':
                return new FFunction(({ args, isNew }) => {
                    FMap.prepareInstanceMethod(isNew, astInfo);
                    const key = this.convertKeyBack(args[0], astInfo);
                    const result = this.source.delete(key);
                    return new FBoolean(result);
                });
            case 'forEach':
                return new FFunction(({ args, isNew }) => {
                    FMap.prepareInstanceMethod(isNew, astInfo);
                    const callbackfn = beginCast(args[0], astInfo).addFunction().cast()(false);
                    this.source.forEach((value, key) =>
                        callbackfn([this.convertValue(value), toFValue(key)]),
                    );
                    return undefined;
                });
            case 'get':
                return new FFunction(({ args, isNew }) => {
                    FMap.prepareInstanceMethod(isNew, astInfo);
                    const key = this.convertKeyBack(args[0], astInfo);
                    const value = this.source.get(key);
                    return this.convertValue(value);
                });
            case 'has':
                return new FFunction(({ args, isNew }) => {
                    FMap.prepareInstanceMethod(isNew, astInfo);
                    const key = this.convertKeyBack(args[0], astInfo);
                    const value = this.source.has(key);
                    return new FBoolean(value);
                });
            case 'size':
                return new FNumber(this.source.size);
            case 'set':
                return new FFunction(({ args, isNew }) => {
                    FMap.prepareInstanceMethod(isNew, astInfo);
                    const key = this.convertKeyBack(args[0], astInfo);
                    const value = this.convertValueBack(args[1], astInfo);
                    this.source.set(key, value);
                    return undefined;
                });
            default:
                break;
        }
        return undefined;
    }

    public override setCore(params: SetCoreParams): void {
        throw new ScriptError('You cannot set any value to Map', params.astInfo?.range);
    }

    public iterate(): IterableIterator<FValue> {
        return mapIterator(this.source[Symbol.iterator](), ([keySource, valueSource]) => {
            const key = toFValue(keySource);
            const value = this.convertValue(valueSource);
            return FArray.create([key, value]);
        });
    }

    public override toPrimitiveAsString(): string {
        return '[object Map]';
    }

    public override toPrimitiveAsNumber(): number {
        return NaN;
    }

    // 正確な型が表現できないのでvalueはunknownとしている
    public override toJObject(): Map<Key, unknown> {
        const result = new Map<Key, unknown>();
        this.source.forEach((value, key) => {
            const converted = this.convertValue(value);
            result.set(key, converted == null ? converted : converted.toJObject());
        });
        return result;
    }
}
