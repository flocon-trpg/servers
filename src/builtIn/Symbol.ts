import { beginCast } from '../scriptValue/cast';
import { ScriptError } from '../ScriptError';
import { FFunction } from '../scriptValue/FFunction';
import { FSymbol } from '../scriptValue/FSymbol';
import { GetCoreParams } from '../scriptValue/types';
import { Option } from '@kizahasi/option';
import { FValue } from '../scriptValue/FValue';

class FSymbolClass extends FFunction {
    public constructor() {
        super(({ isNew, args }) => {
            if (isNew) {
                throw ScriptError.notConstructorError();
            }
            const description = beginCast(args[0]).addString().addUndefined().cast();
            return new FSymbol(Symbol(description));
        });
    }

    public override onGetting({ key }: GetCoreParams): Option<FValue> {
        switch (key) {
            case 'iterator': {
                return Option.some(new FSymbol(Symbol.iterator));
            }
            default:
                return Option.none();
        }
    }
}

export const symbolClass = new FSymbolClass();
