import { FObject } from './FObject';
import { ScriptError } from '../ScriptError';
import { beginCast } from './cast';
import { FFunction } from './FFunction';
import { FType } from './FType';
import { FValue } from './FValue';
import { AstInfo, GetCoreParams, SetCoreParams } from './types';
import { FBoolean } from './FBoolean';

type Key = string | number | boolean | symbol | null | undefined;

export class FMap extends FObject {
    protected constructor(
        private readonly source: Map<Key, unknown>,
        private readonly convertValue: (value: unknown) => FValue,
        private readonly convertValueBack: (value: FValue, astInfo: AstInfo | undefined) => unknown
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
            x => x
        );
    }

    private convertKeyBack(source: FValue, astInfo: AstInfo | undefined) {
        return beginCast(source)
            .addBoolean()
            .addNumber()
            .addString()
            .addNull()
            .addUndefined()
            .cast(astInfo?.range);
    }

    public get type(): typeof FType.Object {
        return FType.Object;
    }

    public override getCore(params: GetCoreParams): FValue {
        const { key, astInfo } = params;
        switch (key) {
            case 'clear':
                this.source.clear();
                return undefined;
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
            case 'set':
                return new FFunction(({ args, isNew }) => {
                    FMap.prepareInstanceMethod(isNew, astInfo);
                    const key = this.convertKeyBack(args[0], astInfo);
                    const value = this.convertValueBack(args[1], astInfo);
                    this.source.set(key, value);
                    return undefined;
                });
        }
        return undefined;
    }

    public override setCore(params: SetCoreParams): void {
        throw new ScriptError('You cannot set any value to Map', params.astInfo?.range);
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
