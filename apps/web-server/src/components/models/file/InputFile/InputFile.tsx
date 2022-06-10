import { Button, Tooltip } from 'antd';
import * as React from 'react';
import { FileSourceType } from '@flocon-trpg/typed-document-node-v0.7.1';
import { some } from '../../../../utils/types';
import { FirebaseStorageLink } from '../FirebaseStorageLink/FirebaseStorageLink';
import * as Core from '@flocon-trpg/core';
import { FilterValue } from 'antd/lib/table/interface';
import { FilePath } from '../../../../utils/file/filePath';
import classNames from 'classnames';
import { flex, flexRow, itemsCenter } from '../../../../utils/className';
import { ImageView } from '../ImageView/ImageView';
import { image } from '../../../../utils/fileType';

type FilePathState = Core.State<typeof Core.filePathTemplate>;

type Props = {
    filePath?: FilePath | FilePathState;
    onPathChange?: (path: FilePath | FilePathState | null) => void;
    openFilesManager: (drawerType: {
        openFileType: typeof some;
        onOpen: (path: FilePath | FilePathState) => void;
        defaultFilteredValue: FilterValue | undefined;
    }) => void;
    showImage?: boolean;
    maxWidthOfLink?: number;
};

export const InputFile: React.FC<Props> = ({
    filePath,
    onPathChange,
    openFilesManager,
    showImage,
    maxWidthOfLink,
}: Props) => {
    const onOpen = (path: FilePath | FilePathState) => {
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
            case FileSourceType.Default: {
                const a = (ellipsis: boolean) => (
                    <a
                        href={filePath.path}
                        target='_blank'
                        rel='noopener noreferrer'
                        style={
                            ellipsis
                                ? {
                                      maxWidth: maxWidthOfLink,
                                      textOverflow: 'ellipsis',
                                      overflow: 'hidden',
                                      whiteSpace: 'nowrap',
                                  }
                                : undefined
                        }
                    >
                        {filePath.path}
                    </a>
                );
                return <Tooltip overlay={a(false)}>{a(true)}</Tooltip>;
            }
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
