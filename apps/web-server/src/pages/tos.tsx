import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FetchTextState } from '../utils/types';
import { Layout } from '@/components/ui/Layout/Layout';

const padding = 20;
const filename = 'tos.md';

/**
 * `tos.md` の内容を用い、利用規約を表示します。
 *
 * サーバーを運用する際は、このコードを改変して利用規約を直接表示させても構いません。その場合は必ずしも `tos.md` を使う必要はありません。
 */
const TosContent: React.FC = () => {
    const [text, setText] = React.useState<FetchTextState>({ fetched: false });
    React.useEffect(() => {
        const main = async () => {
            // chromeなどではfetchできないと `http://localhost:3000/tos.md 404 (Not Found)` などといったエラーメッセージが表示されるが、実際は問題ない
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
        return <div style={{ padding }}>利用規約を取得しています…</div>;
    }
    if (text.value == null) {
        return (
            <div
                style={{ padding }}
            >{`${filename}が見つからなかったため、利用規約の文章を生成することができませんでした。`}</div>
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
                >{`${filename}の中身が空であるため、利用規約の文章を生成することができませんでした。`}</div>
            ) : (
                <ReactMarkdown>{text.value}</ReactMarkdown>
            )}
        </div>
    );
};

const Tos: React.FC = () => {
    return (
        <Layout>
            <TosContent />
        </Layout>
    );
};

export default Tos;
