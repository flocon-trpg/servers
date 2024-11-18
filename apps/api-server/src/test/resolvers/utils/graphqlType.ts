import { AnyVariables, OperationResult, TypedDocumentNode } from 'urql';

export type OperationResultByDoc<T> =
    T extends TypedDocumentNode<infer TResult, infer TVariables extends AnyVariables>
        ? OperationResult<TResult, TVariables>
        : never;
