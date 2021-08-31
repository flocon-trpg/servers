import { Button } from 'antd';
import * as React from 'react';
import { FileSourceType } from '../generated/graphql';
import { success, useUrlFromGraphQL } from '../hooks/url';
import { some } from '../utils/types';
import FirebaseStorageLink from './FirebaseStorageLink';
import * as Core from '@kizahasi/flocon-core';
import { FilterValue } from 'antd/lib/table/interface';
import { FirebaseStorageFile } from '../modules/fileModule';
import { FilePath } from '../utils/filePath';
import classNames from 'classnames';
import { flex, flexRow, itemsCenter } from '../utils/className';
import { ImageView } from './ImageView';

type Props = {
    filePath?: FilePath | Core.FilePath;
    onPathChange?: (path: FilePath | Core.FilePath | null) => void;
    openFilesManager: (drawerType: {
        openFileType: typeof some;
        onOpen: (path: FilePath | Core.FilePath) => void;
        defaultFilteredValue: FilterValue | undefined;
    }) => void;
    showImage?: boolean;
};

const InputFile: React.FC<Props> = ({
    filePath,
    onPathChange,
    openFilesManager,
    showImage,
}: Props) => {
    const onOpen = (path: FilePath | Core.FilePath) => {
        if (onPathChange != null) {
            onPathChange(path);
        }
    };

    const imageElement = (() => {
        if (filePath == null || showImage !== true) {
            return null;
        }
        return <ImageView filePath={filePath} size={30} link />;
    })();
    const fileNameElement = (() => {
        if (filePath == null) {
            return <span>（ファイルが選択されていません）</span>;
        }
        switch (filePath.sourceType) {
            case FileSourceType.Default:
                return (
                    <a href={filePath.path} target="_blank" rel="noopener noreferrer">
                        {filePath.path}
                    </a>
                );
            case FileSourceType.FirebaseStorage:
                return <FirebaseStorageLink reference={filePath.path} />;
        }
    })();

    return (
        <div className={classNames(flex, flexRow, itemsCenter)}>
            {imageElement}
            {imageElement == null ? null : <div style={{ width: 4 }} />}
            {fileNameElement}
            <div style={{ width: 4 }} />
            <Button
                onClick={() => {
                    openFilesManager({
                        openFileType: some,
                        onOpen,
                        defaultFilteredValue: [FirebaseStorageFile.image],
                    });
                }}
            >
                Open
            </Button>
            {filePath != null && (
                <Button
                    onClick={() => {
                        if (onPathChange != null) {
                            onPathChange(null);
                        }
                    }}
                >
                    Remove
                </Button>
            )}
        </div>
    );
};

export default InputFile;
