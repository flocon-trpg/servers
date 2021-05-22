import React from 'react';
import { Layout as AntdLayout, Result, Modal } from 'antd';
import DraggableCard, { horizontalPadding } from '../../foundations/DraggableCard';
import CharacterList from './CharacterList';
import { useSelector } from '../../store';
import roomConfigModule from '../../modules/roomConfigModule';
import { useDispatch } from 'react-redux';
import Board from './Board';
import RoomMessages from './RoomMessages';
import CharacterParameterNamesDrawer from './CharacterParameterNamesDrawer';
import { defaultRoomComponentsState, reduceComponentsState } from './RoomComponentsState';
import ComponentsStateContext from './contexts/RoomComponentsStateContext';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import CharacterDrawer from './CharacterDrawer';
import BoardDrawer from './BoardDrawer';
import { activeBoardPanel, boardEditorPanel, messagePanel } from '../../states/RoomConfig';
import SoundPlayer from './SoundPlayer';
import EditRoomDrawer from './EditRoomDrawer';
import ParticipantList from './ParticipantList';
import MyNumberValueDrawer from './MyNumberValueDrawer';
import LoadingResult from '../../foundations/Result/LoadingResult';
import { usePlayBgm } from '../../hooks/usePlayBgm';
import { usePlaySoundEffect } from '../../hooks/usePlaySoundEffect';
import { useMessageNotification } from '../../hooks/useMessageNotification';
import MyNumberValueList from './MyNumberValueList';
import { useRoomMessageInputTexts } from '../../hooks/useRoomMessageInputTexts';
import { useMe } from '../../hooks/useMe';
import { RoomMenu } from './RoomMenu';
import { recordToArray } from '../../@shared/utils';

const RoomMessagePanels: React.FC<{ roomId: string }> = ({ roomId }: { roomId: string }) => {
    const dispatch = useDispatch();
    const messagePanels = useSelector(state => state.roomConfigModule?.panels.messagePanels);
    const roomMessageInputTexts = useRoomMessageInputTexts({ roomId });

    return <>
        {recordToArray(messagePanels ?? {}).map(pair => {
            if (pair.value.isMinimized) {
                return null;
            }

            // canvasWidthとcanvasHeightはDraggableCardのchildrenの表示領域より大きい値
            return (
                <DraggableCard
                    key={pair.key}
                    header="Message"
                    onDragStop={e => dispatch(roomConfigModule.actions.moveMessagePanel({ ...e, roomId, panelId: pair.key }))}
                    onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeMessagePanel({ roomId, panelId: pair.key, dir, delta }))}
                    onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: messagePanel, panelId: pair.key } }))}
                    onClose={() => {
                        Modal.confirm({
                            title: '削除の確認',
                            content: '選択されたメッセージウィンドウを削除します。よろしいですか？',
                            onOk: () => {
                                dispatch(roomConfigModule.actions.removeMessagePanel({ roomId, panelId: pair.key }));
                            },
                            okText: '削除',
                            cancelText: 'キャンセル',
                            closable: true,
                            maskClosable: true,
                        });
                    }}
                    childrenContainerStyle={({ overflow: 'hidden' })}
                    position={pair.value}
                    size={pair.value}
                    minHeight={150}
                    minWidth={150}
                    zIndex={pair.value.zIndex}>
                    <RoomMessages
                        panelId={pair.key}
                        config={pair.value}
                        height={pair.value.height}
                        useRoomMessageInputTextsResult={roomMessageInputTexts} />
                </DraggableCard>
            );
        })}
    </>;
};

const childrenContainerPadding = `12px ${horizontalPadding}px`;
const bottomContainerPadding = `0px ${horizontalPadding}px`;

const Room: React.FC = () => {
    const { userUid: myUserUid } = useMe();
    const roomIdOfRoomConfig = useSelector(state => state.roomConfigModule?.roomId);
    const activeBoardPanelConfig = useSelector(state => state.roomConfigModule?.panels.activeBoardPanel);
    const boardEditorPanelsConfig = useSelector(state => state.roomConfigModule?.panels.boardEditorPanels);
    const characterPanel = useSelector(state => state.roomConfigModule?.panels.characterPanel);
    const gameEffectPanel = useSelector(state => state.roomConfigModule?.panels.gameEffectPanel);
    const myValuePanel = useSelector(state => state.roomConfigModule?.panels.myValuePanel);
    const participantPanel = useSelector(state => state.roomConfigModule?.panels.participantPanel);

    const dispatch = useDispatch();
    const [componentsState, dispatchComponentsState] = React.useReducer(reduceComponentsState, defaultRoomComponentsState);

    usePlayBgm();
    usePlaySoundEffect();
    useMessageNotification();

    const roomId = useSelector(state => state.roomModule.roomId);

    if (roomIdOfRoomConfig == null || roomIdOfRoomConfig !== roomId || activeBoardPanelConfig == null || boardEditorPanelsConfig == null || characterPanel == null || gameEffectPanel == null || myValuePanel == null || participantPanel == null) {
        return (<LoadingResult title='個人設定のデータをブラウザから読み込んでいます…' />);
    }

    if (myUserUid == null) {
        return <AntdLayout>
            <AntdLayout.Content>
                <Result
                    status='warning'
                    title='ログインしていないか、Participantの取得に失敗しました。' />
            </AntdLayout.Content>
        </AntdLayout>;
    }

    const boardEditorPanels = recordToArray(boardEditorPanelsConfig).map(pair => {
        if (pair.value.isMinimized) {
            return null;
        }

        // canvasWidthとcanvasHeightはDraggableCardのchildrenの表示領域より大きい値
        return (
            <DraggableCard
                key={pair.key}
                header="ボードエディター"
                onDragStop={e => dispatch(roomConfigModule.actions.moveBoardPanel({ ...e, roomId, boardEditorPanelId: pair.key }))}
                onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeBoardPanel({ roomId, boardEditorPanelId: pair.key, dir, delta }))}
                onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: boardEditorPanel, panelId: pair.key } }))}
                onClose={() => dispatch(roomConfigModule.actions.removeBoardPanel({ roomId, boardEditorPanelId: pair.key }))}
                childrenContainerStyle={({ overflow: 'hidden' })}
                position={pair.value}
                size={pair.value}
                minHeight={150}
                minWidth={150}
                zIndex={pair.value.zIndex}>
                <Board
                    canvasWidth={pair.value.width}
                    canvasHeight={pair.value.height}
                    type='boardEditor'
                    boardEditorPanelId={pair.key}
                    boardEditorPanel={pair.value} />
            </DraggableCard>
        );
    });

    return (
        <ComponentsStateContext.Provider value={componentsState}>
            <DispatchRoomComponentsStateContext.Provider value={dispatchComponentsState}>
                <AntdLayout>
                    <AntdLayout.Content>
                        <RoomMenu />
                        <div>
                            {activeBoardPanelConfig.isMinimized ? null : <DraggableCard
                                header="ボードビューア"
                                onDragStop={e => dispatch(roomConfigModule.actions.moveBoardPanel({ ...e, roomId, boardEditorPanelId: null }))}
                                onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeBoardPanel({ roomId, boardEditorPanelId: null, dir, delta }))}
                                onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: activeBoardPanel } }))}
                                onClose={() => dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: activeBoardPanel }, newValue: true }))}
                                childrenContainerStyle={({ overflow: 'hidden' })}
                                position={activeBoardPanelConfig}
                                size={activeBoardPanelConfig}
                                minHeight={150}
                                minWidth={150}
                                zIndex={activeBoardPanelConfig.zIndex}>
                                <Board
                                    canvasWidth={activeBoardPanelConfig.width}
                                    canvasHeight={activeBoardPanelConfig.height}
                                    type='activeBoard'
                                    activeBoardPanel={activeBoardPanelConfig} />
                            </DraggableCard>}
                            {boardEditorPanels}
                            <RoomMessagePanels roomId={roomId} />
                            {characterPanel.isMinimized ? null : <DraggableCard
                                header="Characters"
                                onDragStop={e => dispatch(roomConfigModule.actions.moveCharacterPanel({ ...e, roomId }))}
                                onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeCharacterPanel({ roomId, dir, delta }))}
                                onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: 'characterPanel' } }))}
                                onClose={() => dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: 'characterPanel' }, newValue: true }))}
                                childrenContainerStyle={({ padding: childrenContainerPadding, overflowY: 'scroll' })}
                                position={characterPanel}
                                size={characterPanel}
                                minHeight={150}
                                minWidth={150}
                                zIndex={characterPanel.zIndex}>
                                <CharacterList />
                            </DraggableCard>}
                            {gameEffectPanel.isMinimized ? null : <DraggableCard
                                header="SE, BGM"
                                onDragStop={e => dispatch(roomConfigModule.actions.moveGameEffectPanel({ ...e, roomId }))}
                                onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeGameEffectPanel({ roomId, dir, delta }))}
                                onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: 'gameEffectPanel' } }))}
                                onClose={() => dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: 'gameEffectPanel' }, newValue: true }))}
                                childrenContainerStyle={({ padding: childrenContainerPadding, overflowY: 'scroll' })}
                                position={gameEffectPanel}
                                size={gameEffectPanel}
                                minHeight={150}
                                minWidth={150}
                                zIndex={gameEffectPanel.zIndex}>
                                <SoundPlayer />
                            </DraggableCard>}
                            {participantPanel.isMinimized ? null : <DraggableCard
                                header="Participants"
                                onDragStop={e => dispatch(roomConfigModule.actions.moveParticipantPanel({ ...e, roomId }))}
                                onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeParticipantPanel({ roomId, dir, delta }))}
                                onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: 'participantPanel' } }))}
                                onClose={() => dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: 'participantPanel' }, newValue: true }))}
                                childrenContainerStyle={({ padding: childrenContainerPadding, overflowY: 'scroll' })}
                                position={participantPanel}
                                size={participantPanel}
                                minHeight={150}
                                minWidth={150}
                                zIndex={participantPanel.zIndex}>
                                <ParticipantList />
                            </DraggableCard>}
                            {myValuePanel.isMinimized ? null : <DraggableCard
                                header="コマ"
                                onDragStop={e => dispatch(roomConfigModule.actions.moveMyValuePanel({ ...e, roomId }))}
                                onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeMyValuePanel({ roomId, dir, delta }))}
                                onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: 'myValuePanel' } }))}
                                onClose={() => dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: 'myValuePanel' }, newValue: true }))}
                                childrenContainerStyle={({ padding: childrenContainerPadding, overflowY: 'scroll' })}
                                position={myValuePanel}
                                size={myValuePanel}
                                minHeight={150}
                                minWidth={150}
                                zIndex={myValuePanel.zIndex}>
                                <MyNumberValueList />
                            </DraggableCard>}
                        </div>

                        <BoardDrawer />
                        <CharacterDrawer />
                        <MyNumberValueDrawer />
                        <CharacterParameterNamesDrawer />
                        <EditRoomDrawer />
                    </AntdLayout.Content>
                </AntdLayout>
            </DispatchRoomComponentsStateContext.Provider>
        </ComponentsStateContext.Provider>);
};

export default Room;