import { SBoolean, SFunction, SType, SValue } from '../scriptValue';
import { Option } from '@kizahasi/option';

class SArrayClass extends SFunction {
    public constructor() {
        super(() => {
            throw new Error('Array constructor is not supported');
        });
    }

    public onGetting(key: string | number): Option<SValue> {
        switch (key) {
            case 'isArray': {
                return Option.some(
                    new SFunction(args => {
                        const arg = args[0];
                        return new SBoolean(arg?.type === SType.Array);
                    })
                );
            }
            default:
                return Option.none();
        }
    }
}

export const arrayClass = new SArrayClass();
