import { filterInt } from '../src';

it('tests filterInt', () => {
    expect(filterInt('421')).toBe(421);
    expect(filterInt('-421')).toBe(-421);
    expect(filterInt('+421')).toBe(421);
    expect(filterInt('0')).toBe(0);
    expect(filterInt('-0')).toBe(-0);
    // toBeメソッドでは 0≠-0 とみなされることの確認
    // toBeメソッドは等価比較にObject.isを用いるためこれはpassする https://jestjs.io/docs/expect#tobevalue
    expect(0).not.toBe(-0);

    expect(filterInt('')).toBeNull();
    expect(filterInt('string')).toBeNull();
    expect(filterInt('421kg')).toBeNull();
    expect(filterInt('NaN')).toBeNull();
    expect(filterInt('Infinity')).toBeNull();
    expect(filterInt('3.14')).toBeNull();
});
