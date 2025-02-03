// NOT cryptographically secure
// UUID はセキュリティ面で有利であり v7 であればタイムスタンプ機能もあるが、高度な乱数生成が必要であり環境によっては動かない。例えば npm の uuid は crypto.getRandomValues() API を必要とする(https://github.com/uuidjs/uuid?tab=readme-ov-file#known-issues)。最近のブラウザであれば対応しているが、例えばスマホアプリ版クライアントを作成する際にひと手間かかってしまう可能性があるため、簡易的な ID 生成で十分な Web サーバー等ではこの関数を使うことにしている。
export const simpleId = (): string => {
    const idLength = 9;
    let result = Math.random()
        .toString(36)
        .substring(2, 2 + idLength);
    while (result.length < idLength) {
        result = result + '0';
    }
    return result;
};
