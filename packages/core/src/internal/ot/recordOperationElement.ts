import { z } from 'zod';

export const update = 'update';
export const replace = 'replace';

export const recordDownOperationElementFactory = <
    TState extends z.ZodTypeAny,
    TOperation extends z.ZodTypeAny,
>(
    state: TState,
    operation: TOperation,
) =>
    z.union([
        z.object({
            type: z.literal(replace),
            replace: z
                .object({
                    oldValue: state,
                })
                .partial(),
        }),
        z.object({
            type: z.literal(update),
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
    TState extends z.ZodTypeAny,
    TOperation extends z.ZodTypeAny,
>(
    state: TState,
    operation: TOperation,
) =>
    z.union([
        z.object({
            type: z.literal(replace),
            replace: z
                .object({
                    newValue: state,
                })
                .partial(),
        }),
        z.object({
            type: z.literal(update),
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

/**
 * @deprecated Consider using map(DualKey)?Record(Up|Down)?Operation
 */
export const mapRecordOperationElement = <TReplace1, TReplace2, TUpdate1, TUpdate2>({
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
              update: TUpdate1;
          };
    mapReplace: (replace: TReplace1) => TReplace2;
    mapOperation: (operation: TUpdate1) => TUpdate2;
}):
    | {
          type: typeof replace;
          replace: TReplace2;
      }
    | {
          type: typeof update;
          update: TUpdate2;
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
