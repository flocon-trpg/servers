import React from 'react';
import { Button, Divider, Drawer, Tag, Tooltip, Typography } from 'antd';
import { FilePathInput, FileSourceType, useWriteRoomSoundEffectMutation } from '../../generated/graphql';
import * as Icon from '@ant-design/icons';
import FilesManagerDrawer from '../FilesManagerDrawer';
import { FilesManagerDrawerType, some } from '../../utils/types';
import { replace, update } from '../../stateManagers/states/types';
import { StrIndex5 } from '../../@shared/indexes';
import { Room } from '../../stateManagers/states/room';
import { RoomBgm } from '../../stateManagers/states/roomBgm';
import { filePathEquals } from '../../stateManagers/states/comparer';
import VolumeBar from '../../foundations/VolumeBar';
import DrawerFooter from '../../layouts/DrawerFooter';
import { MyStyle } from '../../utils/myStyle';
import { __ } from '../../@shared/collection';
import { useSelector } from '../../store';
import { useOperate } from '../../hooks/useOperate';

const defaultVolume = 0.5;

const toKey = (source: FilePathInput): string => {
    return `${source.sourceType}:${source.path}`;
};

type VolumeBarForSoundPlayerProps = {
    volumeBarValue: number;
    onVolumeBarValueChange: (newValue: number) => void;
    hasMarginLeft?: boolean;
}

const VolumeBarForSoundPlayer: React.FC<VolumeBarForSoundPlayerProps> = ({ volumeBarValue, onVolumeBarValueChange, hasMarginLeft }: VolumeBarForSoundPlayerProps) => {
    return <Tooltip title='ボリューム補正の値は、自分だけでなく部屋にいる全員に反映されます'>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Icon.SoundOutlined style={{ marginLeft: hasMarginLeft ? 16 : undefined }} />
            <span>ボリューム補正</span>
            <VolumeBar
                inputNumberType='0-1'
                readonly={false}
                value={volumeBarValue}
                onChange={i => {
                    onVolumeBarValueChange(i);
                }} />
        </div>
    </Tooltip>;
};

type FilePathViewProps = {
    filePath: FilePathInput;
    closable?: boolean;
    onClose?: () => void;
}

const FilePathView: React.FC<FilePathViewProps> = ({ filePath, closable, onClose }: FilePathViewProps) => {
    let fileName: string;
    if (filePath.sourceType === FileSourceType.FirebaseStorage) {
        fileName = __(filePath.path.split('/')).lastOrDefault('');
    } else {
        fileName = filePath.path;
    }

    return <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <div style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{fileName}</div>
        {closable && <Button type='text' size='small' style={{ flex: 0 }} onClick={() => onClose == null ? undefined : onClose()}><Icon.CloseOutlined /></Button>}
    </div>;
};

type BgmPlayerDrawerProps = {
    channelKey: StrIndex5;
    bgmState: RoomBgm.State | undefined;
    visible: boolean;
    onClose: () => void;
}

const BgmPlayerDrawer: React.FC<BgmPlayerDrawerProps> = ({ channelKey, bgmState, visible, onClose }: BgmPlayerDrawerProps) => {
    const operate = useOperate();

    const [filesManagerDrawerType, setFilesManagerDrawerType] = React.useState<FilesManagerDrawerType | null>(null);

    const [filesInput, setFilesInput] = React.useState<FilePathInput[]>([]);
    const [volumeInput, setVolumeInput] = React.useState<number>(defaultVolume);

    React.useEffect(() => {
        setFilesInput([]);
        setVolumeInput(defaultVolume);
    }, [visible]);

    const tags = filesInput.map(file => {
        return <FilePathView
            key={toKey(file)}
            closable
            onClose={() => {
                setFilesInput(oldValue => {
                    return oldValue.filter(x => !filePathEquals(file, x));
                });
            }}
            filePath={file} />;
    });

    return (<Drawer
        className='cancel-rnd'
        title={`チャンネル${channelKey}`}
        width={400}
        closable
        onClose={() => onClose()}
        visible={visible}
        footer={<DrawerFooter
            close={{ textType: 'cancel', onClick: () => onClose() }}
            ok={{
                textType: 'ok',
                onClick: () => {
                    const operation = Room.createPostOperationSetup();
                    if (bgmState == null) {
                        operation.bgms.set(channelKey, {
                            type: replace,
                            newValue: {
                                files: filesInput,
                                volume: volumeInput,
                            }
                        });
                        operate(operation);
                        onClose();
                        return;
                    }
                    operation.bgms.set(channelKey, {
                        type: update,
                        operation: {
                            files: {
                                newValue: filesInput,
                            },
                            volume: {
                                newValue: volumeInput,
                            }
                        },
                    });
                    operate(operation);
                    onClose();
                }
            }} />}>
        {<FilesManagerDrawer drawerType={filesManagerDrawerType} onClose={() => setFilesManagerDrawerType(null)} />}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <VolumeBarForSoundPlayer volumeBarValue={volumeInput} onVolumeBarValueChange={i => setVolumeInput(i)} />
            <Divider />
            <Typography.Title level={4}>BGMプレイリスト</Typography.Title>
            {tags.length === 0 ? 'BGMに指定するファイルが1つも選択されていません。' : tags}
            <Button
                icon={<Icon.PlusOutlined />}
                type='dashed'
                size='small'
                onClick={() => setFilesManagerDrawerType({
                    openFileType: some, onOpen: file => {
                        setFilesInput(oldValue => [...oldValue, file]);
                    }
                })}>ファイルを追加</Button>
        </div>
    </Drawer>);
};

type SePlayerDrawerProps = {
    visible: boolean;
    onClose: () => void;
}

const SePlayerDrawer: React.FC<SePlayerDrawerProps> = ({ visible, onClose }: SePlayerDrawerProps) => {
    const roomId = useSelector(state => state.roomModule.roomId);
    const [filesManagerDrawerType, setFilesManagerDrawerType] = React.useState<FilesManagerDrawerType | null>(null);

    const [writeRoomSoundEffect] = useWriteRoomSoundEffectMutation();
    const [fileInput, setFileInput] = React.useState<FilePathInput>();
    const [volumeInput, setVolumeInput] = React.useState<number>(defaultVolume);

    React.useEffect(() => {
        setFileInput(undefined);
        setVolumeInput(defaultVolume);
    }, [visible]);

    if (roomId == null) {
        return null;
    }

    return (<Drawer
        className='cancel-rnd'
        title='SE'
        width={400}
        closable
        visible={visible}
        onClose={() => onClose()}
        footer={<DrawerFooter
            close={{ textType: 'cancel', onClick: () => onClose() }}
            ok={{
                textType: 'ok',
                disabled: fileInput == null,
                onClick: () => {
                    if (fileInput == null) {
                        return;
                    }
                    // Promiseの結果を待たずに処理を続行している
                    writeRoomSoundEffect({ variables: { roomId, file: fileInput, volume: volumeInput } });
                    onClose();
                }
            }} />}>
        {<FilesManagerDrawer drawerType={filesManagerDrawerType} onClose={() => setFilesManagerDrawerType(null)} />}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <VolumeBarForSoundPlayer volumeBarValue={volumeInput} onVolumeBarValueChange={i => setVolumeInput(i)} />
            <Divider />
            <Typography.Title level={4}>ファイル</Typography.Title>
            {fileInput && <FilePathView
                closable
                onClose={() => {
                    setFileInput(undefined);
                }}
                filePath={fileInput} />}
            {!fileInput && <Button
                icon={<Icon.PlusOutlined />}
                type='dashed'
                size='small'
                onClick={() => setFilesManagerDrawerType({
                    openFileType: some, onOpen: file => {
                        setFileInput(file);
                    }
                })}>ファイルを選択</Button>}
        </div>
    </Drawer>);
};

type BgmPlayerProps = {
    channelKey: StrIndex5;
    bgmState: RoomBgm.State | undefined;
}

const BgmPlayer: React.FC<BgmPlayerProps> = ({ channelKey, bgmState }: BgmPlayerProps) => {
    const defaultVolume = 0.5;

    const operate = useOperate();
    const [isDrawerVisible, setIsDrawerVisible] = React.useState(false);
    const [volumeInput, setVolumeInput] = React.useState<number>();

    React.useEffect(() => {
        setVolumeInput(undefined);
    }, [bgmState?.volume]);

    const tags = (bgmState?.files ?? []).map(file => {
        return <FilePathView
            key={toKey(file)}
            filePath={file} />;
    });

    return <div style={{ display: 'flex', flexDirection: 'column' }}>
        <BgmPlayerDrawer channelKey={channelKey} visible={isDrawerVisible} onClose={() => setIsDrawerVisible(false)} bgmState={bgmState} />
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div style={MyStyle.Text.larger}>
                {(bgmState?.files ?? []).length !== 0 && <Tooltip title='再生中'><Icon.SoundOutlined /></Tooltip>}
                <span>{`BGMチャンネル${channelKey}`}</span>
            </div>
            {(bgmState?.files ?? []).length !== 0 &&
                <VolumeBarForSoundPlayer hasMarginLeft volumeBarValue={volumeInput ?? bgmState?.volume ?? defaultVolume} onVolumeBarValueChange={i => setVolumeInput(i)} />}
            {(volumeInput != null && (bgmState?.files ?? []).length !== 0) &&
                <>
                    <Button
                        size='small'
                        onClick={() => {
                            if (volumeInput == null || bgmState == null) {
                                return;
                            }
                            const operation = Room.createPostOperationSetup();
                            operation.bgms.set(channelKey, {
                                type: update,
                                operation: {
                                    volume: { newValue: volumeInput },
                                }
                            });
                            operate(operation);
                        }}>
                        適用
                    </Button>
                    <Button
                        size='small'
                        onClick={() => {
                            setVolumeInput(undefined);
                        }}>
                        キャンセル
                    </Button>
                </>}
        </div>
        {tags.length === 0 ? '(再生中のBGMはありません)' : tags}
        <div style={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
            <Button
                size='small'
                onClick={() => {
                    setIsDrawerVisible(true);
                }}>
                編集
            </Button>
            <Button
                size='small'
                disabled={(bgmState?.files ?? []).length === 0}
                onClick={() => {
                    const operation = Room.createPostOperationSetup();
                    operation.bgms.set(channelKey, {
                        type: replace,
                        newValue: undefined,
                    });
                    operate(operation);
                }}>
                停止
            </Button>
        </div>
    </div>;
};

const SoundPlayer: React.FC = () => {
    const bgmsState = useSelector(state => state.roomModule.roomState?.state?.bgms);
    const [isSeDrawerVisible, setIsSeDrawerVisible] = React.useState(false);

    const padding = 16;

    return <div>
        <SePlayerDrawer visible={isSeDrawerVisible} onClose={() => setIsSeDrawerVisible(false)} />

        <div style={MyStyle.Text.larger}>SE</div>
        <Button
            size='small'
            style={{ marginTop: 2 }}
            onClick={() => {
                setIsSeDrawerVisible(true);
            }}>流す</Button>
        <div style={{ height: padding }} />
        <BgmPlayer bgmState={bgmsState?.get('1')} channelKey='1' />
        <div style={{ height: padding }} />
        <BgmPlayer bgmState={bgmsState?.get('2')} channelKey='2' />
        <div style={{ height: padding }} />
        <BgmPlayer bgmState={bgmsState?.get('3')} channelKey='3' />
        <div style={{ height: padding }} />
        <BgmPlayer bgmState={bgmsState?.get('4')} channelKey='4' />
        <div style={{ height: padding }} />
        <BgmPlayer bgmState={bgmsState?.get('5')} channelKey='5' />
    </div>;
};

export default SoundPlayer;