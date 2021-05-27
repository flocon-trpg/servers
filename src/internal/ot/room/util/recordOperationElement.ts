import * as t from 'io-ts';

export type DualKeyRecord<T> = Record<string, Record<string, T>>;

export const update = 'update';
export const replace = 'replace';

export const recordDownOperationElementFactory = <
    TState extends t.Mixed,
    TOperation extends t.Mixed
>(
    state: TState,
    operation: TOperation
) =>
    t.union([
        t.type({
            type: t.literal(replace),
            replace: t.partial({
                oldValue: state,
            }),
        }),
        t.type({
            type: t.literal(update),
            update: operation,
        }),
    ]);

export type RecordDownOperationElement<TState, TOperation> =
    | {
          type: typeof replace;
          replace: {
              oldValue?: TState;
          };
      }
    | {
          type: typeof update;
          update: TOperation;
      };

export const recordUpOperationElementFactory = <
    TState extends t.Mixed,
    TOperation extends t.Mixed
>(
    state: TState,
    operation: TOperation
) =>
    t.union([
        t.type({
            type: t.literal(replace),
            replace: t.partial({
                newValue: state,
            }),
        }),
        t.type({
            type: t.literal(update),
            update: operation,
        }),
    ]);

export type RecordUpOperationElement<TState, TOperation> =
    | {
          type: typeof replace;
          replace: {
              newValue?: TState;
          };
      }
    | {
          type: typeof update;
          update: TOperation;
      };

export type RecordTwoWayOperationElement<TState, TOperation> =
    | {
          type: typeof replace;
          replace: {
              oldValue?: TState;
              newValue?: TState;
          };
      }
    | {
          type: typeof update;
          update: TOperation;
      };

export const mapRecordOperationElement = <
    TReplace1,
    TReplace2,
    TOperation1,
    TOperation2
>({
    source,
    mapOperation,
    mapReplace,
}: {
    source:
        | {
              type: typeof replace;
              replace: TReplace1;
          }
        | {
              type: typeof update;
              update: TOperation1;
          };
    mapReplace: (replace: TReplace1) => TReplace2;
    mapOperation: (operation: TOperation1) => TOperation2;
}):
    | {
          type: typeof replace;
          replace: TReplace2;
      }
    | {
          type: typeof update;
          update: TOperation2;
      } => {
    if (source.type === replace) {
        return {
            type: replace,
            replace: mapReplace(source.replace),
        };
    }
    return {
        type: update,
        update: mapOperation(source.update),
    };
};
