import { Alert, Checkbox, Col, Drawer, Form, Input, InputNumber, Row, Space } from 'antd';
import React from 'react';
import DrawerFooter from '../../layouts/DrawerFooter';
import * as Room from '../../stateManagers/states/room';
import * as Participant from '../../stateManagers/states/participant';
import * as PieceLocation from '../../stateManagers/states/pieceLocation';
import ComponentsStateContext from './contexts/RoomComponentsStateContext';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import { create, update, createPrivateMessageDrawerVisibility } from './RoomComponentsState';
import { DrawerProps } from 'antd/lib/drawer';
import { Gutter } from 'antd/lib/grid/row';
import MyAuthContext from '../../contexts/MyAuthContext';
import { __ } from '../../@shared/collection';
import { useWritePrivateMessageMutation } from '../../generated/graphql';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

type Props = {
    roomId: string;
    roomState: Room.State;
}

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 18;

// TODO: playerの場合、characterの情報も一緒に載せたほうがわかりやすい
const CreatePrivateMessageDrawer: React.FC<Props> = ({ roomId, roomState }: Props) => {
    const myAuth = React.useContext(MyAuthContext);
    const componentsState = React.useContext(ComponentsStateContext);
    const visible = componentsState.createPrivateMessageDrawerVisibility;
    const dispatch = React.useContext(DispatchRoomComponentsStateContext);
    const [selectedUserIds, setSelectedUserIds] = React.useState<ReadonlySet<string>>(new Set<string>());
    const [message, setMessage] = React.useState('');
    const [writePrivateMessage] = useWritePrivateMessageMutation();
    const [isPosting, setIsPosting] = React.useState(false);

    if (myAuth == null) {
        return null;
    }

    const selectedParticipants = new Map<string, Participant.State>(); // 存在しないユーザーや自分自身のUserUidは除かれる
    roomState.participants.forEach(participant => {
        if (participant.userUid === myAuth.uid) {
            return;
        }
        if (selectedUserIds.has(participant.userUid)) {
            selectedParticipants.set(participant.userUid, participant);
        }
    });

    const onOkClick = () => {
        if (isPosting) {
            return;
        }
        setIsPosting(true);
        writePrivateMessage({
            variables: {
                roomId,
                visibleTo: [...selectedUserIds],
                text: message,
            }
        }).then(e => {
            setIsPosting(false);
            if (e.data?.result.__typename === 'RoomPrivateMessage') {
                setMessage('');
                setSelectedUserIds(new Set());
                dispatch({ type: createPrivateMessageDrawerVisibility, newValue: false });
            }
        });
    };

    return (
        <Drawer
            {...drawerBaseProps}
            title='プライベートメッセージの作成'
            visible={visible}
            closable
            onClose={() => dispatch({ type: createPrivateMessageDrawerVisibility, newValue: false })}
            footer={(
                <DrawerFooter
                    close={({
                        textType: 'cancel',
                        onClick: () => dispatch({ type: createPrivateMessageDrawerVisibility, newValue: false })
                    })}
                    ok={({ textType: isPosting ? 'loading' : 'create', onClick: onOkClick, disabled: isPosting || message === '' })} />)}>
            <div>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>メッセージ</Col>
                    <Col span={inputSpan}>
                        <Input
                            value={message}
                            onChange={e => setMessage(e.target.value)} />
                    </Col>
                </Row>

                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>対象ユーザー</Col>
                    <Col span={inputSpan}>
                        <div>
                            {__(roomState.participants).map(([, participant]) => {
                                return (
                                    <>
                                        <Checkbox
                                            key={participant.userUid}
                                            disabled={participant.userUid === myAuth.uid}
                                            checked={participant.userUid === myAuth.uid || selectedParticipants.has(participant.userUid)}
                                            onChange={newValue => {
                                                const newSelectedUserIds = new Set(selectedUserIds);
                                                if (newValue.target.checked) {
                                                    newSelectedUserIds.add(participant.userUid);
                                                } else {
                                                    newSelectedUserIds.delete(participant.userUid);
                                                }
                                                setSelectedUserIds(newSelectedUserIds);
                                            }}>
                                            {participant.name}
                                        </Checkbox>
                                        <br key={participant.userUid + '<br>'} />
                                    </>);
                            }).toArray()}
                            {selectedParticipants.size === 0 ? <Alert message="対象ユーザーが自分のみの場合、独り言になります。独り言を使うことで、自分の考えをログに残すことができます。" type="info" showIcon /> : null}
                        </div>
                    </Col>
                </Row>
            </div>
        </Drawer>
    );
};

export default CreatePrivateMessageDrawer;