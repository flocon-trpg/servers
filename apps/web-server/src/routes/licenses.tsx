import { createFileRoute } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { fetchLicensesAtom } from '@/atoms/fetchLicensesAtom/fetchLicensesAtom';
import { Layout } from '@/components/ui/Layout/Layout';

const padding = 20;
const filename = 'licenses.md';

const LicensesContent: React.FC = () => {
    const text = useAtomValue(fetchLicensesAtom);
    if (text == null) {
        return <div style={{ padding }}>{`${filename}が見つかりませんでした。`}</div>;
    }
    return (
        <div style={{ padding }}>
            <ReactMarkdown>{text}</ReactMarkdown>
        </div>
    );
};

const Licenses: React.FC = () => {
    return (
        <Layout>
            <LicensesContent />
        </Layout>
    );
};

export const Route = createFileRoute('/licenses')({
    component: Licenses,
});
