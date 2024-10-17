import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

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
});
