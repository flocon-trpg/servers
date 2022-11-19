import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FetchTextState } from '../utils/types';

const padding = 20;
const filename = 'privacy_policy.md';

/**
 * `privacy_policy.md` の内容を用い、プライバシーポリシーを表示します。
 *
 * ただし、サーバーを運用する際は、このコードを改変してプライバシーポリシーを表示させても構いません。
 */
const PrivacyPolicy: React.FC = () => {
    const [text, setText] = React.useState<FetchTextState>({ fetched: false });
    React.useEffect(() => {
        const main = async () => {
            // chromeなどではfetchできないと `http://localhost:3000/privacy_policy.md 404 (Not Found)` などといったエラーメッセージが表示されるが、実際は問題ない
            const envTxtObj = await fetch(`/${filename}`);
            if (!envTxtObj.ok) {
                setText({ fetched: true, value: null });
                return;
            }
            const envTxt = await envTxtObj.text();
            setText({ fetched: true, value: envTxt });
        };
        main();
    }, []);
    if (!text.fetched) {
        return <div style={{ padding }}>プライバシーポリシーを取得しています…</div>;
    }
    if (text.value == null) {
        return (
            <div
                style={{ padding }}
            >{`${filename}が見つからなかったため、プライバシーポリシーの文章を生成することができませんでした。`}</div>
        );
    }
    return (
        <div style={{ padding }}>
            <div style={{ paddingBottom: 16 }}>
                このページは、
                <a href={`/${filename}`} target='_blank' rel='noopener noreferrer'>
                    {filename}
                </a>
                ファイルから生成されています。
            </div>
            {text.value.trim() === '' ? (
                <div
                    style={{ padding }}
                >{`${filename}の中身が空であるため、プライバシーポリシーの文章を生成することができませんでした。`}</div>
            ) : (
                <ReactMarkdown>{text.value}</ReactMarkdown>
            )}
        </div>
    );
};

export default PrivacyPolicy;
