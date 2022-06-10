import React from 'react';
import { Popover } from 'antd';
import { State, filePathTemplate } from '@flocon-trpg/core';
import { FilePathFragment } from '@flocon-trpg/typed-document-node-v0.7.1';
import { ImageView } from '../ImageView/ImageView';

type FilePath = State<typeof filePathTemplate>;

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
