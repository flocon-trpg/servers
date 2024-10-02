import { ScriptError } from '../ScriptError';
import { FBoolean } from './FBoolean';
import { FFunction } from './FFunction';
import { FObject } from './FObject';
import { FType } from './FType';
import { FValue } from './FValue';
import { beginCast } from './cast';
import { toFValue } from './toFValue';
import { AstInfo, GetCoreParams, SetCoreParams } from './types';

// Recordのkeyのジェネリック化は、convertKeyBackの処理の場合分けが難しいと思われるため不採用。
export class FRecordRef<TValue> extends FObject {
    public constructor(
        public readonly source: Record<string, TValue>,
        protected readonly convertValue: (value: TValue) => FValue,
        protected readonly convertValueBack: (
            value: FValue,
            astInfo: AstInfo | undefined,
        ) => TValue,
    ) {
        super();
    }

    protected prepareInstanceMethod(isNew: boolean, astInfo: AstInfo | undefined) {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }

    protected convertKeyBack(source: FValue, astInfo: AstInfo | undefined) {
        return beginCast(source, astInfo).addString().cast();
    }

    protected validateKey(key: string): void {
        const fail = () => {
            throw new ScriptError(`You cannot use "${key}" as a key`);
        };
        switch (key) {
            case 'toString':
            case 'toLocaleString':
            case 'valueOf':
            case 'hasOwnProperty':
            case 'isPrototypeOf':
            case 'propertyIsEnumerable':
            case 'constructor':
            case 'prototype':
                fail();
        }
        // __proto__の他に、念のため__defineSetter__なども弾けるような処理をしている
        if (key.startsWith('__')) {
            fail();
        }
    }

    public get type(): typeof FType.Object {
        return FType.Object;
    }

    public override getCore(params: GetCoreParams): FValue {
        const { key, astInfo } = params;
        switch (key) {
            case 'delete':
                return new FFunction(({ args, isNew }) => {
                    this.prepareInstanceMethod(isNew, astInfo);
                    const key = this.convertKeyBack(args[0], astInfo);
                    this.validateKey(key);
                    delete this.source[key];
                    return undefined;
                });
            case 'forEach':
                return new FFunction(({ args, isNew }) => {
                    this.prepareInstanceMethod(isNew, astInfo);
                    const callbackfn = beginCast(args[0], astInfo).addFunction().cast()(false);
                    for (const key in this.source) {
                        const value = this.source[key];
                        if (value == null) {
                            throw new Error('this should not happen');
                        }
                        callbackfn([this.convertValue(value), toFValue(key)]);
                    }
                    return undefined;
                });
            case 'get':
                return new FFunction(({ args, isNew }) => {
                    this.prepareInstanceMethod(isNew, astInfo);
                    const key = this.convertKeyBack(args[0], astInfo);
                    this.validateKey(key);
                    const value = this.source[key];
                    if (value === undefined) {
                        return undefined;
                    }
                    return this.convertValue(value);
                });
            case 'has':
                return new FFunction(({ args, isNew }) => {
                    this.prepareInstanceMethod(isNew, astInfo);
                    const key = this.convertKeyBack(args[0], astInfo);
                    this.validateKey(key);
                    return new FBoolean(key in this.source);
                });
            case 'set':
                return new FFunction(({ args, isNew }) => {
                    this.prepareInstanceMethod(isNew, astInfo);
                    const key = this.convertKeyBack(args[0], astInfo);
                    this.validateKey(key);
                    const value = this.convertValueBack(args[1], astInfo);
                    this.source[key] = value;
                    return undefined;
                });
            default:
                break;
        }
        return undefined;
    }

    public override setCore(params: SetCoreParams): void {
        throw new ScriptError('You cannot set any value to this object', params.astInfo?.range);
    }

    public override toPrimitiveAsString(): string {
        return '[object Object]';
    }

    public override toPrimitiveAsNumber(): number {
        return NaN;
    }

    public override toJObject(): Record<string, TValue> {
        return this.source;
    }

    public equals(other: FValue): boolean {
        if (other instanceof FRecordRef) {
            return this.source === other.source;
        }
        return false;
    }
}
