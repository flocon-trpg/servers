import { FBoolean, FFunction, FType, FValue } from '../scriptValue';
import { Option } from '@kizahasi/option';

class SArrayClass extends FFunction {
    public constructor() {
        super(() => {
            throw new Error('Array constructor is not supported');
        });
    }

    public onGetting(key: string | number): Option<FValue> {
        switch (key) {
            case 'isArray': {
                return Option.some(
                    new FFunction(args => {
                        const arg = args[0];
                        return new FBoolean(arg?.type === FType.Array);
                    })
                );
            }
            default:
                return Option.none();
        }
    }
}

export const arrayClass = new SArrayClass();
