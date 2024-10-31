import { Select } from 'antd';
import classNames from 'classnames';
import { Draft } from 'immer';
import { useSetAtom } from 'jotai/react';
import React from 'react';
import { Subject } from 'rxjs';
import { TextColorPicker } from '../../../../../../ui/TextColorPicker/TextColorPicker';
import { roomPrivateMessageInputAtom } from '../../atoms/roomPrivateMessageInputAtom/roomPrivateMessageInputAtom';
import { roomPublicMessageInputAtom } from '../../atoms/roomPublicMessageInputAtom/roomPublicMessageInputAtom';
import { useMyCharacters } from '../../hooks/useMyCharacters';
import { CharacterVarInput } from '../CharacterVarInput/CharacterVarInput';
import { GameSelector } from '../GameSelector/GameSelector';
import { SelectedChannelType, SubmitMessage, publicChannel } from '../SubmitMessage/SubmitMessage';
import { manual, roomConfigAtomFamily } from '@/atoms/roomConfigAtom/roomConfigAtom';
import { ChatPalettePanelConfig } from '@/atoms/roomConfigAtom/types/chatPalettePanelConfig';
import { MessagePanelConfig } from '@/atoms/roomConfigAtom/types/messagePanelConfig';
import { useSetRoomStateWithImmer } from '@/components/models/room/Room/subcomponents/hooks/useSetRoomStateWithImmer';
import { CollaborativeInput } from '@/components/ui/CollaborativeInput/CollaborativeInput';
import { UISelector } from '@/components/ui/UISelector/UISelector';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { useBufferValue } from '@/hooks/useBufferValue';
import { flex, flex1, flexColumn, flexNone, flexRow, itemsCenter } from '@/styles/className';

const descriptionStyle: React.CSSProperties = {
    flexBasis: '80px',
};

type ChatPaletteListProps = {
    className?: string;
    chatPaletteText: string | null;
    onClick: (text: string) => void;
    onDoubleClick: (text: string) => void;
    isEditMode: boolean;
    onChange: (toml: string) => void;
};

const ChatPaletteList: React.FC<ChatPaletteListProps> = ({
    className,
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
        [bufferedChatPaletteText],
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
            <CollaborativeInput
                className={className}
                style={{ overflow: 'auto' }}
                multiline
                size="small"
                bufferDuration="default"
                value={chatPaletteText ?? ''}
                onChange={e => onChange(e.currentValue)}
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
            className={className}
            style={{
                ...baseStyle,
                backgroundColor: 'transparent',
                color: 'white',
                borderColor: '#303030',
                outline: 'none',
            }}
            size={4}
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

type ChatPalettePanelContentProps = {
    roomId: string;
    panelId: string;
};

export const ChatPalettePanelContent: React.FC<ChatPalettePanelContentProps> = ({
    roomId,
    panelId,
}: ChatPalettePanelContentProps) => {
    const miniInputMaxWidth = 200;

    const setPublicMessageInput = useSetAtom(roomPublicMessageInputAtom);
    const setPrivateMessageInput = useSetAtom(roomPrivateMessageInputAtom);
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const config = useAtomSelector(
        roomConfigAtom,
        state => state?.panels.chatPalettePanels?.[panelId],
    );
    const reduceRoomConfig = useSetAtom(roomConfigAtom);
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

    const onConfigUpdate = React.useCallback(
        (recipe: (draft: Draft<ChatPalettePanelConfig> | Draft<MessagePanelConfig>) => void) => {
            reduceRoomConfig({
                type: manual,
                action: roomConfig => {
                    if (roomConfig == null) {
                        return;
                    }
                    const chatPalettePanel = roomConfig.panels.chatPalettePanels[panelId];
                    if (chatPalettePanel == null) {
                        return;
                    }
                    recipe(chatPalettePanel);
                },
            });
        },
        [panelId, reduceRoomConfig],
    );

    if (config == null) {
        return null;
    }

    const selectedCharacterId = config.selectedCharacterId;
    const selectedCharacter =
        selectedCharacterId == null ? undefined : myCharacters?.get(selectedCharacterId);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className={classNames(flexNone, flex, flexRow, itemsCenter)}>
                <div style={descriptionStyle}>キャラクター</div>
                <Select
                    style={{ flex: 1, maxWidth: miniInputMaxWidth }}
                    placeholder="キャラクター"
                    value={config.selectedCharacterId}
                    onChange={value => {
                        if (value == null) {
                            return;
                        }
                        onConfigUpdate(draft => {
                            draft.selectedCharacterId = value;
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
            <TextColorPicker
                config={config}
                onConfigUpdate={onConfigUpdate}
                descriptionStyle={descriptionStyle}
            />
            <UISelector
                style={{ padding: '2px 0', overflow: 'hidden' }}
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
                                style={{ padding: '0 0 2px 0', overflow: 'auto' }}
                                className={classNames(flex1)}
                                character={selectedCharacter}
                                onChange={newValue =>
                                    setRoomState(roomState => {
                                        if (selectedCharacterId == null) {
                                            return;
                                        }
                                        const character =
                                            roomState.characters?.[selectedCharacterId];
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
                            className={classNames(flex1)}
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
                                    const character = roomState.characters?.[selectedCharacterId];
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
                selectedCharacterType="some"
                autoSubmitter={subject}
            />
        </div>
    );
};
