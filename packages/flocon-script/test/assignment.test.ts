import { exec } from '../src';

test.each`
    left      | right     | operator  | expected
    ${10}     | ${20}     | ${'+='}   | ${10 + 20}
    ${10}     | ${20}     | ${'-='}   | ${10 - 20}
    ${10}     | ${20}     | ${'*='}   | ${10 * 20}
    ${20}     | ${10}     | ${'/='}   | ${20 / 10}
    ${2}      | ${3}      | ${'**='}  | ${2 ** 3}
    ${100}    | ${17}     | ${'%='}   | ${100 % 17}
    ${0b0011} | ${0b0101} | ${'&='}   | ${0b0011 & 0b0101}
    ${0b0011} | ${0b0101} | ${'|='}   | ${0b0011 | 0b0101}
    ${0b0011} | ${2}      | ${'<<='}  | ${0b0011 << 2}
    ${0b1100} | ${2}      | ${'>>='}  | ${0b1100 >> 2}
    ${-5}     | ${2}      | ${'>>>='} | ${-5 >>> 2}
    ${5}      | ${3}      | ${'^='}   | ${5 ^ 3}
`('assignment', ({ left, right, operator, expected }) => {
    const actual = exec(
        `
let left = ${left};
let right = ${right};
let assignmentResult = (left ${operator} right);
[left, right, assignmentResult]
        `,
        {},
    );
    expect(actual.result).toEqual([expected, right, expected]);
});
