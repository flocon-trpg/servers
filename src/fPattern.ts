import { Pattern } from 'estree';
import { ScriptError } from './ScriptError';
import { FIdentifier, fMemberExpression, FMemberExpression } from './fExpression';

export type FPattern = FIdentifier | FMemberExpression;

export const fPattern = (pattern: Pattern): FPattern => {
    switch (pattern.type) {
        case 'ArrayPattern':
        case 'AssignmentPattern':
        case 'ObjectPattern':
        case 'RestElement':
            throw new ScriptError(`${pattern.type} is not supported`);
        case 'Identifier':
            return pattern;
        case 'MemberExpression':
            return fMemberExpression(pattern);
    }
};
