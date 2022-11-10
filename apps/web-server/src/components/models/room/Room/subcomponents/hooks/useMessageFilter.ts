import { $free, $system } from '@flocon-trpg/core';
import {
    Message,
    PrivateChannelSets,
    custom,
    pieceLog,
    privateMessage,
    publicMessage,
    soundEffect,
} from '@flocon-trpg/web-server-utils';
import React from 'react';
import { CombinedError } from 'urql';
import { MessageFilter } from '@/atoms/roomConfigAtom/types/messageFilter';
import { NotificationType } from '@/components/models/room/Room/subcomponents/components/Notification/Notification';

export function useMessageFilter(
    config: MessageFilter
): (message: Message<NotificationType<CombinedError>>) => boolean {
    const {
        showNotification,
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
    return React.useCallback(
        (message: Message<NotificationType<CombinedError>>): boolean => {
            switch (message.type) {
                case custom:
                    return showNotification;
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
                        const x = set.toStringSet();
                        const y = new Set(message.value.visibleTo);
                        if (x.size !== y.size) {
                            return false;
                        }
                        for (const elem of x) {
                            if (!y.has(elem)) {
                                return false;
                            }
                        }
                        return true;
                    });
                }
                case pieceLog:
                    return showSystem;
                case soundEffect:
                    return false;
            }
        },
        [
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
            privateChannelsAsString,
            showNotification,
        ]
    );
}
