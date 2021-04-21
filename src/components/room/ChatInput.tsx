import React from 'react';
import { Button, Col, Drawer, Input, Select, Row, Checkbox, Alert } from 'antd';
import { isPublicChannelKey } from './RoomMessages';
import { useListAvailableGameSystemsQuery, useWritePrivateMessageMutation, useWritePublicMessageMutation } from '../../generated/graphql';
import { $free, $system } from '../../@shared/Constants';
import { useSelector } from '../../store';
import { useDispatch } from 'react-redux';
import roomConfigModule from '../../modules/roomConfigModule';
import { ReadonlyStateMap } from '../../@shared/StateMap';
import MyAuthContext from '../../contexts/MyAuthContext';
import LogNotificationContext from './contexts/LogNotificationContext';
import { apolloError } from '../../hooks/useRoomMessages';
import { Character } from '../../stateManagers/states/character';
import { getUserUid } from '../../hooks/useFirebaseUser';
import { MessagePanelConfig } from '../../states/MessagesPanelConfig';
import * as Icon from '@ant-design/icons';
import { Participant } from '../../stateManagers/states/participant';
import { Gutter } from 'antd/lib/grid/row';
import DrawerFooter from '../../layouts/DrawerFooter';
import { __ } from '../../@shared/collection';

type PrivateMessageDrawerProps = {
    visible: boolean;
    participants: ReadonlyMap<string, Participant.State>;
    selectedParticipants: ReadonlySet<string>;
    onChange: (selectedParticipants: ReadonlySet<string>) => void;
    onClose: () => void;
}

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 18;

// TODO: playerの場合、characterの情報も一緒に載せたほうがわかりやすい
const PrivateMessageDrawer: React.FC<PrivateMessageDrawerProps> = ({ visible, participants, selectedParticipants, onChange, onClose }: PrivateMessageDrawerProps) => {
    const myAuth = React.useContext(MyAuthContext);

    const myUserUid = getUserUid(myAuth);
    if (myUserUid == null) {
        return null;
    }

    return (
        <Drawer
            className='cancel-rnd'
            width={600}
            title='秘話の送信先'
            visible={visible}
            closable
            onClose={() => onClose()}
            footer={(
                <DrawerFooter
                    close={({
                        textType: 'close',
                        onClick: () => onClose()
                    })} />)}>
            <div>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>送信先</Col>
                    <Col span={inputSpan}>
                        <div>
                            {participants.size <= 1 ? '(自分以外の入室者がいません)' : [...participants]
                                .filter(([userUid]) => getUserUid(myAuth) !== userUid)
                                .sort(([, x], [, y]) => x.name.localeCompare(y.name))
                                .map(([userUid, participant]) => {
                                    return (
                                        <React.Fragment key={userUid}>
                                            <Checkbox
                                                checked={selectedParticipants.has(userUid)}
                                                onChange={newValue => {
                                                    const newSelectedParticipants = new Set(selectedParticipants);
                                                    if (newValue.target.checked) {
                                                        newSelectedParticipants.add(userUid);
                                                    } else {
                                                        newSelectedParticipants.delete(userUid);
                                                    }
                                                    onChange(newSelectedParticipants);
                                                }}>
                                                {participant.name}
                                            </Checkbox>
                                            <br />
                                        </React.Fragment>);
                                })}
                        </div>
                    </Col>
                </Row>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col span={inputSpan}>
                        {selectedParticipants.size === 0 ? <Alert message="送信先のユーザーが選択されていないため、独り言になります。独り言を使うことで、自分の考えをログに残すことができます。" type="info" showIcon /> : null}
                    </Col>
                </Row>
            </div>
        </Drawer>
    );
};

const publicChannelKey = '0';
const freeChannelKey = '1';
const privateChannelKey = '2';

const titleStyle: React.CSSProperties = {
    flexBasis: '80px',
};

const none = 'none';
const some = 'some';
const custom = 'custom';

type Props = {
    roomId: string;
    style?: Omit<React.CSSProperties, 'alignItems' | 'display' | 'flexDirection'>;
    characters: ReadonlyStateMap<Character.State>;
    participants: ReadonlyMap<string, Participant.State>;
    config: MessagePanelConfig;
}

export const ChatInput: React.FC<Props> = ({ roomId, style, characters, participants, config }: Props) => {
    const miniInputMaxWidth = 200;

    const notificationContext = React.useContext(LogNotificationContext);
    const availableGameSystems = useListAvailableGameSystemsQuery();
    React.useEffect(() => {
        if (availableGameSystems.error == null) {
            return;
        }
        notificationContext({
            type: apolloError,
            error: availableGameSystems.error,
            createdAt: new Date().getTime(),
        });
    }, [availableGameSystems.error, notificationContext]);
    const myAuth = React.useContext(MyAuthContext);
    const [writePublicMessage] = useWritePublicMessageMutation();
    const [writePrivateMessage] = useWritePrivateMessageMutation();
    const [isPosting, setIsPosting] = React.useState(false); // 現状、チャンネルごとに並列的に投稿することはできないが、この制限はstateを増やすなどにより取り除くことができる。
    const [selectedChannelType, setSelectedChannelType] = React.useState<typeof freeChannelKey | typeof publicChannelKey | typeof privateChannelKey>(freeChannelKey);
    const [selectedCharacterType, setSelectedCharacterType] = React.useState<typeof none | typeof some | typeof custom>(none);
    const [selectedPublicChannel, setSelectedPublicChannel] = React.useState<'1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'>('1');
    const [selectedParticipantIds, setSelectedParticipantIds] = React.useState<ReadonlySet<string>>(new Set());
    const [text, setText] = React.useState('');
    const [customName, setCustomName] = React.useState('');
    const [isDrawerVisible, setIsDrawerVisible] = React.useState(false);
    const roomConfig = useSelector(state => state.roomConfigModule);
    const dispatch = useDispatch();

    const myUserUid = getUserUid(myAuth);

    const selectedParticipants = React.useMemo(() =>
        __(selectedParticipantIds)
            .compact(id => {
                const found = participants.get(id);
                if (found == null) {
                    return null;
                }
                return [id, found] as const;
            })
            .toArray()
            .sort(([, x], [, y]) => x.name.localeCompare(y.name))
            .map(([id, participant]) => {
                return (<div key={id} style={{ maxWidth: '60px' }}>
                    {participant.name}
                </div>);
            }),
    [selectedParticipantIds, participants]);

    const myCharacters = React.useMemo(() => {
        if (myUserUid == null) {
            return [];
        }
        return characters.toArray().sort(([, x], [, y]) => x.name.localeCompare(y.name)).map(([key, character]) => {
            if (key.createdBy === myUserUid) {
                return (
                    <Select.Option key={key.id} value={key.id}>
                        {character.name}
                    </Select.Option>
                );
            }
            return null;
        });
    }, [characters, myUserUid]);

    const onPost = () => {
        if (isPosting || text.trim() === '') {
            return;
        }
        let characterStateId: string | undefined;
        if (selectedCharacterType === some) {
            characterStateId = config.selectedCharacterStateId;
        } else {
            characterStateId = undefined;
        }
        let customNameVariable: string | undefined;
        if (selectedCharacterType === custom) {
            customNameVariable = customName;
        } else {
            customNameVariable = undefined;
        }
        switch (selectedChannelType) {
            case privateChannelKey: {
                setIsPosting(true);
                writePrivateMessage({
                    variables: {
                        roomId,
                        text,
                        visibleTo: [...selectedParticipantIds],
                        characterStateId,
                        customName: customNameVariable
                    }
                })
                    .then(() => setText(''))
                    .finally(() => setIsPosting(false));
                break;
            }
            case publicChannelKey: {
                setIsPosting(true);
                writePublicMessage({
                    variables: {
                        roomId,
                        text,
                        channelKey: selectedPublicChannel,
                        characterStateId,
                        customName: customNameVariable,
                    }
                })
                    .then(() => setText(''))
                    .finally(() => setIsPosting(false));
                break;
            }
            case freeChannelKey: {
                setIsPosting(true);
                writePublicMessage({
                    variables: {
                        roomId,
                        text,
                        channelKey: $free,
                        characterStateId,
                        customName: customNameVariable,
                    },
                })
                    .then(() => setText(''))
                    .finally(() => setIsPosting(false));
                break;
            }
        }
    };

    return (
        <>
            <PrivateMessageDrawer
                participants={participants}
                visible={isDrawerVisible}
                onClose={() => setIsDrawerVisible(false)}
                selectedParticipants={selectedParticipantIds}
                onChange={x => setSelectedParticipantIds(x)} />
            <div style={{ ...style, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={titleStyle}>
                        送信先
                    </div>
                    <Select style={{ flex: 1, maxWidth: miniInputMaxWidth }} value={selectedChannelType} onSelect={newValue => setSelectedChannelType(newValue)}>
                        <Select.Option value={publicChannelKey}>
                            メイン
                        </Select.Option>
                        <Select.Option value={freeChannelKey}>
                            雑談
                        </Select.Option>
                        <Select.Option value={privateChannelKey}>
                            秘話
                        </Select.Option>
                    </Select>
                    {selectedChannelType !== freeChannelKey && <div style={{ flex: '0 0 auto', margin: '3px 0' }}><Icon.RightOutlined /></div>}
                    {selectedChannelType === publicChannelKey && <Select
                        style={{ flex: 1, maxWidth: miniInputMaxWidth }}
                        value={selectedPublicChannel}
                        onSelect={(value, option) => {
                            if (!isPublicChannelKey(option.key)) {
                                return;
                            }
                            if (option.key === $free || option.key === $system) {
                                return;
                            }
                            setSelectedPublicChannel(option.key);
                        }}>
                        <Select.Option key='1' value='1'>
                            1
                        </Select.Option>
                        <Select.Option key='2' value='2'>
                            2
                        </Select.Option>
                        <Select.Option key='3' value='3'>
                            3
                        </Select.Option>
                        <Select.Option key='4' value='4'>
                            4
                        </Select.Option>
                        <Select.Option key='5' value='5'>
                            5
                        </Select.Option>
                        <Select.Option key='6' value='6'>
                            6
                        </Select.Option>
                        <Select.Option key='7' value='7'>
                            7
                        </Select.Option>
                        <Select.Option key='8' value='8'>
                            8
                        </Select.Option>
                        <Select.Option key='9' value='9'>
                            9
                        </Select.Option>
                        <Select.Option key='10' value='10'>
                            10
                        </Select.Option>
                    </Select>}
                    {selectedChannelType === privateChannelKey && <>
                        <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'row' }}>
                            {selectedParticipants.length === 0 ? '(自分のみ)' : selectedParticipants}
                        </div>
                        <Button style={{ flex: '0 0 auto' }} onClick={() => setIsDrawerVisible(true)}>編集</Button>
                    </>}
                    <div style={{ flex: 1 }} />
                </div >
                <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={titleStyle}>
                        キャラクター
                    </div>
                    <Select style={{ flex: 1, maxWidth: miniInputMaxWidth }} value={selectedCharacterType} onSelect={newValue => setSelectedCharacterType(newValue)}>
                        <Select.Option value={none}>
                            なし
                        </Select.Option>
                        <Select.Option value={some}>
                            あり
                        </Select.Option>
                        <Select.Option value={custom}>
                            カスタム
                        </Select.Option>
                    </Select>
                    {selectedCharacterType === none ? <div style={{ flex: 1 }} /> : <div style={{ flex: '0 0 auto', margin: '3px 0' }}><Icon.RightOutlined /></div>}
                    {selectedCharacterType === some && <Select
                        style={{ flex: 1, maxWidth: miniInputMaxWidth }}
                        placeholder='キャラクター'
                        value={config.selectedCharacterStateId}
                        onSelect={(value, option) => {
                            if (typeof option.key !== 'string') {
                                return;
                            }
                            dispatch(roomConfigModule.actions.setOtherValues({
                                roomId,
                                chatSelectedCharacterStateId: option.key,
                            }));
                        }}>
                        {myCharacters}
                    </Select>}
                    {selectedCharacterType === custom && <Input style={{ flex: 1, maxWidth: miniInputMaxWidth }} placeholder='名前' value={customName} onChange={e => setCustomName(e.target.value)} />}
                    <div style={{ flex: 1 }} />
                </div>
                <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={titleStyle}>
                        ダイス
                    </div>
                    <Select
                        style={{ flex: 1, maxWidth: miniInputMaxWidth }}
                        placeholder='ゲームの種類'
                        showSearch
                        value={roomConfig?.chatGameSystemId}
                        onSelect={(value, option) => {
                            if (typeof option.key !== 'string') {
                                return;
                            }
                            dispatch(roomConfigModule.actions.setOtherValues({ roomId, chatGameSystemId: option.key }));
                        }}
                        filterOption={(input, option) => {
                            const value: unknown = option?.value;
                            if (typeof value !== 'string') {
                                return false;
                            }
                            return value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                        }}>
                        {[...availableGameSystems.data?.result.value ?? []].sort((x, y) => x.sortKey.localeCompare(y.sortKey)).map(gs => {
                            return (<Select.Option key={gs.id} value={gs.id}>{gs.name}</Select.Option>);
                        })}
                    </Select>
                    <div style={{ flex: 1 }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Input disabled={isPosting} value={text} onChange={e => setText(e.target.value)} onPressEnter={() => onPost()} />
                    <Button
                        style={{ width: 80 }}
                        disabled={isPosting || text.trim() === ''}
                        onClick={() => onPost()}>
                        {isPosting ? <Icon.LoadingOutlined /> : '投稿'}
                    </Button>
                </div>
            </div>
        </>);
};

export default ChatInput;