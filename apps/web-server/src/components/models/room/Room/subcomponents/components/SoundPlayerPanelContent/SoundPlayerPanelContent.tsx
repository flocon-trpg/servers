import * as Icon from '@ant-design/icons';
import { State, StrIndex5, bgmTemplate } from '@flocon-trpg/core';
import { WriteRoomSoundEffectDocument } from '@flocon-trpg/typed-document-node-v0.7.13';
import { keyNames } from '@flocon-trpg/utils';
import { Button, Checkbox, Modal, Tooltip } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { useLatest } from 'react-use';
import { useMutation } from 'urql';
import { useRoomId } from '../../hooks/useRoomId';
import { useSetRoomStateWithImmer } from '../../hooks/useSetRoomStateWithImmer';
import { FileSelector } from '@/components/models/file/FileSelector/FileSelector';
import { FileSelectorModal } from '@/components/models/file/FileSelectorModal/FileSelectorModal';
import { FileView } from '@/components/models/file/FileView/FileView';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { Fieldset } from '@/components/ui/Fieldset/Fieldset';
import { VolumeBar } from '@/components/ui/VolumeBar/VolumeBar';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';
import { Styles } from '@/styles';
import { flex, flexColumn, flexRow, itemsCenter } from '@/styles/className';
import { FilePathModule } from '@/utils/file/filePath';
import { sound } from '@/utils/fileType';
import { setStateWithImmer } from '@/utils/setStateWithImmer';
import { stretchedModalWidth } from '@/utils/variables';

type BgmState = State<typeof bgmTemplate>;

const maxWidthOfLink = 300;
const defaultVolume = 0.5;
const initBgmState: BgmState = { $v: 1, $r: 1, isPaused: true, files: [], volume: defaultVolume };

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
        <Tooltip title='ボリューム補正の値は、自分だけでなく部屋にいる全員に反映されます。'>
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

type BgmSimpleModalProps = {
    channelKey: StrIndex5;
    visible: boolean;
    onClose: () => void;
};

/** 1曲のみからなるBGMを設定するModal */
const BgmSimpleModal: React.FC<BgmSimpleModalProps> = ({ channelKey, visible, onClose }) => {
    const setRoomState = useSetRoomStateWithImmer();
    const currentBgmState = useRoomStateValueSelector(state => state.bgms?.[channelKey]);
    const currentBgmStateRef = useLatest(currentBgmState);
    const [newBgmState, setNewBgmStateCore] = React.useState<BgmState>(
        currentBgmState ?? initBgmState
    );
    const setNewBgmState = setStateWithImmer(setNewBgmStateCore);

    React.useEffect(() => {
        setNewBgmStateCore(currentBgmStateRef.current ?? initBgmState);
    }, [currentBgmStateRef, visible, setNewBgmStateCore]);

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            width={stretchedModalWidth}
            footer={<DialogFooter close={{ onClick: onClose, textType: 'cancel' }} />}
        >
            <div className={classNames(flex, flexColumn)}>
                <Fieldset legend='BGMファイルの選択'>
                    <FileSelector
                        uploaderFileBrowserHeight={null}
                        onSelect={newValue => {
                            setRoomState(room => {
                                if (room.bgms == null) {
                                    room.bgms = {};
                                }
                                room.bgms[channelKey] = { ...newBgmState, files: [newValue] };
                            });
                            onClose();
                        }}
                        defaultFileTypeFilter={sound}
                    />
                </Fieldset>
                <Fieldset legend='オプション'>
                    <VolumeBarForSoundPlayer
                        volumeBarValue={newBgmState.volume}
                        onVolumeBarValueChange={newValue =>
                            setNewBgmState(state => {
                                state.volume = newValue;
                            })
                        }
                    />
                    <Checkbox
                        checked={!newBgmState.isPaused}
                        onChange={e =>
                            setNewBgmState(state => {
                                state.isPaused = !e.target.checked;
                            })
                        }
                    >
                        すぐに再生を開始する
                    </Checkbox>
                </Fieldset>
            </div>
        </Modal>
    );
};

type BgmPlaylistModalProps = {
    channelKey: StrIndex5;
    visible: boolean;
    onClose: () => void;
};

/** 複数の曲から構成されるBGMを設定するModal */
// CONSIDER: 複数の曲から構成されるBGMの機能に需要があるかどうかが疑問視。
const BgmPlaylistModal: React.FC<BgmPlaylistModalProps> = ({ channelKey, visible, onClose }) => {
    const setRoomState = useSetRoomStateWithImmer();
    const currentBgmState = useRoomStateValueSelector(state => state.bgms?.[channelKey]);
    const currentBgmStateRef = useLatest(currentBgmState);
    const [newBgmState, setNewBgmStateCore] = React.useState<BgmState>(
        currentBgmState ?? initBgmState
    );
    const setNewBgmState = setStateWithImmer(setNewBgmStateCore);

    const [modalToAddVisible, setModalToAddVisible] = React.useState(false);

    React.useEffect(() => {
        setNewBgmStateCore(currentBgmStateRef.current ?? initBgmState);
    }, [currentBgmStateRef, visible]);

    const files = newBgmState.files.map((file, i) => {
        return (
            <div
                // 同一ファイルが複数存在することも可能なため、file のみから key を作ることはできない
                key={keyNames('BgmPlaylistModal-BGM', i)}
                className={classNames(flex, flexRow)}
            >
                <FileView
                    maxWidthOfLink={null}
                    uploaderFileBrowserHeight={null}
                    onPathChange={file =>
                        setNewBgmState(state => {
                            if (file == null) {
                                state.files.splice(i, 1);
                                return;
                            }
                            state.files[i] = { ...file, $v: 1, $r: 1 };
                        })
                    }
                    defaultFileTypeFilter={sound}
                    filePath={file}
                />
            </div>
        );
    });

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            width={stretchedModalWidth}
            footer={
                <DialogFooter
                    close={{ textType: 'cancel', onClick: onClose }}
                    ok={{
                        textType: 'ok',
                        disabled: newBgmState.files.length === 0,
                        onClick: () => {
                            if (newBgmState.files.length === 0) {
                                return;
                            }
                            setRoomState(roomState => {
                                if (roomState.bgms == null) {
                                    roomState.bgms = {};
                                }
                                roomState.bgms[channelKey] = newBgmState;
                            });
                            onClose();
                        },
                    }}
                />
            }
        >
            <div className={classNames(flex, flexColumn)}>
                <Fieldset legend='プレイリスト'>
                    {files.length === 0 ? <div>BGMが1つも指定されていません。</div> : files}
                    <Button style={{ marginTop: 12 }} onClick={() => setModalToAddVisible(true)}>
                        BGMを追加
                    </Button>
                </Fieldset>
                <Fieldset legend='オプション'>
                    <VolumeBarForSoundPlayer
                        volumeBarValue={newBgmState.volume}
                        onVolumeBarValueChange={newValue =>
                            setNewBgmState(state => {
                                state.volume = newValue;
                            })
                        }
                    />
                    <Checkbox
                        checked={!newBgmState.isPaused}
                        onChange={e =>
                            setNewBgmState(state => {
                                state.isPaused = !e.target.checked;
                            })
                        }
                    >
                        すぐに再生を開始する
                    </Checkbox>
                </Fieldset>
                <FileSelectorModal
                    visible={modalToAddVisible}
                    uploaderFileBrowserHeight={null}
                    onClose={() => setModalToAddVisible(false)}
                    defaultFileTypeFilter={sound}
                    onSelect={newValue => {
                        setNewBgmState(state => {
                            state.files.push({ ...newValue, $v: 1, $r: 1 });
                        });
                        setModalToAddVisible(false);
                    }}
                />
            </div>
        </Modal>
    );
};

type SeModalProps = {
    visible: boolean;
    onClose: () => void;
};

const SeModal: React.FC<SeModalProps> = ({ visible, onClose }) => {
    const roomId = useRoomId();

    const [, writeRoomSoundEffect] = useMutation(WriteRoomSoundEffectDocument);
    const [volumeInput, setVolumeInput] = React.useState<number>(defaultVolume);

    if (roomId == null) {
        return null;
    }

    return (
        <Modal open={visible} onCancel={onClose} width={stretchedModalWidth}>
            <div className={classNames(flex, flexColumn)}>
                <VolumeBarForSoundPlayer
                    volumeBarValue={volumeInput}
                    onVolumeBarValueChange={newValue => setVolumeInput(newValue)}
                />
                <FileSelector
                    uploaderFileBrowserHeight={null}
                    onSelect={newValue => {
                        // Promiseの結果を待たずに処理を続行している
                        writeRoomSoundEffect({
                            roomId,
                            file: FilePathModule.toGraphQL(newValue),
                            volume: volumeInput,
                        });
                        onClose();
                    }}
                    defaultFileTypeFilter={sound}
                />
            </div>
        </Modal>
    );
};

type BgmPlayerProps = {
    channelKey: StrIndex5;
    bgmState: BgmState | undefined;
};

const BgmPlayer: React.FC<BgmPlayerProps> = ({ channelKey, bgmState }: BgmPlayerProps) => {
    const defaultVolume = 0.5;

    const setRoomState = useSetRoomStateWithImmer();
    const [isSimpleModalVisible, setIsSimpleModalVisible] = React.useState(false);
    const [isPlaylistModalVisible, setIsPlaylistModalVisible] = React.useState(false);
    const [volumeInput, setVolumeInput] = React.useState<number>();

    React.useEffect(() => {
        setVolumeInput(undefined);
    }, [bgmState?.volume]);

    const tags = (bgmState?.files ?? []).map((file, i) => {
        return (
            <FileView
                // 同一ファイルが複数存在することも可能なため、file のみから key を作ることはできない
                key={keyNames('BgmPlayer-BGM', i)}
                uploaderFileBrowserHeight={null}
                filePath={file}
                onPathChange={null}
                maxWidthOfLink={maxWidthOfLink}
            />
        );
    });

    return (
        <div className={classNames(flex, flexColumn)}>
            <BgmSimpleModal
                channelKey={channelKey}
                visible={isSimpleModalVisible}
                onClose={() => setIsSimpleModalVisible(false)}
            />
            <BgmPlaylistModal
                channelKey={channelKey}
                visible={isPlaylistModalVisible}
                onClose={() => setIsPlaylistModalVisible(false)}
            />
            <div className={classNames(flex, flexRow, itemsCenter)}>
                <div style={Styles.Text.larger}>
                    {bgmState != null && (bgmState.files ?? []).length !== 0 ? (
                        /* TODO: 本当はPauseアイコンではなく停止アイコンを使いたいが、antdでは見つからなかったので暫定的にPauseアイコンを用いている */
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
                                    const bgm = roomState.bgms?.[channelKey];
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
                <Tooltip overlay='1つの音声ファイルをBGMとして設定します。'>
                    <Button
                        size='small'
                        onClick={() => {
                            setIsSimpleModalVisible(true);
                        }}
                    >
                        変更(通常)
                    </Button>
                </Tooltip>
                <Tooltip overlay='複数の音声ファイルをBGMとして設定します。再生は順に行われます。'>
                    <Button
                        size='small'
                        onClick={() => {
                            setIsPlaylistModalVisible(true);
                        }}
                    >
                        変更(プレイリスト)
                    </Button>
                </Tooltip>
                <Button
                    size='small'
                    disabled={(bgmState?.files ?? []).length === 0}
                    onClick={() => {
                        setRoomState(roomState => {
                            const bgm = roomState.bgms?.[channelKey];
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
                            delete roomState.bgms?.[channelKey];
                        });
                    }}
                >
                    クリア
                </Button>
            </div>
        </div>
    );
};

export const SoundPlayerPanelContent: React.FC = () => {
    const bgmsState = useRoomStateValueSelector(state => state.bgms);
    const [isSeModalVisible, setIsSeModalVisible] = React.useState(false);

    const padding = 16;

    return (
        <div>
            <SeModal visible={isSeModalVisible} onClose={() => setIsSeModalVisible(false)} />

            <div style={Styles.Text.larger}>SE</div>
            <Button
                size='small'
                style={{ marginTop: 2 }}
                onClick={() => {
                    setIsSeModalVisible(true);
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
