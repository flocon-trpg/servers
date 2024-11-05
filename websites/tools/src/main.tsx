/* eslint-disable react-refresh/only-export-components */
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { App as AntdApp, ConfigProvider, theme } from 'antd';
import jaJP from 'antd/locale/ja_JP';
import { PropsWithChildren, StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { routeTree } from './routeTree.gen';
import './main.css';

// Create a new router instance
const router = createRouter({
    routeTree,
    notFoundMode: 'root',
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

const App = ({ children }: PropsWithChildren) => {
    return (
        <ConfigProvider
            theme={{ algorithm: [theme.compactAlgorithm, theme.darkAlgorithm] }}
            locale={jaJP}
        >
            <AntdApp>{children}</AntdApp>
        </ConfigProvider>
    );
};

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <StrictMode>
            <App>
                <RouterProvider router={router} />
            </App>
        </StrictMode>,
    );
}
