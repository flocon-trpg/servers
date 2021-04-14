import { castToRecord } from '../utils/cast';
import isObject from '../utils/isObject';
import { chooseRecord } from '../utils/record';
import { castToPartialCharactersPanelConfig, CharactersPanelConfig as CharacterPanelConfig, defaultCharactersPanelConfig as defaultCharacterPanelConfig, PartialCharactersPanelConfig as PartialCharacterPanelConfig, toCompleteCharactersPanelConfig } from './CharactersPanelConfig';
import * as Room from '../stateManagers/states/room';
import { BoardsPanelConfig as BoardPanelConfig, castToPartialBoardPanelConfig, defaultBoardPanelsConfig as defaultBoardPanelsConfig, PartialBoardPanelConfig, toCompleteBoardPanelConfig } from './BoardsPanelConfig';
import { castToPartialMessagePanelConfig, defaultMessagePanelsConfig, MessagePanelConfig, PartialMessagePanelConfig, toCompleteMessagePanelConfig } from './MessagesPanelConfig';
import { ReadonlyStateToReduce } from '../hooks/useRoomMessages';
import { castToPartialGameEffectPanelConfig, defaultGameEffectPanelConfig, GameEffectPanelConfig, PartialGameEffectPanelConfig, toCompleteGameEffectPanelConfig } from './GameEffectPanelConfig';
import { castToPartialParticipantPanelConfig, defaultParticipantPanelConfig, PartialParticipantPanelConfig, ParticipantPanelConfig, toCompleteParticipantsPanelConfig } from './ParticipantsPanelConfig';

export type PanelsConfig = {
    boardPanels: Record<string, BoardPanelConfig>;
    characterPanel: CharacterPanelConfig;
    gameEffectPanel: GameEffectPanelConfig;
    messagePanels: Record<string, MessagePanelConfig>;
    participantPanel: ParticipantPanelConfig;
}

export type PartialPanelsConfig = {
    boardPanels?: Record<string, PartialBoardPanelConfig>;
    characterPanel?: PartialCharacterPanelConfig;
    gameEffectPanel?: PartialGameEffectPanelConfig;
    messagePanels?: Record<string, PartialMessagePanelConfig>;
    participantPanel?: PartialParticipantPanelConfig;
}

export const castToPartialPanelsConfig = (source: unknown): PartialPanelsConfig | undefined => {
    if (!isObject<PartialPanelsConfig>(source)) {
        return;
    }
    return {
        boardPanels: castToRecord(source.boardPanels, castToPartialBoardPanelConfig),
        characterPanel: castToPartialCharactersPanelConfig(source.characterPanel),
        gameEffectPanel: castToPartialGameEffectPanelConfig(source.gameEffectPanel),
        messagePanels: castToRecord(source.messagePanels, castToPartialMessagePanelConfig),
        participantPanel: castToPartialParticipantPanelConfig(source.participantPanel),
    };
};

export const toCompletePanelsConfig = (source: PartialPanelsConfig): PanelsConfig => {
    return {
        boardPanels: chooseRecord(source.boardPanels ?? {}, toCompleteBoardPanelConfig),
        characterPanel: toCompleteCharactersPanelConfig(source.characterPanel ?? {}),
        gameEffectPanel: toCompleteGameEffectPanelConfig(source.gameEffectPanel ?? {}),
        messagePanels: chooseRecord(source.messagePanels ?? {}, toCompleteMessagePanelConfig),
        participantPanel: toCompleteParticipantsPanelConfig(source.participantPanel ?? {}),
    };
};

export const defaultPanelsConfig = (): PanelsConfig => {
    return {
        boardPanels: defaultBoardPanelsConfig(),
        characterPanel: defaultCharacterPanelConfig(),
        gameEffectPanel: defaultGameEffectPanelConfig(),
        messagePanels: defaultMessagePanelsConfig(),
        participantPanel: defaultParticipantPanelConfig(),
    };
};