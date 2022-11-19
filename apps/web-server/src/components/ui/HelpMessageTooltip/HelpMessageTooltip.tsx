import * as Icons from '@ant-design/icons';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';
import { flex, flexRow, itemsCenter } from '@/styles/className';

export type Props = {
    title?: React.ReactNode;
};

export const HelpMessageTooltip: React.FC<Props> = ({
    title,
    children,
}: PropsWithChildren<Props>) => {
    return (
        <div className={flex} style={{ justifyContent: 'flex-start' }}>
            <Tooltip title={title}>
                <div className={classNames([flex, flexRow, itemsCenter])} style={{ gap: '0 4px' }}>
                    {children}
                    {title && <Icons.QuestionCircleTwoTone style={{ fontSize: 14 }} />}
                </div>
            </Tooltip>
        </div>
    );
};
