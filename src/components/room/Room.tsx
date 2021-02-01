import React from 'react';
import { Menu, Layout as AntdLayout, Drawer, Dropdown } from 'antd';
import DraggableCard, { horizontalPadding } from '../../foundations/DraggableCard';
import CharactersList from './CharactersList';
import useRoomConfig from '../../hooks/localStorage/useRoomConfig';
import { useSelector } from '../../store';
import roomConfigModule from '../../modules/roomConfigModule';
import { useDispatch } from 'react-redux';
import * as RoomStates from '../../stateManagers/states/room';
import Boards from './Boards';
import { recordToArray } from '../../utils/record';
import RoomMessages, { Tab } from './RoomMessages';
import CharacterParameterNamesDrawer from './CharacterParameterNamesDrawer';
import { RoomComponentsState, defaultRoomComponentsState, reduce, roomDrawerVisibility } from './RoomComponentsState';
import DrawerFooter from '../../layouts/DrawerFooter';
import ComponentsStateContext from './contexts/RoomComponentsStateContext';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import OperateContext from './contexts/OperateContext';
import CharacterDrawer from './CharacterDrawer';
import BoardDrawer from './BoardDrawer';
import CreatePrivateMessageDrawer from './CreatePrivateMessageDrawer';
import { boardsPanel, charactersPanel, gameEffectPanel, messagesPanel } from '../../states/RoomConfig';
import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import { useLeaveRoomMutation } from '../../generated/graphql';
import { useRouter } from 'next/router';
import path from '../../utils/path';
import PlaySoundBehavior from '../../foundations/PlaySoundBehavior';
import SoundPlayer from './SoundPlayer';

const childrenContainerPadding = `12px ${horizontalPadding}px`;
const bottomContainerPadding = `0px ${horizontalPadding}px`;

type Props = {
    roomState: RoomStates.State;
    operate: ((operation: RoomStates.PostOperationSetup) => void);
    roomId: string;
}

const Room: React.FC<Props> = ({ roomState, roomId, operate }: Props) => {
    useRoomConfig(roomId);
    const roomConfig = useSelector(state => state.roomConfigModule);
    const router = useRouter();
    const dispatch = useDispatch();
    const [componentsState, dispatchComponentsState] = React.useReducer(reduce, defaultRoomComponentsState);
    const [leaveRoomMutation] = useLeaveRoomMutation({ variables: { id: roomId } });

    if (roomConfig == null || roomConfig.roomId !== roomId) {
        return (<div>loading config file...</div>);
    }

    // TODO: offset, zoom
    const boardsPanels = recordToArray(roomConfig.panels.boardsPanels).map(pair => {
        if (pair.value.isMinimized) {
            return null;
        }

        // canvasWidthとcanvasHeightはDraggableCardのchildrenの表示領域より大きい値
        return (
            <DraggableCard
                key={pair.key}
                header="Board"
                onDragStop={e => dispatch(roomConfigModule.actions.moveBoardPanel({ ...e, roomId, panelId: pair.key }))}
                onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeBoardPanel({ roomId, panelId: pair.key, dir, delta }))}
                onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: boardsPanel, panelId: pair.key } }))}
                onClose={() => dispatch(roomConfigModule.actions.removeBoardPanel({ roomId, panelId: pair.key }))}
                childrenContainerStyle={({ overflow: 'hidden', backgroundColor: 'white' })}
                position={pair.value}
                size={pair.value}
                minHeight={150}
                minWidth={150}
                zIndex={pair.value.zIndex}>
                <Boards
                    canvasWidth={pair.value.width}
                    canvasHeight={pair.value.height}
                    boards={roomState.boards}
                    boardsPanelConfigId={pair.key}
                    boardsPanelConfig={pair.value}
                    roomId={roomId}
                    characters={roomState.characters} />
            </DraggableCard>
        );
    });

    return (
        <ComponentsStateContext.Provider value={componentsState}>
            <DispatchRoomComponentsStateContext.Provider value={dispatchComponentsState}>
                <OperateContext.Provider value={operate}>
                    <AntdLayout>
                        <AntdLayout.Content>
                            <Menu triggerSubMenuAction='click' selectable={false} mode="horizontal">
                                <Menu.SubMenu title="部屋">
                                    <Menu.Item onClick={() => dispatchComponentsState({ type: roomDrawerVisibility, newValue: true })}>
                                        編集
                                    </Menu.Item>
                                    <Menu.Item onClick={() => {
                                        leaveRoomMutation().then(result => {
                                            if (result.data == null) {
                                                return;
                                            }
                                            router.push(path.rooms.index);
                                        });
                                    }}>
                                        退室する
                                    </Menu.Item>
                                </Menu.SubMenu>
                                <Menu.SubMenu title="ウィンドウ">
                                    <Menu.Item onClick={() => {
                                        dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: charactersPanel }, newValue: false }));
                                        dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: charactersPanel } }));
                                    }}>
                                        <div>
                                            <span>{roomConfig.panels.charactersPanel.isMinimized ? null : <CheckOutlined />}</span>
                                            <span>キャラクター一覧</span>
                                        </div>
                                    </Menu.Item>
                                    <Menu.SubMenu title="ボード">
                                        {
                                            recordToArray(roomConfig.panels.boardsPanels).map((pair, i) => {
                                                return (
                                                    <Menu.Item
                                                        key={pair.key}
                                                        onClick={() => {
                                                            // これは通常の操作が行われた場合は必要ないが、設定ファイルがおかしくなったりしたときのために書いている。これがないと、設定ファイルを直接編集しない限りは、isMinimized: trueになっているpanelを永遠に削除することができない。
                                                            dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: boardsPanel, panelId: pair.key }, newValue: false }));

                                                            dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: boardsPanel, panelId: pair.key } }));
                                                        }}>
                                                        <div>
                                                            <span>{pair.value.isMinimized ? null : <CheckOutlined />}</span>
                                                            <span>{`パネル${i}`}</span>
                                                        </div>
                                                    </Menu.Item>);
                                            })
                                        }
                                        <Menu.Divider />
                                        <Menu.Item onClick={() => {
                                            dispatch(roomConfigModule.actions.addBoardPanelConfig({
                                                roomId,
                                                panel: {
                                                    activeBoardKey: null,
                                                    boards: {},
                                                    isMinimized: false,
                                                    x: 10,
                                                    y: 10,
                                                    width: 400,
                                                    height: 300,
                                                },
                                            }));
                                        }}>
                                            <div>
                                                <span>{roomConfig.panels.messagesPanel.isMinimized ? null : <PlusOutlined />}</span>
                                                <span>新規作成</span>
                                            </div>
                                        </Menu.Item>
                                    </Menu.SubMenu>
                                    <Menu.Item onClick={() => {
                                        dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: messagesPanel }, newValue: false }));
                                        dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: messagesPanel } }));
                                    }}>
                                        <div>
                                            <span>{roomConfig.panels.messagesPanel.isMinimized ? null : <CheckOutlined />}</span>
                                            <span>メッセージ</span>
                                        </div>
                                    </Menu.Item>
                                    <Menu.Item onClick={() => {
                                        dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: gameEffectPanel }, newValue: false }));
                                        dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: gameEffectPanel } }));
                                    }}>
                                        <div>
                                            <span>{roomConfig.panels.gameEffectPanel.isMinimized ? null : <CheckOutlined />}</span>
                                            <span>エフェクト</span>
                                        </div>
                                    </Menu.Item>
                                </Menu.SubMenu>
                            </Menu>
                            <div>
                                {boardsPanels}
                                {roomConfig.panels.charactersPanel.isMinimized ? null : <DraggableCard
                                    header="Characters"
                                    onDragStop={e => dispatch(roomConfigModule.actions.moveCharactersPanel({ ...e, roomId }))}
                                    onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeCharactersPanel({ roomId, dir, delta }))}
                                    onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: charactersPanel } }))}
                                    onClose={() => dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: charactersPanel }, newValue: true }))}
                                    childrenContainerStyle={({ padding: childrenContainerPadding, overflowY: 'scroll', backgroundColor: 'white' })}
                                    position={roomConfig.panels.charactersPanel}
                                    size={roomConfig.panels.charactersPanel}
                                    minHeight={150}
                                    minWidth={150}
                                    zIndex={roomConfig.panels.charactersPanel.zIndex}>
                                    <CharactersList room={roomState} />
                                </DraggableCard>}
                                {roomConfig.panels.gameEffectPanel.isMinimized ? null : <DraggableCard
                                    header="Game effect"
                                    onDragStop={e => dispatch(roomConfigModule.actions.moveGameEffectPanel({ ...e, roomId }))}
                                    onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeGameEffectPanel({ roomId, dir, delta }))}
                                    onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: gameEffectPanel } }))}
                                    onClose={() => dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: gameEffectPanel }, newValue: true }))}
                                    childrenContainerStyle={({ padding: childrenContainerPadding, overflowY: 'scroll', backgroundColor: 'white' })}
                                    position={roomConfig.panels.gameEffectPanel}
                                    size={roomConfig.panels.gameEffectPanel}
                                    minHeight={150}
                                    minWidth={150}
                                    zIndex={roomConfig.panels.gameEffectPanel.zIndex}>
                                    <SoundPlayer />
                                </DraggableCard>}
                                {roomConfig.panels.messagesPanel.isMinimized ? null : <DraggableCard
                                    header="Messages"
                                    onDragStop={e => dispatch(roomConfigModule.actions.moveMessagesPanel({ ...e, roomId }))}
                                    onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeMessagesPanel({ roomId, dir, delta }))}
                                    onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: messagesPanel } }))}
                                    onClose={() => dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: messagesPanel }, newValue: true }))}
                                    childrenContainerStyle={({ padding: childrenContainerPadding, backgroundColor: 'white' })}
                                    position={roomConfig.panels.messagesPanel}
                                    size={roomConfig.panels.messagesPanel}
                                    minHeight={150}
                                    minWidth={150}
                                    zIndex={roomConfig.panels.messagesPanel.zIndex}>
                                    <RoomMessages roomId={roomId} participants={roomState.participants} characters={roomState.characters} />
                                </DraggableCard>}
                            </div>

                            <BoardDrawer roomState={roomState} />
                            <CharacterDrawer roomState={roomState} />
                            <CharacterParameterNamesDrawer roomState={roomState} />
                            <CreatePrivateMessageDrawer roomState={roomState} roomId={roomId} />

                            <PlaySoundBehavior bgms={roomState.bgms} />
                        </AntdLayout.Content>
                    </AntdLayout>
                </OperateContext.Provider>
            </DispatchRoomComponentsStateContext.Provider>
        </ComponentsStateContext.Provider>);
};

export default Room;