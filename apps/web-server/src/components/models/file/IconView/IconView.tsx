import { Popover } from 'antd';
import React from 'react';
import { ImageView } from '../ImageView/ImageView';
import { FilePathLikeOrThumb } from '@/utils/file/filePath';

type Props = {
    image: FilePathLikeOrThumb | 'Message' | 'Person';
    size: number;
};

export const IconView = ({ image, size }: Props) => {
    return (
        <Popover
            trigger={typeof image === 'string' ? [] : 'hover'}
            content={<ImageView filePath={image} size="Popover" />}
        >
            <div>
                <ImageView filePath={image} size={size} />
            </div>
        </Popover>
    );
};
