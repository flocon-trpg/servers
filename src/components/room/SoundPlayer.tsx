import React from 'react';
import { Button, Input, Select } from 'antd';
import { isPublicChannelKey, Tab } from './RoomMessages';
import { FilePathInput, useWritePrivateMessageMutation } from '../../generated/graphql';
import { LoadingOutlined } from '@ant-design/icons';
import { $system } from '../../@shared/Constants';
import { useSelector } from '../../store';
import { allGameTypes } from '../../@shared/bcdice';
import { useDispatch } from 'react-redux';
import roomConfigModule from '../../modules/roomConfigModule';
import OperateContext from './contexts/OperateContext';
import FilesManagerDrawer from '../FilesManagerDrawer';
import { FilesManagerDrawerType, some } from '../../utils/types';
import { createPostOperationSetup } from '../../stateManagers/states/room';
import { replace } from '../../stateManagers/states/types';

const SoundPlayer: React.FC = () => {
    const operate = React.useContext(OperateContext);
    const [files, setFiles] = React.useState<FilePathInput[]>([]);
    const [drawerType, setDrawerType] = React.useState<FilesManagerDrawerType | null>(null);

    return (
        <div>
            {
                files.map((file, i) => <span key={i}>{file.path}</span>)
            }
            <Button onClick={() => setDrawerType({openFileType: some, onOpen: file => setFiles(x => [...x, file]) })}>追加</Button>
            <Button onClick={() => setFiles([])}>クリア</Button>
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
            <FilesManagerDrawer drawerType={drawerType} onClose={() => setDrawerType(null)} />
        </div>
    );
};

export default SoundPlayer;