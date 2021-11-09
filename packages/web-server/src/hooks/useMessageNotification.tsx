import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import { Howl } from 'howler';
import React from 'react';
import { RoomMessage } from '../pageComponents/room/RoomMessage';
import { emptyPublicChannelNames } from '../utils/types';
import { useMessageFilter } from './useMessageFilter';
import { usePublicChannelNames } from './state/usePublicChannelNames';
import { newEvent, privateMessage, publicMessage } from './useRoomMessages';
import { useParticipants } from './state/useParticipants';
import { useMyUserUid } from './useMyUserUid';
import classNames from 'classnames';
import { flex, flexRow } from '../utils/className';
import { useReadonlyRef } from './useReadonlyRef';
import { useAtomSelector } from '../atoms/useAtomSelector';
import { roomConfigAtom } from '../atoms/roomConfig/roomConfigAtom';
import { roomAtom } from '../atoms/room/roomAtom';
import { MessageFilterUtils } from '../atoms/roomConfig/types/messageFilter/utils';
import { defaultMasterVolume, defaultSeVolume } from '../atoms/roomConfig/types/roomConfig/resources';

const argsBase: Omit<ArgsProps, 'message'> = {
    placement: 'bottomRight',
};

export function useMessageNotification(): void {
    const publicChannelNames = usePublicChannelNames();
    const publicChannelNameRef = useReadonlyRef(publicChannelNames);
    const allRoomMessagesResult = useAtomSelector(roomAtom,state => state.allRoomMessagesResult);
    const participantsMap = useParticipants();
    const participantsMapRef = useReadonlyRef(participantsMap);
    const masterVolume = useAtomSelector(roomConfigAtom,state => state?.masterVolume);
    const seVolume = useAtomSelector(roomConfigAtom,state => state?.seVolume);
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

    const messageNotificationFilter = useAtomSelector(roomConfigAtom,
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
    const messageFilterRef = useReadonlyRef(messageFilter);

    React.useEffect(() => {
        if (myUserUidRef.current == null || allRoomMessagesResult?.type !== newEvent) {
            return;
        }
        let message: RoomMessage.MessageState;
        switch (allRoomMessagesResult.event.__typename) {
            case 'RoomPrivateMessage':
                if (
                    !messageFilterRef.current({
                        type: privateMessage,
                        value: allRoomMessagesResult.event,
                    })
                ) {
                    return;
                }
                message = {
                    type: privateMessage,
                    value: allRoomMessagesResult.event,
                };
                break;
            case 'RoomPublicMessage':
                if (
                    !messageFilterRef.current({
                        type: publicMessage,
                        value: allRoomMessagesResult.event,
                    })
                ) {
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
    }, [allRoomMessagesResult, messageFilterRef, participantsMapRef, publicChannelNameRef]);
}
