import '../src/styles/css/antd.css';
import '../src/styles/css/main.scss';
import '@storybook/addon-console';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import FakeTimers from '@sinonjs/fake-timers';

FakeTimers.install({ now: 1_000_000_000_000 });

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
    nextRouter: {
        Provider: RouterContext.Provider,
    },
};
