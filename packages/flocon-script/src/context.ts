import { Range } from './range';
import { FRecord } from './scriptValue/FRecord';
import { FString } from './scriptValue/FString';
import { FValue } from './scriptValue/FValue';

type Ref<T> = { ref: T; isConst: boolean };

export class Context {
    /*
    let x = 1;
    let f = () => {
        let x = 2;
        return 2;
    }
    
    のようなとき、let f の括弧の外では [{ x: 1 }]、let x = 2 のすぐ上では [{ x: 1 }, {}]、下から ) までは [{ x: 1 }, { x: 2 }] となる。
    */
    private varTables: Map<string, Ref<FValue>>[] = [new Map<string, Ref<FValue>>()];

    public constructor(public globalThis: FRecord) {}

    public get(name: string, range: Range | undefined): FValue {
        const found = this.varTables
            .map(table => table.get(name))
            .filter(val => val !== undefined)
            .reverse()[0];
        if (found !== undefined) {
            return found.ref;
        }
        const prop = this.globalThis.get({
            property: new FString(name),
            astInfo: { range },
        });
        if (prop !== undefined) {
            return prop;
        }
        return undefined;
    }

    public assign(name: string, newValue: FValue, range: Range | undefined): void {
        const found = this.varTables
            .map(table => table.get(name))
            .filter(val => val !== undefined)
            .reverse()[0];
        if (found !== undefined) {
            if (found.isConst) {
                throw new Error(`invalid assignment to const '${name}'`);
            }
            found.ref = newValue;
            return;
        }
        this.globalThis.set({
            property: new FString(name),
            newValue,
            astInfo: { range },
        });
    }

    public declare(name: string, value: FValue, type: 'let' | 'const'): void {
        const varTable = this.varTables[this.varTables.length - 1];
        if (varTable === undefined) {
            throw new Error('this should not happen');
        }
        const found = varTable.get(name);
        if (found !== undefined) {
            throw new Error(`redeclaration of ${type} ${name}`);
        }
        varTable.set(name, {
            ref: value,
            isConst: type === 'const',
        });
    }

    public scopeIn(): void {
        this.varTables.push(new Map());
    }

    public scopeOut(): void {
        if (this.varTables.length <= 1) {
            throw new Error('this.varTables must not be empty');
        }
        this.varTables.pop();
    }
}
