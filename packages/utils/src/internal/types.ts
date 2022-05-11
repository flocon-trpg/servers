export const left = 'left';
export const right = 'right';
export const both = 'both';

type Left<TLeft> = {
    type: typeof left;
    left: TLeft;
    right?: undefined;
};

type Right<TRight> = {
    type: typeof right;
    left?: undefined;
    right: TRight;
};

type Both<TLeft, TRight> = {
    type: typeof both;
    left: TLeft;
    right: TRight;
};

export type GroupJoinResult<TLeft, TRight> = Left<TLeft> | Right<TRight> | Both<TLeft, TRight>;
