import * as Icons from '@ant-design/icons';
import { Tooltip } from 'antd';
import { RenderFunction } from 'antd/lib/tooltip';
import React from 'react';

type Props = {
    title?: React.ReactNode | RenderFunction;
};

export const InformationIcon: React.FC<Props> = ({ title }: Props) => {
    return (
        <Tooltip title={title}>
            <Icons.InfoCircleFilled />
        </Tooltip>
    );
};
