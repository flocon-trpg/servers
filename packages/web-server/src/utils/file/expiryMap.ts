// 主にFirebase StorageでgetDownloadURLの呼び出しをスキップして処理を高速化するために実装したクラス。
// だが実際はQuery Stringが異なっていることがあるため（特にログ出力）、全ての場面で大きく高速化できているわけではない。逆に、メッセージのキャラクター画像ではQuery Stringが付かないようなので高速化が期待できる。
export class ExpiryMap<TKey, TValue> {
    private core = new Map<TKey, { value: TValue; expiresAt?: Date }>();

    public set(key: TKey, value: TValue, expiry?: number): void {
        let expiresAt: Date | undefined = undefined;
        if (expiry != null) {
            expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + expiry / 1000);
        }
        this.core.set(key, { value, expiresAt });
    }

    public get(key: TKey): TValue | undefined {
        const result = this.core.get(key);
        if (result == null) {
            return undefined;
        }
        if (result.expiresAt == null) {
            return result.value;
        }
        if (result.expiresAt < new Date()) {
            this.core.delete(key);
            return undefined;
        }
        return result.value;
    }

    public clear(): void {
        this.core.clear();
    }
}
