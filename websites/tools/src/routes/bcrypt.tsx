import { createFileRoute } from '@tanstack/react-router';
import { Button, Input, Layout, Select, Typography } from 'antd';
import { hash } from 'bcryptjs';
import { FC, useState } from 'react';
import { useAsync, useLatest } from 'react-use';

const HashView: FC<{ hash: string }> = ({ hash }) => {
    return (
        <table>
            <tbody>
                <tr>
                    <th>ハッシュ</th>
                    <td>{hash}</td>
                </tr>
                <tr>
                    <th>{'fly.tomlの[env]に記述する方法'}</th>
                    <td>
                        <Typography.Text
                            code
                        >{`ENTRY_PASSWORD='{"type":"bcrypt","value":"${hash}"}'`}</Typography.Text>
                    </td>
                </tr>
            </tbody>
        </table>
    );
};

const Bcrypt: React.FC = () => {
    const [text, setText] = useState('');
    const textRef = useLatest(text);
    const [salt, setSalt] = useState<8 | 10 | 12 | 14>(10);
    const saltRef = useLatest(salt);
    const [keyToGenerate, setKeyToGenerate] = useState<number>();
    const result = useAsync(async () => {
        if (keyToGenerate == null) {
            return null;
        }
        return await hash(textRef.current, saltRef.current);
    }, [keyToGenerate]);

    let resultElement;
    if (result.loading) {
        resultElement = <div>生成中です…</div>;
    } else if (result.value != null) {
        resultElement = <HashView hash={result.value} />;
    } else if (result.error != null) {
        resultElement = <div>エラー: {result.error?.message}</div>;
    } else {
        resultElement = null;
    }

    return (
        <div style={{ padding: 8 }}>
            bcrypt のハッシュ値を生成できます。
            <a href="https://www.npmjs.com/package/bcryptjs">npm の bcryptjs パッケージ</a>{' '}
            を使用しています。ハッシュ値の生成は、サーバーとの通信は行われず、ブラウザ内のスクリプトのみで完結します。
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="エントリーパスワード"
                    style={{ maxWidth: 320 }}
                />
                <Select value={salt} onChange={e => setSalt(e)}>
                    <Select.Option value={8}>8</Select.Option>
                    <Select.Option value={10}>10(デフォルト)</Select.Option>
                    <Select.Option value={12}>12</Select.Option>
                    <Select.Option value={14}>14</Select.Option>
                </Select>
                <Button onClick={() => setKeyToGenerate(i => (i ?? 0) + 1)}>ハッシュを生成</Button>
            </div>
            <hr />
            {resultElement}
        </div>
    );
};

export const Route = createFileRoute('/bcrypt')({
    component: () => (
        <Layout style={{ minHeight: '100vh' }}>
            <Bcrypt />
        </Layout>
    ),
});
