export const replace = 'replace';
export const update = 'update';

export type OperationElement<TState, TOperation> =
    | {
          type: typeof replace;
          newValue: TState | undefined;
      }
    | {
          type: typeof update;
          operation: TOperation;
      };
