export const tryParseJSON = (json: string): unknown => {
    try {
        return JSON.parse(json);
    } catch (e: unknown) {
        if (e instanceof SyntaxError) {
            return undefined;
        }
        throw e;
    }
};
