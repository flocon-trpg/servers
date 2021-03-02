import { Field, ObjectType } from 'type-graphql';
import { ReplaceBooleanDownOperation, ReplaceBooleanUpOperation, ReplaceNullableNumberDownOperation, ReplaceNullableNumberUpOperation, ReplaceNumberDownOperation, ReplaceNumberUpOperation } from '../../../../../Operations';

export const number = 'number'; 
export const numberOperation = 'numberOperation'; 

export type NumberValueStateJsonType = {
    version: 1;
    type: typeof number;

    isValuePrivate: boolean;
    valueRangeMin?: number | null;
    valueRangeMax?: number | null;
    value: number;
}

export const isNumberValueStateJsonType = (source: NumberValueStateJsonType): source is NumberValueStateJsonType => {
    return true;
};

export type NumberValueOperationJsonType = {
    version: 1;
    type: typeof numberOperation;

    isValuePrivate?: ReplaceBooleanDownOperation | null;
    valueRangeMin?: ReplaceNullableNumberDownOperation | null;
    valueRangeMax?: ReplaceNullableNumberDownOperation | null;
    value?: ReplaceNumberDownOperation | null;
}

export const isNumberValueOperationJsonType = (source: NumberValueOperationJsonType): source is NumberValueOperationJsonType => {
    return true;
};
