import React from 'react';
import { Button, Input, Select } from 'antd';
import { isPublicChannelKey, Tab } from './RoomMessages';
import { useListAvailableGameSystemsQuery, useWritePrivateMessageMutation, useWritePublicMessageMutation } from '../../generated/graphql';
import { LoadingOutlined } from '@ant-design/icons';
import { $system } from '../../@shared/Constants';
import { useSelector } from '../../store';
import { useDispatch } from 'react-redux';
import roomConfigModule from '../../modules/roomConfigModule';
import * as Character from '../../stateManagers/states/character';
import { ReadonlyStateMap } from '../../@shared/StateMap';
import MyAuthContext from '../../contexts/MyAuthContext';
import * as Participant from '../../stateManagers/states/participant';
import NotificationContext, { graphQLErrors } from './contexts/NotificationContext';
import { apolloError } from '../../hooks/useRoomMessages';

const defaultNameKey = 'defaultNameKey';
const customNameKey = 'customNameKey';
const useCharacterKey = 'useCharacterKey';

type Props = {
    roomId: string;
    style?: Omit<React.CSSProperties, 'alignItems' | 'display' | 'flexDirection'>;
    activeTab?: Tab;
    characters: ReadonlyStateMap<Character.State>;
}

const ChatInput: React.FC<Props> = ({ roomId, style, activeTab, characters }: Props) => {
    const notificationContext = React.useContext(NotificationContext);
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
    const [text, setText] = React.useState('');
    const [customName, setCustomName] = React.useState('');
    const [selectedNameType, setSelectedNameType] = React.useState<string>();
    const [selectedCharacterStateId, setSelectedCharacterStateId] = React.useState<string>();
    const roomConfig = useSelector(state => state.roomConfigModule);
    const dispatch = useDispatch();
    const myCharacters = React.useMemo(() => {
        if (myAuth?.uid == null) {
            return [];
        }
        return characters.toArray().map(([key, character]) => {
            if (key.createdBy === myAuth.uid) {
                return (
                    <Select.Option key={key.id} value={key.id}>
                        {character.name}
                    </Select.Option>
                );
            }
            return null;
        });
    }, [characters, myAuth?.uid]);

    const post = () => {
        if (text === '' || isPosting || activeTab == null) {
            return;
        }
        if (activeTab == null) {
            return;
        }
        if (typeof activeTab === 'string') {
            if (!isPublicChannelKey(activeTab)) {
                return;
            }
            setIsPosting(true);
            writePublicMessage({
                variables: {
                    roomId,
                    channelKey: activeTab,
                    text,
                    gameType: roomConfig?.gameTypeId,
                    characterStateId: selectedNameType === useCharacterKey ? selectedCharacterStateId : undefined,
                    customName: selectedNameType === customNameKey ? customName : undefined,
                }
            }).then(e => {
                setIsPosting(false);
                if (e.data?.result.__typename === 'RoomPublicMessage') {
                    setText('');
                }
            });
            return;
        }
        setIsPosting(true);
        writePrivateMessage({
            variables: {
                roomId,
                text,
                visibleTo: activeTab.toStringArray(),
                characterStateId: selectedCharacterStateId,
            }
        }).then(e => {
            setIsPosting(false);
            if (e.data?.result.__typename === 'WritePrivateRoomMessageFailureResult') {
                setText('');
            }
        });
        return;
    };

    const gameTypes = (availableGameSystems.data?.result.value ?? []).map(x => x).sort((x, y) => x.sortKey.localeCompare(y.sortKey)).map(gameSystem => <Select.Option key={gameSystem.id} value={gameSystem.name}>{gameSystem.name}</Select.Option>);

    return (
        <div style={({ ...style, alignItems: 'stretch', display: 'flex', flexDirection: 'column' })}>
            <div>
                <Select
                    size='small'
                    showSearch
                    style={{ width: 200 }}
                    placeholder="ゲームの種類"
                    optionFilterProp="children"
                    value={roomConfig?.gameTypeName}
                    onSelect={(newValue, option) => {
                        if (typeof option.key !== 'string') {
                            return;
                        }
                        dispatch(roomConfigModule.actions.setGameType({ roomId, gameType: { id: option.key, name: newValue } }));
                    }}
                    filterOption={(input, option) => {
                        const value: unknown = option?.value;
                        if (typeof value !== 'string') {
                            return false;
                        }
                        return value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                    }}>
                    {gameTypes}
                </Select>
            </div>
            <div style={({ flex: 'auto', alignItems: 'center', display: 'flex', flexDirection: 'row' })}>
                <Select
                    style={{ width: 150 }}
                    size='small'
                    placeholder="名前"
                    onSelect={(_, option) => {
                        const key = option.key;
                        if (typeof key !== 'string') {
                            return;
                        }
                        setSelectedNameType(key);
                    }}>
                    <Select.Option key={defaultNameKey} value={defaultNameKey}>
                        キャラクターなし
                    </Select.Option>
                    <Select.Option key={useCharacterKey} value={useCharacterKey}>
                        キャラクターあり
                    </Select.Option>
                    <Select.Option key={customNameKey} value={customNameKey}>
                        カスタム名
                    </Select.Option>
                </Select>
                {selectedNameType === useCharacterKey && <Select
                    style={{ width: 200 }}
                    size='small'
                    showSearch
                    placeholder="キャラクター"
                    optionFilterProp="children"
                    value={(selectedCharacterStateId == null || myAuth == null ? undefined : characters.get({ createdBy: myAuth.uid, id: selectedCharacterStateId })?.name)}
                    onSelect={(_, option) => {
                        const key = option.key;
                        if (typeof key !== 'string') {
                            return;
                        }
                        setSelectedCharacterStateId(key);
                    }}
                    filterOption={(input, option) => {
                        const value = option?.key;
                        if (typeof value !== 'string') {
                            return false;
                        }
                        return value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                    }}>
                    {myCharacters}
                </Select>}
                {selectedNameType === customNameKey && <Input
                    style={{ width: 200 }}
                    size='small'
                    placeholder="カスタム名"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)} />}
            </div>
            <div style={({ flex: 'auto', alignItems: 'center', display: 'flex', flexDirection: 'row' })}>
                <Input
                    size='small'
                    placeholder="メッセージ"
                    disabled={activeTab == null || activeTab === $system}
                    value={activeTab == null || activeTab === $system ? 'このチャンネルには投稿できません。' : text}
                    onChange={e => setText(e.target.value)}
                    onPressEnter={post} />
                <Button
                    size='small'
                    disabled={text === '' || isPosting || activeTab == null || activeTab === $system}
                    onClick={post}>
                    {isPosting ? <LoadingOutlined /> : '投稿'}
                </Button>
            </div>
        </div>);
};

export default ChatInput;