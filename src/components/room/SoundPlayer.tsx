import React from 'react';
import { Button, Input, Select } from 'antd';
import { FilePathInput, useWritePrivateMessageMutation, useWriteRoomSoundEffectMutation } from '../../generated/graphql';
import * as Icon from '@ant-design/icons';
import OperateContext from './contexts/OperateContext';
import FilesManagerDrawer from '../FilesManagerDrawer';
import { FilesManagerDrawerType, some } from '../../utils/types';
import { createPostOperationSetup } from '../../stateManagers/states/room';
import { replace } from '../../stateManagers/states/types';

type Props = {
    roomId: string;
}

const SoundPlayer: React.FC<Props> = ({ roomId }: Props) => {
    const operate = React.useContext(OperateContext);
    const [files, setFiles] = React.useState<FilePathInput[]>([]);
    const [writeRoomSoundEffect] = useWriteRoomSoundEffectMutation();
    const [bgmDrawerType, setBgmDrawerType] = React.useState<FilesManagerDrawerType | null>(null);
    const [seDrawerType, setSeDrawerType] = React.useState<FilesManagerDrawerType | null>(null);

    return (
        <div>
            (まだ仮UIです。BGMを再生するには、まずBGMリストに1曲以上ファイルを追加してから「BGMを再生」ボタンをクリックします。再生中にBGMリストを変更しても現在再生中のBGMには反映されません。SEはBGMリストなどとは関係ありません。)
            <br />
            {
                files.map((file, i) => <span key={i}>{file.path}</span>)
            }
            <br />
            <Button onClick={() => setBgmDrawerType({ openFileType: some, onOpen: file => setFiles(x => [...x, file]) })}>BGMリストに追加</Button>
            <Button onClick={() => setFiles([])}>BGMリストをクリア</Button>
            <Button onClick={() => {
                const operation = createPostOperationSetup();
                operation.bgms.set('1', {
                    type: replace,
                    newValue: {
                        files,
                        volume: 0.5
                    }
                });
                operate(operation);
            }}>BGMを再生</Button>
            <Button onClick={() => {
                const operation = createPostOperationSetup();
                operation.bgms.set('1', {
                    type: replace,
                    newValue: undefined,
                });
                operate(operation);
            }}>BGMを停止</Button>
            <br />
            <Button
                onClick={() => setSeDrawerType({
                    openFileType: some, onOpen: file => {
                        // TODO: catch
                        writeRoomSoundEffect({ variables: { file, roomId, volume: 0.5 } });
                    }
                })}>
                SEを再生
            </Button>
            <FilesManagerDrawer drawerType={bgmDrawerType} onClose={() => setBgmDrawerType(null)} />
            <FilesManagerDrawer drawerType={seDrawerType} onClose={() => setSeDrawerType(null)} />
        </div>
    );
};

export default SoundPlayer;