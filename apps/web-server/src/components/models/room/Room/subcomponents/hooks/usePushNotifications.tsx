import { Master, Player, getOpenRollCall, simpleId } from '@flocon-trpg/core';
import { keyNames, loggerRef } from '@flocon-trpg/utils';
import {
    custom,
    pieceLog,
    privateMessage,
    publicMessage,
    soundEffect,
} from '@flocon-trpg/web-server-utils';
import { App, Button } from 'antd';
import classNames from 'classnames';
import { Howl } from 'howler';
import { useSetAtom } from 'jotai';
import React from 'react';
import { useLatest } from 'react-use';
import { NotificationMain } from '../components/Notification/Notification';
import { RoomMessage } from '../components/RoomMessagesPanelContent/subcomponents/components/RoomMessage/RoomMessage';
import { useMessageFilter } from './useMessageFilter';
import { useParticipants } from './useParticipants';
import { usePublicChannelNames } from './usePublicChannelNames';
import { useRoomId } from './useRoomId';
import { useRoomMessages } from './useRoomMessages';
import { panelHighlightKeysAtom } from '@/atoms/panelHighlightKeysAtom/panelHighlightKeysAtom';
import {
    bringPanelToFront,
    rollCallPanel,
    roomConfigAtomFamily,
} from '@/atoms/roomConfigAtom/roomConfigAtom';
import { MessageFilterUtils } from '@/atoms/roomConfigAtom/types/messageFilter/utils';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { useImmerSetAtom } from '@/hooks/useImmerSetAtom';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';
import { flex, flexColumn, flexRow } from '@/styles/className';
import { emptyPublicChannelNames } from '@/utils/types';

function useMessageNotifications(): void {
    const { notification } = App.useApp();
    const publicChannelNames = usePublicChannelNames();
    const publicChannelNameRef = useLatest(publicChannelNames);
    const participantsMap = useParticipants();
    const participantsMapRef = useLatest(participantsMap);
    const roomId = useRoomId();
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const masterVolume = useAtomSelector(roomConfigAtom, state => state.masterVolume);
    const seVolume = useAtomSelector(roomConfigAtom, state => state.seVolume);
    const volumeRef = React.useRef(masterVolume * seVolume);
    React.useEffect(() => {
        volumeRef.current = masterVolume * seVolume;
    }, [masterVolume, seVolume]);

    const myUserUid = useMyUserUid();
    const myUserUidRef = React.useRef(myUserUid);
    React.useEffect(() => {
        myUserUidRef.current = myUserUid;
    }, [myUserUid]);

    const messageNotificationFilter = useAtomSelector(
        roomConfigAtom,
        state => state?.messageNotificationFilter,
    );
    const messageNotificationFilterRef = React.useRef(
        messageNotificationFilter ?? MessageFilterUtils.createEmpty(),
    );
    React.useEffect(() => {
        messageNotificationFilterRef.current =
            messageNotificationFilter ?? MessageFilterUtils.createEmpty();
    }, [messageNotificationFilter]);

    const messageFilter = useMessageFilter(messageNotificationFilterRef.current);
    const messageFilterRef = useLatest(messageFilter);

    const roomMessages = useRoomMessages({});
    const messageDiff = roomMessages.diff;

    React.useEffect(() => {
        if (myUserUidRef.current == null || messageDiff == null) {
            return;
        }
        // 削除（現時点ではメッセージのインスタンスが消えることはないので起こらないが）や変更は無視する
        if (messageDiff.prevValue != null || messageDiff.nextValue == null) {
            return;
        }
        const message = messageDiff.nextValue;
        switch (message.type) {
            case privateMessage:
            case publicMessage:
                if (!messageFilterRef.current(message)) {
                    return;
                }
                break;
            case custom: {
                if (message.value.error != null) {
                    switch (message.value.type) {
                        case 'error':
                            loggerRef.error(message.value.error, message.value.message);
                            break;
                        case 'warning':
                            loggerRef.warn(message.value.error, message.value.message);
                            break;
                        default:
                            break;
                    }
                }
                notification[message.value.type]({
                    message: <NotificationMain notification={message.value} />,
                    description: message.value.description,
                    placement: 'bottomRight',
                });
                return;
            }
            case pieceLog:
            case soundEffect:
                return;
        }

        // TODO: システムメッセージは別の音にするか鳴らさないようにしたほうがいいか
        const volume = Math.min(volumeRef.current, 1);
        if (message.value.commandResult == null) {
            if (message.value.createdBy !== myUserUidRef.current) {
                new Howl({ src: '/assets/chat.mp3', volume }).play();
            }
        } else {
            new Howl({ src: '/assets/diceroll.mp3', volume }).play();
        }

        if (message.value.createdBy === myUserUidRef.current) {
            return;
        }
        notification.open({
            placement: 'bottomRight',
            message: (
                <div className={classNames(flex, flexRow)}>
                    {RoomMessage.userName(message, participantsMapRef.current ?? new Map())}
                    <div style={{ margin: '0 4px' }}>-</div>
                    {RoomMessage.toChannelName(
                        message,
                        publicChannelNameRef.current ?? emptyPublicChannelNames,
                        participantsMapRef.current ?? new Map(),
                    )}
                </div>
            ),
            description: <RoomMessage.Content style={{}} message={message} />,
        });
    }, [messageDiff, messageFilterRef, notification, participantsMapRef, publicChannelNameRef]);
}

function useRollCallNotificationsAndAutoOpenRollCallPanel(): void {
    const roomId = useRoomId();
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const reduceRoomConfig = useSetAtom(roomConfigAtom);
    const myUserUid = useMyUserUid();
    const rollCalls = useRoomStateValueSelector(roomState => roomState.rollCalls);
    const openRollCall = React.useMemo(() => getOpenRollCall(rollCalls ?? {}), [rollCalls]);
    const openRollCallId = openRollCall?.key;
    const openRollCallRef = useLatest(openRollCall?.value);
    const setPanelHightlightKeys = useImmerSetAtom(panelHighlightKeysAtom);
    const participants = useRoomStateValueSelector(roomState => roomState.participants);
    const myRole = myUserUid == null ? undefined : participants?.[myUserUid]?.role;
    const myRoleRef = useLatest(myRole);
    const { notification } = App.useApp();

    React.useEffect(() => {
        if (openRollCallId == null || openRollCallRef.current == null || myUserUid == null) {
            return;
        }
        switch (myRoleRef.current) {
            case Master:
            case Player:
                break;
            default:
                return;
        }
        if (openRollCallRef.current.createdBy === myUserUid) {
            return;
        }
        if (openRollCallRef.current.participants?.[myUserUid]?.answeredAt != null) {
            return;
        }
        // 点呼が始まった瞬間に自動的に点呼ウィンドウを開いてほしいという要望があったので開くようにしている
        reduceRoomConfig({
            type: bringPanelToFront,
            panelType: { type: rollCallPanel },
            action: { unminimizePanel: true },
        });
        const key = keyNames('RollCallNotification', simpleId());
        notification.open({
            key,
            placement: 'bottomLeft',
            // never be closed automatically
            duration: null,
            message: (
                <div className={classNames(flex, flexColumn)} style={{ gap: 8 }}>
                    <div>{'点呼が行われています。'}</div>
                    {/* CONSIDER: 点呼が始まったときに点呼ウィンドウが自動的に開くようになっているため、点呼ウィンドウを開くボタンは必要ないと思われる。通知自体も必要ないかもしれない。 */}
                    <Button
                        onClick={() => {
                            reduceRoomConfig({
                                type: bringPanelToFront,
                                panelType: { type: rollCallPanel },
                                action: { unminimizePanel: true },
                            });
                            setPanelHightlightKeys(keys => {
                                keys.rollCallPanel = simpleId();
                            });
                            notification.destroy(key);
                        }}
                    >
                        点呼ウィンドウを開く
                    </Button>
                </div>
            ),
        });
        return () => notification.destroy(key);
    }, [
        myRoleRef,
        myUserUid,
        notification,
        openRollCallId,
        openRollCallRef,
        setPanelHightlightKeys,
        reduceRoomConfig,
    ]);
}

export function usePushNotificationsAndAutoOpenPanel(): void {
    useMessageNotifications();
    useRollCallNotificationsAndAutoOpenRollCallPanel();
}
