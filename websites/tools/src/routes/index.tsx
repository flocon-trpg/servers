import { createFileRoute } from '@tanstack/react-router';
import { Layout } from 'antd';
import { layoutContentStyle } from '@/styles/LayoutContentStyle';

export const Route = createFileRoute('/')({
    component: () => (
        <Layout style={{ minHeight: '100vh' }}>
            <Layout.Content style={layoutContentStyle}>
                <a href="https://flocon.app/tools">https://flocon.app/tools</a>
                {' に移行しました。'}
            </Layout.Content>
        </Layout>
    ),
});
