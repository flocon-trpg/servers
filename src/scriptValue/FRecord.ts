import { mapToRecord } from '@kizahasi/util';
import { FObject } from './FObject';
import { FValue } from './FValue';
import { GetCoreParams, SetCoreParams } from './types';

// Mapに変換することで、外界から受け取ったオブジェクトに対する破壊的な操作を起こせないようにしている。
export class FRecord extends FObject {
    private readonly raw: Map<string, FValue>;

    public constructor(base?: FRecord) {
        super();
        if (base != null) {
            this.raw = new Map(base.raw);
        } else {
            this.raw = new Map();
        }
    }

    protected override getCore({ key }: GetCoreParams): FValue {
        return this.raw.get(key.toString());
    }

    protected override setCore({ key, newValue }: SetCoreParams): void {
        this.raw.set(key.toString(), newValue);
    }

    public override toJObject(): unknown {
        const result = new Map<string, unknown>();
        this.raw.forEach((value, key) => {
            result.set(key, value?.toJObject());
        });
        return mapToRecord(result);
    }
}
