import { combineReducers, AnyAction } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook } from 'react-redux';
import { useSelector as useReduxSelector } from 'react-redux';
import { createEpicMiddleware } from 'redux-observable';
import roomConfigModule from './modules/roomConfigModule';
import { rootEpic } from './epics/rootEpic';
import userConfigModule from './modules/userConfigModule';
import { roomDrawerAndPopoverAndModalModule } from './modules/roomDrawerAndPopoverAndModalModule';
import { fileModule } from './modules/fileModule';
import { roomModule } from './modules/roomModule';
import { messageInputTextModule } from './modules/messageInputTextModule';

// rootReducer の準備
const rootReducer = combineReducers({
    fileModule: fileModule.reducer,
    roomConfigModule: roomConfigModule.reducer,
    userConfigModule: userConfigModule.reducer,
    roomModule: roomModule.reducer,
    roomDrawerAndPopoverAndModalModule: roomDrawerAndPopoverAndModalModule.reducer,
    messageInputTextModule: messageInputTextModule.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

const createStore = () => {
    // このように型を書かないとepicMiddleware.runでtype error
    // 参考: https://github.com/redux-observable/redux-observable/issues/555
    const epicMiddleware = createEpicMiddleware<AnyAction, AnyAction, RootState, void>();
    const store = configureStore({
        reducer: rootReducer,
        //middleware: [...getDefaultMiddleware(), epicMiddleware], // getDefaultMiddleware()の中に含まれているthunkはいらないが、thunkだけ取り除くオプションもないのでやむなし
        middleware: [epicMiddleware],
    });
    epicMiddleware.run(rootEpic);
    return store;
};

const store = createStore();

export default store;
