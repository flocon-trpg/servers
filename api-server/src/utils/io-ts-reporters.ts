import { Errors } from 'io-ts';
import {
    formatValidationErrors as formatValidationErrorsCore,
    ReporterOptions,
} from 'io-ts-reporters';

export const formatValidationErrors = (
    errors: Errors,
    options?: ReporterOptions | undefined
): string => {
    const errorArray = formatValidationErrorsCore(errors, options);
    return errorArray[0] ?? 'unknown encode error';
};
