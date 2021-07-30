import React from 'react';
import { Button, Checkbox, Divider, Drawer, Tag, Tooltip, Typography } from 'antd';
import {
    FilePathInput,
    FileSourceType,
    useWriteRoomSoundEffectMutation,
} from '../../generated/graphql';
import * as Icon from '@ant-design/icons';
import FilesManagerDrawer from '../../components/FilesManagerDrawer';
import { FilesManagerDrawerType, some } from '../../utils/types';
import { replace, update } from '../../stateManagers/states/types';
import { filePathEquals } from '../../stateManagers/states/comparer';
import VolumeBar from '../../components/VolumeBar';
import DrawerFooter from '../../layouts/DrawerFooter';
import { MyStyle } from '../../utils/myStyle';
import { useSelector } from '../../store';
import { useOperate } from '../../hooks/useOperate';
import { StrIndex5 } from '@kizahasi/util';
import { BgmState, FilePath, UpOperation } from '@kizahasi/flocon-core';
import _ from 'lodash';
import { FirebaseStorageFile } from '../../modules/fileModule';
import { cancelRnd, flex, flexColumn, flexRow, itemsCenter } from '../../utils/className';
import classNames from 'classnames';

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
        <Tooltip title="ボリューム補正の値は、自分だけでなく部屋にいる全員に反映されます">
            <div className={classNames(flex, flexRow, itemsCenter)}>
                <Icon.SoundOutlined style={{ marginLeft: hasMarginLeft ? 16 : undefined }} />
                <span>ボリューム補正</span>
                <VolumeBar
                    inputNumberType="0-1"
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
                    type="text"
                    size="small"
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
    bgmState: BgmState | undefined;
    visible: boolean;
    onClose: () => void;
};

const BgmPlayerDrawer: React.FC<BgmPlayerDrawerProps> = ({
    channelKey,
    bgmState,
    visible,
    onClose,
}: BgmPlayerDrawerProps) => {
    const operate = useOperate();

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
                        return oldValue.filter(x => !filePathEquals(file, x));
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
                            if (bgmState == null) {
                                const operation: UpOperation = {
                                    $version: 1,
                                    bgms: {
                                        [channelKey]: {
                                            type: replace,
                                            replace: {
                                                newValue: {
                                                    $version: 1,
                                                    files: filesInput.map(x => ({
                                                        ...x,
                                                        $version: 1,
                                                    })),
                                                    volume: volumeInput,
                                                    isPaused: !isNotPausedInput,
                                                },
                                            },
                                        },
                                    },
                                };
                                operate(operation);
                                onClose();
                                return;
                            }
                            const operation: UpOperation = {
                                $version: 1,
                                bgms: {
                                    [channelKey]: {
                                        type: update,
                                        update: {
                                            $version: 1,
                                            files: {
                                                newValue: filesInput.map(x => ({
                                                    ...x,
                                                    $version: 1,
                                                })),
                                            },
                                            volume: {
                                                newValue: volumeInput,
                                            },
                                            isPaused: {
                                                newValue: !isNotPausedInput,
                                            },
                                        },
                                    },
                                },
                            };
                            operate(operation);
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
                <Typography.Title level={4}>BGMプレイリスト</Typography.Title>
                {tags.length === 0 ? 'BGMに指定するファイルが1つも選択されていません。' : tags}
                <Button
                    icon={<Icon.PlusOutlined />}
                    type="dashed"
                    size="small"
                    onClick={() =>
                        setFilesManagerDrawerType({
                            openFileType: some,
                            defaultFilteredValue: [FirebaseStorageFile.sound],
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

const SePlayerDrawer: React.FC<SePlayerDrawerProps> = ({
    visible,
    onClose,
}: SePlayerDrawerProps) => {
    const roomId = useSelector(state => state.roomModule.roomId);
    const [filesManagerDrawerType, setFilesManagerDrawerType] =
        React.useState<FilesManagerDrawerType | null>(null);

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

    return (
        <Drawer
            className={cancelRnd}
            title="SE"
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
                <Typography.Title level={4}>ファイル</Typography.Title>
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
                        type="dashed"
                        size="small"
                        onClick={() =>
                            setFilesManagerDrawerType({
                                openFileType: some,
                                defaultFilteredValue: [FirebaseStorageFile.sound],
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

    const operate = useOperate();
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
                bgmState={bgmState}
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
                            size="small"
                            onClick={() => {
                                if (volumeInput == null || bgmState == null) {
                                    return;
                                }
                                const operation: UpOperation = {
                                    $version: 1,
                                    bgms: {
                                        [channelKey]: {
                                            type: update,
                                            update: {
                                                $version: 1,
                                                volume: { newValue: volumeInput },
                                            },
                                        },
                                    },
                                };
                                operate(operation);
                            }}
                        >
                            適用
                        </Button>
                        <Button
                            size="small"
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
                    size="small"
                    onClick={() => {
                        setIsDrawerVisible(true);
                    }}
                >
                    編集
                </Button>
                <Button
                    size="small"
                    disabled={(bgmState?.files ?? []).length === 0}
                    onClick={() => {
                        if (bgmState == null) {
                            return;
                        }
                        const operation: UpOperation = {
                            $version: 1,
                            bgms: {
                                [channelKey]: {
                                    type: update,
                                    update: {
                                        $version: 1,
                                        isPaused: {
                                            newValue: !bgmState.isPaused,
                                        },
                                    },
                                },
                            },
                        };
                        operate(operation);
                    }}
                >
                    {bgmState?.isPaused === true ? '再生' : '停止'}
                </Button>
                <Button
                    size="small"
                    disabled={(bgmState?.files ?? []).length === 0}
                    onClick={() => {
                        const operation: UpOperation = {
                            $version: 1,
                            bgms: {
                                [channelKey]: {
                                    type: replace,
                                    replace: { newValue: undefined },
                                },
                            },
                        };
                        operate(operation);
                    }}
                >
                    クリア
                </Button>
            </div>
        </div>
    );
};

const SoundPlayer: React.FC = () => {
    const bgmsState = useSelector(state => state.roomModule.roomState?.state?.bgms);
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
                size="small"
                style={{ marginTop: 2 }}
                onClick={() => {
                    setIsSeDrawerVisible(true);
                }}
            >
                流す
            </Button>
            <div style={{ height: padding }} />
            <BgmPlayer bgmState={(bgmsState ?? {})['1']} channelKey="1" />
            <div style={{ height: padding }} />
            <BgmPlayer bgmState={(bgmsState ?? {})['2']} channelKey="2" />
            <div style={{ height: padding }} />
            <BgmPlayer bgmState={(bgmsState ?? {})['3']} channelKey="3" />
            <div style={{ height: padding }} />
            <BgmPlayer bgmState={(bgmsState ?? {})['4']} channelKey="4" />
            <div style={{ height: padding }} />
            <BgmPlayer bgmState={(bgmsState ?? {})['5']} channelKey="5" />
        </div>
    );
};

export default SoundPlayer;
