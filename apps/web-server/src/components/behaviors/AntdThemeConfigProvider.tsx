import { ConfigProvider, theme } from 'antd';
import { ThemeConfig } from 'antd/es/config-provider/context';
import jaJP from 'antd/locale/ja_JP';
import React from 'react';
import { AntdThemeContext, Value } from '@/contexts/AntdThemeContext';

const defaultTheme: ThemeConfig = { algorithm: [theme.darkAlgorithm] };
const compactTheme: ThemeConfig = { algorithm: [theme.compactAlgorithm, theme.darkAlgorithm] };

type Props = {
    /** `true` の場合は compact テーマが適用されます。`false` の場合は compact テーマが無効化されます。それ以外の場合は compact テーマの設定を維持します。 */
    compact?: boolean | undefined;
};

export const AntdThemeConfigProvider: React.FC<Props> = ({ compact, children }) => {
    const parentCompact = React.useContext(AntdThemeContext).compact;
    const childCompact = compact ?? parentCompact;
    const childContextValue: Value = React.useMemo(() => {
        return { compact: childCompact };
    }, [childCompact]);

    return (
        <ConfigProvider theme={childCompact ? compactTheme : defaultTheme} locale={jaJP}>
            <AntdThemeContext.Provider value={childContextValue}>
                {children}
            </AntdThemeContext.Provider>
        </ConfigProvider>
    );
};
