import * as React from 'react';
import { Button, Drawer, Input, Result, Tabs, Tooltip } from 'antd';
import { FilePathFragment, FileSourceType, useGetServerInfoQuery } from '../generated/graphql';
import DrawerFooter from '../layouts/DrawerFooter';
import { FilesManagerDrawerType, some } from '../utils/types';
import { cancelRnd } from '../utils/className';
import { FirebaseFilesManager } from './FilesManagerDrawer/FirebaseFilesManager';
import { FloconFilesManager } from './FilesManagerDrawer/FloconFilesManager';
import { MyAuthContext } from '../contexts/MyAuthContext';

type Props = {
    drawerType: FilesManagerDrawerType | null;
    onClose: () => void;
};

const FilesManagerDrawer: React.FC<Props> = ({ drawerType, onClose }: Props) => {
    const myAuth = React.useContext(MyAuthContext);
    const [input, setInput] = React.useState<string>('');
    const { data: serverInfo } = useGetServerInfoQuery();
    const isUploaderDisabled = serverInfo?.result.uploaderEnabled !== true;

    const child = (() => {
        if (typeof myAuth === 'string') {
            return (
                <Result
                    status='warning'
                    title='この機能を利用するにはログインする必要があります。'
                />
            );
        }
        let onFileOpen: ((path: FilePathFragment) => void) | undefined = undefined;
        if (drawerType?.openFileType === some) {
            onFileOpen = path => {
                drawerType.onOpen(path);
                onClose();
            };
        }
        return (
            <Tabs>
                <Tabs.TabPane tab='Firebase Storage' key='1'>
                    <FirebaseFilesManager
                        onFlieOpen={onFileOpen}
                        defaultFilteredValue={drawerType?.defaultFilteredValue}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane
                    tab={
                        isUploaderDisabled ? (
                            <Tooltip title='APIサーバーの設定で有効化されていないため、使用できません'>
                                内蔵アップローダー
                            </Tooltip>
                        ) : (
                            '内蔵アップローダー'
                        )
                    }
                    key='2'
                    disabled={isUploaderDisabled}
                >
                    <FloconFilesManager
                        onFlieOpen={onFileOpen}
                        defaultFilteredValue={drawerType?.defaultFilteredValue}
                    />
                </Tabs.TabPane>
                {drawerType?.openFileType === some && (
                    <Tabs.TabPane tab='URL' key='2'>
                        <div>
                            <Input value={input} onChange={e => setInput(e.target.value)} />
                            <Button
                                type='primary'
                                style={{ marginTop: 2 }}
                                disabled={input.trim() === '' /* このチェックはかなり簡易的 */}
                                onClick={() => {
                                    drawerType.onOpen({
                                        sourceType: FileSourceType.Default,
                                        path: input.trim(),
                                    });
                                    setInput('');
                                    onClose();
                                }}
                            >
                                OK
                            </Button>
                        </div>
                    </Tabs.TabPane>
                )}
            </Tabs>
        );
    })();

    return (
        <Drawer
            className={cancelRnd}
            closable
            visible={drawerType != null}
            onClose={() => onClose()}
            width={800}
            footer={
                <DrawerFooter
                    close={{
                        textType: 'close',
                        onClick: () => onClose(),
                    }}
                />
            }
        >
            {child}
        </Drawer>
    );
};

export default FilesManagerDrawer;
