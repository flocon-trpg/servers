import { AstInfo, GetCoreParams } from '../scriptValue/types';
import { Option } from '@kizahasi/option';
import { ScriptError } from '../ScriptError';
import { FFunction } from '../scriptValue/FFunction';
import { FValue } from '../scriptValue/FValue';

class FConsoleClass extends FFunction {
    public constructor(private readonly header: string) {
        super(() => {
            throw new Error('console constructor is not supported');
        });
    }

    private static prepareStaticMethod(isNew: boolean, astInfo: AstInfo | undefined): void {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }

    public override onGetting({ key, astInfo }: GetCoreParams): Option<FValue> {
        switch (key) {
            case 'log': {
                return Option.some(
                    new FFunction(({ args, isNew }) => {
                        FConsoleClass.prepareStaticMethod(isNew, astInfo);
                        console.log([this.header, ...args]);
                        return undefined;
                    })
                );
            }
            case 'info': {
                return Option.some(
                    new FFunction(({ args, isNew }) => {
                        FConsoleClass.prepareStaticMethod(isNew, astInfo);
                        console.info([this.header, ...args]);
                        return undefined;
                    })
                );
            }
            case 'warn': {
                return Option.some(
                    new FFunction(({ args, isNew }) => {
                        FConsoleClass.prepareStaticMethod(isNew, astInfo);
                        console.warn([this.header, ...args]);
                        return undefined;
                    })
                );
            }
            case 'error': {
                return Option.some(
                    new FFunction(({ args, isNew }) => {
                        FConsoleClass.prepareStaticMethod(isNew, astInfo);
                        console.error([this.header, ...args]);
                        return undefined;
                    })
                );
            }
            default:
                return Option.none();
        }
    }
}

export const createConsoleClass = (header: string) => new FConsoleClass(header);
