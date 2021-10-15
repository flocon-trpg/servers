import { ScriptError } from '../ScriptError';
import { FFunction } from './FFunction';
import { FString } from './FString';
import { FType } from './FType';
import { FValue } from './FValue';
import { tryToPropertyName } from './tryToPropertyName';
import { AstInfo, FObjectBase, GetParams, SetParams } from './types';

export class FSymbol implements FObjectBase {
    public constructor(public readonly raw: symbol) {}

    private static prepareInstanceMethod(isNew: boolean, astInfo: AstInfo | undefined) {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }

    public get type(): typeof FType.Symbol {
        return FType.Symbol;
    }

    public get({ property, astInfo }: GetParams): FValue {
        const propertyName = tryToPropertyName(property);
        switch (propertyName) {
            case 'toString':
                return new FFunction(({ isNew }) => {
                    FSymbol.prepareInstanceMethod(isNew, astInfo);
                    return new FString(this.raw.toString());
                });
            default:
                return undefined;
        }
    }

    public set({ astInfo }: SetParams): void {
        throw new ScriptError('You cannot set any value to Symbol', astInfo?.range);
    }

    public toPrimitiveAsString() {
        return this.raw.toString();
    }

    public toPrimitiveAsNumber(): number {
        throw new ScriptError("can't convert symbol to number");
    }

    public toJObject(): symbol {
        return this.raw;
    }
}
