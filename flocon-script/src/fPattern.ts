import { ArrayPattern, AssignmentPattern, ObjectPattern, Pattern, RestElement } from 'estree';
import {
    fExpression,
    FExpression,
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

export type FAssignmentPattern = Omit<AssignmentPattern, 'left' | 'right'> & {
    left: FPattern;
    right: FExpression;
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
    | FAssignmentPattern
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
            return {
                ...pattern,
                left: fPattern(pattern.left),
                right: fExpression(pattern.right),
            };
        case 'RestElement':
            // function f(...x) {return x;} の...xの部分で使われる
            return fRestElement(pattern);
        case 'Identifier':
            return pattern;
        case 'MemberExpression':
            return fMemberExpression(pattern);
    }
};
