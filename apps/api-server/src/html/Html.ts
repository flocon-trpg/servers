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
            APIサーバーを稼働させることができませんでした。必要であればサーバーに出力されたエラーメッセージを確認して、環境変数や.env.localファイルなどに問題がないか確認してください。
        </p>
    </div>
    <h2>Deploy To Herokuボタンを使用してこのAPIサーバーを設置した方へ</h2>
    <div>
        <p>
            この画面が表示されているということは、おそらくHerokuへのデプロイに成功したことを示すため、問題ありません👌。あとはHerokuのConfig
            Varsの設定で FIREBASE_ADMIN
            の値をセットすればAPIサーバーが正常に稼働します。詳しくは公式ドキュメントを参照してください。
        </p>
        <p>
            もしその設定を行ったのにこの画面が表示されている場合は、おそらく設定に誤りがあります。必要であればHerokuに出力されたエラーログを参照して、Config
            Varsの設定に問題がないか確認してください。
        </p>
    </div>
</html>
`;
}
