import { mergeStyles } from './mergeStyles';

describe('mergeStyles', () => {
    it('tests merging 1 object', () => {
        const actual = mergeStyles(
            {
                width: 1,
                maxWidth: 1,
                minWidth: 1,
                height: undefined,
                maxHeight: undefined,
                minHeight: undefined,
                paddingLeft: 1,
                paddingRight: undefined,
            },
            {
                width: 2,
                maxWidth: undefined,
                minWidth: 2,
                height: undefined,
                maxHeight: 2,
                minHeight: undefined,
                paddingTop: 2,
                paddingBottom: undefined,
            },
        );
        expect(actual).toEqual({
            width: 2,
            maxWidth: 1,
            minWidth: 2,
            maxHeight: 2,
            paddingLeft: 1,
            paddingTop: 2,
        });
    });

    it('tests merging no object', () => {
        const actual = mergeStyles({ padding: 1, margin: 1 });
        expect(actual).toEqual({ padding: 1, margin: 1 });
    });

    it('tests merging undefined', () => {
        const actual = mergeStyles({ padding: 1 }, undefined, { margin: 1 });
        expect(actual).toEqual({ padding: 1, margin: 1 });
    });

    it('tests merging {}', () => {
        const actual = mergeStyles({ padding: 1, margin: 1 }, {});
        expect(actual).toEqual({ padding: 1, margin: 1 });
    });

    it('tests merging undefined to undefined', () => {
        const actual = mergeStyles(undefined, undefined);
        expect(actual).toBeUndefined();
    });

    it('tests merging no object to undefined', () => {
        const actual = mergeStyles(undefined);
        expect(actual).toBeUndefined();
    });
});
