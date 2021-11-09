import { MessageFilter } from '.';

export namespace MessageFilterUtils {
    export const isEmpty = (source: MessageFilter): boolean => {
        return (
            source.privateChannels === false &&
            !source.showNotification &&
            !source.showFree &&
            !source.showPublic1 &&
            !source.showPublic10 &&
            !source.showPublic2 &&
            !source.showPublic3 &&
            !source.showPublic4 &&
            !source.showPublic5 &&
            !source.showPublic6 &&
            !source.showPublic7 &&
            !source.showPublic8 &&
            !source.showPublic9 &&
            !source.showSystem
        );
    };

    export const isAll = (source: MessageFilter): boolean => {
        return (
            source.privateChannels === true &&
            source.showNotification &&
            source.showFree &&
            source.showPublic1 &&
            source.showPublic10 &&
            source.showPublic2 &&
            source.showPublic3 &&
            source.showPublic4 &&
            source.showPublic5 &&
            source.showPublic6 &&
            source.showPublic7 &&
            source.showPublic8 &&
            source.showPublic9 &&
            source.showSystem
        );
    };

    export const createEmpty = (): MessageFilter => {
        return {
            privateChannels: false,
            showNotification: false,
            showFree: false,
            showPublic1: false,
            showPublic10: false,
            showPublic2: false,
            showPublic3: false,
            showPublic4: false,
            showPublic5: false,
            showPublic6: false,
            showPublic7: false,
            showPublic8: false,
            showPublic9: false,
            showSystem: false,
        };
    };

    export const createAll = (): MessageFilter => {
        return {
            privateChannels: true,
            showNotification: true,
            showFree: true,
            showPublic1: true,
            showPublic10: true,
            showPublic2: true,
            showPublic3: true,
            showPublic4: true,
            showPublic5: true,
            showPublic6: true,
            showPublic7: true,
            showPublic8: true,
            showPublic9: true,
            showSystem: true,
        };
    };
}
