import React from 'react';
import { Popover } from 'antd';
import { FilePath } from '@kizahasi/flocon-core';
import { useFirebaseStorageUrl } from '../hooks/firebaseStorage';
import { FilePathFragment } from '../generated/graphql';
import { RiFileUnknowLine } from 'react-icons/ri';
import { AiOutlineMessage, AiOutlineUser } from 'react-icons/ai';

type ImageProps = {
    filePath: FilePathFragment | FilePath | 'Message' | 'Person' | 'NotFound';
    size: number | 'Popover';
};

const Image: React.FC<ImageProps> = ({ filePath: filePathProp, size: sizeProp }: ImageProps) => {
    const size: number = sizeProp === 'Popover' ? 150 : sizeProp;
    const filePath = typeof filePathProp === 'string' ? undefined : filePathProp;
    const src = useFirebaseStorageUrl(filePath);
    if (src == null) {
        switch (filePathProp) {
            // antdのiconを直接使うと一定以上のサイズにならないので、react-iconsのものを使っている
            case 'Person':
                return <AiOutlineUser style={{ width: size, height: size }} />;
            case 'Message':
                return <AiOutlineMessage style={{ width: size, height: size }} />;
            default:
                return <RiFileUnknowLine style={{ width: size, height: size }} />;
        }
    }
    return <img src={src} width={size} height={size} />;
};

type Props = {
    image: FilePathFragment | FilePath | 'Message' | 'Person' | 'NotFound';
    size: number;
};

export const IconView = ({ image, size }: Props) => {
    return (
        <Popover
            trigger={typeof image === 'string' ? [] : 'hover'}
            content={<Image filePath={image} size="Popover" />}
        >
            <div>
                <Image filePath={image} size={size} />
            </div>
        </Popover>
    );
};
