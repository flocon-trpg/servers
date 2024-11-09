import { Layout } from 'antd';
import React from 'react';
import { AntDesign } from '../../components/AntDesign';
import { CreateEnv } from '../../components/CreateEnv';

const id = 'env-web-nHwcPQ1UyYZh6e';

export default function Home(): JSX.Element {
    return (
        <AntDesign id={id}>
            <Layout style={{ minHeight: '100vh' }}>
                <CreateEnv />
            </Layout>
        </AntDesign>
    );
}
