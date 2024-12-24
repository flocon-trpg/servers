import { ArrayPattern, AssignmentPattern, ObjectPattern, Pattern, RestElement } from 'estree';
import { FExpression, FIdentifier, FMemberExpression, FProperty } from './fExpression';
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
export declare function fRestElement(source: RestElement): FRestElement;
export type FPattern = FArrayPattern | FObjectPattern | FRestElement | FAssignmentPattern | FIdentifier | FMemberExpression;
export declare const fPattern: (pattern: Pattern) => FPattern;
//# sourceMappingURL=fPattern.d.ts.map