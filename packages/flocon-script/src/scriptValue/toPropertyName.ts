import { FValue } from './FValue';
import { beginCast } from './cast';
import { AstInfo } from './types';

// If you do not want to throw expections, consider using tryToProperyName instead.
export const toPropertyName = (value: FValue, astInfo: AstInfo | undefined): string | symbol => {
    const result = beginCast(value, astInfo).addString().addNumber().addSymbol().cast();
    if (typeof result === 'number') {
        return result.toString();
    }
    return result;
};
