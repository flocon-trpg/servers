import React from 'react';
import { Layout as AntdLayout, Result, Modal } from 'antd';
import { DraggableCard, horizontalPadding } from '../../components/DraggableCard';
import { CharacterList } from './CharacterList';
import { RoomMessages } from './RoomMessages';
import { CharacterParameterNamesEditorModal } from './CharacterParameterNamesEditorModal';
import { CharacterEditorModal } from './CharacterEditorModal';
import { BoardDrawer } from './BoardDrawer';
import { SoundPlayer } from './SoundPlayer';
import { EditRoomDrawer } from './EditRoomDrawer';
import { ParticipantList } from './ParticipantList';
import { LoadingResult } from '../../components/Result/LoadingResult';
import { usePlayBgm } from '../../hooks/usePlayBgm';
import { usePlaySoundEffect } from '../../hooks/usePlaySoundEffect';
import { useMessageNotification } from '../../hooks/useMessageNotification';
import { RoomMenu } from './RoomMenu';
import { recordToArray } from '@flocon-trpg/utils';
import { PieceValueList } from './PieceValueList';
import { StringPieceValueDrawer } from './StringPieceValueEditorModal';
import { DicePieceValueEditorModal } from './DicePieceValueEditorModal';
import { Memos } from './Memos';
import { BoardContextMenu, PieceTooltip, PopoverEditor } from './BoardPopover';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { ImagePieceDrawer } from './ImagePieceDrawer';
import { CommandEditorModal } from './CommandEditorModal';
import { ChatPalette } from './ChatPalettes';
import { Board } from './Board';
import { useAtomSelector } from '../../atoms/useAtomSelector';
import { roomConfigAtom } from '../../atoms/roomConfig/roomConfigAtom';
import { RoomConfigUtils } from '../../atoms/roomConfig/types/roomConfig/utils';
import { roomAtom } from '../../atoms/room/roomAtom';
import { useImmerUpdateAtom } from '../../atoms/useImmerUpdateAtom';
import { BoardPositionAndPieceEditorModal } from './BoardPositionAndPieceEditorModal';
import { CharacterTagNamesEditorModal } from './CharacterTagNamesEditorModal';

const RoomMessagePanels: React.FC = () => {
    const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);
    const messagePanels = useAtomSelector(roomConfigAtom, state => state?.panels.messagePanels);

    return (
        <>
            {recordToArray(messagePanels ?? {}).map(pair => {
                if (pair.value.isMinimized) {
                    return null;
                }

                // canvasWidthとcanvasHeightはDraggableCardのchildrenの表示領域より大きい値
                return (
                    <DraggableCard
                        key={pair.key}
                        header='メッセージ'
                        onDragStop={e =>
                            setRoomConfig(roomConfig => {
                                if (roomConfig == null) {
                                    return;
                                }
                                const messagePanel = roomConfig.panels.messagePanels[pair.key];
                                if (messagePanel == null) {
                                    return;
                                }
                                RoomConfigUtils.movePanel(messagePanel, e);
                            })
                        }
                        onResizeStop={(dir, delta) =>
                            setRoomConfig(roomConfig => {
                                if (roomConfig == null) {
                                    return;
                                }
                                const messagePanel = roomConfig.panels.messagePanels[pair.key];
                                if (messagePanel == null) {
                                    return;
                                }
                                RoomConfigUtils.resizePanel(messagePanel, dir, delta);
                            })
                        }
                        onMoveToFront={() =>
                            setRoomConfig(roomConfig => {
                                if (roomConfig == null) {
                                    return;
                                }
                                const messagePanel = roomConfig.panels.messagePanels[pair.key];
                                if (messagePanel == null) {
                                    return;
                                }
                                RoomConfigUtils.bringPanelToFront(roomConfig, {
                                    type: 'messagePanel',
                                    panelId: pair.key,
                                });
                            })
                        }
                        onClose={() => {
                            Modal.confirm({
                                title: '削除の確認',
                                content:
                                    '選択されたメッセージウィンドウを削除します。よろしいですか？',
                                onOk: () => {
                                    setRoomConfig(roomConfig => {
                                        if (roomConfig == null) {
                                            return;
                                        }
                                        roomConfig.panels.messagePanels[pair.key] = undefined;
                                    });
                                },
                                okText: '削除',
                                cancelText: 'キャンセル',
                                closable: true,
                                maskClosable: true,
                            });
                        }}
                        childrenContainerStyle={{ overflow: 'hidden' }}
                        position={pair.value}
                        size={pair.value}
                        minHeight={150}
                        minWidth={150}
                        zIndex={pair.value.zIndex}
                    >
                        <RoomMessages panelId={pair.key} height={pair.value.height} />
                    </DraggableCard>
                );
            })}
        </>
    );
};

const childrenContainerPadding = `12px ${horizontalPadding}px`;
const bottomContainerPadding = `0px ${horizontalPadding}px`;

export const Room: React.FC = () => {
    const myUserUid = useMyUserUid();
    const roomIdOfRoomConfig = useAtomSelector(roomConfigAtom, state => state?.roomId);
    const activeBoardPanelConfig = useAtomSelector(
        roomConfigAtom,
        state => state?.panels.activeBoardPanel
    );
    const boardEditorPanelsConfig = useAtomSelector(
        roomConfigAtom,
        state => state?.panels.boardEditorPanels
    );
    const characterPanel = useAtomSelector(roomConfigAtom, state => state?.panels.characterPanel);
    const chatPalettePanelsConfig = useAtomSelector(
        roomConfigAtom,
        state => state?.panels.chatPalettePanels
    );
    const gameEffectPanel = useAtomSelector(roomConfigAtom, state => state?.panels.gameEffectPanel);
    const memoPanelsConfig = useAtomSelector(roomConfigAtom, state => state?.panels.memoPanels);
    const pieceValuePanel = useAtomSelector(roomConfigAtom, state => state?.panels.pieceValuePanel);
    const participantPanel = useAtomSelector(
        roomConfigAtom,
        state => state?.panels.participantPanel
    );

    const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);

    usePlayBgm();
    usePlaySoundEffect();
    useMessageNotification();

    const roomId = useAtomSelector(roomAtom, state => state.roomId);

    if (
        roomIdOfRoomConfig == null ||
        roomIdOfRoomConfig !== roomId ||
        activeBoardPanelConfig == null ||
        boardEditorPanelsConfig == null ||
        characterPanel == null ||
        chatPalettePanelsConfig == null ||
        gameEffectPanel == null ||
        memoPanelsConfig == null ||
        pieceValuePanel == null ||
        participantPanel == null
    ) {
        return <LoadingResult title='個人設定のデータをブラウザから読み込んでいます…' />;
    }

    if (myUserUid == null) {
        return (
            <AntdLayout>
                <AntdLayout.Content>
                    <Result
                        status='warning'
                        title='ログインしていないか、Participantの取得に失敗しました。'
                    />
                </AntdLayout.Content>
            </AntdLayout>
        );
    }

    const boardEditorPanels = recordToArray(boardEditorPanelsConfig).map(pair => {
        if (pair.value.isMinimized) {
            return null;
        }

        // canvasWidthとcanvasHeightはDraggableCardのchildrenの表示領域より大きい値
        return (
            <DraggableCard
                key={pair.key}
                header='ボードエディター'
                onDragStop={e =>
                    setRoomConfig(roomConfig => {
                        if (roomConfig == null) {
                            return;
                        }
                        const boardEditorPanel = roomConfig.panels.boardEditorPanels[pair.key];
                        if (boardEditorPanel == null) {
                            return;
                        }
                        RoomConfigUtils.movePanel(boardEditorPanel, e);
                    })
                }
                onResizeStop={(dir, delta) =>
                    setRoomConfig(roomConfig => {
                        if (roomConfig == null) {
                            return;
                        }
                        const boardEditorPanel = roomConfig.panels.boardEditorPanels[pair.key];
                        if (boardEditorPanel == null) {
                            return;
                        }
                        RoomConfigUtils.resizePanel(boardEditorPanel, dir, delta);
                    })
                }
                onMoveToFront={() =>
                    setRoomConfig(roomConfig => {
                        if (roomConfig == null) {
                            return;
                        }
                        const boardEditorPanel = roomConfig.panels.boardEditorPanels[pair.key];
                        if (boardEditorPanel == null) {
                            return;
                        }
                        RoomConfigUtils.bringPanelToFront(roomConfig, {
                            type: 'boardEditorPanel',
                            panelId: pair.key,
                        });
                    })
                }
                onClose={() =>
                    setRoomConfig(roomConfig => {
                        if (roomConfig == null) {
                            return;
                        }
                        roomConfig.panels.boardEditorPanels[pair.key] = undefined;
                    })
                }
                childrenContainerStyle={{ overflow: 'hidden' }}
                position={pair.value}
                size={pair.value}
                minHeight={150}
                minWidth={150}
                zIndex={pair.value.zIndex}
            >
                <Board
                    canvasWidth={pair.value.width}
                    canvasHeight={pair.value.height}
                    type='boardEditor'
                    boardEditorPanelId={pair.key}
                    boardEditorPanel={pair.value}
                />
            </DraggableCard>
        );
    });

    const chatPalettePanels = recordToArray(chatPalettePanelsConfig).map(pair => {
        if (pair.value.isMinimized) {
            return null;
        }

        return (
            <DraggableCard
                key={pair.key}
                header='チャットパレット'
                onDragStop={e =>
                    setRoomConfig(roomConfig => {
                        if (roomConfig == null) {
                            return;
                        }
                        const chatPalettePanel = roomConfig.panels.chatPalettePanels[pair.key];
                        if (chatPalettePanel == null) {
                            return;
                        }
                        RoomConfigUtils.movePanel(chatPalettePanel, e);
                    })
                }
                onResizeStop={(dir, delta) =>
                    setRoomConfig(roomConfig => {
                        if (roomConfig == null) {
                            return;
                        }
                        const chatPalettePanel = roomConfig.panels.chatPalettePanels[pair.key];
                        if (chatPalettePanel == null) {
                            return;
                        }
                        RoomConfigUtils.resizePanel(chatPalettePanel, dir, delta);
                    })
                }
                onMoveToFront={() =>
                    setRoomConfig(roomConfig => {
                        if (roomConfig == null) {
                            return;
                        }
                        const chatPalettePanel = roomConfig.panels.chatPalettePanels[pair.key];
                        if (chatPalettePanel == null) {
                            return;
                        }
                        RoomConfigUtils.bringPanelToFront(roomConfig, {
                            type: 'chatPalettePanel',
                            panelId: pair.key,
                        });
                    })
                }
                onClose={() =>
                    setRoomConfig(roomConfig => {
                        if (roomConfig == null) {
                            return;
                        }
                        roomConfig.panels.chatPalettePanels[pair.key] = undefined;
                    })
                }
                childrenContainerStyle={{ overflow: 'hidden' }}
                position={pair.value}
                size={pair.value}
                minHeight={150}
                minWidth={150}
                zIndex={pair.value.zIndex}
            >
                <ChatPalette roomId={roomId} panelId={pair.key} />
            </DraggableCard>
        );
    });

    const memoPanels = recordToArray(memoPanelsConfig).map(pair => {
        if (pair.value.isMinimized) {
            return null;
        }

        return (
            <DraggableCard
                key={pair.key}
                header='共有メモ（部屋）'
                onDragStop={e =>
                    setRoomConfig(roomConfig => {
                        if (roomConfig == null) {
                            return;
                        }
                        const memoPanel = roomConfig.panels.memoPanels[pair.key];
                        if (memoPanel == null) {
                            return;
                        }
                        RoomConfigUtils.movePanel(memoPanel, e);
                    })
                }
                onResizeStop={(dir, delta) =>
                    setRoomConfig(roomConfig => {
                        if (roomConfig == null) {
                            return;
                        }
                        const memoPanel = roomConfig.panels.memoPanels[pair.key];
                        if (memoPanel == null) {
                            return;
                        }
                        RoomConfigUtils.resizePanel(memoPanel, dir, delta);
                    })
                }
                onMoveToFront={() =>
                    setRoomConfig(roomConfig => {
                        if (roomConfig == null) {
                            return;
                        }
                        const memoPanel = roomConfig.panels.memoPanels[pair.key];
                        if (memoPanel == null) {
                            return;
                        }
                        RoomConfigUtils.bringPanelToFront(roomConfig, {
                            type: 'memoPanel',
                            panelId: pair.key,
                        });
                    })
                }
                onClose={() =>
                    setRoomConfig(roomConfig => {
                        if (roomConfig == null) {
                            return;
                        }
                        roomConfig.panels.memoPanels[pair.key] = undefined;
                    })
                }
                childrenContainerStyle={{ overflow: 'hidden' }}
                position={pair.value}
                size={pair.value}
                minHeight={150}
                minWidth={150}
                zIndex={pair.value.zIndex}
            >
                <Memos
                    selectedMemoId={pair.value.selectedMemoId}
                    onSelectedMemoIdChange={newId =>
                        setRoomConfig(roomConfig => {
                            if (roomConfig == null) {
                                return;
                            }
                            const memoPanel = roomConfig.panels.memoPanels[pair.key];
                            if (memoPanel == null) {
                                return;
                            }
                            memoPanel.selectedMemoId = newId;
                        })
                    }
                />
            </DraggableCard>
        );
    });

    return (
        <AntdLayout>
            <AntdLayout.Content>
                <RoomMenu />
                <div style={{ position: 'relative' }}>
                    {activeBoardPanelConfig.isMinimized ? null : (
                        <DraggableCard
                            header='ボードビュアー'
                            onDragStop={e =>
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    RoomConfigUtils.movePanel(
                                        roomConfig.panels.activeBoardPanel,
                                        e
                                    );
                                })
                            }
                            onResizeStop={(dir, delta) =>
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    RoomConfigUtils.resizePanel(
                                        roomConfig.panels.activeBoardPanel,
                                        dir,
                                        delta
                                    );
                                })
                            }
                            onMoveToFront={() =>
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    RoomConfigUtils.bringPanelToFront(roomConfig, {
                                        type: 'activeBoardPanel',
                                    });
                                })
                            }
                            onClose={() =>
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    roomConfig.panels.activeBoardPanel.isMinimized = true;
                                })
                            }
                            childrenContainerStyle={{ overflow: 'hidden' }}
                            position={activeBoardPanelConfig}
                            size={activeBoardPanelConfig}
                            minHeight={150}
                            minWidth={150}
                            zIndex={activeBoardPanelConfig.zIndex}
                        >
                            <Board
                                canvasWidth={activeBoardPanelConfig.width}
                                canvasHeight={activeBoardPanelConfig.height}
                                type='activeBoard'
                                activeBoardPanel={activeBoardPanelConfig}
                            />
                        </DraggableCard>
                    )}
                    {boardEditorPanels}
                    <RoomMessagePanels />
                    {characterPanel.isMinimized ? null : (
                        <DraggableCard
                            header='キャラクター'
                            onDragStop={e =>
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    RoomConfigUtils.movePanel(roomConfig.panels.characterPanel, e);
                                })
                            }
                            onResizeStop={(dir, delta) =>
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    RoomConfigUtils.resizePanel(
                                        roomConfig.panels.characterPanel,
                                        dir,
                                        delta
                                    );
                                })
                            }
                            onMoveToFront={() =>
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    RoomConfigUtils.bringPanelToFront(roomConfig, {
                                        type: 'characterPanel',
                                    });
                                })
                            }
                            onClose={() =>
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    roomConfig.panels.characterPanel.isMinimized = true;
                                })
                            }
                            childrenContainerStyle={{
                                padding: childrenContainerPadding,
                                overflowY: 'scroll',
                            }}
                            position={characterPanel}
                            size={characterPanel}
                            minHeight={150}
                            minWidth={150}
                            zIndex={characterPanel.zIndex}
                        >
                            <CharacterList />
                        </DraggableCard>
                    )}
                    {chatPalettePanels}
                    {gameEffectPanel.isMinimized ? null : (
                        <DraggableCard
                            header='SE, BGM'
                            onDragStop={e =>
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    RoomConfigUtils.movePanel(roomConfig.panels.gameEffectPanel, e);
                                })
                            }
                            onResizeStop={(dir, delta) =>
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    RoomConfigUtils.resizePanel(
                                        roomConfig.panels.gameEffectPanel,
                                        dir,
                                        delta
                                    );
                                })
                            }
                            onMoveToFront={() =>
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    RoomConfigUtils.bringPanelToFront(roomConfig, {
                                        type: 'gameEffectPanel',
                                    });
                                })
                            }
                            onClose={() =>
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    roomConfig.panels.gameEffectPanel.isMinimized = true;
                                })
                            }
                            childrenContainerStyle={{
                                padding: childrenContainerPadding,
                                overflowY: 'scroll',
                            }}
                            position={gameEffectPanel}
                            size={gameEffectPanel}
                            minHeight={150}
                            minWidth={150}
                            zIndex={gameEffectPanel.zIndex}
                        >
                            <SoundPlayer />
                        </DraggableCard>
                    )}
                    {memoPanels}
                    {participantPanel.isMinimized ? null : (
                        <DraggableCard
                            header='入室者'
                            onDragStop={e =>
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    RoomConfigUtils.movePanel(
                                        roomConfig.panels.participantPanel,
                                        e
                                    );
                                })
                            }
                            onResizeStop={(dir, delta) =>
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    RoomConfigUtils.resizePanel(
                                        roomConfig.panels.participantPanel,
                                        dir,
                                        delta
                                    );
                                })
                            }
                            onMoveToFront={() =>
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    RoomConfigUtils.bringPanelToFront(roomConfig, {
                                        type: 'participantPanel',
                                    });
                                })
                            }
                            onClose={() =>
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    roomConfig.panels.participantPanel.isMinimized = true;
                                })
                            }
                            childrenContainerStyle={{
                                padding: childrenContainerPadding,
                                overflowY: 'scroll',
                            }}
                            position={participantPanel}
                            size={participantPanel}
                            minHeight={150}
                            minWidth={150}
                            zIndex={participantPanel.zIndex}
                        >
                            <ParticipantList />
                        </DraggableCard>
                    )}
                    {pieceValuePanel.isMinimized ? null : (
                        <DraggableCard
                            header='コマ'
                            onDragStop={e =>
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    RoomConfigUtils.movePanel(roomConfig.panels.pieceValuePanel, e);
                                })
                            }
                            onResizeStop={(dir, delta) =>
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    RoomConfigUtils.resizePanel(
                                        roomConfig.panels.pieceValuePanel,
                                        dir,
                                        delta
                                    );
                                })
                            }
                            onMoveToFront={() =>
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    RoomConfigUtils.bringPanelToFront(roomConfig, {
                                        type: 'pieceValuePanel',
                                    });
                                })
                            }
                            onClose={() =>
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    roomConfig.panels.pieceValuePanel.isMinimized = true;
                                })
                            }
                            childrenContainerStyle={{
                                padding: childrenContainerPadding,
                                overflowY: 'scroll',
                            }}
                            position={pieceValuePanel}
                            size={pieceValuePanel}
                            minHeight={150}
                            minWidth={150}
                            zIndex={pieceValuePanel.zIndex}
                        >
                            <PieceValueList />
                        </DraggableCard>
                    )}
                </div>

                <BoardContextMenu />
                <PieceTooltip />
                <PopoverEditor />

                <BoardDrawer />
                <CharacterEditorModal />
                <CharacterTagNamesEditorModal/>
                <BoardPositionAndPieceEditorModal />
                <DicePieceValueEditorModal />
                <ImagePieceDrawer />
                <StringPieceValueDrawer />
                <CharacterParameterNamesEditorModal />
                <EditRoomDrawer />

                <CommandEditorModal />
            </AntdLayout.Content>
        </AntdLayout>
    );
};
