import { exec, toFValue } from '../src';
import { FRecordRef } from '../src/scriptValue/FRecordRef';
import { toJObject } from '../src/utils/toJObject';

describe('FRecordRef', () => {
    test('get', () => {
        const record: Record<string, string> = { x: 'foo', y: 'bar' };
        const recordRef = new FRecordRef(record, toFValue, fValue => toJObject(fValue));
        const execResult = exec(
            `
let x = this.recordRef.get('x');
let z = this.recordRef.get('z');
[x, z];
`,
            {
                recordRef,
            }
        );
        const expectedRecord = { x: 'foo', y: 'bar' };
        expect(record).toEqual(expectedRecord);
        expect(execResult.result).toEqual(['foo', undefined]);
        expect(execResult.getGlobalThis()).toEqual({ recordRef: expectedRecord });
    });

    test('get', () => {
        const record: Record<string, string> = { x: 'foo', y: 'bar' };
        const recordRef = new FRecordRef(record, toFValue, fValue => toJObject(fValue));
        const execResult = exec(
            `
let x = this.recordRef.has('x');
let z = this.recordRef.has('z');
[x, z];
`,
            {
                recordRef,
            }
        );
        const expectedRecord = { x: 'foo', y: 'bar' };
        expect(record).toEqual(expectedRecord);
        expect(execResult.result).toEqual([true, false]);
        expect(execResult.getGlobalThis()).toEqual({ recordRef: expectedRecord });
    });

    test('set', () => {
        const record: Record<string, string> = { x: 'foo', y: 'bar' };
        const recordRef = new FRecordRef(record, toFValue, fValue => toJObject(fValue));
        const execResult = exec(
            `
this.recordRef.set('x', 'FOO');
this.recordRef.set('z', 'BAZ');
this.recordRef;
`,
            {
                recordRef,
            }
        );
        const expectedRecord = { x: 'FOO', y: 'bar', z: 'BAZ' };
        expect(record).toEqual(expectedRecord);
        expect(execResult.result).toEqual(expectedRecord);
        expect(execResult.getGlobalThis()).toEqual({ recordRef: expectedRecord });
    });

    test('delete', () => {
        const record: Record<string, string> = { x: 'foo', y: 'bar' };
        const recordRef = new FRecordRef(record, toFValue, fValue => toJObject(fValue));
        const execResult = exec(
            `
this.recordRef.delete('x');
this.recordRef.delete('z');
this.recordRef;
`,
            {
                recordRef,
            }
        );
        const expectedRecord = { y: 'bar' };
        expect(record).toEqual(expectedRecord);
        expect(execResult.result).toEqual(expectedRecord);
        expect(execResult.getGlobalThis()).toEqual({ recordRef: expectedRecord });
    });

    test('forEach', () => {
        const record: Record<string, string> = { x: 'foo', y: 'bar' };
        const recordRef = new FRecordRef(record, toFValue, fValue => toJObject(fValue));
        const execResult = exec(
            `
let result = {};
this.recordRef.forEach(([value, key]) => {
    result[key] = value;
});
result;
`,
            {
                recordRef,
            }
        );
        const expectedRecord = { x: 'foo', y: 'bar' };
        expect(record).toEqual(expectedRecord);
        expect(execResult.result).toEqual(expectedRecord);
        expect(execResult.getGlobalThis()).toEqual({ recordRef: expectedRecord });
    });
});
