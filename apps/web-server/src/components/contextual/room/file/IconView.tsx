import React from 'react';
import { Popover } from 'antd';
import { FilePath } from '@flocon-trpg/core';
import { FilePathFragment } from '@flocon-trpg/typed-document-node';
import { ImageView } from './ImageView';

type Props = {
    image: FilePathFragment | FilePath | 'Message' | 'Person';
    size: number;
};

export const IconView = ({ image, size }: Props) => {
    return (
        <Popover
            trigger={typeof image === 'string' ? [] : 'hover'}
            content={<ImageView filePath={image} size='Popover' />}
        >
            <div>
                <ImageView filePath={image} size={size} />
            </div>
        </Popover>
    );
};