import * as Icons from '@ant-design/icons';
import React from 'react';
import { LazyAndPreloadImage } from '@/components/ui/LazyAndPreloadImage/LazyAndPreloadImage';
import { loaded, loading, nullishArg, useSrcFromFilePath } from '@/hooks/srcHooks';
import { FilePathLikeOrThumb } from '@/utils/file/filePath';

type Props = {
    filePath: FilePathLikeOrThumb | 'Message' | 'Person';
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
    const { queryResult } = useSrcFromFilePath(filePath);

    const loadingIcon = <Icons.LoadingOutlined style={{ fontSize: size }} />;
    const errorIcon = <Icons.FileExclamationOutlined style={{ fontSize: size }} />;

    switch (queryResult.type) {
        case loaded: {
            if (queryResult.value.status === 'pending') {
                return loadingIcon;
            }
            if (queryResult.value.data?.src == null) {
                return errorIcon;
            }
            const src = queryResult.value.data.src;
            // CONSIDER: 画像のURLを取得中のときだけでなく、画像を読込中のときもLoadingとして表示しないと少し混乱しそう
            // TODO: Uploaderのときは新しいタブで開くのではなくダウンロードする
            if (link) {
                <a href={src} target='_blank' rel='noopener noreferrer'>
                    <LazyAndPreloadImage
                        src={src}
                        width={size}
                        height={size}
                        loadingPlaceholder={loadingIcon}
                    />
                </a>;
            }
            return (
                <LazyAndPreloadImage
                    src={src}
                    width={size}
                    height={size}
                    loadingPlaceholder={loadingIcon}
                />
            );
        }
        case loading:
            return loadingIcon;
        case nullishArg: {
            switch (filePathProp) {
                case 'Person':
                    return <Icons.UserOutlined style={{ fontSize: size }} />;
                default:
                    return <Icons.MessageOutlined style={{ fontSize: size }} />;
            }
        }
        default:
            return errorIcon;
    }
};
