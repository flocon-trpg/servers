import { ScriptError } from '../ScriptError';
import { FFunction } from '../scriptValue/FFunction';
import { FMap } from '../scriptValue/FMap';

class FMapClass extends FFunction {
    public constructor() {
        super(({ isNew }) => {
            if (!isNew) {
                throw ScriptError.requiresNewError();
            }
            return FMap.create(new Map());
        });
    }
}

export const mapClass = new FMapClass();
