import { createConsoleClass, exec } from '../src';

test.each(['log', 'info', 'warn', 'error'])('console', methodName => {
    const actual = exec(
        `
console.${methodName}('UNITTEST-CONSOLE-MESSAGE: If you see this message, even if written in console.warn or console.error, it does not mean an error');
        `,
        { console: createConsoleClass('[UNITTEST-CONSOLE-HEADER]') }
    );
    expect(actual.result).toBeUndefined();
});
