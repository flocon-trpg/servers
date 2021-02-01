import { __ } from '../@shared/collection';
import { delete$, insert$, retain, TextTwoWayOperation, TextUpOperation } from '../@shared/textOperation';
import { TextUpOperationUnit, TextUpOperationUnitInput } from '../generated/graphql';

export const TextUpOperationModule = {
    ofUnit: (source: ReadonlyArray<TextUpOperationUnit | TextUpOperationUnitInput> | null | undefined): TextUpOperation.Operation | undefined => {
        if (source == null) {
            return undefined;
        }

        const unit = __(source).compact(unit => {
            // TextDownOperationUnit のインスタンスが制約を守っていなくても、処理は続行される。

            if (unit.delete != null) {
                return {
                    type: delete$,
                    delete: unit.delete,
                } as const;
            }
            if (unit.insert != null) {
                return {
                    type: insert$,
                    insert: unit.insert,
                } as const;
            }
            if (unit.retain != null) {
                return {
                    type: retain,
                    retain: unit.retain,
                } as const;
            }
            return null;
        }).toArray();

        return TextUpOperation.ofUnit(unit);
    },
    toUnit: (source: TextUpOperation.Operation): TextUpOperationUnit[] => {
        return TextUpOperation.toUnit(source).map(unit => {
            switch (unit.type) {
                case retain:
                    return { retain: unit.retain };
                case insert$:
                    return { insert: unit.insert };
                case delete$:
                    return { delete: unit.delete };
            }
        });
    },
    apply: (prevState: string, action: TextUpOperation.Operation | undefined) => {
        if (action == null) {
            return prevState;
        }
        const result = TextUpOperation.apply({prevState, action});
        if (result.isError) {
            throw `TextUpOperationModule.apply failure: ${JSON.stringify({prevState, action})}`;
        }
        return result.value;
    },
    transform: ({ first, second }: { first?: TextUpOperation.Operation; second?: TextUpOperation.Operation }): { firstPrime?: TextUpOperation.Operation; secondPrime?: TextUpOperation.Operation }=> {
        if (first == null || second == null) {
            return {
                firstPrime: first,
                secondPrime: second,
            };
        }
        const result = TextUpOperation.transform({ 
            first, second,
        });
        if (result.isError) {
            throw `TextUpOperationModule.transform failure: ${JSON.stringify({ first, second })}`;
        }
        return result.value;
    },
    diff: ({ first, second }: { first: string; second: string }): TextUpOperation.Operation | undefined => {
        const diff = TextTwoWayOperation.diff({ first, second });

        if (diff == null) {
            return undefined;
        }

        return TextTwoWayOperation.toUpOperation(diff);
    },
};