import { castToRecord } from '../utils/cast';
import isObject from '../utils/isObject';
import { chooseRecord } from '../utils/record';
import { castToPartialCharactersPanelConfig, CharactersPanelConfig, defaultCharactersPanelConfig, PartialCharactersPanelConfig, toCompleteCharactersPanelConfig } from './CharactersPanelConfig';
import * as Room from '../stateManagers/states/room';
import { BoardsPanelConfig, castToPartialBoardsPanelConfig, defaultBoardsPanelsConfig, PartialBoardsPanelConfig, toCompleteBoardsPanelConfig } from './BoardsPanelConfig';
import { castToPartialMessagesPanelConfig, defaultMessagesPanelConfig, MessagesPanelConfig, PartialMessagesPanelConfig, toCompleteMessagesPanelConfig } from './MessagesPanelConfig';
import { ReadonlyStateToReduce } from '../hooks/useRoomMessages';
import { castToPartialGameEffectPanelConfig, defaultGameEffectPanelConfig, GameEffectPanelConfig, PartialGameEffectPanelConfig, toCompleteGameEffectPanelConfig } from './GameEffectPanelConfig';

export type PanelsConfig = {
    boardsPanels: Record<string, BoardsPanelConfig>;
    charactersPanel: CharactersPanelConfig;
    gameEffectPanel: GameEffectPanelConfig;
    messagesPanel: MessagesPanelConfig;
}

export type PartialPanelsConfig = {
    boardsPanels?: Record<string, PartialBoardsPanelConfig>;
    charactersPanel?: PartialCharactersPanelConfig;
    gameEffectPanel?: PartialGameEffectPanelConfig;
    messagesPanel?: PartialMessagesPanelConfig;
}

export const castToPartialPanelsConfig = (source: unknown): PartialPanelsConfig | undefined => {
    if (!isObject<PartialPanelsConfig>(source)) {
        return;
    }
    return {
        boardsPanels: castToRecord(source.boardsPanels, castToPartialBoardsPanelConfig),
        charactersPanel: castToPartialCharactersPanelConfig(source.charactersPanel),
        gameEffectPanel: castToPartialGameEffectPanelConfig(source.gameEffectPanel),
        messagesPanel: castToPartialMessagesPanelConfig(source.messagesPanel),
    };
};

export const toCompletePanelsConfig = (source: PartialPanelsConfig): PanelsConfig => {
    return {
        boardsPanels: chooseRecord(source.boardsPanels ?? {}, toCompleteBoardsPanelConfig),
        charactersPanel: toCompleteCharactersPanelConfig(source.charactersPanel ?? {}),
        gameEffectPanel: toCompleteGameEffectPanelConfig(source.gameEffectPanel ?? {}),
        messagesPanel: toCompleteMessagesPanelConfig(source.messagesPanel ?? {}),
    };
};

export const defaultPanelsConfig = (): PanelsConfig => {
    return {
        boardsPanels: defaultBoardsPanelsConfig(),
        charactersPanel: defaultCharactersPanelConfig(),
        gameEffectPanel: defaultGameEffectPanelConfig(),
        messagesPanel: defaultMessagesPanelConfig(),
    };
};