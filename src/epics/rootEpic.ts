import { combineEpics } from 'redux-observable';
import { panelsEpic } from './panelsEpic';

export const rootEpic = combineEpics(
    panelsEpic,
);