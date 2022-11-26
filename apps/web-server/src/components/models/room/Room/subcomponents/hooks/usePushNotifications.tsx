import { loggerRef } from '@flocon-trpg/utils';
import {
    custom,
    pieceLog,
    privateMessage,
    publicMessage,
    soundEffect,
} from '@flocon-trpg/web-server-utils';
import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import classNames from 'classnames';
import { Howl } from 'howler';
import React from 'react';
import { useLatest } from 'react-use';
import { NotificationMain } from '../components/Notification/Notification';
import { RoomMessage } from '../components/RoomMessagesPanelContent/subcomponents/components/RoomMessage/RoomMessage';
import { useMessageFilter } from './useMessageFilter';
import { useParticipants } from './useParticipants';
import { usePublicChannelNames } from './usePublicChannelNames';
import { useRoomMessages } from './useRoomMessages';
import { roomConfigAtom } from '@/atoms/roomConfigAtom/roomConfigAtom';
import { MessageFilterUtils } from '@/atoms/roomConfigAtom/types/messageFilter/utils';
import {
    defaultMasterVolume,
    defaultSeVolume,
} from '@/atoms/roomConfigAtom/types/roomConfig/resources';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { flex, flexRow } from '@/styles/className';
import { emptyPublicChannelNames } from '@/utils/types';

const argsBase: Omit<ArgsProps, 'message'> = {
    placement: 'bottomRight',
};

export function usePushNotifications(): void {
    const publicChannelNames = usePublicChannelNames();
    const publicChannelNameRef = useLatest(publicChannelNames);
    const participantsMap = useParticipants();
    const participantsMapRef = useLatest(participantsMap);
    const masterVolume = useAtomSelector(roomConfigAtom, state => state?.masterVolume);
    const seVolume = useAtomSelector(roomConfigAtom, state => state?.seVolume);
    const volumeRef = React.useRef(
        (masterVolume ?? defaultMasterVolume) * (seVolume ?? defaultSeVolume)
    );
    React.useEffect(() => {
        volumeRef.current = (masterVolume ?? defaultMasterVolume) * (seVolume ?? defaultSeVolume);
    }, [masterVolume, seVolume]);

    const myUserUid = useMyUserUid();
    const myUserUidRef = React.useRef(myUserUid);
    React.useEffect(() => {
        myUserUidRef.current = myUserUid;
    }, [myUserUid]);

    const messageNotificationFilter = useAtomSelector(
        roomConfigAtom,
        state => state?.messageNotificationFilter
    );
    const messageNotificationFilterRef = React.useRef(
        messageNotificationFilter ?? MessageFilterUtils.createEmpty()
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
            ...argsBase,
            message: (
                <div className={classNames(flex, flexRow)}>
                    {RoomMessage.userName(message, participantsMapRef.current ?? new Map())}
                    <div style={{ margin: '0 4px' }}>-</div>
                    {RoomMessage.toChannelName(
                        message,
                        publicChannelNameRef.current ?? emptyPublicChannelNames,
                        participantsMapRef.current ?? new Map()
                    )}
                </div>
            ),
            description: <RoomMessage.Content style={{}} message={message} />,
        });
    }, [messageDiff, messageFilterRef, participantsMapRef, publicChannelNameRef]);
}
