import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserConfig } from '../states/UserConfig';

const userConfigModule = createSlice({
    name: 'userConfig',
    initialState: null as UserConfig | null,
    reducers: {
        reset: (state: UserConfig | null, action: PayloadAction<UserConfig | null>) => {
            return action.payload;
        },
        set: (state: UserConfig | null, action: PayloadAction<Partial<UserConfig>>) => {
            if (state == null) {
                return;
            }
            if (action.payload.roomMessagesFontSizeDelta != null) {
                state.roomMessagesFontSizeDelta = action.payload.roomMessagesFontSizeDelta;
                if (state.roomMessagesFontSizeDelta > 3) {
                    state.roomMessagesFontSizeDelta = 3;
                } else if (state.roomMessagesFontSizeDelta < -3) {
                    state.roomMessagesFontSizeDelta = -3;
                }
            }
        },
    }
});

export default userConfigModule;