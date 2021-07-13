import * as ScriptValue from './scriptValue';

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
    private varTables: Map<string, Ref<ScriptValue.FValue>>[] = [new Map()];

    public constructor(public globalThis: ScriptValue.FObject) {}

    public get(name: string): ScriptValue.FValue {
        const found = this.varTables
            .map(table => table.get(name))
            .filter(val => val !== undefined)
            .reverse()[0];
        if (found !== undefined) {
            return found.ref;
        }
        const prop = this.globalThis.get(new ScriptValue.FString(name));
        if (prop !== undefined) {
            return prop;
        }
        return undefined;
    }

    public assign(name: string, newValue: ScriptValue.FValue): void {
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
        this.globalThis.set(new ScriptValue.FString(name), newValue);
    }

    public declare(name: string, value: ScriptValue.FValue, type: 'let' | 'const'): void {
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
