import { FType } from './FType';
import { FValue } from './FValue';
import { toPropertyName } from './toPropertyName';
import { tryToPropertyName } from './tryToPropertyName';
import { FObjectBase, GetCoreParams, GetParams, SetCoreParams, SetParams } from './types';

export abstract class FObject implements FObjectBase {
    protected abstract getCore(params: GetCoreParams): FValue;

    public get({ property, astInfo }: GetParams): FValue {
        const key = tryToPropertyName(property);
        if (key == null) {
            return undefined;
        }
        return this.getCore({ key, astInfo });
    }

    // setを拒否したい場合は何かをthrowする。
    protected abstract setCore(params: SetCoreParams): void;

    public set({ property, newValue, astInfo }: SetParams): void {
        const key = toPropertyName(property, astInfo);
        this.setCore({ key, newValue, astInfo });
    }

    public get type(): typeof FType.Object {
        return FType.Object;
    }

    public toPrimitiveAsString() {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        return {}.toString();
    }

    public toPrimitiveAsNumber() {
        return +{};
    }

    public abstract toJObject(): unknown;
}
