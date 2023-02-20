import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FetchTextState } from '../utils/types';
import { Layout } from '@/components/ui/Layout/Layout';

const padding = 20;
const filename = 'licenses.md';

const LicensesContent: React.FC = () => {
    const [text, setText] = React.useState<FetchTextState>({ fetched: false });
    React.useEffect(() => {
        const main = async () => {
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
        return <div style={{ padding }}>{`${filename}を取得しています…`}</div>;
    }
    if (text.value == null) {
        return <div style={{ padding }}>{`${filename}が見つかりませんでした。`}</div>;
    }
    return (
        <div style={{ padding }}>
            <ReactMarkdown>{text.value}</ReactMarkdown>
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

export default Licenses;
