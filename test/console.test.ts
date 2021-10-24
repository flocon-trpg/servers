import { createConsoleClass, exec } from '../src';

test.each(['log', 'info', 'warn', 'error'])('console', methodName => {
    const actual = exec(
        `
console.${methodName}('JEST-CONSOLE-MESSAGE: If you see this message, even if written by console.warn or console.error, it does not mean an error');
        `,
        { console: createConsoleClass('[JEST-CONSOLE-HEADER]') }
    );
    expect(actual.result).toBeUndefined();
});
