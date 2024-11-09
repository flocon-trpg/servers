import { ConfigProvider, theme } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import React, { PropsWithChildren } from 'react';
import { createRoot } from 'react-dom/client';

// docusaurus には global css を無効化する方法がない(https://github.com/facebook/docusaurus/issues/6032)ため、https://ant.design/docs/react/compatible-style#shadow-dom-usage を参考に shadow DOM を使って Ant Design のコンポーネントを使用している
// id には他と重複しない適当な文字列を入れる
export const AntDesign: React.FC<PropsWithChildren<{ id: string }>> = ({ id, children }) => {
    React.useEffect(() => {
        const targetElement = document.getElementById(id);
        if (targetElement === null) {
            console.warn(`Element with id ${id} is not found at AntDesign component.`);
            return;
        }
        const shadowRoot = targetElement.attachShadow({ mode: 'open' });
        const container = document.createElement('div');
        shadowRoot.appendChild(container);
        const root = createRoot(container);

        root.render(
            <StyleProvider container={shadowRoot}>
                <ConfigProvider
                    theme={{ algorithm: theme.darkAlgorithm }}
                    // これがないと antd の Image コンポーネントをクリックしても画像が拡大して表示されない - https://github.com/ant-design/ant-design/issues/38911#issuecomment-2308376290
                    getPopupContainer={() => container}
                >
                    {children}
                </ConfigProvider>
            </StyleProvider>,
        );
    }, []);
    return <div id={id} />;
};
