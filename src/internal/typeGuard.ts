import { None, Option, Some } from '@kizahasi/option';

type Types = {
    null?: true;
    undefined?: true;

    boolean?: true;
    number?: true;
    string?: true;

    array?: true;
};

class TypeGuardPreparation<T = None> {
    private constructor(private readonly source: unknown, private readonly types: Types) {}

    public static create(source: unknown): TypeGuardPreparation {
        return new TypeGuardPreparation(source, {});
    }

    public end(): T {
        const someValue = Option.some(this.source) as unknown as T;

        if (this.types.null) {
            if (this.source === null) {
                return someValue;
            }
        }
        if (this.types.undefined) {
            if (this.source === undefined) {
                return someValue;
            }
        }

        if (this.types.boolean) {
            if (this.source === true || this.source === false) {
                return someValue;
            }
        }
        if (this.types.number) {
            if (typeof this.source === 'number') {
                return someValue;
            }
        }
        if (this.types.string) {
            if (typeof this.source === 'string') {
                return someValue;
            }
        }

        if (this.types.array) {
            if (Array.isArray(this.source)) {
                return someValue;
            }
        }

        return Option.none() as unknown as T;
    }

    public addNull(): TypeGuardPreparation<T | Some<null>> {
        return new TypeGuardPreparation(this.source, { ...this.types, null: true });
    }

    public addUndefined(): TypeGuardPreparation<T | Some<undefined>> {
        return new TypeGuardPreparation(this.source, { ...this.types, undefined: true });
    }

    public addBoolean(): TypeGuardPreparation<T | Some<boolean>> {
        return new TypeGuardPreparation(this.source, { ...this.types, boolean: true });
    }

    public addNumber(): TypeGuardPreparation<T | Some<number>> {
        return new TypeGuardPreparation(this.source, { ...this.types, number: true });
    }

    public addString(): TypeGuardPreparation<T | Some<string>> {
        return new TypeGuardPreparation(this.source, { ...this.types, string: true });
    }

    public addArray(): TypeGuardPreparation<T | Some<unknown[]>> {
        return new TypeGuardPreparation(this.source, { ...this.types, array: true });
    }
}

export const beginTypeGuard = (value: unknown) => TypeGuardPreparation.create(value);
