import { ScriptError } from '../ScriptError';
import { FFunction } from './FFunction';
import { FString } from './FString';
import { FType } from './FType';
import { FValue } from './FValue';
import { tryToPropertyName } from './tryToPropertyName';
import { AstInfo, FObjectBase, GetParams, SetParams } from './types';

export class FBoolean implements FObjectBase {
    public constructor(public readonly raw: boolean) {}

    private static prepareInstanceMethod(isNew: boolean, astInfo: AstInfo | undefined) {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }

    public get type(): typeof FType.Boolean {
        return FType.Boolean;
    }

    public get({ property, astInfo }: GetParams): FValue {
        const propertyName = tryToPropertyName(property);
        switch (propertyName) {
            case 'toString':
                return new FFunction(({ isNew }) => {
                    FBoolean.prepareInstanceMethod(isNew, astInfo);
                    return new FString(this.raw.toString());
                });
            default:
                return undefined;
        }
    }

    public set({ astInfo }: SetParams): void {
        throw new ScriptError('You cannot set any value to Boolean', astInfo?.range);
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
