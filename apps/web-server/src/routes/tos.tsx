import { createFileRoute } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { fetchTosAtom, tosFileName } from '@/atoms/fetchTosAtom/fetchTosAtom';
import { Layout } from '@/components/ui/Layout/Layout';

const padding = 20;

/**
 * `tos.md` の内容を用い、利用規約を表示します。
 *
 * サーバーを運用する際は、このコードを改変して利用規約を直接表示させても構いません。その場合は必ずしも `tos.md` を使う必要はありません。
 */
const TosContent: React.FC = () => {
    React.useEffect(() => {
        const main = async () => {};
        void main();
    }, []);
    const text = useAtomValue(fetchTosAtom);
    if (text == null) {
        return (
            <div
                style={{ padding }}
            >{`${tosFileName}が見つからなかったため、利用規約の文章を生成することができませんでした。`}</div>
        );
    }
    return (
        <div style={{ padding }}>
            <div style={{ paddingBottom: 16 }}>
                このページは、
                <a href={`/${tosFileName}`} target="_blank" rel="noopener noreferrer">
                    {tosFileName}
                </a>
                ファイルから生成されています。
            </div>
            {text.trim() === '' ? (
                <div
                    style={{ padding }}
                >{`${tosFileName}の中身が空であるため、利用規約の文章を生成することができませんでした。`}</div>
            ) : (
                <ReactMarkdown>{text}</ReactMarkdown>
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
export const Route = createFileRoute('/tos')({
    component: Tos,
});
