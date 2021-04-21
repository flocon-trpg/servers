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
import { PublicChannelNames } from '../../utils/types';

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
    panelId: string;
} & PublicChannelNames

export const ChatInput: React.FC<Props> = ({
    roomId,
    style,
    characters,
    participants,
    config,
    panelId,
    publicChannel1Name,
    publicChannel2Name,
    publicChannel3Name,
    publicChannel4Name,
    publicChannel5Name,
    publicChannel6Name,
    publicChannel7Name,
    publicChannel8Name,
    publicChannel9Name,
    publicChannel10Name,
}: Props) => {
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
    const [selectedParticipantIds, setSelectedParticipantIds] = React.useState<ReadonlySet<string>>(new Set());
    const [text, setText] = React.useState('');
    const [isDrawerVisible, setIsDrawerVisible] = React.useState(false);
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

    let selectedCharacterType: typeof some | typeof none | typeof custom = none;
    switch (config.selectedCharacterType) {
        case 'some':
        case 'none':
        case 'custom':
            selectedCharacterType = config.selectedCharacterType;
            break;
    }

    let selectedChannelType: typeof publicChannelKey | typeof privateChannelKey | typeof freeChannelKey = freeChannelKey;
    switch (config.selectedChannelType) {
        case publicChannelKey:
        case privateChannelKey:
        case freeChannelKey:
            selectedChannelType = config.selectedChannelType;
    }

    let selectedPublicChannel: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' = '1';
    switch (config.selectedPublicChannelKey) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        case '10':
            selectedPublicChannel = config.selectedPublicChannelKey;
            break;
    }

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
            customNameVariable = config.customCharacterName;
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
                    <Select
                        style={{ flex: 1, maxWidth: miniInputMaxWidth }}
                        value={selectedChannelType}
                        onSelect={newValue => dispatch(roomConfigModule.actions.updateMessagePanel({ roomId, panelId, panel: { selectedChannelType: newValue } }))}>
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
                            dispatch(roomConfigModule.actions.updateMessagePanel({ roomId, panelId, panel: { selectedPublicChannelKey: option.key } }));
                        }}>
                        <Select.Option key='1' value='1'>
                            {publicChannel1Name}
                        </Select.Option>
                        <Select.Option key='2' value='2'>
                            {publicChannel2Name}
                        </Select.Option>
                        <Select.Option key='3' value='3'>
                            {publicChannel3Name}
                        </Select.Option>
                        <Select.Option key='4' value='4'>
                            {publicChannel4Name}
                        </Select.Option>
                        <Select.Option key='5' value='5'>
                            {publicChannel5Name}
                        </Select.Option>
                        <Select.Option key='6' value='6'>
                            {publicChannel6Name}
                        </Select.Option>
                        <Select.Option key='7' value='7'>
                            {publicChannel7Name}
                        </Select.Option>
                        <Select.Option key='8' value='8'>
                            {publicChannel8Name}
                        </Select.Option>
                        <Select.Option key='9' value='9'>
                            {publicChannel9Name}
                        </Select.Option>
                        <Select.Option key='10' value='10'>
                            {publicChannel10Name}
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
                    <Select
                        style={{ flex: 1, maxWidth: miniInputMaxWidth }}
                        value={selectedCharacterType}
                        onSelect={newValue => dispatch(roomConfigModule.actions.updateMessagePanel({ roomId, panelId, panel: { selectedCharacterType: newValue } }))}>
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
                            dispatch(roomConfigModule.actions.updateMessagePanel({
                                roomId,
                                panelId,
                                panel: {
                                    selectedCharacterStateId: option.key,
                                }
                            }));
                        }}>
                        {myCharacters}
                    </Select>}
                    {selectedCharacterType === custom && <Input style={{ flex: 1, maxWidth: miniInputMaxWidth }} placeholder='名前' value={config.customCharacterName} onChange={e => dispatch(roomConfigModule.actions.updateMessagePanel({ roomId, panelId, panel: { customCharacterName: e.target.value } }))} />}
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
                        value={config.selectedGameSystem}
                        onSelect={(value, option) => {
                            if (typeof option.key !== 'string') {
                                return;
                            }
                            dispatch(roomConfigModule.actions.updateMessagePanel({ roomId, panelId, panel: { selectedGameSystem: option.key } }));
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