import { ArrayPattern, ObjectPattern, Pattern, RestElement } from 'estree';
import { ScriptError } from './ScriptError';
import {
    FIdentifier,
    fMemberExpression,
    FMemberExpression,
    FProperty,
    fProperty,
} from './fExpression';

export type FArrayPattern = Omit<ArrayPattern, 'elements'> & {
    elements: (FPattern | null)[];
};

export type FObjectPattern = Omit<ObjectPattern, 'properties'> & {
    properties: (FRestElement | FProperty)[];
};

export type FRestElement = Omit<RestElement, 'argument'> & {
    argument: FPattern;
};

export function fRestElement(source: RestElement): FRestElement {
    return {
        ...source,
        argument: fPattern(source.argument),
    };
}

export type FPattern =
    | FArrayPattern
    | FObjectPattern
    | FRestElement
    | FIdentifier
    | FMemberExpression;

export const fPattern = (pattern: Pattern): FPattern => {
    switch (pattern.type) {
        case 'ArrayPattern':
            return {
                ...pattern,
                elements: pattern.elements.map(x => (x == null ? x : fPattern(x))),
            };
        case 'ObjectPattern':
            return {
                ...pattern,
                properties: pattern.properties.map(x => {
                    if (x.type === 'RestElement') {
                        return fRestElement(x);
                    }
                    return fProperty(x);
                }),
            };
        case 'AssignmentPattern':
            // function f(x=1) {return x;} のx=1の部分で使われる
            throw new ScriptError(`${pattern.type} is not supported`);
        case 'RestElement':
            // function f(...x) {return x;} の...xの部分で使われる
            return fRestElement(pattern);
        case 'Identifier':
            return pattern;
        case 'MemberExpression':
            return fMemberExpression(pattern);
    }
};
