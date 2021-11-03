// NOT cryptographically secure
export const simpleId = (): string => Math.random().toString(36).substr(2, 9);
