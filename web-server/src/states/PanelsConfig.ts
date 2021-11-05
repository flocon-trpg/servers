import {
    CharactersPanelConfig,
    defaultCharactersPanelConfig,
    serializedCharactersPanelConfig,
    toCompleteCharactersPanelConfig,
} from './CharactersPanelConfig';
import {
    BoardEditorPanelConfig,
    defaultBoardEditorPanelsConfig,
    serializedBoardEditorPanelConfig,
    toCompleteBoardEditorPanelConfig,
} from './BoardEditorPanelConfig';
import {
    defaultMessagePanelsConfig,
    MessagePanelConfig,
    serializedMessagePanelConfig,
    toCompleteMessagePanelConfig,
} from './MessagePanelConfig';
import {
    defaultGameEffectPanelConfig,
    GameEffectPanelConfig,
    serializedGameEffectPanelConfig,
    toCompleteGameEffectPanelConfig,
} from './GameEffectPanelConfig';
import {
    defaultParticipantPanelConfig,
    serializedParticipantPanelConfig,
    ParticipantPanelConfig,
    toCompleteParticipantsPanelConfig,
} from './ParticipantsPanelConfig';
import {
    defaultPieceValuePanelConfig,
    PieceValuePanelConfig,
    toCompletePieceValuePanelConfig,
    serializedPieceValuePanelConfig,
} from './PieceValuePanelConfig';
import {
    ActiveBoardPanelConfig,
    defaultActiveBoardPanelsConfig,
    serializedActiveBoardPanelConfig,
    toCompleteActiveBoardPanelConfig,
} from './ActiveBoardPanelConfig';
import { chooseRecord } from '@kizahasi/util';
import {
    defaultMemoPanelsConfig,
    MemoPanelConfig,
    serializedMemoPanelConfig,
    toCompleteMemoPanelConfig,
} from './MemoPanelConfig';
import {
    ChatPalettePanelConfig,
    defaultChatPalettePanelsConfig,
    serializedChatPalettePanelConfig,
    toCompleteChatPalettePanelConfig,
} from './ChatPalettePanelConfig';
import * as t from 'io-ts';
import { record } from '../utils/io-ts/record';

export type PanelsConfig = {
    activeBoardPanel: ActiveBoardPanelConfig;
    boardEditorPanels: Record<string, BoardEditorPanelConfig | undefined>;
    characterPanel: CharactersPanelConfig;
    chatPalettePanels: Record<string, ChatPalettePanelConfig | undefined>;
    gameEffectPanel: GameEffectPanelConfig;
    memoPanels: Record<string, MemoPanelConfig | undefined>;
    messagePanels: Record<string, MessagePanelConfig | undefined>;
    pieceValuePanel: PieceValuePanelConfig;
    participantPanel: ParticipantPanelConfig;
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
    participantPanel: serializedParticipantPanelConfig,
});

export type SerializedPanelsConfig = t.TypeOf<typeof serializedPanelsConfig>;

export const toCompletePanelsConfig = (source: SerializedPanelsConfig): PanelsConfig => {
    return {
        activeBoardPanel: toCompleteActiveBoardPanelConfig(source.activeBoardPanel ?? {}),
        boardEditorPanels: chooseRecord(
            source.boardEditorPanels ?? {},
            toCompleteBoardEditorPanelConfig
        ),
        characterPanel: toCompleteCharactersPanelConfig(source.characterPanel ?? {}),
        chatPalettePanels: chooseRecord(
            source.chatPalettePanels ?? {},
            toCompleteChatPalettePanelConfig
        ),
        gameEffectPanel: toCompleteGameEffectPanelConfig(source.gameEffectPanel ?? {}),
        memoPanels: chooseRecord(source.memoPanels ?? {}, toCompleteMemoPanelConfig),
        messagePanels: chooseRecord(source.messagePanels ?? {}, toCompleteMessagePanelConfig),
        pieceValuePanel: toCompletePieceValuePanelConfig(source.pieceValuePanel ?? {}),
        participantPanel: toCompleteParticipantsPanelConfig(source.participantPanel ?? {}),
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
        participantPanel: defaultParticipantPanelConfig(),
    };
};
