import { Option } from '@kizahasi/option';
import { ScriptError } from '../ScriptError';
import { FBoolean } from '../scriptValue/FBoolean';
import { FFunction } from '../scriptValue/FFunction';
import { FType } from '../scriptValue/FType';
import { FValue } from '../scriptValue/FValue';
import { AstInfo, GetCoreParams } from '../scriptValue/types';

class FArrayClass extends FFunction {
    public constructor() {
        super(() => {
            throw new Error('Array constructor is not supported');
        });
    }

    private static prepareStaticMethod(isNew: boolean, astInfo: AstInfo | undefined): void {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }

    public override onGetting({ key, astInfo }: GetCoreParams): Option<FValue> {
        switch (key) {
            case 'isArray': {
                return Option.some(
                    new FFunction(({ args, isNew }) => {
                        FArrayClass.prepareStaticMethod(isNew, astInfo);
                        const arg = args[0];
                        return new FBoolean(arg?.type === FType.Array);
                    }),
                );
            }
            default:
                return Option.none();
        }
    }
}

export const arrayClass = new FArrayClass();
