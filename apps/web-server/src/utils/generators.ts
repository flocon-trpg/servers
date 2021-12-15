// cryptographically secure
export const secureId = (): string => {
    const length = 8;

    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const array = new Uint32Array(length);
    let result = '';
    window.crypto.getRandomValues(array).forEach(randomValue => {
        const randomIndex = randomValue % chars.length;
        result = result + chars.charAt(randomIndex);
    });
    return result;
};
