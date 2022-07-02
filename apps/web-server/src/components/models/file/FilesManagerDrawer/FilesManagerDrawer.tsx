import * as React from 'react';
import { Button, Drawer, Input, Result, Tabs, Tooltip } from 'antd';
import {
    FilePathFragment,
    FileSourceType,
    GetServerInfoDocument,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { FilesManagerDrawerType, some } from '@/utils/types';
import { cancelRnd } from '@/styles/className';
import { FirebaseFilesManager } from './subcomponents/components/FirebaseFilesManager/FirebaseFilesManager';
import { FloconFilesManager } from './subcomponents/components/FloconFilesManager/FloconFilesManager';
import { useQuery } from 'urql';
import { useAtomValue } from 'jotai';
import { firebaseUserValueAtom } from '@/pages/_app';

type Props = {
    drawerType: FilesManagerDrawerType | null;
    onClose: () => void;
};

export const FilesManagerDrawer: React.FC<Props> = ({ drawerType, onClose }: Props) => {
    const firebaseUser = useAtomValue(firebaseUserValueAtom);
    const [input, setInput] = React.useState<string>('');
    const [{ data: serverInfo }] = useQuery({ query: GetServerInfoDocument });
    const isEmbeddedUploaderDisabled = serverInfo?.result.uploaderEnabled !== true;

    const child = (() => {
        if (firebaseUser == null) {
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
                        isEmbeddedUploaderDisabled={isEmbeddedUploaderDisabled}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane
                    tab={
                        isEmbeddedUploaderDisabled ? (
                            <Tooltip title='APIサーバーが稼働していないか、APIサーバーの設定で有効化されていないため、使用できません'>
                                内蔵アップローダー
                            </Tooltip>
                        ) : (
                            '内蔵アップローダー'
                        )
                    }
                    key='2'
                    disabled={isEmbeddedUploaderDisabled}
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
                <DialogFooter
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
