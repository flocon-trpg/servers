import { exec, symbolClass } from '../src';

test.each`
    target         | operator     | expected
    ${17}          | ${'+'}       | ${17}
    ${17}          | ${'-'}       | ${-17}
    ${17}          | ${'~'}       | ${~17}
    ${true}        | ${'!'}       | ${false}
    ${false}       | ${'!'}       | ${true}
    ${2}           | ${'!'}       | ${false}
    ${0}           | ${'!'}       | ${true}
    ${17}          | ${'typeof '} | ${typeof 17}
    ${'"str"'}     | ${'typeof '} | ${typeof 'str'}
    ${true}        | ${'typeof '} | ${typeof true}
    ${'(() => 1)'} | ${'typeof '} | ${typeof (() => 1)}
    ${'Symbol()'}  | ${'typeof '} | ${typeof Symbol()}
    ${'[]'}        | ${'typeof '} | ${typeof []}
    ${null}        | ${'typeof '} | ${typeof null}
    ${undefined}   | ${'typeof '} | ${typeof undefined}
`('UnaryExpression', ({ target, operator, expected }) => {
    const actual = exec(
        `
let target = ${target};
(${operator}target);
        `,
        { Symbol: symbolClass },
    );
    expect(actual.result).toBe(expected);
});
