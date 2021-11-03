import { exec } from '../src';

test('prevent __proto__ attack', () => {
    expect(() => {
        // この段階では、globalThisはMapで表現されているため例外は発生しない
        const execResult = exec('__proto__ = {};', {});

        // これによりMapをRecordに変換しようとするが、この際に防御機構が働き例外が発生する
        return execResult.getGlobalThis();
    }).toThrow();
});
