export function* range(from: number, count: number) {
    for (let i = 0; i < count; i++) {
        yield i + from;
    }
}
