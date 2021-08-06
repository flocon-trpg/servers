import { AstInfo, FBoolean, FFunction, FType, FValue, GetCoreParams } from '../scriptValue';
import { Option } from '@kizahasi/option';
import { ScriptError } from '..';

class FArrayClass extends FFunction {
    public constructor() {
        super(
            () => {
                throw new Error('Array constructor is not supported');
            },
            undefined,
            false
        );
    }

    private static prepareStaticMethod(isNew: boolean, astInfo: AstInfo | undefined): void {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }

    public onGetting({ key, astInfo }: GetCoreParams): Option<FValue> {
        switch (key) {
            case 'isArray': {
                return Option.some(
                    new FFunction(
                        ({ args, isNew }) => {
                            FArrayClass.prepareStaticMethod(isNew, astInfo);
                            const arg = args[0];
                            return new FBoolean(arg?.type === FType.Array);
                        },
                        this,
                        false
                    )
                );
            }
            default:
                return Option.none();
        }
    }
}

export const arrayClass = new FArrayClass();
