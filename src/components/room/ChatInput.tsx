import React from 'react';
import { Button, Input, Select } from 'antd';
import { isPublicChannelKey, Tab } from './RoomMessages';
import { useWritePrivateMessageMutation, useWritePublicMessageMutation } from '../../generated/graphql';
import { LoadingOutlined } from '@ant-design/icons';
import { $system } from '../../@shared/Constants';
import { useSelector } from '../../store';
import { allGameTypes } from '../../@shared/bcdice';
import { useDispatch } from 'react-redux';
import roomConfigModule from '../../modules/roomConfigModule';
import * as Character from '../../stateManagers/states/character';
import { ReadonlyStateMap } from '../../@shared/StateMap';
import MyAuthContext from '../../contexts/MyAuthContext';

const noCharacterKey = '';

type Props = {
    roomId: string;
    style?: Omit<React.CSSProperties, 'alignItems' | 'display' | 'flexDirection'>;
    activeTab?: Tab;
    characters: ReadonlyStateMap<Character.State>;
}

const ChatInput: React.FC<Props> = ({ roomId, style, activeTab, characters }: Props) => {
    const myAuth = React.useContext(MyAuthContext);
    const [writePublicMessage] = useWritePublicMessageMutation();
    const [writePrivateMessage] = useWritePrivateMessageMutation();
    const [isPosting, setIsPosting] = React.useState(false); // 現状、チャンネルに関わらず並行して投稿することはできないが、この制限はstateを増やすなどにより取り除くことができる。
    const [text, setText] = React.useState('');
    const [selectedCharacterStateId, setSelectedCharacterStateId] = React.useState<string>();
    const roomConfig = useSelector(state => state.roomConfigModule);
    const dispatch = useDispatch();
    const myCharacters = React.useMemo(() => {
        const noCharacterElement = (
            <Select.Option key={noCharacterKey} value={noCharacterKey}>
                (キャラクターなし)
            </Select.Option>);
        if (myAuth?.uid == null) {
            return [noCharacterElement];
        }
        const result: (JSX.Element)[] = [noCharacterElement];
        characters.forEach((character, key) => {
            if (key.createdBy === myAuth.uid) {
                result.push(
                    <Select.Option key={key.id} value={key.id}>
                        {character.name}
                    </Select.Option>);
            }
        });
        return result;
    }, [characters, myAuth?.uid]);

    const onClick = () => {
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
                    gameType: roomConfig?.gameType,
                    characterStateId: selectedCharacterStateId,
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

    const gameTypes = allGameTypes.map(gameType => <Select.Option key={gameType} value={gameType}>{gameType}</Select.Option>);

    return (
        <div style={({ ...style, alignItems: 'stretch', display: 'flex', flexDirection: 'column' })}>
            <div style={({ flex: 'auto', alignItems: 'center', display: 'flex', flexDirection: 'row' })}>
                <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder="キャラクター"
                    optionFilterProp="children"
                    value={(selectedCharacterStateId == null || myAuth == null ? undefined : characters.get({ createdBy: myAuth.uid, id: selectedCharacterStateId })?.name)}
                    onSelect={(_, option) => {
                        const key = option.key;
                        if (typeof key !== 'string') {
                            return;
                        }
                        if (key === noCharacterKey) {
                            setSelectedCharacterStateId(undefined);
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
                </Select>
                <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder="ゲームの種類"
                    optionFilterProp="children"
                    value={roomConfig?.gameType}
                    onSelect={newValue => dispatch(roomConfigModule.actions.setGameType({ roomId, gameType: newValue }))}
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
                <Input
                    placeholder="メッセージ"
                    disabled={activeTab == null || activeTab === $system}
                    value={activeTab == null || activeTab === $system ? 'このチャンネルには投稿できません。' : text}
                    onChange={e => setText(e.target.value)}
                    onPressEnter={onClick} />
                <Button
                    disabled={text === '' || isPosting || activeTab == null || activeTab === $system}
                    onClick={onClick}>
                    {isPosting ? <LoadingOutlined /> : '投稿'}
                </Button>
            </div>
        </div>);
};

export default ChatInput;