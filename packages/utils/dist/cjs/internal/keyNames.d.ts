import { CompositeKey } from './compositeKey';
import { DualKey } from './dualKeyMap';
type Key = string | number | CompositeKey | DualKey<string, string>;
/** React の key に用いる文字列を生成します。 */
export declare const keyNames: (keys_0: Key, ...keys: Key[]) => string;
export {};
//# sourceMappingURL=keyNames.d.ts.map