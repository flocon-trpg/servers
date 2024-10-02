import { Global } from '@emotion/react';
import { theme } from 'antd';
import React from 'react';

// Room において共通して使われる Global。
// 現時点では、主に次の2つのケースで使われている。
// - 部屋の画面において、ウィンドウがはみ出た場合でもブラウザ画面全体の background が黒くなるようにするため。これがないと一部の背景が白くなる。
// - Storybook において、背景を黒くするため。
export const RoomGlobalStyle = () => {
    const { token } = theme.useToken();
    const globalStyles = React.useMemo(
        () => ({ body: { background: token.colorBgBase } }),
        [token.colorBgBase],
    );
    return <Global styles={globalStyles} />;
};
