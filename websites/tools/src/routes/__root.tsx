import { Outlet, createRootRoute } from '@tanstack/react-router';
import { Layout, Typography } from 'antd';

const App = () => {
    return (
        <>
            <Outlet />
        </>
    );
};

export const Route = createRootRoute({
    component: App,
    notFoundComponent: () => {
        return (
            <Layout>
                <Typography.Title
                    level={1}
                    style={{
                        padding: 32,
                    }}
                >
                    {'404 - Not Found'}
                </Typography.Title>
            </Layout>
        );
    },
});
