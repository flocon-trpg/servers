import { chooseRecord } from '@flocon-trpg/utils';
import * as t from 'io-ts';
import { record } from '../../../../utils/io-ts/record';
import {
    ActiveBoardPanelConfig,
    defaultActiveBoardPanelsConfig,
    deserializeActiveBoardPanelConfig,
    serializedActiveBoardPanelConfig,
} from '../activeBoardPanelConfig';
import {
    BoardEditorPanelConfig,
    defaultBoardEditorPanelsConfig,
    deserializeBoardEditorPanelConfig,
    serializedBoardEditorPanelConfig,
} from '../boardEditorPanelConfig';
import {
    CharactersPanelConfig,
    defaultCharactersPanelConfig,
    deserializeCharactersPanelConfig,
    serializedCharactersPanelConfig,
} from '../charactersPanelConfig';
import {
    ChatPalettePanelConfig,
    defaultChatPalettePanelsConfig,
    deserializeChatPalettePanelConfig,
    serializedChatPalettePanelConfig,
} from '../chatPalettePanelConfig';
import {
    defaultGameEffectPanelConfig,
    deserializeGameEffectPanelConfig,
    GameEffectPanelConfig,
    serializedGameEffectPanelConfig,
} from '../gameEffectPanelConfig';
import {
    defaultMemoPanelsConfig,
    deserializeMemoPanelConfig,
    MemoPanelConfig,
    serializedMemoPanelConfig,
} from '../memoPanelConfig';
import {
    defaultMessagePanelsConfig,
    MessagePanelConfig,
    serializedMessagePanelConfig,
    deserializeMessagePanelConfig,
} from '../messagePanelConfig';
import {
    defaultParticipantsPanelConfig,
    deserializeParticipantsPanelConfig,
    ParticipantsPanelConfig,
    serializedParticipantsPanelConfig,
} from '../participantsPanelConfig';
import {
    defaultPieceValuePanelConfig,
    deserializePieceValuePanelConfig,
    PieceValuePanelConfig,
    serializedPieceValuePanelConfig,
} from '../pieceValuePanelConfig';

export type PanelsConfig = {
    activeBoardPanel: ActiveBoardPanelConfig;
    boardEditorPanels: Record<string, BoardEditorPanelConfig | undefined>;
    characterPanel: CharactersPanelConfig;
    chatPalettePanels: Record<string, ChatPalettePanelConfig | undefined>;
    gameEffectPanel: GameEffectPanelConfig;
    memoPanels: Record<string, MemoPanelConfig | undefined>;
    messagePanels: Record<string, MessagePanelConfig | undefined>;
    pieceValuePanel: PieceValuePanelConfig;
    participantPanel: ParticipantsPanelConfig;
};

export const serializedPanelsConfig = t.partial({
    activeBoardPanel: serializedActiveBoardPanelConfig,
    boardEditorPanels: record(t.string, serializedBoardEditorPanelConfig),
    characterPanel: serializedCharactersPanelConfig,
    chatPalettePanels: record(t.string, serializedChatPalettePanelConfig),
    gameEffectPanel: serializedGameEffectPanelConfig,
    messagePanels: record(t.string, serializedMessagePanelConfig),
    memoPanels: record(t.string, serializedMemoPanelConfig),
    pieceValuePanel: serializedPieceValuePanelConfig,
    participantPanel: serializedParticipantsPanelConfig,
});

export type SerializedPanelsConfig = t.TypeOf<typeof serializedPanelsConfig>;

export const deserializePanelsConfig = (source: SerializedPanelsConfig): PanelsConfig => {
    return {
        activeBoardPanel: deserializeActiveBoardPanelConfig(source.activeBoardPanel ?? {}),
        boardEditorPanels: chooseRecord(
            source.boardEditorPanels ?? {},
            deserializeBoardEditorPanelConfig
        ),
        characterPanel: deserializeCharactersPanelConfig(source.characterPanel ?? {}),
        chatPalettePanels: chooseRecord(
            source.chatPalettePanels ?? {},
            deserializeChatPalettePanelConfig
        ),
        gameEffectPanel: deserializeGameEffectPanelConfig(source.gameEffectPanel ?? {}),
        memoPanels: chooseRecord(source.memoPanels ?? {}, deserializeMemoPanelConfig),
        messagePanels: chooseRecord(source.messagePanels ?? {}, deserializeMessagePanelConfig),
        pieceValuePanel: deserializePieceValuePanelConfig(source.pieceValuePanel ?? {}),
        participantPanel: deserializeParticipantsPanelConfig(source.participantPanel ?? {}),
    };
};

export const defaultPanelsConfig = (): PanelsConfig => {
    return {
        activeBoardPanel: defaultActiveBoardPanelsConfig(),
        boardEditorPanels: defaultBoardEditorPanelsConfig(),
        characterPanel: defaultCharactersPanelConfig(),
        chatPalettePanels: defaultChatPalettePanelsConfig(),
        gameEffectPanel: defaultGameEffectPanelConfig(),
        memoPanels: defaultMemoPanelsConfig(),
        messagePanels: defaultMessagePanelsConfig(),
        pieceValuePanel: defaultPieceValuePanelConfig(),
        participantPanel: defaultParticipantsPanelConfig(),
    };
};
