import { MessagePanelConfig } from '../../states/MessagePanelConfig';

export const none = 'none';
export const some = 'some';
export const custom = 'custom';
export type SelectedCharacterType = typeof none | typeof some | typeof custom;

export const getSelectedCharacterType = (config: MessagePanelConfig): SelectedCharacterType => {
    switch (config.selectedCharacterType) {
        case some:
        case none:
        case custom:
            return config.selectedCharacterType;
        default:
            return none;
    }
};
