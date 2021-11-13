import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook } from 'react-redux';
import { useSelector as useReduxSelector } from 'react-redux';
import { roomDrawerAndPopoverAndModalModule } from './modules/roomDrawerAndPopoverAndModalModule';

// rootReducer の準備
const rootReducer = combineReducers({
    roomDrawerAndPopoverAndModalModule: roomDrawerAndPopoverAndModalModule.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

const createStore = () => {
    const store = configureStore({
        reducer: rootReducer,
    });
    return store;
};

export const store = createStore();
