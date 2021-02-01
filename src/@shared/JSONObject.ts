import { __ } from './collection';

const keysToString = (keys: ReadonlyArray<string>): string => {
    if (keys.length === 0) {
        // 原則として、ここには来るべきでない
        return 'root value';
    }
    let result = keys[0];
    __(keys).skip(1).forEach(key => {
        result = `${result}/${key}`;
    });
    return result;
};

// null以外のJSONを表す。e.g. number, boolean, string, object
export class JSONObject {
    private constructor(private readonly jsonObject: any, readonly currentPath: ReadonlyArray<string>) {
        if (jsonObject == null) {
            throw 'jsonObject == null';
        }
    }

    public static init(jsonRoot: any): JSONObject {
        return new JSONObject(jsonRoot, []);
    }

    public tryGet(key: string): JSONObject | null | undefined {
        if (typeof this.jsonObject !== 'object') {
            return undefined;
        }
        const child = this.jsonObject[key];
        if (child == null) {
            return child;
        }
        return new JSONObject(child, [...this.currentPath, key]);
    }

    public get(key: string): JSONObject {
        const result = this.tryGet(key);
        if (result == null) {
            throw `${keysToString([...this.currentPath, key])} is not object.`;
        }
        return result;
    }

    public valueAsString(): string {
        if (typeof this.jsonObject === 'string') {
            return this.jsonObject;
        }
        throw `${keysToString(this.currentPath)} must be string.`;
    }

    public valueAsNullableString(): string | null {
        if (this.jsonObject === null || typeof this.jsonObject === 'string') {
            return this.jsonObject;
        }
        throw `${keysToString(this.currentPath)} must be string or null.`;
    }

    public valueAsBoolean(): boolean {
        if (typeof this.jsonObject === 'boolean') {
            return this.jsonObject;
        }
        throw `${keysToString(this.currentPath)} must be true or false.`;
    }
}