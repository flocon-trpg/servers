// NOT cryptographically secure
export const simpleId = (): string => {
    const idLength = 9;
    let result = Math.random().toString(36).substring(2, 2 + idLength);
    while (result.length < idLength) {
        result = result + '0';
    }
    return result;
};
