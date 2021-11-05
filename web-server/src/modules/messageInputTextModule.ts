import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type State = {
    publicMessage: string;
    privateMessage: string;
};

type SetAction = Partial<State>;

const initState: State = {
    publicMessage: '',
    privateMessage: '',
};

export const messageInputTextModule = createSlice({
    name: 'messageInputText',
    initialState: initState,
    reducers: {
        set: (state: State, action: PayloadAction<SetAction>) => {
            return {
                ...state,
                publicMessage: action.payload.publicMessage ?? state.publicMessage,
                privateMessage: action.payload.privateMessage ?? state.privateMessage,
            };
        },
        reset: (state: State, action: PayloadAction<void>) => {
            return initState;
        },
    },
});
