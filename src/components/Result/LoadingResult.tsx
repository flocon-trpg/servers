import { Result } from 'antd';
import React from 'react';
import * as Icon from '@ant-design/icons';

type Props = {
    title?: string;
};

export const LoadingResult: React.FC<Props> = (props: Props) => {
    return <Result icon={<Icon.LoadingOutlined />} title={props.title ?? '読み込み中…'} />;
};
