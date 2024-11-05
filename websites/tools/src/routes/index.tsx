import { Link, createFileRoute } from '@tanstack/react-router';
import { Layout } from 'antd';

const Index: React.FC = () => {
    return (
        <div style={{ padding: 16 }}>
            <h2>Floconツール</h2>
            <p>
                <Link to="/web-server">Webサーバーの設定を作成する</Link>
            </p>
            <p>
                <Link to="/bcrypt">エントリーパスワードに用いるbcryptハッシュを生成する</Link>
            </p>
            <h2>その他</h2>
            <a
                href="https://github.com/flocon-trpg/servers"
                target="_blank"
                rel="noopener noreferrer"
            >
                ソースコード
            </a>
        </div>
    );
};

export const Route = createFileRoute('/')({
    component: () => (
        <Layout style={{ minHeight: '100vh' }}>
            <Index />
        </Layout>
    ),
});
