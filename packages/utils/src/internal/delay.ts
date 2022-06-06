export const delay = async (ms: number) => {
    await new Promise(next => setTimeout(next, ms));
};
