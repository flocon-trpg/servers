import { BaseNodeWithoutComments } from 'estree';

export class ScriptError extends Error {
    public constructor(private readonly node: BaseNodeWithoutComments, message?: string) {
        super(message);
    }

    public get range(): [number, number] | undefined {
        // @types/estreeとacornでは型が異なる。このライブラリではacornを用いているため、それに合わせて型変換している。
        const node = this.node as { start?: number; end?: number };
        if (node.start != null && node.end != null) {
            return [node.start, node.end];
        }
        return undefined;
    }
}
