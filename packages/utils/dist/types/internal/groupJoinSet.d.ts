import { both, left, right } from './types';
declare type GroupJoinResultType = typeof left | typeof right | typeof both;
export declare const groupJoinSet: <T>(left: ReadonlySet<T>, right: ReadonlySet<T>) => Map<T, GroupJoinResultType>;
export {};
//# sourceMappingURL=groupJoinSet.d.ts.map