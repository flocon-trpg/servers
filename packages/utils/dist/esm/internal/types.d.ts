export declare const left = "left";
export declare const right = "right";
export declare const both = "both";
declare type Left<TLeft> = {
    type: typeof left;
    left: TLeft;
    right?: undefined;
};
declare type Right<TRight> = {
    type: typeof right;
    left?: undefined;
    right: TRight;
};
declare type Both<TLeft, TRight> = {
    type: typeof both;
    left: TLeft;
    right: TRight;
};
export declare type GroupJoinResult<TLeft, TRight> = Left<TLeft> | Right<TRight> | Both<TLeft, TRight>;
export {};
//# sourceMappingURL=types.d.ts.map