import { CreateEnv } from '@flocon-trpg/websites-base';
import { createFileRoute } from '@tanstack/react-router';
import { Layout } from 'antd';

export const Route = createFileRoute('/web-server')({
    component: () => (
        <Layout style={{ minHeight: '100vh' }}>
            <CreateEnv />
        </Layout>
    ),
});
