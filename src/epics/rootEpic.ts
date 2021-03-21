import { combineEpics } from 'redux-observable';
import { roomConfigEpic } from './roomConfigEpic';

export const rootEpic = combineEpics(
    roomConfigEpic,
);