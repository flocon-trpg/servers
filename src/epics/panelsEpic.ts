import { AnyAction } from 'redux';
import { Observable } from 'rxjs';
import { ActionsObservable, StateObservable, combineEpics } from 'redux-observable';
import * as Rx from 'rxjs/operators';
import { RootState } from '../store';
import roomConfigModule from '../modules/roomConfigModule';
import localforage from 'localforage';
import { setRoomConfig } from '../utils/localStorage/roomConfig';

const saveToStorageSampleTime = 500;

const isNotNullOrUndefined = <T>(source: T | null | undefined): source is T => {
    if (source == null) {
        return false;
    }
    return true;
};

const updatePanelsEpic = (action$: ActionsObservable<AnyAction>, state$: StateObservable<RootState>): Observable<AnyAction> => {
    return new Observable<AnyAction>(observer => {
        return action$.pipe(
            Rx.map(action => {
                if (
                    roomConfigModule.actions.setGameType.match(action)
                    || roomConfigModule.actions.bringPanelToFront.match(action)
                    || roomConfigModule.actions.setIsMinimized.match(action)

                    || roomConfigModule.actions.addBoardPanelConfig.match(action)
                    || roomConfigModule.actions.moveBoardPanel.match(action)
                    || roomConfigModule.actions.resizeBoardPanel.match(action)
                    || roomConfigModule.actions.removeBoardPanel.match(action)
                    || roomConfigModule.actions.updateBoard.match(action)
                    || roomConfigModule.actions.zoomBoard.match(action)
                    || roomConfigModule.actions.resetBoard.match(action)
                    || roomConfigModule.actions.removeBoard.match(action)
                    || roomConfigModule.actions.updateBoardPanel.match(action)

                    || roomConfigModule.actions.moveCharactersPanel.match(action)
                    || roomConfigModule.actions.resizeCharactersPanel.match(action)

                    || roomConfigModule.actions.moveGameEffectPanel.match(action)
                    || roomConfigModule.actions.resizeGameEffectPanel.match(action)

                    || roomConfigModule.actions.moveMessagesPanel.match(action)
                    || roomConfigModule.actions.resizeMessagesPanel.match(action)
                    || roomConfigModule.actions.updateChannelVisibility.match(action)
                ) {
                    return action;
                }
                return null;
            }),
            Rx.filter(isNotNullOrUndefined),
            Rx.groupBy(action => action.payload.roomId),
            Rx.map(group => group.pipe(
                // TODO: configをユーザーが更新した直後にすぐブラウザを閉じると、閉じる直前のconfigが保存されないケースがある。余裕があれば直したい（閉じるときに強制保存orダイアログを出すなど）。
                Rx.sampleTime(saveToStorageSampleTime),
                Rx.map(() => {
                    const roomConfigModule = state$.value.roomConfigModule;
                    if (roomConfigModule == null) {
                        return new Promise(() => undefined);
                    }
                    return setRoomConfig(roomConfigModule);
                })
            )),
            Rx.mergeAll(),
            Rx.mergeAll()
        ).subscribe(() => undefined, observer.error, observer.complete);
    });
};

export const panelsEpic = combineEpics(
    updatePanelsEpic,
);