/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { Button, Col, Drawer, Input, Select, Row, Checkbox, Alert, Popover } from 'antd';
import { useListAvailableGameSystemsQuery, useWritePrivateMessageMutation, useWritePublicMessageMutation } from '../../generated/graphql';
import { useDispatch } from 'react-redux';
import roomConfigModule from '../../modules/roomConfigModule';
import MyAuthContext from '../../contexts/MyAuthContext';
import { apolloError } from '../../hooks/useRoomMessages';
import { getUserUid } from '../../hooks/useFirebaseUser';
import { MessagePanelConfig } from '../../states/MessagesPanelConfig';
import * as Icon from '@ant-design/icons';
import { Gutter } from 'antd/lib/grid/row';
import DrawerFooter from '../../layouts/DrawerFooter';
import { reset } from '../../utils/types';
import { SketchPicker } from 'react-color';
import classNames from 'classnames';
import { VisibleTo } from '../../utils/visibleTo';
import { UseRoomMessageInputTextsResult } from '../../hooks/useRoomMessageInputTexts';
import roomModule from '../../modules/roomModule';
import { useSelector } from '../../store';
import { usePublicChannelNames } from '../../hooks/state/usePublicChannelNames';
import { $free, isStrIndex10, PublicChannelKey, recordToArray, __ } from '@kizahasi/util';

type PrivateMessageDrawerProps = {
    visible: boolean;
    selectedParticipants: ReadonlySet<string>;
    onChange: (selectedParticipants: ReadonlySet<string>) => void;
    onClose: () => void;
}

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 18;

// TODO: playerの場合、characterの情報も一緒に載せたほうがわかりやすい
const PrivateMessageDrawer: React.FC<PrivateMessageDrawerProps> = ({ visible, selectedParticipants, onChange, onClose }: PrivateMessageDrawerProps) => {
    const myAuth = React.useContext(MyAuthContext);
    const participants = useSelector(state => state.roomModule.roomState?.state?.participants);

    const myUserUid = getUserUid(myAuth);
    if (myUserUid == null || participants == null) {
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
                            {recordToArray(participants.size).length <= 1 ? '(自分以外の入室者がいません)' : recordToArray(participants)
                                .filter(pair => getUserUid(myAuth) !== pair.key)
                                .sort((x, y) => x.value.name.localeCompare(y.value.name))
                                .map(pair => {
                                    return (
                                        <React.Fragment key={pair.key}>
                                            <Checkbox
                                                checked={selectedParticipants.has(pair.key)}
                                                onChange={newValue => {
                                                    const newSelectedParticipants = new Set(selectedParticipants);
                                                    if (newValue.target.checked) {
                                                        newSelectedParticipants.add(pair.key);
                                                    } else {
                                                        newSelectedParticipants.delete(pair.key);
                                                    }
                                                    onChange(newSelectedParticipants);
                                                }}>
                                                {pair.value.name}
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
    config: MessagePanelConfig;
    panelId: string;

    // メッセージ書き込み中通知機能を実現するため、*MessageTextは全てのChatInputで共通にしている。そのため、ChatInput内部でuseStateせず、外部でuseStateしたものを受け取る形にしている。
    useRoomMessageInputTextsResult: UseRoomMessageInputTextsResult;
}

export const ChatInput: React.FC<Props> = ({
    roomId,
    style,
    config,
    panelId,
    useRoomMessageInputTextsResult,
}: Props) => {
    const miniInputMaxWidth = 200;

    const dispatch = useDispatch();
    const participants = useSelector(state => state.roomModule.roomState?.state?.participants);
    const publicChannelNames = usePublicChannelNames();
    const availableGameSystems = useListAvailableGameSystemsQuery();
    React.useEffect(() => {
        if (availableGameSystems.error == null) {
            return;
        }
        dispatch(roomModule.actions.addNotification({
            type: apolloError,
            error: availableGameSystems.error,
            createdAt: new Date().getTime(),
        }));
    }, [availableGameSystems.error, dispatch]);
    const myAuth = React.useContext(MyAuthContext);
    const [writePublicMessage] = useWritePublicMessageMutation();
    const [writePrivateMessage] = useWritePrivateMessageMutation();
    const [isPosting, setIsPosting] = React.useState(false); // 現状、チャンネルごとに並列的に投稿することはできないが、この制限はstateを増やすなどにより取り除くことができる。
    const [selectedParticipantIds, setSelectedParticipantIds] = React.useState<ReadonlySet<string>>(new Set());

    const [isDrawerVisible, setIsDrawerVisible] = React.useState(false);

    const myUserUid = getUserUid(myAuth);
    const selectedParticipantsBase = React.useMemo(() =>
        __(selectedParticipantIds)
            .compact(id => {
                const found = (participants ?? {})[id];
                if (found == null) {
                    return null;
                }
                return [id, found] as const;
            })
            .toArray()
            .sort(([, x], [, y]) => x.name.localeCompare(y.name)), [selectedParticipantIds, participants]);
    const selectedParticipants = React.useMemo(() =>
        selectedParticipantsBase.map(([, participant]) => participant.name), [selectedParticipantsBase]);
    const selectedParticipantElements = React.useMemo(() =>
        selectedParticipantsBase
            .map(([id, participant]) => {
                return (<div key={id} style={{ maxWidth: '60px' }}>
                    {participant.name}
                </div>);
            }), [selectedParticipantsBase]);

    const characters = React.useMemo(() => {
        return __(recordToArray(participants ?? {}))
            .flatMap(participantPair =>
                recordToArray(participantPair.value.characters)
                    .map(characterPair => ({ key: { createdBy: participantPair.key, id: characterPair.key }, value: characterPair.value })))
            .toArray();
    }, [participants]);

    const myCharacters = React.useMemo(() => {
        if (myUserUid == null || characters == null) {
            return [];
        }
        return characters.sort((x, y) => x.value.name.localeCompare(y.value.name)).map(pair => {
            if (pair.key.createdBy === myUserUid) {
                return (
                    <Select.Option key={pair.key.id} value={pair.key.id}>
                        {pair.value.name}
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

    let postTo: PublicChannelKey.Without$System.PublicChannelKey | ReadonlySet<string>;
    let placeholder: string;
    switch (selectedChannelType) {
        case freeChannelKey:
            postTo = $free;
            placeholder = '雑談へ投稿';
            break;
        case publicChannelKey:
            postTo = selectedPublicChannel;
            placeholder = `${publicChannelNames == null ? '?' : publicChannelNames[`publicChannel${selectedPublicChannel}Name` as const]}へ投稿`;
            break;
        case privateChannelKey:
            postTo = selectedParticipantIds;
            placeholder = `秘話 (${selectedParticipants.length === 0 ? '自分のみ' : selectedParticipants.reduce((seed, elem, i) => {
                if (i === 0) {
                    return elem;
                }
                return `${seed}, ${elem}`;
            }, '')}) へ投稿`;
            break;
    }

    const getText = (postTo: PublicChannelKey.Without$System.PublicChannelKey | ReadonlySet<string>): string => {
        if (PublicChannelKey.Without$System.isPublicChannelKey(postTo)) {
            return useRoomMessageInputTextsResult.publicMessageInputTexts.get(postTo) ?? '';
        } else {
            return useRoomMessageInputTextsResult.privateMessageInputTexts.get(VisibleTo.toString(postTo)) ?? '';
        }
    };

    // postToは、ReadonlySet<string>のときは秘話を表す
    const onPost = (postTo: PublicChannelKey.Without$System.PublicChannelKey | ReadonlySet<string>) => {
        const text = getText(postTo);
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
                        textColor: config.selectedTextColor,
                        visibleTo: [...selectedParticipantIds],
                        characterStateId,
                        customName: customNameVariable,
                        gameType: config.selectedGameSystem,
                    }
                })
                    .then(() => useRoomMessageInputTextsResult.setPrivateMessageInputText(undefined, selectedParticipantIds))
                    .finally(() => setIsPosting(false));
                break;
            }
            case publicChannelKey: {
                setIsPosting(true);
                writePublicMessage({
                    variables: {
                        roomId,
                        text,
                        textColor: config.selectedTextColor,
                        channelKey: selectedPublicChannel,
                        characterStateId,
                        customName: customNameVariable,
                        gameType: config.selectedGameSystem,
                    }
                })
                    .then(() => {
                        if (!PublicChannelKey.Without$System.isPublicChannelKey(postTo)) {
                            return;
                        }
                        useRoomMessageInputTextsResult.setPublicMessageInputText(undefined, postTo);
                    })
                    .finally(() => setIsPosting(false));
                break;
            }
            case freeChannelKey: {
                setIsPosting(true);
                writePublicMessage({
                    variables: {
                        roomId,
                        text,
                        textColor: config.selectedTextColor,
                        channelKey: $free,
                        characterStateId,
                        customName: customNameVariable,
                        gameType: config.selectedGameSystem,
                    },
                })
                    .then(() => {
                        if (!PublicChannelKey.Without$System.isPublicChannelKey(postTo)) {
                            return;
                        }
                        useRoomMessageInputTextsResult.setPublicMessageInputText(undefined, postTo);
                    })
                    .finally(() => setIsPosting(false));
                break;
            }
        }
    };

    return (
        <>
            <PrivateMessageDrawer
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
                            if (typeof option.key !== 'string' || !isStrIndex10(option.key)) {
                                return;
                            }
                            dispatch(roomConfigModule.actions.updateMessagePanel({ roomId, panelId, panel: { selectedPublicChannelKey: option.key } }));
                        }}>
                        <Select.Option key='1' value='1'>
                            {publicChannelNames?.publicChannel1Name}
                        </Select.Option>
                        <Select.Option key='2' value='2'>
                            {publicChannelNames?.publicChannel2Name}
                        </Select.Option>
                        <Select.Option key='3' value='3'>
                            {publicChannelNames?.publicChannel3Name}
                        </Select.Option>
                        <Select.Option key='4' value='4'>
                            {publicChannelNames?.publicChannel4Name}
                        </Select.Option>
                        <Select.Option key='5' value='5'>
                            {publicChannelNames?.publicChannel5Name}
                        </Select.Option>
                        <Select.Option key='6' value='6'>
                            {publicChannelNames?.publicChannel6Name}
                        </Select.Option>
                        <Select.Option key='7' value='7'>
                            {publicChannelNames?.publicChannel7Name}
                        </Select.Option>
                        <Select.Option key='8' value='8'>
                            {publicChannelNames?.publicChannel8Name}
                        </Select.Option>
                        <Select.Option key='9' value='9'>
                            {publicChannelNames?.publicChannel9Name}
                        </Select.Option>
                        <Select.Option key='10' value='10'>
                            {publicChannelNames?.publicChannel10Name}
                        </Select.Option>
                    </Select>}
                    {selectedChannelType === privateChannelKey && <>
                        <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'row' }}>
                            {selectedParticipantElements.length === 0 ? '(自分のみ)' : selectedParticipantElements}
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
                <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={titleStyle}>
                        文字色
                    </div>
                    <Popover
                        trigger='click'
                        content={<SketchPicker
                            className={classNames('cancel-rnd')}
                            css={css`color: black`}
                            disableAlpha
                            color={config.selectedTextColor == null ? '#000000' : config.selectedTextColor}
                            onChange={e => dispatch(roomConfigModule.actions.updateMessagePanel({ roomId, panelId, panel: { selectedTextColor: e.hex } }))}
                            presetColors={['#F26262', '#F2A962', '#F1F262', '#AAF262', '#63F262', '#62F2AB', '#62F2F2', '#62ABF2', '#6362F2', '#AA62F2', '#F162F2', '#F262A9', '#9D9D9D']} />}>
                        <Button style={{ color: config.selectedTextColor, width: 80, margin: '4px 4px 4px 0' }} type='dashed' size='small' >{config.selectedTextColor?.toUpperCase() ?? 'デフォルト'}</Button>
                    </Popover>
                    <Button
                        size='small'
                        onClick={() => dispatch(roomConfigModule.actions.updateMessagePanel({ roomId, panelId, panel: { selectedTextColor: { type: reset } } }))}>リセット</Button>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Input
                        disabled={isPosting}
                        value={(PublicChannelKey.Without$System.isPublicChannelKey(postTo) ? useRoomMessageInputTextsResult.publicMessageInputTexts.get(postTo) : useRoomMessageInputTextsResult.privateMessageInputTexts.get(VisibleTo.toString(postTo))) ?? ''}
                        placeholder={placeholder}
                        onChange={e => {
                            if (PublicChannelKey.Without$System.isPublicChannelKey(postTo)) {
                                const $postTo = postTo;
                                useRoomMessageInputTextsResult.setPublicMessageInputText(e.target.value, $postTo);
                                return;
                            }
                            const $postTo = postTo;
                            useRoomMessageInputTextsResult.setPrivateMessageInputText(e.target.value, $postTo);
                            return;
                        }}
                        onPressEnter={() => onPost(postTo)} />
                    <Button
                        style={{ width: 80 }}
                        disabled={isPosting || getText(postTo).trim() === ''}
                        onClick={() => onPost(postTo)}>
                        {isPosting ? <Icon.LoadingOutlined /> : '投稿'}
                    </Button>
                </div>
            </div>
        </>);
};

export default ChatInput;