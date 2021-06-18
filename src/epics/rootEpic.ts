import { combineEpics } from 'redux-observable';
import { roomConfigEpic } from './roomConfigEpic';
import { userConfigEpic } from './userConfigEpic';

export const rootEpic = combineEpics(
    roomConfigEpic,
    userConfigEpic,
);