import { Option } from '@kizahasi/option';
import { Range } from '../range';
import { ScriptError } from '../ScriptError';
import { FArray } from './FArray';
import { FBoolean } from './FBoolean';
import { FFunction } from './FFunction';
import { FNumber } from './FNumber';
import { FObject } from './FObject';
import { FString } from './FString';
import { FValue } from './FValue';
import { toTypeName } from './toTypeName';

type TypesOption = {
    array?: boolean;
    boolean?: boolean;
    function?: boolean;
    null?: boolean;
    number?: boolean;
    object?: boolean;
    string?: boolean;
    undefined?: boolean;
};

const typesOptionToString = (source: TypesOption) => {
    const base = [
        source.array ? 'array' : null,
        source.boolean ? 'boolean' : null,
        source.function ? 'function' : null,
        source.null ? 'null' : null,
        source.number ? 'number' : null,
        source.object ? 'object' : null,
        source.string ? 'string' : null,
        source.undefined ? 'undefined' : null,
    ].reduce((seed, elem) => {
        if (elem == null) {
            return seed;
        }
        if (seed === '') {
            return elem;
        }
        return `${seed}, ${elem}`;
    }, '');
    return `[${base}]`;
};

class JObjectCaster<T = never> {
    private constructor(
        private readonly source: FValue,
        private readonly addedTypes: TypesOption,
        private readonly successfullyCastedValue: Option<T>
    ) {}

    public static begin(source: FValue) {
        return new JObjectCaster<never>(source, {}, Option.none());
    }

    public cast(errorRange?: Range): T {
        if (this.successfullyCastedValue.isNone) {
            throw new ScriptError(
                `Expected type: ${typesOptionToString(this.addedTypes)}, Actual type: ${toTypeName(
                    this.source
                )}`,
                errorRange
            );
        }
        return this.successfullyCastedValue.value;
    }

    public addArray(): JObjectCaster<T | FArray> {
        if (this.source instanceof FArray) {
            return new JObjectCaster<T | FArray>(
                this.source,
                { ...this.addedTypes, array: true },
                Option.some(this.source)
            );
        }
        return this;
    }

    public addBoolean(): JObjectCaster<T | boolean> {
        if (this.source instanceof FBoolean) {
            return new JObjectCaster<T | boolean>(
                this.source,
                { ...this.addedTypes, boolean: true },
                Option.some(this.source.raw)
            );
        }
        return this;
    }

    public addFunction(): JObjectCaster<T | ((isNew: boolean) => (args: FValue[]) => FValue)> {
        if (this.source instanceof FFunction) {
            const source = this.source;
            return new JObjectCaster<T | ((isNew: boolean) => (args: FValue[]) => FValue)>(
                source,
                { ...this.addedTypes, function: true },
                Option.some((isNew: boolean) => (args: FValue[]) => source.exec({ args, isNew }))
            );
        }
        return this;
    }

    public addNull(): JObjectCaster<T | null> {
        if (this.source === null) {
            const source = this.source;
            return new JObjectCaster<T | null>(
                source,
                { ...this.addedTypes, null: true },
                Option.some(null)
            );
        }
        return this;
    }

    public addNumber(): JObjectCaster<T | number> {
        if (this.source instanceof FNumber) {
            return new JObjectCaster<T | number>(
                this.source,
                { ...this.addedTypes, number: true },
                Option.some(this.source.raw)
            );
        }
        return this;
    }

    public addObject(): JObjectCaster<T | FObject> {
        if (this.source instanceof FObject) {
            return new JObjectCaster<T | FObject>(
                this.source,
                { ...this.addedTypes, object: true },
                Option.some(this.source)
            );
        }
        return this;
    }

    public addString(): JObjectCaster<T | string> {
        if (this.source instanceof FString) {
            return new JObjectCaster<T | string>(
                this.source,
                { ...this.addedTypes, string: true },
                Option.some(this.source.raw)
            );
        }
        return this;
    }

    public addUndefined(): JObjectCaster<T | undefined> {
        if (this.source === undefined) {
            const source = this.source;
            return new JObjectCaster<T | undefined>(
                source,
                { ...this.addedTypes, undefined: true },
                Option.some(undefined)
            );
        }
        return this;
    }
}

export const beginCast = (source: FValue) => {
    return JObjectCaster.begin(source);
};
