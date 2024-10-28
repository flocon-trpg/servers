import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Typography } from 'antd';
import { useAtomValue } from 'jotai';
import { enableTanStackRouterDevtoolsAtom } from '@/atoms/enableTanStackRouterDevtoolsAtom/enableTanStackRouterDevtoolsAtom';
import { LayoutWithNoHook } from '@/components/ui/Layout/Layout';

const App = () => {
    const enableTanStackRouterDevtools = useAtomValue(enableTanStackRouterDevtoolsAtom);

    return (
        <>
            <Outlet />
            {enableTanStackRouterDevtools && <TanStackRouterDevtools />}
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
