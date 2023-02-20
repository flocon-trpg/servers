import '../src/styles/css/main.scss';
import '@storybook/addon-console';
import { RouterContext } from 'next/dist/shared/lib/router-context';

// 当初、ここで @sinonjs/fake-timers を使って Date を mock していたが、Board の Story で 画像が表示されなかったり縮尺が変わるという問題が発生したので取り除いた

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
