import { FObject } from './FObject';
import { ScriptError } from '../ScriptError';
import { FFunction } from './FFunction';
import { FType } from './FType';
import { FValue } from './FValue';
import { AstInfo, GetCoreParams, SetCoreParams } from './types';
import { FBoolean } from './FBoolean';
import { FRecord } from './FRecord';
import { FString } from './FString';
import { toJObject } from '../utils/toJObject';
import { mapIterator } from '../utils/mapIterator';

export class FIterator extends FObject {
    protected constructor(
        private readonly source: IterableIterator<unknown>,
        private readonly convertValue: (value: unknown) => FValue
    ) {
        super();
    }

    private static prepareInstanceMethod(isNew: boolean, astInfo: AstInfo | undefined) {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }

    public static create(source: IterableIterator<FValue>): FIterator {
        return new FIterator(source, x => x as FValue);
    }

    public get type(): typeof FType.Object {
        return FType.Object;
    }

    public override getCore(params: GetCoreParams): FValue {
        const { key, astInfo } = params;
        switch (key) {
            case 'next':
                return new FFunction(({ isNew }) => {
                    FIterator.prepareInstanceMethod(isNew, astInfo);
                    const next = this.source.next();
                    const result = new FRecord();
                    result.set({
                        property: new FString('value'),
                        newValue: this.convertValue(next.value),
                        astInfo,
                    });
                    result.set({
                        property: new FString('done'),
                        newValue: next.done === undefined ? undefined : new FBoolean(next.done),
                        astInfo,
                    });
                    return result;
                });
        }
        return undefined;
    }

    public override setCore(params: SetCoreParams): void {
        throw new ScriptError('You cannot set any value to Iterator', params.astInfo?.range);
    }

    public iterate(): IterableIterator<FValue> {
        return mapIterator(this.source, x => this.convertValue(x));
    }

    public override toPrimitiveAsString(): string {
        // JavaScriptでは例えば配列由来なら'[object Array Iterator]'となる（ChromeとFirefoxで確認）が、ここでは実装を簡略化するためにすべてIteratorとしている
        return '[object Iterator]';
    }

    public override toPrimitiveAsNumber(): number {
        return NaN;
    }

    public override toJObject(): IterableIterator<unknown> {
        return mapIterator(this.source, x => toJObject(this.convertValue(x)));
    }
}
