import React from 'react';
import { Select } from 'antd';
import { useBufferValue } from '../../../../hooks/useBufferValue';
import { useMyCharacters } from '../../../../hooks/state/useMyCharacters';
import { GameSelector } from '../message/ChatInput/GameSelector';
import { TextColorSelector } from '../message/ChatInput/TextColorSelector';
import {
    publicChannel,
    SelectedChannelType,
    SubmitMessage,
} from '../message/ChatInput/SubmitMessage';
import { Subject } from 'rxjs';
import classNames from 'classnames';
import {
    flex,
    flex1,
    flexColumn,
    flexNone,
    flexRow,
    itemsCenter,
} from '../../../../utils/className';
import { useSetRoomStateWithImmer } from '../../../../hooks/useSetRoomStateWithImmer';
import { UISelector } from '../../../ui/UISelector';
import { roomConfigAtom } from '../../../../atoms/roomConfig/roomConfigAtom';
import { useAtomSelector } from '../../../../atoms/useAtomSelector';
import { Draft } from 'immer';
import { ChatPalettePanelConfig } from '../../../../atoms/roomConfig/types/chatPalettePanelConfig';
import { MessagePanelConfig } from '../../../../atoms/roomConfig/types/messagePanelConfig';
import { useUpdateAtom } from 'jotai/utils';
import { roomPublicMessageInputAtom } from '../../../../atoms/inputs/roomPublicMessageInputAtom';
import { roomPrivateMessageInputAtom } from '../../../../atoms/inputs/roomPrivateMessageInputAtom';
import { useImmerUpdateAtom } from '../../../../atoms/useImmerUpdateAtom';
import { BufferedTextArea } from '../../../ui/BufferedTextArea';
import { CharacterVarInput } from './CharacterVarInput';

const descriptionStyle: React.CSSProperties = {
    flexBasis: '80px',
};

type ChatPaletteListProps = {
    chatPaletteText: string | null;
    onClick: (text: string) => void;
    onDoubleClick: (text: string) => void;
    isEditMode: boolean;
    onChange: (toml: string) => void;
};

const ChatPaletteList: React.FC<ChatPaletteListProps> = ({
    chatPaletteText,
    onClick,
    onDoubleClick,
    isEditMode,
    onChange,
}: ChatPaletteListProps) => {
    const { currentValue: bufferedChatPaletteText } = useBufferValue({
        value: chatPaletteText,
        bufferDuration: 1000,
    });

    const chatPaletteResult = React.useMemo(
        () =>
            bufferedChatPaletteText == null
                ? null
                : bufferedChatPaletteText.replace(/(\r\n|\r)/g, '\n').split('\n'),
        [bufferedChatPaletteText]
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
            <BufferedTextArea
                style={{ minHeight: 'calc(100% - 32px)' }}
                disableResize
                size='small'
                bufferDuration='default'
                value={chatPaletteText ?? ''}
                onChange={e => onChange(e.currentValue)}
                spellCheck={false}
            />
        );
    }

    const options = chatPaletteResult.map((value, i) => (
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

const nonEditKey = 'nonEdit';
const editKey = 'edit';
const editVarKey = 'editVar';
type UISelectorKey = typeof nonEditKey | typeof editKey | typeof editVarKey;

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
    const myCharacters = useMyCharacters();
    const [selectedChannelType, setSelectedChannelType] =
        React.useState<SelectedChannelType>(publicChannel);
    const [uiSelectorKey, setUiSelectorKey] = React.useState<UISelectorKey>(nonEditKey);
    const setRoomState = useSetRoomStateWithImmer();

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

    const selectedCharacterId = config.selectedCharacterId;
    const selectedCharacter =
        selectedCharacterId == null ? undefined : myCharacters?.get(selectedCharacterId);

    const onConfigUpdate = (
        recipe: (draft: Draft<ChatPalettePanelConfig> | Draft<MessagePanelConfig>) => void
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
                <div style={descriptionStyle}>キャラクター</div>
                <Select
                    style={{ flex: 1, maxWidth: miniInputMaxWidth }}
                    placeholder='キャラクター'
                    value={config.selectedCharacterId}
                    onSelect={(value, option) => {
                        onConfigUpdate(draft => {
                            if (typeof option.key !== 'string') {
                                return;
                            }
                            draft.selectedCharacterId = option.key;
                        });
                    }}
                >
                    {myCharactersOptions}
                </Select>
            </div>
            <GameSelector
                config={config}
                onConfigUpdate={onConfigUpdate}
                descriptionStyle={descriptionStyle}
                inputMaxWidth={miniInputMaxWidth}
            />
            <TextColorSelector
                config={config}
                onConfigUpdate={onConfigUpdate}
                descriptionStyle={descriptionStyle}
            />
            <UISelector
                style={{ padding: '2px 0' }}
                className={classNames(flex1, flex, flexColumn)}
                keys={[nonEditKey, editKey, editVarKey] as const}
                activeKey={uiSelectorKey}
                getName={key => {
                    switch (key) {
                        case nonEditKey:
                            return '通常';
                        case editKey:
                            return '編集';
                        case editVarKey:
                            return '編集（キャラクター変数）';
                    }
                }}
                onChange={setUiSelectorKey}
                render={uiSelectorKey => {
                    if (uiSelectorKey === editVarKey) {
                        return (
                            <CharacterVarInput
                                style={{ padding: '0 0 2px 0' }}
                                classNames={classNames(flex1)}
                                disableResize
                                character={selectedCharacter}
                                onChange={newValue =>
                                    setRoomState(roomState => {
                                        if (selectedCharacterId == null) {
                                            return;
                                        }
                                        const character = roomState.characters[selectedCharacterId];
                                        if (character == null) {
                                            return;
                                        }
                                        character.privateVarToml = newValue;
                                    })
                                }
                            />
                        );
                    }

                    return (
                        <ChatPaletteList
                            chatPaletteText={selectedCharacter?.chatPalette ?? null}
                            onClick={text => {
                                if (selectedChannelType === publicChannel) {
                                    setPublicMessageInput(text);
                                    return;
                                }
                                setPrivateMessageInput(text);
                            }}
                            onDoubleClick={text => subject.next(text)}
                            isEditMode={uiSelectorKey === editKey}
                            onChange={toml => {
                                setRoomState(roomState => {
                                    if (selectedCharacterId == null) {
                                        return;
                                    }
                                    const character = roomState.characters[selectedCharacterId];
                                    if (character == null) {
                                        return;
                                    }
                                    character.chatPalette = toml;
                                });
                            }}
                        />
                    );
                }}
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
