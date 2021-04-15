import React from 'react';
import { __ } from '../@shared/collection';
import { $free, $system } from '../@shared/Constants';
import { TabConfig } from '../states/MessagesPanelConfig';
import { PrivateChannelSets } from '../utils/PrivateChannelSet';
import { privateMessage, publicMessage, RoomMessage, soundEffect } from './useRoomMessages';

export function useMessageFilter(config: TabConfig) {
    const {
        showSystem,
        showFree,
        showPublic1,
        showPublic2,
        showPublic3,
        showPublic4,
        showPublic5,
        showPublic6,
        showPublic7,
        showPublic8,
        showPublic9,
        showPublic10,
        privateChannels: privateChannelsAsString,
    } = config;
    return React.useCallback((message: RoomMessage) => {
        switch (message.type) {
            case publicMessage: {
                if (showSystem && message.value.channelKey === $system) {
                    return true;
                }
                if (showFree && message.value.channelKey === $free) {
                    return true;
                }
                if (showPublic1 && message.value.channelKey === '1') {
                    return true;
                }
                if (showPublic2 && message.value.channelKey === '2') {
                    return true;
                }
                if (showPublic3 && message.value.channelKey === '3') {
                    return true;
                }
                if (showPublic4 && message.value.channelKey === '4') {
                    return true;
                }
                if (showPublic5 && message.value.channelKey === '5') {
                    return true;
                }
                if (showPublic6 && message.value.channelKey === '6') {
                    return true;
                }
                if (showPublic7 && message.value.channelKey === '7') {
                    return true;
                }
                if (showPublic8 && message.value.channelKey === '8') {
                    return true;
                }
                if (showPublic9 && message.value.channelKey === '9') {
                    return true;
                }
                if (showPublic10 && message.value.channelKey === '10') {
                    return true;
                }
                return false;
            }
            case privateMessage: {
                if (privateChannelsAsString === true) {
                    return true;
                }
                if (privateChannelsAsString === false) {
                    return false;
                }
                const privateChannelSets = new PrivateChannelSets(privateChannelsAsString);
                return privateChannelSets.toArray().some(set => {
                    return __(set.toStringSet()).equal(new Set(message.value.visibleTo));
                });
            }
            case soundEffect:
                return false;
        }
    }, [showSystem, showFree, showPublic1, showPublic2, showPublic3, showPublic4, showPublic5, showPublic6, showPublic7, showPublic8, showPublic9, showPublic10, privateChannelsAsString]);
}