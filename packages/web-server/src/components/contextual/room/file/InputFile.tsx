import { Button } from 'antd';
import * as React from 'react';
import { FileSourceType } from '@flocon-trpg/typed-document-node';
import { some } from '../../../../utils/types';
import { FirebaseStorageLink } from './FirebaseStorageLink';
import * as Core from '@flocon-trpg/core';
import { FilterValue } from 'antd/lib/table/interface';
import { FilePath } from '../../../../utils/file/filePath';
import classNames from 'classnames';
import { flex, flexRow, itemsCenter } from '../../../../utils/className';
import { ImageView } from './ImageView';
import { image } from '../../../../utils/fileType';

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

export const InputFile: React.FC<Props> = ({
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
                    <a href={filePath.path} target='_blank' rel='noopener noreferrer'>
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
                        defaultFilteredValue: [image],
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
