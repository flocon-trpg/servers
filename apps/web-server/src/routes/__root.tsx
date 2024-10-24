import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Typography } from 'antd';
import { LayoutWithNoHook } from '@/components/ui/Layout/Layout';

const App = () => {
    return (
        <>
            <Outlet />
            <TanStackRouterDevtools />
        </>
    );
};

export const Route = createRootRoute({
    component: App,
    notFoundComponent: () => {
        return (
            <LayoutWithNoHook>
                <Typography.Title
                    level={1}
                    style={{
                        padding: 32,
                    }}
                >
                    {'404 - Not Found'}
                </Typography.Title>
            </LayoutWithNoHook>
        );
    },
});
