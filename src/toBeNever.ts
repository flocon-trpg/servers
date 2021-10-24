// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const toBeNever = (_: never): never => {
    throw new Error('this should not happen');
};
