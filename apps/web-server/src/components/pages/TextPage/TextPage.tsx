import React from 'react';
import { Layout } from '@/components/ui/Layout/Layout';

export const TextPage: React.FC<{ text: string | null; filename: string }> = ({
    text,
    filename,
}) => {
    // TODO: preのbackground-colorをライトテーマにも対応させる
    return (
        <Layout>
            <div style={{ padding: 20 }}>
                <span>
                    {'このページは、'}
                    <a href={`/${filename}`} target="_blank" rel="noopener noreferrer">
                        {`/${filename}`}
                    </a>
                    {
                        ' ファイルの中身を表示しています。ファイルを直接開くと文字化けすることがありますが、このページで文字化けせずに表示されていれば正常です。'
                    }
                </span>
                <h4>ファイルの中身</h4>
                <pre
                    style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        backgroundColor: 'rgba(200,200,200,0.2)',
                    }}
                >
                    {text}
                </pre>
            </div>
        </Layout>
    );
};
