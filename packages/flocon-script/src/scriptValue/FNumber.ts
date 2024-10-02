import { ScriptError } from '../ScriptError';
import { FFunction } from './FFunction';
import { FString } from './FString';
import { FType } from './FType';
import { FValue } from './FValue';
import { beginCast } from './cast';
import { tryToPropertyName } from './tryToPropertyName';
import { AstInfo, FObjectBase, GetParams, SetParams } from './types';

export class FNumber implements FObjectBase {
    public constructor(public readonly raw: number) {}

    private static prepareInstanceMethod(isNew: boolean, astInfo: AstInfo | undefined) {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }

    public get type(): typeof FType.Number {
        return FType.Number;
    }

    public get({ property, astInfo }: GetParams): FValue {
        const propertyName = tryToPropertyName(property);
        switch (propertyName) {
            // TODO: もっと実装する
            case 'toString':
                return new FFunction(({ args, isNew }) => {
                    FNumber.prepareInstanceMethod(isNew, astInfo);
                    const radix = args[0];
                    return new FString(
                        this.raw.toString(
                            beginCast(radix, astInfo).addNumber().addUndefined().cast(),
                        ),
                    );
                });
            default:
                return undefined;
        }
    }

    public set({ astInfo }: SetParams): void {
        throw new ScriptError('You cannot set any value to Number', astInfo?.range);
    }

    public toPrimitiveAsString() {
        return this.raw.toString();
    }

    public toPrimitiveAsNumber() {
        return +this.raw;
    }

    public toJObject(): number {
        return this.raw;
    }
}
