import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import { Howl } from 'howler';
import React from 'react';
import { RoomMessage } from '../components/RoomMessagesPanelContent/subcomponents/components/RoomMessage/RoomMessage';
import { emptyPublicChannelNames } from '@/utils/types';
import { useMessageFilter } from './useMessageFilter';
import { usePublicChannelNames } from './usePublicChannelNames';
import { privateMessage, publicMessage } from '@flocon-trpg/web-server-utils';
import { useParticipants } from './useParticipants';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import classNames from 'classnames';
import { flex, flexRow } from '@/styles/className';
import { useLatest } from 'react-use';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { roomConfigAtom } from '@/atoms/roomConfigAtom/roomConfigAtom';
import { MessageFilterUtils } from '@/atoms/roomConfigAtom/types/messageFilter/utils';
import {
    defaultMasterVolume,
    defaultSeVolume,
} from '@/atoms/roomConfigAtom/types/roomConfig/resources';
import { useRoomMessageEvent } from '@/hooks/useRoomMessages';

const argsBase: Omit<ArgsProps, 'message'> = {
    placement: 'bottomRight',
};

export function useMessageNotification(): void {
    const publicChannelNames = usePublicChannelNames();
    const publicChannelNameRef = useLatest(publicChannelNames);
    const messageDiff = useRoomMessageEvent();
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
            default:
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
