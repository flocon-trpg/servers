import { Option } from '@kizahasi/option';
import { ScriptError } from '../ScriptError';
import { FFunction } from '../scriptValue/FFunction';
import { FValue } from '../scriptValue/FValue';
import { AstInfo, GetCoreParams } from '../scriptValue/types';
import { toJObject } from '../utils/toJObject';

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
                        // eslint-disable-next-line no-console
                        console.log(...[this.header, ...args.map(arg => toJObject(arg))]);
                        return undefined;
                    }),
                );
            }
            case 'info': {
                return Option.some(
                    new FFunction(({ args, isNew }) => {
                        FConsoleClass.prepareStaticMethod(isNew, astInfo);
                        // eslint-disable-next-line no-console
                        console.info(...[this.header, ...args.map(arg => toJObject(arg))]);
                        return undefined;
                    }),
                );
            }
            case 'warn': {
                return Option.some(
                    new FFunction(({ args, isNew }) => {
                        FConsoleClass.prepareStaticMethod(isNew, astInfo);
                        // eslint-disable-next-line no-console
                        console.warn(...[this.header, ...args.map(arg => toJObject(arg))]);
                        return undefined;
                    }),
                );
            }
            case 'error': {
                return Option.some(
                    new FFunction(({ args, isNew }) => {
                        FConsoleClass.prepareStaticMethod(isNew, astInfo);
                        // eslint-disable-next-line no-console
                        console.error(...[this.header, ...args.map(arg => toJObject(arg))]);
                        return undefined;
                    }),
                );
            }
            default:
                return Option.none();
        }
    }
}

export const createConsoleClass = (header: string) => new FConsoleClass(header);
