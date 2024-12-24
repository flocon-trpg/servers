import { FRecordRef, FValue, OnGettingParams } from '@flocon-trpg/flocon-script';
export declare class FStateRecord<TSource, TRef extends FValue> extends FRecordRef<TSource | undefined> {
    private readonly createNewState?;
    private readonly toRef;
    constructor({ states, createNewState, toRef, unRef, }: {
        states: Record<string, TSource | undefined>;
        createNewState?: () => TSource;
        toRef: (source: TSource) => TRef;
        unRef: (ref: FValue) => TSource;
    });
    getCore({ key, astInfo }: OnGettingParams): FValue;
}
//# sourceMappingURL=stateRecord.d.ts.map