const keysToString = (keys: ReadonlyArray<string>): string => {
    const firstKey = keys[0];
    if (firstKey === undefined) {
        // 原則として、ここには来るべきでない
        return 'root value';
    }
    let result = firstKey;
    keys.forEach((key, i) => {
        if (i === 0) {
            return;
        }
        result = `${result}/${key}`;
    });
    return result;
};

// null以外のJSONを表す。e.g. number, boolean, string, object
export class JsonObject {
    private constructor(
        private readonly jsonObject: any,
        readonly currentPath: ReadonlyArray<string>
    ) {
        if (jsonObject == null) {
            throw new Error('jsonObject == null');
        }
    }

    public static init(jsonRoot: any): JsonObject {
        return new JsonObject(jsonRoot, []);
    }

    public tryGet(key: string): JsonObject | null | undefined {
        if (typeof this.jsonObject !== 'object') {
            return undefined;
        }
        const child = this.jsonObject[key];
        if (child == null) {
            return child;
        }
        return new JsonObject(child, [...this.currentPath, key]);
    }

    public get(key: string): JsonObject {
        const result = this.tryGet(key);
        if (result == null) {
            throw new Error(`${keysToString([...this.currentPath, key])} is not object.`);
        }
        return result;
    }

    public valueAsString(): string {
        if (typeof this.jsonObject === 'string') {
            return this.jsonObject;
        }
        throw new Error(`${keysToString(this.currentPath)} must be string.`);
    }

    public valueAsNullableString(): string | null {
        if (this.jsonObject === null || typeof this.jsonObject === 'string') {
            return this.jsonObject;
        }
        throw new Error(`${keysToString(this.currentPath)} must be string or null.`);
    }

    public valueAsBoolean(): boolean {
        if (typeof this.jsonObject === 'boolean') {
            return this.jsonObject;
        }
        throw new Error(`${keysToString(this.currentPath)} must be true or false.`);
    }

    public valueAsNumber(): number {
        if (typeof this.jsonObject === 'number') {
            return this.jsonObject;
        }
        throw new Error(`${keysToString(this.currentPath)} must be number.`);
    }

    public valueAsNullableNumber(): number | null {
        if (this.jsonObject === null || typeof this.jsonObject === 'number') {
            return this.jsonObject;
        }
        throw new Error(`${keysToString(this.currentPath)} must be number or null.`);
    }
}
