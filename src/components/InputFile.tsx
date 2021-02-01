import { Button } from 'antd';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { FileSourceType } from '../generated/graphql';
import { useFirebaseStorageUrl } from '../hooks/firebaseStorage';
import { useSelector } from '../store';
import { FilePath, some } from '../utils/types';
import FirebaseStorageLink from './FirebaseStorageLink';

type ImageProps = {
    filePath?: FilePath;
}

const Image: React.FC<ImageProps> = ({filePath}: ImageProps) => {
    const src = useFirebaseStorageUrl(filePath);
    if (src == null) {
        return null;
    }
    return (<img src={src} width={50} height={50} />);
};

type Props = {
    filePath?: FilePath;
    onPathChange?: (path: FilePath | null) => void;
    openFilesManager: (drawerType: { openFileType: typeof some; onOpen: (path: FilePath) => void }) => void;
    showImage?: boolean;
}

const InputFile: React.FC<Props> = ({ filePath, onPathChange, openFilesManager, showImage }: Props) => {
    const onOpen = (path: FilePath) => {
        if (onPathChange != null) {
            onPathChange(path);
        }
    };

    const imageElement = (() => {
        if (filePath == null || showImage !== true) {
            return null;
        }
        return (<Image filePath={filePath} />);
    })();
    const fileNameElement = (() => {
        if (filePath == null) {
            return <span>（ファイルが選択されていません）</span>;
        }
        switch (filePath.sourceType) {
            case FileSourceType.Default:
                return (<a href={filePath.path} target='_blank' rel='noopener noreferrer'>{filePath.path}</a>);
            case FileSourceType.FirebaseStorage:
                return (<FirebaseStorageLink reference={filePath.path} />);
        }
    })();
    const button = (() => {
        if (filePath == null) {
            return (<Button onClick={() => {
                openFilesManager({ openFileType: some, onOpen });
            }}>Open</Button>);
        }
        return(<Button onClick={() => {
            if (onPathChange != null) {
                onPathChange(null);
            }
        }}>Remove</Button>);
    })();
    
    return (
        <span>
            {imageElement}
            {fileNameElement}
            {button}
        </span>
    );
};

export default InputFile;