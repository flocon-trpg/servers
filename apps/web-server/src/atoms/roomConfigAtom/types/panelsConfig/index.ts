import { chooseRecord } from '@flocon-trpg/utils';
import { z } from 'zod';
import {
    ActiveBoardPanelConfig,
    defaultActiveBoardPanelConfig,
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
    GameEffectPanelConfig,
    defaultGameEffectPanelConfig,
    deserializeGameEffectPanelConfig,
    serializedGameEffectPanelConfig,
} from '../gameEffectPanelConfig';
import {
    MemoPanelConfig,
    defaultMemoPanelsConfig,
    deserializeMemoPanelConfig,
    serializedMemoPanelConfig,
} from '../memoPanelConfig';
import {
    MessagePanelConfig,
    defaultMessagePanelsConfig,
    deserializeMessagePanelConfig,
    serializedMessagePanelConfig,
} from '../messagePanelConfig';
import {
    ParticipantsPanelConfig,
    defaultParticipantsPanelConfig,
    deserializeParticipantsPanelConfig,
    serializedParticipantsPanelConfig,
} from '../participantsPanelConfig';
import {
    PieceValuePanelConfig,
    defaultPieceValuePanelConfig,
    deserializePieceValuePanelConfig,
    serializedPieceValuePanelConfig,
} from '../pieceValuePanelConfig';
import {
    RollCallPanelConfig,
    defaultRollCallPanelConfig,
    deserializeRollCallPanelConfig,
    serializedRollCallPanelConfig,
} from '../rollCallPanelConfig';
import { record } from '@/utils/zod/record';

export type PanelsConfig = {
    // DraggablePanelConfigBaseのプロパティは使われていない
    activeBoardBackground: ActiveBoardPanelConfig;

    activeBoardPanel: ActiveBoardPanelConfig;
    boardEditorPanels: Record<string, BoardEditorPanelConfig | undefined>;
    characterPanel: CharactersPanelConfig;
    chatPalettePanels: Record<string, ChatPalettePanelConfig | undefined>;
    gameEffectPanel: GameEffectPanelConfig;
    memoPanels: Record<string, MemoPanelConfig | undefined>;
    messagePanels: Record<string, MessagePanelConfig | undefined>;
    pieceValuePanel: PieceValuePanelConfig;
    participantPanel: ParticipantsPanelConfig;
    rollCallPanel: RollCallPanelConfig;
};

export const serializedPanelsConfig = z
    .object({
        activeBoardBackground: serializedActiveBoardPanelConfig,
        activeBoardPanel: serializedActiveBoardPanelConfig,
        boardEditorPanels: record(serializedBoardEditorPanelConfig),
        characterPanel: serializedCharactersPanelConfig,
        chatPalettePanels: record(serializedChatPalettePanelConfig),
        gameEffectPanel: serializedGameEffectPanelConfig,
        messagePanels: record(serializedMessagePanelConfig),
        memoPanels: record(serializedMemoPanelConfig),
        pieceValuePanel: serializedPieceValuePanelConfig,
        participantPanel: serializedParticipantsPanelConfig,
        rollCallPanel: serializedRollCallPanelConfig,
    })
    .partial();

export type SerializedPanelsConfig = z.TypeOf<typeof serializedPanelsConfig>;

export const deserializePanelsConfig = (source: SerializedPanelsConfig): PanelsConfig => {
    return {
        activeBoardBackground: deserializeActiveBoardPanelConfig(
            source.activeBoardBackground ?? {},
        ),
        activeBoardPanel: deserializeActiveBoardPanelConfig(source.activeBoardPanel ?? {}),
        boardEditorPanels: chooseRecord(
            source.boardEditorPanels ?? {},
            deserializeBoardEditorPanelConfig,
        ),
        characterPanel: deserializeCharactersPanelConfig(source.characterPanel ?? {}),
        chatPalettePanels: chooseRecord(
            source.chatPalettePanels ?? {},
            deserializeChatPalettePanelConfig,
        ),
        gameEffectPanel: deserializeGameEffectPanelConfig(source.gameEffectPanel ?? {}),
        memoPanels: chooseRecord(source.memoPanels ?? {}, deserializeMemoPanelConfig),
        messagePanels: chooseRecord(source.messagePanels ?? {}, deserializeMessagePanelConfig),
        pieceValuePanel: deserializePieceValuePanelConfig(source.pieceValuePanel ?? {}),
        participantPanel: deserializeParticipantsPanelConfig(source.participantPanel ?? {}),
        rollCallPanel: deserializeRollCallPanelConfig(source.rollCallPanel ?? {}),
    };
};

export const defaultPanelsConfig = (): PanelsConfig => {
    return {
        activeBoardBackground: defaultActiveBoardPanelConfig(),
        activeBoardPanel: defaultActiveBoardPanelConfig(),
        boardEditorPanels: defaultBoardEditorPanelsConfig(),
        characterPanel: defaultCharactersPanelConfig(),
        chatPalettePanels: defaultChatPalettePanelsConfig(),
        gameEffectPanel: defaultGameEffectPanelConfig(),
        memoPanels: defaultMemoPanelsConfig(),
        messagePanels: defaultMessagePanelsConfig(),
        pieceValuePanel: defaultPieceValuePanelConfig(),
        participantPanel: defaultParticipantsPanelConfig(),
        rollCallPanel: defaultRollCallPanelConfig(),
    };
};
