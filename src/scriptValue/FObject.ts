import { beginCast } from './cast';
import { FType } from './FType';
import { FValue } from './FValue';
import { FObjectBase, GetCoreParams, GetParams, SetCoreParams, SetParams } from './types';

export abstract class FObject implements FObjectBase {
    protected abstract getCore(params: GetCoreParams): FValue;

    public get({ property, astInfo }: GetParams): FValue {
        const key = beginCast(property).addString().addNumber().cast(astInfo?.range);
        return this.getCore({ key, astInfo });
    }

    // setを拒否したい場合は何かをthrowする。
    protected abstract setCore(params: SetCoreParams): void;

    public set({ property, newValue, astInfo }: SetParams): void {
        const key = beginCast(property).addNumber().addString().cast(astInfo?.range);
        this.setCore({ key, newValue, astInfo });
    }

    public get type(): typeof FType.Object {
        return FType.Object;
    }

    public toPrimitiveAsString() {
        return {}.toString();
    }

    public toPrimitiveAsNumber() {
        return +{};
    }

    public abstract toJObject(): unknown;
}
