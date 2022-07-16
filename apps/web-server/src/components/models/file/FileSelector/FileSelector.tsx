import React from 'react';
import { flex, flexColumn, flexRow } from '@/styles/className';
import { State, filePathTemplate } from '@flocon-trpg/core';
import classNames from 'classnames';
import { UploaderFileBrowser } from '../UploaderFileBrowser/UploaderFileBrowser';
import { Alert, Button, Input } from 'antd';
import { analyzeUrl } from '@/utils/analyzeUrl';
import { Fieldset } from '@/components/ui/Fieldset/Fieldset';
import { FileType } from '@/utils/fileType';

type FilePathState = State<typeof filePathTemplate>;

type OnSelect = (filePath: FilePathState) => void;

export type Props = {
    onSelect: OnSelect;

    defaultFileTypeFilter: FileType | null;

    header?: React.ReactNode;

    uploaderFileBrowserHeight: number | null;
};

export const FileSelector: React.FC<Props> = ({
    onSelect,
    defaultFileTypeFilter,
    header,
    uploaderFileBrowserHeight,
}) => {
    const [urlInputValue, setUrlInputValue] = React.useState('');

    const isUrlInputValueEmpty = urlInputValue.trim() === '';
    const url = React.useMemo(() => analyzeUrl(urlInputValue), [urlInputValue]);

    let urlInfo: JSX.Element | null;
    if (urlInputValue == null || isUrlInputValueEmpty) {
        urlInfo = null;
    } else if (url == null) {
        urlInfo = <Alert message='無効なURLです。' type='warning' showIcon />;
    } else if (url.type === 'dropbox') {
        urlInfo = (
            <Alert
                message='DropboxのURLと判定されました。自動的に変換して処理されます。'
                type='info'
                showIcon
            />
        );
    } else {
        urlInfo = null;
    }

    return (
        <div className={classNames(flex, flexColumn)}>
            {header}
            <Fieldset legend='アップローダーから選択'>
                <UploaderFileBrowser
                    height={uploaderFileBrowserHeight}
                    onSelect={onSelect}
                    defaultFileTypeFilter={defaultFileTypeFilter}
                />
            </Fieldset>
            <Fieldset legend='URLから直接指定'>
                <div className={classNames(flex, flexRow)}>
                    <Input value={urlInputValue} onChange={e => setUrlInputValue(e.target.value)} />
                    <Button
                        disabled={url == null || isUrlInputValueEmpty}
                        onClick={() => {
                            if (url == null || isUrlInputValueEmpty) {
                                return;
                            }
                            onSelect({ $v: 1, $r: 1, path: urlInputValue, sourceType: 'Default' });
                            setUrlInputValue('');
                        }}
                    >
                        選択
                    </Button>
                </div>
                {urlInfo}
            </Fieldset>
        </div>
    );
};
