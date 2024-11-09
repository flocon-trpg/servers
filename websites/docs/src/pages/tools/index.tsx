import { AntDesign } from '@site/src/components/AntDesign';
import { Layout } from 'antd';

const Index: React.FC = () => {
    return (
        <div style={{ padding: 16 }}>
            <h2>Floconツール</h2>
            <p>
                <a href="./web-server">Webサーバーの設定を作成する</a>
            </p>
            <p>
                <a href="./bcrypt">エントリーパスワードに用いるbcryptハッシュを生成する</a>
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

const id = 'index-OD9prQeada4rUe';

export default function Home(): JSX.Element {
    return (
        <AntDesign id={id}>
            <Layout style={{ minHeight: '100vh' }}>
                <Index />
            </Layout>
        </AntDesign>
    );
}
