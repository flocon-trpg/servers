import React from 'react';
import { Tooltip } from 'antd';
import * as Icons from '@ant-design/icons';
import { RenderFunction } from 'antd/lib/tooltip';

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
