import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import React from 'react';
import { RoomMessage } from '../components/room/RoomMessage';
import { Participant } from '../stateManagers/states/participant';
import { MessageFilter } from '../states/MessagesPanelConfig';
import { useSelector } from '../store';
import { PublicChannelNames } from '../utils/types';
import { useMessageFilter } from './useMessageFilter';
import { AllRoomMessagesResult, newEvent, privateMessage, publicMessage } from './useRoomMessages';

const argsBase: Omit<ArgsProps, 'message'> = {
    placement: 'bottomRight',
};

export function useMessageNotification(allRoomMessagesResult: AllRoomMessagesResult | null, myUserUid: string | null, publicChannelNames: PublicChannelNames, participants: ReadonlyMap<string, Participant.State>): void {
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

    const myUserUidRef = React.useRef(myUserUid);
    React.useEffect(() => {
        myUserUidRef.current = myUserUid;
    }, [myUserUid]);

    const publicChannelNameRef = React.useRef(publicChannelNames);
    React.useEffect(() => {
        publicChannelNameRef.current = publicChannelNames;
    }, [publicChannelNames]);

    const participantsRef = React.useRef(participants);
    React.useEffect(() => {
        participantsRef.current = participants;
    }, [participants]);

    React.useEffect(() => {
        if (allRoomMessagesResult?.type !== newEvent) {
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
        if (message.value.createdBy === myUserUidRef.current) {
            return;
        }
        notification.open({
            ...argsBase,
            message: (<div style={{ display: 'flex', flexDirection: 'row' }}>
                {RoomMessage.userName(message, participantsRef.current)}
                <div style={{ margin: '0 4px' }}>-</div>
                {RoomMessage.toChannelName(message, publicChannelNameRef.current, participantsRef.current)}</div>),
            description: <RoomMessage.Content style={{}} message={message} />
        });
    }, [allRoomMessagesResult]);
}