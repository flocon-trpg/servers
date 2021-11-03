import { ScriptError } from '../ScriptError';
import { FRecord } from './FRecord';
import { FValue } from './FValue';
import { GetCoreParams, SetCoreParams } from './types';

const self = 'self';
const globalThis = 'globalThis';

// keyが'self'か'globalThis'のときは自分自身を返すRecord
// baseでkeyが'self'か'globalThis'である要素は全て無視される
export class FGlobalRecord extends FRecord {
    public constructor(base?: FRecord) {
        super(base);
    }

    protected override getCore(params: GetCoreParams): FValue {
        const keyAsString = params.key.toString();
        if (keyAsString === self || keyAsString === globalThis) {
            return this;
        }
        return super.getCore(params);
    }

    protected override setCore({ key, newValue, astInfo }: SetCoreParams): void {
        const keyAsString = key.toString();
        if (keyAsString === self || keyAsString === globalThis) {
            throw new ScriptError(
                `Assignment to '${keyAsString}' is not supported`,
                astInfo?.range
            );
        }
        super.setCore({ key, newValue, astInfo });
    }
}
