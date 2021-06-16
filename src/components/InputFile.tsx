import { Button } from 'antd';
import * as React from 'react';
import { FileSourceType } from '../generated/graphql';
import { useFirebaseStorageUrl } from '../hooks/firebaseStorage';
import { FilePath, some } from '../utils/types';
import FirebaseStorageLink from './FirebaseStorageLink';
import * as Core from '@kizahasi/flocon-core';
import { FilterValue } from 'antd/lib/table/interface';
import { image } from './FilesManagerDrawer';

type ImageProps = {
    filePath?: FilePath | Core.FilePath;
}

const Image: React.FC<ImageProps> = ({ filePath }: ImageProps) => {
    const src = useFirebaseStorageUrl(filePath);
    if (src == null || filePath == null) {
        return null;
    }
    return (
        <a href={src} target='_blank' rel='noopener noreferrer'>
            <img src={src} width={30} height={30} />
        </a>);
};

type Props = {
    filePath?: FilePath | Core.FilePath;
    onPathChange?: (path: FilePath | Core.FilePath | null) => void;
    openFilesManager: (drawerType: { openFileType: typeof some; onOpen: (path: FilePath | Core.FilePath) => void; defaultFilteredValue: FilterValue | undefined }) => void;
    showImage?: boolean;
}

const InputFile: React.FC<Props> = ({ filePath, onPathChange, openFilesManager, showImage }: Props) => {
    const onOpen = (path: FilePath | Core.FilePath) => {
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

    return (
        <div style={({ display: 'flex', flexDirection: 'row', alignItems: 'center' })}>
            {imageElement}
            {imageElement == null ? null : <div style={({ width: 4 })} />}
            {fileNameElement}
            <div style={({ width: 4 })} />
            <Button onClick={() => {
                openFilesManager({ openFileType: some, onOpen, defaultFilteredValue: [image] });
            }}>Open</Button>
            {filePath != null && <Button onClick={() => {
                if (onPathChange != null) {
                    onPathChange(null);
                }
            }}>Remove</Button>}
        </div>
    );
};

export default InputFile;