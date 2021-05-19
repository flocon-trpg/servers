import { ApplyError, ComposeAndTransformError } from '../@shared/textOperation';

export const TextOperationErrorModule = {
    toString: (error: ApplyError<unknown> | ComposeAndTransformError): string => {
        return error.type;
    },
};