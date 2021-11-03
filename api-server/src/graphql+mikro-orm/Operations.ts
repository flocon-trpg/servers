import { ApplyError, ComposeAndTransformError } from '@kizahasi/ot-string';

export const TextOperationErrorModule = {
    toString: (error: ApplyError<unknown> | ComposeAndTransformError): string => {
        return error.type;
    },
};
