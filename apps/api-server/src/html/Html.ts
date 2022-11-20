export namespace Html {
    export const success = `
<html>
    <head>
        <title>Flocon APIサーバー</title>
    </head>
    <h1>Flocon APIサーバー</h1>
    <div>
        <p>
            APIサーバーは稼働しています😊
        </p>
    </div>
</html>
`;

    export const error = `
<html>
    <head>
        <title>Flocon APIサーバー</title>
    </head>
    <h1>Flocon APIサーバー</h1>
    <div>
        <p>
            ⚠️ エラーが発生したため、APIサーバーを稼働させることができませんでした。サーバーに出力されたエラーメッセージを確認して、環境変数や.env.localファイルなどに問題がないか確認してください。
        </p>
    </div>
    <h2>fly.ioにデプロイした方へ</h2>
    <div>
        <p>
            おそらくFIREBASE_PROJECT_IDもしくはENTRY_PASSWORDの設定に誤りがあると思われます。fly.ioのダッシュボードに出力されたエラーログを参照して、設定に問題がないか確認してください。
        </p>
    </div>
</html>
`;
}
