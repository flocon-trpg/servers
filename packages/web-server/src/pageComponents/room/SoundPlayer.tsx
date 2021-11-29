import React from 'react';
import { Button, Checkbox, Divider, Drawer, Tooltip, Typography } from 'antd';
import {
    FilePathInput,
    FileSourceType,
    WriteRoomSoundEffectDocument,
} from '@flocon-trpg/typed-document-node';
import * as Icon from '@ant-design/icons';
import { FilesManagerDrawer } from '../../components/FilesManagerDrawer';
import { FilesManagerDrawerType, some } from '../../utils/types';
import { VolumeBar } from '../../components/VolumeBar';
import { DrawerFooter } from '../../layouts/DrawerFooter';
import { MyStyle } from '../../utils/myStyle';
import { BgmState, FilePath, StrIndex5 } from '@flocon-trpg/core';
import _ from 'lodash';
import { cancelRnd, flex, flexColumn, flexRow, itemsCenter } from '../../utils/className';
import classNames from 'classnames';
import { sound } from '../../utils/fileType';
import { FilePath as FilePathModule } from '../../utils/filePath';
import { useMutation } from '@apollo/client';
import { atom } from 'jotai';
import { roomAtom } from '../../atoms/room/roomAtom';
import { useAtomValue } from 'jotai/utils';
import { useSetRoomStateWithImmer } from '../../hooks/useSetRoomStateWithImmer';
import { EditorGroupHeader } from '../../components/EditorGroupHeader';

const defaultVolume = 0.5;

const toKey = (source: FilePathInput | FilePath): string => {
    return `${source.sourceType}:${source.path}`;
};

type VolumeBarForSoundPlayerProps = {
    volumeBarValue: number;
    onVolumeBarValueChange: (newValue: number) => void;
    hasMarginLeft?: boolean;
};

const VolumeBarForSoundPlayer: React.FC<VolumeBarForSoundPlayerProps> = ({
    volumeBarValue,
    onVolumeBarValueChange,
    hasMarginLeft,
}: VolumeBarForSoundPlayerProps) => {
    return (
        <Tooltip title='ボリューム補正の値は、自分だけでなく部屋にいる全員に反映されます'>
            <div className={classNames(flex, flexRow, itemsCenter)}>
                <Icon.SoundOutlined style={{ marginLeft: hasMarginLeft ? 16 : undefined }} />
                <span>ボリューム補正</span>
                <VolumeBar
                    inputNumberType='0-1'
                    readonly={false}
                    value={volumeBarValue}
                    onChange={i => {
                        onVolumeBarValueChange(i);
                    }}
                />
            </div>
        </Tooltip>
    );
};

type FilePathViewProps = {
    filePath: FilePathInput | FilePath;
    closable?: boolean;
    onClose?: () => void;
};

const FilePathView: React.FC<FilePathViewProps> = ({
    filePath,
    closable,
    onClose,
}: FilePathViewProps) => {
    let fileName: string;
    if (filePath.sourceType === FileSourceType.FirebaseStorage) {
        fileName = _(filePath.path.split('/')).last() ?? '';
    } else {
        fileName = filePath.path;
    }

    return (
        <div className={classNames(flex, flexRow, itemsCenter)}>
            <div
                style={{
                    flex: 1,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                }}
            >
                {fileName}
            </div>
            {closable && (
                <Button
                    type='text'
                    size='small'
                    style={{ flex: 0 }}
                    onClick={() => (onClose == null ? undefined : onClose())}
                >
                    <Icon.CloseOutlined />
                </Button>
            )}
        </div>
    );
};

type BgmPlayerDrawerProps = {
    channelKey: StrIndex5;
    visible: boolean;
    onClose: () => void;
};

const BgmPlayerDrawer: React.FC<BgmPlayerDrawerProps> = ({
    channelKey,
    visible,
    onClose,
}: BgmPlayerDrawerProps) => {
    const setRoomState = useSetRoomStateWithImmer();

    const [filesManagerDrawerType, setFilesManagerDrawerType] =
        React.useState<FilesManagerDrawerType | null>(null);

    const [filesInput, setFilesInput] = React.useState<FilePathInput[]>([]);
    const [volumeInput, setVolumeInput] = React.useState<number>(defaultVolume);
    const [isNotPausedInput, setIsNotPausedInput] = React.useState(false);

    React.useEffect(() => {
        setFilesInput([]);
        setVolumeInput(defaultVolume);
        setIsNotPausedInput(false);
    }, [visible]);

    const tags = filesInput.map(file => {
        return (
            <FilePathView
                key={toKey(file)}
                closable
                onClose={() => {
                    setFilesInput(oldValue => {
                        return oldValue.filter(x => !FilePathModule.equals(file, x));
                    });
                }}
                filePath={file}
            />
        );
    });

    return (
        <Drawer
            className={cancelRnd}
            title={`チャンネル${channelKey}`}
            width={400}
            closable
            onClose={() => onClose()}
            visible={visible}
            footer={
                <DrawerFooter
                    close={{ textType: 'cancel', onClick: () => onClose() }}
                    ok={{
                        textType: 'ok',
                        onClick: () => {
                            setRoomState(roomState => {
                                const bgm = roomState.bgms[channelKey];
                                if (bgm == null) {
                                    roomState.bgms[channelKey] = {
                                        $v: 1,
                                        $r: 1,
                                        files: filesInput.map(x => ({
                                            ...x,
                                            $v: 1,
                                            $r: 1,
                                        })),
                                        volume: volumeInput,
                                        isPaused: !isNotPausedInput,
                                    };
                                    return;
                                }
                                bgm.files = filesInput.map(x => ({
                                    ...x,
                                    $v: 1,
                                    $r: 1,
                                }));
                                bgm.volume = volumeInput;
                                bgm.isPaused = !isNotPausedInput;
                            });
                            onClose();
                        },
                    }}
                />
            }
        >
            {
                <FilesManagerDrawer
                    drawerType={filesManagerDrawerType}
                    onClose={() => setFilesManagerDrawerType(null)}
                />
            }
            <div className={classNames(flex, flexColumn)}>
                <VolumeBarForSoundPlayer
                    volumeBarValue={volumeInput}
                    onVolumeBarValueChange={i => setVolumeInput(i)}
                />
                <Checkbox
                    checked={isNotPausedInput}
                    onChange={e => setIsNotPausedInput(e.target.checked)}
                >
                    すぐ再生を開始する
                </Checkbox>
                <Divider />
                <EditorGroupHeader>BGMプレイリスト</EditorGroupHeader>
                {tags.length === 0 ? 'BGMに指定するファイルが1つも選択されていません。' : tags}
                <Button
                    icon={<Icon.PlusOutlined />}
                    type='dashed'
                    size='small'
                    onClick={() =>
                        setFilesManagerDrawerType({
                            openFileType: some,
                            defaultFilteredValue: [sound],
                            onOpen: file => {
                                setFilesInput(oldValue => [...oldValue, file]);
                            },
                        })
                    }
                >
                    ファイルを追加
                </Button>
            </div>
        </Drawer>
    );
};

type SePlayerDrawerProps = {
    visible: boolean;
    onClose: () => void;
};

const roomIdAtom = atom(get => get(roomAtom).roomId);

const SePlayerDrawer: React.FC<SePlayerDrawerProps> = ({
    visible,
    onClose,
}: SePlayerDrawerProps) => {
    const roomId = useAtomValue(roomIdAtom);
    const [filesManagerDrawerType, setFilesManagerDrawerType] =
        React.useState<FilesManagerDrawerType | null>(null);

    const [writeRoomSoundEffect] = useMutation(WriteRoomSoundEffectDocument);
    const [fileInput, setFileInput] = React.useState<FilePathInput>();
    const [volumeInput, setVolumeInput] = React.useState<number>(defaultVolume);

    React.useEffect(() => {
        setFileInput(undefined);
        setVolumeInput(defaultVolume);
    }, [visible]);

    if (roomId == null) {
        return null;
    }

    return (
        <Drawer
            className={cancelRnd}
            title='SE'
            width={400}
            closable
            visible={visible}
            onClose={() => onClose()}
            footer={
                <DrawerFooter
                    close={{ textType: 'cancel', onClick: () => onClose() }}
                    ok={{
                        textType: 'ok',
                        disabled: fileInput == null,
                        onClick: () => {
                            if (fileInput == null) {
                                return;
                            }
                            // Promiseの結果を待たずに処理を続行している
                            writeRoomSoundEffect({
                                variables: { roomId, file: fileInput, volume: volumeInput },
                            });
                            onClose();
                        },
                    }}
                />
            }
        >
            {
                <FilesManagerDrawer
                    drawerType={filesManagerDrawerType}
                    onClose={() => setFilesManagerDrawerType(null)}
                />
            }
            <div className={classNames(flex, flexColumn)}>
                <VolumeBarForSoundPlayer
                    volumeBarValue={volumeInput}
                    onVolumeBarValueChange={i => setVolumeInput(i)}
                />
                <Divider />
                <EditorGroupHeader>ファイル</EditorGroupHeader>
                {fileInput && (
                    <FilePathView
                        closable
                        onClose={() => {
                            setFileInput(undefined);
                        }}
                        filePath={fileInput}
                    />
                )}
                {!fileInput && (
                    <Button
                        icon={<Icon.PlusOutlined />}
                        type='dashed'
                        size='small'
                        onClick={() =>
                            setFilesManagerDrawerType({
                                openFileType: some,
                                defaultFilteredValue: [sound],
                                onOpen: file => {
                                    setFileInput(file);
                                },
                            })
                        }
                    >
                        ファイルを選択
                    </Button>
                )}
            </div>
        </Drawer>
    );
};

type BgmPlayerProps = {
    channelKey: StrIndex5;
    bgmState: BgmState | undefined;
};

const BgmPlayer: React.FC<BgmPlayerProps> = ({ channelKey, bgmState }: BgmPlayerProps) => {
    const defaultVolume = 0.5;

    const setRoomState = useSetRoomStateWithImmer();
    const [isDrawerVisible, setIsDrawerVisible] = React.useState(false);
    const [volumeInput, setVolumeInput] = React.useState<number>();

    React.useEffect(() => {
        setVolumeInput(undefined);
    }, [bgmState?.volume]);

    const tags = (bgmState?.files ?? []).map(file => {
        return <FilePathView key={toKey(file)} filePath={file} />;
    });

    return (
        <div className={classNames(flex, flexColumn)}>
            <BgmPlayerDrawer
                channelKey={channelKey}
                visible={isDrawerVisible}
                onClose={() => setIsDrawerVisible(false)}
            />
            <div className={classNames(flex, flexRow, itemsCenter)}>
                <div style={MyStyle.Text.larger}>
                    {bgmState != null && (bgmState.files ?? []).length !== 0 ? (
                        /* 本当はPauseアイコンではなく停止アイコンを使いたいが、antdでは見つからなかったので暫定的にPauseアイコンを用いている */
                        bgmState.isPaused ? (
                            <Icon.PauseOutlined />
                        ) : (
                            <Icon.CaretRightOutlined />
                        )
                    ) : null}
                    <span>{`BGMチャンネル${channelKey}`}</span>
                </div>
                {(bgmState?.files ?? []).length !== 0 && (
                    <VolumeBarForSoundPlayer
                        hasMarginLeft
                        volumeBarValue={volumeInput ?? bgmState?.volume ?? defaultVolume}
                        onVolumeBarValueChange={i => setVolumeInput(i)}
                    />
                )}
                {volumeInput != null && (bgmState?.files ?? []).length !== 0 && (
                    <>
                        <Button
                            size='small'
                            onClick={() => {
                                if (volumeInput == null) {
                                    return;
                                }
                                setRoomState(roomState => {
                                    const bgm = roomState.bgms[channelKey];
                                    if (bgm == null) {
                                        return;
                                    }
                                    bgm.volume = volumeInput;
                                });
                            }}
                        >
                            適用
                        </Button>
                        <Button
                            size='small'
                            onClick={() => {
                                setVolumeInput(undefined);
                            }}
                        >
                            キャンセル
                        </Button>
                    </>
                )}
            </div>
            {tags.length === 0 ? '(再生中のBGMはありません)' : tags}
            <div style={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                <Button
                    size='small'
                    onClick={() => {
                        setIsDrawerVisible(true);
                    }}
                >
                    編集
                </Button>
                <Button
                    size='small'
                    disabled={(bgmState?.files ?? []).length === 0}
                    onClick={() => {
                        setRoomState(roomState => {
                            const bgm = roomState.bgms[channelKey];
                            if (bgm == null) {
                                return;
                            }
                            bgm.isPaused = !bgm.isPaused;
                        });
                    }}
                >
                    {bgmState?.isPaused === true ? '再生' : '停止'}
                </Button>
                <Button
                    size='small'
                    disabled={(bgmState?.files ?? []).length === 0}
                    onClick={() => {
                        setRoomState(roomState => {
                            delete roomState.bgms[channelKey];
                        });
                    }}
                >
                    クリア
                </Button>
            </div>
        </div>
    );
};

const bgmsAtom = atom(get => get(roomAtom).roomState?.state?.bgms);

export const SoundPlayer: React.FC = () => {
    const bgmsState = useAtomValue(bgmsAtom);
    const [isSeDrawerVisible, setIsSeDrawerVisible] = React.useState(false);

    const padding = 16;

    return (
        <div>
            <SePlayerDrawer
                visible={isSeDrawerVisible}
                onClose={() => setIsSeDrawerVisible(false)}
            />

            <div style={MyStyle.Text.larger}>SE</div>
            <Button
                size='small'
                style={{ marginTop: 2 }}
                onClick={() => {
                    setIsSeDrawerVisible(true);
                }}
            >
                流す
            </Button>
            <div style={{ height: padding }} />
            <BgmPlayer bgmState={(bgmsState ?? {})['1']} channelKey='1' />
            <div style={{ height: padding }} />
            <BgmPlayer bgmState={(bgmsState ?? {})['2']} channelKey='2' />
            <div style={{ height: padding }} />
            <BgmPlayer bgmState={(bgmsState ?? {})['3']} channelKey='3' />
            <div style={{ height: padding }} />
            <BgmPlayer bgmState={(bgmsState ?? {})['4']} channelKey='4' />
            <div style={{ height: padding }} />
            <BgmPlayer bgmState={(bgmsState ?? {})['5']} channelKey='5' />
        </div>
    );
};
