/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { exec, toFValue } from '../src';

test('docs.md 例1', () => {
    const globalThis = { obj: { x: 1 } };
    const execResult = exec('this.obj.x = 2', globalThis);
    const globalThisAfterExec: any = execResult.getGlobalThis();

    expect(globalThis.obj.x).toBe(1);
    expect(globalThisAfterExec.obj.x).toBe(2);
});

test('docs.md 例2', () => {
    const obj = { x: 1 };
    const globalThis = { obj1: obj, obj2: obj };
    const execResult = exec('this.obj1.x = 2; this.obj2.x;', globalThis);
    const globalThisAfterExec: any = execResult.getGlobalThis();

    expect(execResult.result).toBe(1);
    expect(globalThisAfterExec.obj1.x).toBe(2);
    expect(globalThisAfterExec.obj2.x).toBe(1);
});

test('docs.md 例3', () => {
    const obj = toFValue({ x: 1 });
    const globalThis = { obj1: obj, obj2: obj };
    const execResult = exec('this.obj1.x = 2; this.obj2.x', globalThis);
    const globalThisAfterExec: any = execResult.getGlobalThis();

    expect(execResult.result).toBe(2);
    expect(globalThisAfterExec.obj1.x).toBe(2);
    expect(globalThisAfterExec.obj2.x).toBe(2);
});
