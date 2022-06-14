export namespace UserConfigUtils {
    export const getRoomMessagesFontSize = (roomMessagesFontSizeDelta: number): number => {
        switch (roomMessagesFontSizeDelta) {
            case -3:
                return 9;
            case -2:
                return 10;
            case -1:
                return 11;
            case 0:
                return 12;
            case 1:
                return 13;
            case 2:
                return 14;
            case 3:
                return 15;
            default:
                if (roomMessagesFontSizeDelta < 0) {
                    return 9;
                }
                return 15;
        }
    };
}
