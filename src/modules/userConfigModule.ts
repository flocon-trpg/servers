import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserConfig } from '../states/UserConfig';

const userConfigModule = createSlice({
    name: 'userConfig',
    initialState: null as UserConfig | null,
    reducers: {
        setUserConfig: (state: UserConfig | null, action: PayloadAction<UserConfig | null>) => {
            return action.payload;
        },
    }
});

export default userConfigModule;