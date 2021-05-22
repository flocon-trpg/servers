import * as t from 'io-ts';

export const compositeKey = t.type({
    createdBy: t.string,
    id: t.string,
});
export type CompositeKey = t.TypeOf<typeof compositeKey>;