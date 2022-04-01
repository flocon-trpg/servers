import React from 'react';
import { State, filePathTemplate } from '@flocon-trpg/core';
import { error, loading, success, useSrcFromGraphQL } from '../../../../hooks/src';
import { FilePathFragment } from '@flocon-trpg/typed-document-node';
import * as Icons from '@ant-design/icons';
import { LazyAndPreloadImage } from '../../../ui/LazyAndPreloadImage';

type FilePath = State<typeof filePathTemplate>;

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
    const src = useSrcFromGraphQL(filePath);
    const loadingIcon = <Icons.LoadingOutlined style={{ fontSize: size }} />;
    switch (src.type) {
        case success:
            // CONSIDER: 画像のURLを取得中のときだけでなく、画像を読込中のときもLoadingとして表示しないと少し混乱しそう
            // TODO: Uploaderのときは新しいタブで開くのではなくダウンロードする
            if (link) {
                <a href={src.value} target='_blank' rel='noopener noreferrer'>
                    <LazyAndPreloadImage
                        src={src.value}
                        width={size}
                        height={size}
                        loadingPlaceholder={loadingIcon}
                    />
                </a>;
            }
            return (
                <LazyAndPreloadImage
                    src={src.value}
                    width={size}
                    height={size}
                    loadingPlaceholder={loadingIcon}
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
