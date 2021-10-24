import { mapToRecord } from '@kizahasi/util';
import { ScriptError } from '..';
import { FObject } from './FObject';
import { FValue } from './FValue';
import { GetCoreParams, SetCoreParams } from './types';

const symbolNotSupportedMessage = 'Symbol keys are not supported';

// Mapに変換することで、外界から受け取ったオブジェクトに対する破壊的な操作を起こせないようにしている。
export class FRecord extends FObject {
    public readonly source: Map<string, FValue>;

    public constructor(base?: FRecord) {
        super();
        if (base != null) {
            this.source = new Map(base.source);
        } else {
            this.source = new Map();
        }
    }

    protected override getCore({ key, astInfo }: GetCoreParams): FValue {
        if (typeof key === 'symbol') {
            throw new ScriptError(symbolNotSupportedMessage, astInfo?.range);
        }
        return this.source.get(key.toString());
    }

    protected override setCore({ key, newValue, astInfo }: SetCoreParams): void {
        if (typeof key === 'symbol') {
            throw new ScriptError(symbolNotSupportedMessage, astInfo?.range);
        }
        this.source.set(key.toString(), newValue);
    }

    public clone(): FRecord {
        return new FRecord(this);
    }

    public forEach(callbackfn: (value: FValue, key: string) => void) {
        this.source.forEach(callbackfn);
    }

    public override toJObject(): unknown {
        const result = new Map<string, unknown>();
        this.source.forEach((value, key) => {
            result.set(key, value?.toJObject());
        });
        return mapToRecord(result);
    }
}
