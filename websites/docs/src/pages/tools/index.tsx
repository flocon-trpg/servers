import { AntDesign } from '@site/src/components/AntDesign';
import { ToolsHeader } from '@site/src/components/ToolsHeader';
import { Button, Layout } from 'antd';

const Index: React.FC = () => {
    return (
        <div style={{ padding: 16 }}>
            <h2>Floconツール</h2>
            <p>
                <a href="/tools/web-server">Webサーバーの設定を作成する</a>
            </p>
            <p>
                <a href="/tools/bcrypt">エントリーパスワードに用いるbcryptハッシュを生成する</a>
            </p>
        </div>
    );
};

const id = 'index-OD9prQeada4rUe';

export default function Home(): JSX.Element {
    return (
        <AntDesign id={id}>
            <Layout style={{ minHeight: '100vh' }}>
                <ToolsHeader />
                <Layout.Content>
                    <Index />
                </Layout.Content>
            </Layout>
        </AntDesign>
    );
}
