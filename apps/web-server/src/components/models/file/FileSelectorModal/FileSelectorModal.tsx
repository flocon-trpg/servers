import { State, filePathTemplate } from '@flocon-trpg/core';
import { Modal } from 'antd';
import React from 'react';
import { FileSelector } from '../FileSelector/FileSelector';
import { UploaderFileBrowser } from '../UploaderFileBrowser/UploaderFileBrowser';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { FileType } from '@/utils/fileType';
import { stretchedModalWidth } from '@/utils/variables';

type FilePathState = State<typeof filePathTemplate>;

type PropsBase = {
    visible: boolean;
    onClose: () => void;
    defaultFileTypeFilter: FileType | null;
    uploaderFileBrowserHeight: number | null;
};

type ModeProps =
    | {
          /** nullを渡した場合、ファイルを選択するメニュー等が無効化されます。 */
          onSelect: (path: FilePathState) => void;
          header?: React.ReactNode;
      }
    | {
          /** nullを渡した場合、ファイルを選択するメニュー等が無効化されます。 */
          onSelect: null;
      };

export type Props = PropsBase & ModeProps;

export const FileSelectorModal: React.FC<Props> = props => {
    const { visible, onClose, defaultFileTypeFilter } = props;
    return (
        <Modal
            visible={visible}
            width={stretchedModalWidth}
            onCancel={onClose}
            footer={<DialogFooter close={{ textType: 'close', onClick: onClose }} />}
        >
            {props.onSelect == null ? (
                <UploaderFileBrowser
                    defaultFileTypeFilter={defaultFileTypeFilter}
                    onSelect={null}
                    height={props.uploaderFileBrowserHeight}
                />
            ) : (
                <FileSelector
                    defaultFileTypeFilter={defaultFileTypeFilter}
                    onSelect={props.onSelect}
                    header={props.header}
                    uploaderFileBrowserHeight={props.uploaderFileBrowserHeight}
                />
            )}
        </Modal>
    );
};
