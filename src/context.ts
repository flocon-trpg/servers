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
    private varTables: Map<string, Ref<ScriptValue.SValue>>[] = [new Map()];

    public constructor(public globalThis: ScriptValue.SObject) {}

    public get(name: string): ScriptValue.SValue {
        const found = this.varTables
            .map(table => table.get(name))
            .filter(val => val !== undefined)
            .reverse()[0];
        if (found !== undefined) {
            return found.ref;
        }
        const prop = this.globalThis.get(new ScriptValue.SString(name));
        if (prop !== undefined) {
            return prop;
        }
        return undefined;
    }

    public assign(name: string, newValue: ScriptValue.SValue) {
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
        this.globalThis.set(new ScriptValue.SString(name), newValue);
    }

    public declare(
        name: string,
        value: ScriptValue.SValue,
        type: 'let' | 'const'
    ) {
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

    public scopeIn() {
        this.varTables.push(new Map());
    }

    public scopeOut() {
        if (this.varTables.length <= 1) {
            throw new Error('this.varTables must not be empty');
        }
        this.varTables.pop();
    }
}
