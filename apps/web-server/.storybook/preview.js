import '../src/styles/css/antd.css';
import '../src/styles/css/main.scss';
import '@storybook/addon-console';

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
};
