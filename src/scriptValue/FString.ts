import { ScriptError } from '../ScriptError';
import { FFunction } from './FFunction';
import { FType } from './FType';
import { FValue } from './FValue';
import { tryToPropertyName } from './tryToPropertyName';
import { AstInfo, FObjectBase, GetParams, SetParams } from './types';

export class FString implements FObjectBase {
    public constructor(public readonly raw: string) {}

    private static prepareInstanceMethod(isNew: boolean, astInfo: AstInfo | undefined) {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }

    public get type(): typeof FType.String {
        return FType.String;
    }

    public get({ property, astInfo }: GetParams): FValue {
        const propertyName = tryToPropertyName(property);
        switch (propertyName) {
            // TODO: もっと実装する
            case 'toString':
                return new FFunction(({ isNew }) => {
                    FString.prepareInstanceMethod(isNew, astInfo);
                    return this;
                });
            default:
                return undefined;
        }
    }

    public set({ astInfo }: SetParams): void {
        throw new ScriptError('You cannot set any value to String', astInfo?.range);
    }

    public toPrimitiveAsString() {
        return this.raw.toString();
    }

    public toPrimitiveAsNumber() {
        return +this.raw;
    }

    public toJObject(): string {
        return this.raw;
    }
}
