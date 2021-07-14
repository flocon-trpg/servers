import { castToRecord } from '../utils/cast';
import isObject from '../utils/isObject';
import {
    castToPartialCharactersPanelConfig,
    CharactersPanelConfig as CharacterPanelConfig,
    defaultCharactersPanelConfig as defaultCharacterPanelConfig,
    PartialCharactersPanelConfig as PartialCharacterPanelConfig,
    toCompleteCharactersPanelConfig,
} from './CharactersPanelConfig';
import {
    BoardEditorPanelConfig,
    castToPartialBoardEditorPanelConfig,
    defaultBoardEditorPanelsConfig as defaultBoardEditorPanelsConfig,
    PartialBoardEditorPanelConfig,
    toCompleteBoardEditorPanelConfig,
} from './BoardEditorPanelConfig';
import {
    castToPartialMessagePanelConfig,
    defaultMessagePanelsConfig,
    MessagePanelConfig,
    PartialMessagePanelConfig,
    toCompleteMessagePanelConfig,
} from './MessagePanelConfig';
import {
    castToPartialGameEffectPanelConfig,
    defaultGameEffectPanelConfig,
    GameEffectPanelConfig,
    PartialGameEffectPanelConfig,
    toCompleteGameEffectPanelConfig,
} from './GameEffectPanelConfig';
import {
    castToPartialParticipantPanelConfig,
    defaultParticipantPanelConfig,
    PartialParticipantPanelConfig,
    ParticipantPanelConfig,
    toCompleteParticipantsPanelConfig,
} from './ParticipantsPanelConfig';
import {
    castToPartialPieceValuePanelConfig,
    defaultPieceValuePanelConfig,
    PieceValuePanelConfig,
    PartialPieceValuePanelConfig,
    toCompletePieceValuePanelConfig,
} from './PieceValuePanelConfig';
import {
    ActiveBoardPanelConfig,
    castToPartialActiveBoardPanelConfig,
    defaultActiveBoardPanelsConfig,
    PartialActiveBoardPanelConfig,
    toCompleteActiveBoardPanelConfig,
} from './ActiveBoardPanelConfig';
import { chooseRecord } from '@kizahasi/util';
import {
    castToPartialMemoPanelConfig,
    defaultMemoPanelsConfig,
    MemoPanelConfig,
    PartialMemoPanelConfig,
    toCompleteMemoPanelConfig,
} from './MemoPanelConfig';

export type PanelsConfig = {
    activeBoardPanel: ActiveBoardPanelConfig;
    boardEditorPanels: Record<string, BoardEditorPanelConfig>;
    characterPanel: CharacterPanelConfig;
    gameEffectPanel: GameEffectPanelConfig;
    memoPanels: Record<string, MemoPanelConfig>;
    messagePanels: Record<string, MessagePanelConfig>;
    pieceValuePanel: PieceValuePanelConfig;
    participantPanel: ParticipantPanelConfig;
};

export type PartialPanelsConfig = {
    activeBoardPanel?: PartialActiveBoardPanelConfig;
    boardEditorPanels?: Record<string, PartialBoardEditorPanelConfig>;
    characterPanel?: PartialCharacterPanelConfig;
    gameEffectPanel?: PartialGameEffectPanelConfig;
    messagePanels?: Record<string, PartialMessagePanelConfig>;
    memoPanels?: Record<string, PartialMemoPanelConfig>;
    pieceValuePanel?: PartialPieceValuePanelConfig;
    participantPanel?: PartialParticipantPanelConfig;
};

export const castToPartialPanelsConfig = (source: unknown): PartialPanelsConfig | undefined => {
    if (!isObject<PartialPanelsConfig>(source)) {
        return;
    }
    return {
        activeBoardPanel: castToPartialActiveBoardPanelConfig(source.activeBoardPanel),
        boardEditorPanels: castToRecord(
            source.boardEditorPanels,
            castToPartialBoardEditorPanelConfig
        ),
        characterPanel: castToPartialCharactersPanelConfig(source.characterPanel),
        gameEffectPanel: castToPartialGameEffectPanelConfig(source.gameEffectPanel),
        memoPanels: castToRecord(source.memoPanels, castToPartialMemoPanelConfig),
        messagePanels: castToRecord(source.messagePanels, castToPartialMessagePanelConfig),
        pieceValuePanel: castToPartialPieceValuePanelConfig(source.pieceValuePanel),
        participantPanel: castToPartialParticipantPanelConfig(source.participantPanel),
    };
};

export const toCompletePanelsConfig = (source: PartialPanelsConfig): PanelsConfig => {
    return {
        activeBoardPanel: toCompleteActiveBoardPanelConfig(source.activeBoardPanel ?? {}),
        boardEditorPanels: chooseRecord(
            source.boardEditorPanels ?? {},
            toCompleteBoardEditorPanelConfig
        ),
        characterPanel: toCompleteCharactersPanelConfig(source.characterPanel ?? {}),
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
        characterPanel: defaultCharacterPanelConfig(),
        gameEffectPanel: defaultGameEffectPanelConfig(),
        memoPanels: defaultMemoPanelsConfig(),
        messagePanels: defaultMessagePanelsConfig(),
        pieceValuePanel: defaultPieceValuePanelConfig(),
        participantPanel: defaultParticipantPanelConfig(),
    };
};
