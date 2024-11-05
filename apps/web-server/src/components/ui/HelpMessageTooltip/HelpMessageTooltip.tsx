import * as Icons from '@ant-design/icons';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';
import { AntdThemeContext } from '@/contexts/AntdThemeContext';
import { flex, flexRow, itemsCenter } from '@/styles/className';

export type Props = {
    title?: React.ReactNode;
    overlayWidth?: React.CSSProperties['width'];
} & PropsWithChildren;

export const HelpMessageTooltip: React.FC<Props> = ({ title, overlayWidth, children }: Props) => {
    const compact = React.useContext(AntdThemeContext).compact;
    return (
        <div className={flex} style={{ justifyContent: 'flex-start' }}>
            <div className={classNames([flex, flexRow, itemsCenter])} style={{ gap: '0 4px' }}>
                {children}
                <Tooltip title={title} overlayInnerStyle={{ width: overlayWidth }}>
                    {title != null && (
                        <Icons.QuestionCircleTwoTone style={{ fontSize: compact ? 14 : 16 }} />
                    )}
                </Tooltip>
            </div>
        </div>
    );
};
