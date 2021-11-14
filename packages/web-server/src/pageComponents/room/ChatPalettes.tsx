import React from 'react';
import { generateChatPalette } from '@flocon-trpg/core';
import { Select } from 'antd';
import { useBufferValue } from '../../hooks/useBufferValue';
import { useMyCharacters } from '../../hooks/state/useMyCharacters';
import { GameSelector } from '../../components/ChatInput/GameSelector';
import { TextColorSelector } from '../../components/ChatInput/TextColorSelector';
import {
    publicChannel,
    SelectedChannelType,
    SubmitMessage,
} from '../../components/ChatInput/SubmitMessage';
import { Subject } from 'rxjs';
import classNames from 'classnames';
import { flex, flex1, flexColumn, flexNone, flexRow, itemsCenter } from '../../utils/className';
import { ChatPaletteTomlInput } from '../../components/ChatPaletteTomlInput';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { useSetRoomStateWithImmer } from '../../hooks/useSetRoomStateWithImmer';
import { UISelector } from '../../components/UISelector';
import { roomConfigAtom } from '../../atoms/roomConfig/roomConfigAtom';
import { useAtomSelector } from '../../atoms/useAtomSelector';
import { Draft } from 'immer';
import { ChatPalettePanelConfig } from '../../atoms/roomConfig/types/chatPalettePanelConfig';
import { MessagePanelConfig } from '../../atoms/roomConfig/types/messagePanelConfig';
import { useUpdateAtom } from 'jotai/utils';
import { roomPublicMessageInputAtom } from '../../atoms/inputs/roomPublicMessageInputAtom';
import { roomPrivateMessageInputAtom } from '../../atoms/inputs/roomPrivateMessageInputAtom';
import { useImmerUpdateAtom } from '../../atoms/useImmerUpdateAtom';

const titleStyle: React.CSSProperties = {
    flexBasis: '80px',
};

type ChatPaletteListProps = {
    chatPaletteToml: string | null;
    onClick: (text: string) => void;
    onDoubleClick: (text: string) => void;
    isEditMode: boolean;
    onChange: (toml: string) => void;
};

const ChatPaletteList: React.FC<ChatPaletteListProps> = ({
    chatPaletteToml,
    onClick,
    onDoubleClick,
    isEditMode,
    onChange,
}: ChatPaletteListProps) => {
    const { currentValue: bufferedChatPaletteToml } = useBufferValue({
        value: chatPaletteToml,
        bufferDuration: 1000,
    });

    const chatPaletteResult = React.useMemo(
        () =>
            bufferedChatPaletteToml == null ? null : generateChatPalette(bufferedChatPaletteToml),
        [bufferedChatPaletteToml]
    );

    const baseStyle: React.CSSProperties = {
        flex: '1',
        margin: '4px 0',
    };

    if (chatPaletteResult == null) {
        return <div style={baseStyle}>該当するキャラクターが見つかりませんでした</div>;
    }

    if (isEditMode) {
        return (
            <ChatPaletteTomlInput
                style={{ minHeight: 'calc(100% - 32px)' }}
                disableResize
                size='small'
                bufferDuration='default'
                value={chatPaletteToml ?? ''}
                onChange={e => onChange(e.currentValue)}
            />
        );
    }

    if (chatPaletteResult.isError) {
        if (bufferedChatPaletteToml?.trim() === '') {
            return <div style={baseStyle}>チャットパレットが空です。</div>;
        }
        return <div style={baseStyle}>文法エラー: {chatPaletteResult.error}</div>;
    }

    const options = chatPaletteResult.value.map((value, i) => (
        <option
            style={{ backgroundColor: i % 2 === 0 ? undefined : '#FFFFFF10' }}
            key={i}
            value={value}
        >
            {value}
        </option>
    ));

    return (
        <select
            style={{
                ...baseStyle,
                backgroundColor: 'transparent',
                color: 'white',
                borderColor: '#303030',
                outline: 'none',
            }}
            size={10}
            onChange={e => onClick(e.target.value)}
            onDoubleClick={e => onDoubleClick(e.currentTarget.value)}
        >
            {options}
        </select>
    );
};

type ChatPaletteProps = {
    roomId: string;
    panelId: string;
};

export const ChatPalette: React.FC<ChatPaletteProps> = ({ roomId, panelId }: ChatPaletteProps) => {
    const miniInputMaxWidth = 200;

    const setPublicMessageInput = useUpdateAtom(roomPublicMessageInputAtom);
    const setPrivateMessageInput = useUpdateAtom(roomPrivateMessageInputAtom);
    const config = useAtomSelector(
        roomConfigAtom,
        state => state?.panels.chatPalettePanels?.[panelId]
    );
    const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);
    const subject = React.useMemo(() => new Subject<string>(), []);
    const myUserUid = useMyUserUid();
    const myCharacters = useMyCharacters();
    const [selectedChannelType, setSelectedChannelType] =
        React.useState<SelectedChannelType>(publicChannel);
    const [isEditMode, setIsEditMode] = React.useState(false);
    const operateAsStateWithImmer = useSetRoomStateWithImmer();

    const myCharactersOptions = React.useMemo(() => {
        if (myCharacters == null) {
            return [];
        }
        return [...(myCharacters ?? [])]
            .sort(([, x], [, y]) => x.name.localeCompare(y.name))
            .map(([key, value]) => {
                return (
                    <Select.Option key={key} value={key}>
                        {value.name}
                    </Select.Option>
                );
            });
    }, [myCharacters]);

    if (config == null) {
        return null;
    }

    const selectedCharacterStateId = config.selectedCharacterStateId;
    const selectedCharacter =
        selectedCharacterStateId == null ? undefined : myCharacters?.get(selectedCharacterStateId);

    const onConfigUpdate = (
        recipe: (
            draft: Draft<ChatPalettePanelConfig> | Draft<MessagePanelConfig>
        ) => void
    ) => {
        setRoomConfig(roomConfig => {
            if (roomConfig == null) {
                return;
            }
            const chatPalettePanel = roomConfig.panels.chatPalettePanels[panelId];
            if (chatPalettePanel == null) {
                return;
            }
            recipe(chatPalettePanel);
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className={classNames(flexNone, flex, flexRow, itemsCenter)}>
                <div style={titleStyle}>キャラクター</div>
                <Select
                    style={{ flex: 1, maxWidth: miniInputMaxWidth }}
                    placeholder='キャラクター'
                    value={config.selectedCharacterStateId}
                    onSelect={(value, option) => {
                        onConfigUpdate(draft => {
                            if (typeof option.key !== 'string') {
                                return;
                            }
                            draft.selectedCharacterStateId = option.key;
                        });
                    }}
                >
                    {myCharactersOptions}
                </Select>
            </div>
            <GameSelector
                config={config}
                onConfigUpdate={onConfigUpdate}
                titleStyle={titleStyle}
                inputMaxWidth={miniInputMaxWidth}
            />
            <TextColorSelector
                config={config}
                onConfigUpdate={onConfigUpdate}
                titleStyle={titleStyle}
            />
            <UISelector
                style={{ padding: '2px 0' }}
                className={classNames(flex1, flex, flexColumn)}
                keys={[false, true]}
                activeKey={isEditMode}
                getName={key => (key ? '編集' : '通常')}
                onChange={setIsEditMode}
                render={isEditMode => (
                    <ChatPaletteList
                        chatPaletteToml={selectedCharacter?.chatPalette ?? null}
                        onClick={text => {
                            if (selectedChannelType === publicChannel) {
                                setPublicMessageInput(text);
                                return;
                            }
                            setPrivateMessageInput(text)
                        }}
                        onDoubleClick={text => subject.next(text)}
                        isEditMode={isEditMode}
                        onChange={toml => {
                            operateAsStateWithImmer(prevRoom => {
                                if (myUserUid == null || selectedCharacterStateId == null) {
                                    return;
                                }
                                const character =
                                    prevRoom.participants[myUserUid]?.characters?.[
                                        selectedCharacterStateId
                                    ];
                                if (character == null) {
                                    return;
                                }
                                character.chatPalette = toml;
                            });
                        }}
                    />
                )}
            />
            <SubmitMessage
                roomId={roomId}
                selectedChannelType={selectedChannelType}
                onSelectedChannelTypeChange={setSelectedChannelType}
                config={config}
                onConfigUpdate={onConfigUpdate}
                selectedCharacterType='some'
                autoSubmitter={subject}
            />
        </div>
    );
};
