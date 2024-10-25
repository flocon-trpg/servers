import { createFileRoute } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import {
    fetchPrivacyPolicyAtom,
    privacyPolicyFileName,
} from '@/atoms/fetchPrivacyPolicyAtom/fetchPrivacyPolicyAtom';
import { Layout } from '@/components/ui/Layout/Layout';

const padding = 20;

/**
 * `privacy_policy.md` の内容を用い、プライバシーポリシーを表示します。
 *
 * サーバーを運用する際は、このコードを改変してプライバシーポリシーを直接表示させても構いません。その場合は必ずしも `privacy_policy.md` を使う必要はありません。
 */
const PrivacyPolicyContent: React.FC = () => {
    const text = useAtomValue(fetchPrivacyPolicyAtom);
    if (text == null) {
        return (
            <div
                style={{ padding }}
            >{`${privacyPolicyFileName}が見つからなかったため、プライバシーポリシーの文章を生成することができませんでした。`}</div>
        );
    }
    return (
        <div style={{ padding }}>
            <div style={{ paddingBottom: 16 }}>
                このページは、
                <a href={`/${privacyPolicyFileName}`} target="_blank" rel="noopener noreferrer">
                    {privacyPolicyFileName}
                </a>
                ファイルから生成されています。
            </div>
            {text.trim() === '' ? (
                <div
                    style={{ padding }}
                >{`${privacyPolicyFileName}の中身が空であるため、プライバシーポリシーの文章を生成することができませんでした。`}</div>
            ) : (
                <ReactMarkdown>{text}</ReactMarkdown>
            )}
        </div>
    );
};

const PrivacyPolicy: React.FC = () => {
    return (
        <Layout>
            <PrivacyPolicyContent />
        </Layout>
    );
};

export const Route = createFileRoute('/privacy_policy')({
    component: PrivacyPolicy,
});
