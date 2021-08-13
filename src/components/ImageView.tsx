import React from 'react';
import { FilePath } from '@kizahasi/flocon-core';
import { error, loading, success, useFirebaseStorageUrl } from '../hooks/firebaseStorage';
import { FilePathFragment } from '../generated/graphql';
import * as Icons from '@ant-design/icons';
import { LazyAndPreloadImage } from './LazyAndPreloadImage';

type Props = {
    filePath: FilePathFragment | FilePath | 'Message' | 'Person';
    size: number | 'Popover';
    link?: boolean;
};

export const ImageView: React.FC<Props> = ({
    filePath: filePathProp,
    size: sizeProp,
    link,
}: Props) => {
    const size: number = sizeProp === 'Popover' ? 150 : sizeProp;
    const filePath = typeof filePathProp === 'string' ? undefined : filePathProp;
    const src = useFirebaseStorageUrl(filePath);
    const loadingIcon = <Icons.LoadingOutlined style={{ fontSize: size }} />;
    switch (src.type) {
        case success:
            // CONSIDER: 画像のURLを取得中のときだけでなく、画像を読込中のときもLoadingとして表示しないと少し混乱しそう
            if (link) {
                <a href={src.value} target="_blank" rel="noopener noreferrer">
                    <LazyAndPreloadImage
                        src={src.value}
                        width={size}
                        height={size}
                        placeHolderElement={loadingIcon}
                    />
                </a>;
            }
            return (
                <LazyAndPreloadImage
                    src={src.value}
                    width={size}
                    height={size}
                    placeHolderElement={loadingIcon}
                />
            );
        case error:
            return <Icons.FileExclamationOutlined style={{ fontSize: size }} />;
        case loading:
            return loadingIcon;
    }
    switch (filePathProp) {
        case 'Person':
            return <Icons.UserOutlined style={{ fontSize: size }} />;
        default:
            return <Icons.MessageOutlined style={{ fontSize: size }} />;
    }
};
