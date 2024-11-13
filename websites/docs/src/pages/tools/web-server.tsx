import { Layout } from 'antd';
import React from 'react';
import { AntDesign } from '../../components/AntDesign';
import { CreateEnv } from '../../components/CreateEnv';

const id = 'env-web-nHwcPQ1UyYZh6e';

export default function Home(): JSX.Element {
    return (
        <AntDesign id={id}>
            <Layout style={{ minHeight: '100vh' }}>
                {/* もし Layout.Content がないと、Layout.Content の中身のコンポーネントの文字色が Docusaurus のテーマの色になってしまう。このため、例えば Ant Design がダークモードの場合は文字色は白であってほしいが、Docusaurus がライトテーマだと文字色が黒っぽくなり見づらくなる。 */}
                <Layout.Content>
                    <CreateEnv />
                </Layout.Content>
            </Layout>
        </AntDesign>
    );
}
