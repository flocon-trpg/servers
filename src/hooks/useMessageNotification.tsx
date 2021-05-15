import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import { Howl } from 'howler';
import React from 'react';
import { recordToMap } from '../@shared/utils';
import { RoomMessage } from '../components/room/RoomMessage';
import { MessageFilter } from '../states/MessagesPanelConfig';
import { defaultMasterVolume, defaultSeVolume } from '../states/RoomConfig';
import { useSelector } from '../store';
import { emptyPublicChannelNames, PublicChannelNames } from '../utils/types';
import { useMe } from './useMe';
import { useMessageFilter } from './useMessageFilter';
import { usePublicChannelNames } from './state/usePublicChannelNames';
import { AllRoomMessagesResult, newEvent, privateMessage, publicMessage } from './useRoomMessages';
import { useParticipants } from './state/useParticipants';

const argsBase: Omit<ArgsProps, 'message'> = {
    placement: 'bottomRight',
};

export function useMessageNotification(): void {
    const publicChannelNames = usePublicChannelNames();
    const allRoomMessagesResult = useSelector(state => state.roomModule.allRoomMessagesResult);
    const participantsMap = useParticipants(); 
    const masterVolume = useSelector(state => state.roomConfigModule?.masterVolume);
    const seVolume = useSelector(state => state.roomConfigModule?.seVolume);
    const volumeRef = React.useRef((masterVolume ?? defaultMasterVolume) * (seVolume ?? defaultSeVolume));
    React.useEffect(() => {
        volumeRef.current = (masterVolume ?? defaultMasterVolume) * (seVolume ?? defaultSeVolume);
    }, [masterVolume, seVolume]);

    const { userUid: myUserUid } = useMe();
    const myUserUidRef = React.useRef(myUserUid);
    React.useEffect(() => {
        myUserUidRef.current = myUserUid;
    }, [myUserUid]);

    const messageNotificationFilter = useSelector(state => state.roomConfigModule?.messageNotificationFilter);
    const messageNotificationFilterRef = React.useRef(messageNotificationFilter ?? MessageFilter.createEmpty());
    React.useEffect(() => {
        messageNotificationFilterRef.current = messageNotificationFilter ?? MessageFilter.createEmpty();
    }, [messageNotificationFilter]);

    const messageFilter = useMessageFilter(messageNotificationFilterRef.current);
    const messageFilterRef = React.useRef(messageFilter);
    React.useEffect(() => {
        messageFilterRef.current = messageFilter;
    }, [messageFilter]);

    const publicChannelNameRef = React.useRef(publicChannelNames);
    React.useEffect(() => {
        publicChannelNameRef.current = publicChannelNames;
    }, [publicChannelNames]);

    const participantsMapRef = React.useRef(participantsMap);
    React.useEffect(() => {
        participantsMapRef.current = participantsMap;
    }, [participantsMap]);

    React.useEffect(() => {
        if (myUserUidRef.current == null || allRoomMessagesResult?.type !== newEvent) {
            return;
        }
        let message: RoomMessage.MessageState;
        switch (allRoomMessagesResult.event.__typename) {
            case 'RoomPrivateMessage':
                if (!messageFilterRef.current({ type: privateMessage, value: allRoomMessagesResult.event })) {
                    return;
                }
                message = {
                    type: privateMessage,
                    value: allRoomMessagesResult.event,
                };
                break;
            case 'RoomPublicMessage':
                if (!messageFilterRef.current({ type: publicMessage, value: allRoomMessagesResult.event })) {
                    return;
                }
                message = {
                    type: publicMessage,
                    value: allRoomMessagesResult.event,
                };
                break;
            default:
                return;
        }

        // TODO: システムメッセージは別の音にするか鳴らさないようにしたほうがいいか
        const volume = Math.min(volumeRef.current, 1);
        if (message.value.commandResult == null) {
            if (message.value.createdBy !== myUserUidRef.current) {
                new Howl({ src: '/chat.mp3', volume }).play();
            }
        } else {
            new Howl({ src: '/diceroll.mp3', volume }).play();
        }

        if (message.value.createdBy === myUserUidRef.current) {
            return;
        }
        notification.open({
            ...argsBase,
            message: (<div style={{ display: 'flex', flexDirection: 'row' }}>
                {RoomMessage.userName(message, participantsMapRef.current ?? new Map())}
                <div style={{ margin: '0 4px' }}>-</div>
                {RoomMessage.toChannelName(message, publicChannelNameRef.current ?? emptyPublicChannelNames, participantsMapRef.current ?? new Map())}</div>),
            description: <RoomMessage.Content style={{}} message={message} />
        });
    }, [allRoomMessagesResult]);
}