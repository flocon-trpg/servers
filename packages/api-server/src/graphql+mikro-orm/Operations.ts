import {
    ApplyError,
    ComposeAndTransformError,
    NonEmptyString,
    PositiveInt,
} from '@kizahasi/ot-string';

export const TextOperationErrorModule = {
    toString: (
        error: ApplyError<unknown> | ComposeAndTransformError<NonEmptyString, PositiveInt>
    ): string => {
        return error.type;
    },
};
