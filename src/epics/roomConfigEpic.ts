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

const roomConfigEpicCore = (action$: ActionsObservable<AnyAction>, state$: StateObservable<RootState>): Observable<AnyAction> => {
    return new Observable<AnyAction>(observer => {
        return action$.pipe(
            Rx.map(action => {
                if (
                    roomConfigModule.actions.setOtherValues.match(action)
                    || roomConfigModule.actions.bringPanelToFront.match(action)
                    || roomConfigModule.actions.setIsMinimized.match(action)

                    || roomConfigModule.actions.addBoardEditorPanelConfig.match(action)
                    || roomConfigModule.actions.moveBoardPanel.match(action)
                    || roomConfigModule.actions.resizeBoardPanel.match(action)
                    || roomConfigModule.actions.removeBoardPanel.match(action)
                    || roomConfigModule.actions.updateBoard.match(action)
                    || roomConfigModule.actions.zoomBoard.match(action)
                    || roomConfigModule.actions.resetBoard.match(action)
                    || roomConfigModule.actions.updateBoardEditorPanel.match(action)

                    || roomConfigModule.actions.addMemoPanelConfig.match(action)
                    || roomConfigModule.actions.moveMemoPanel.match(action)
                    || roomConfigModule.actions.resizeMemoPanel.match(action)
                    || roomConfigModule.actions.removeMemoPanel.match(action)
                    || roomConfigModule.actions.updateMemoPanel.match(action)

                    || roomConfigModule.actions.addMessagePanelConfig.match(action)
                    || roomConfigModule.actions.moveMessagePanel.match(action)
                    || roomConfigModule.actions.resizeMessagePanel.match(action)
                    || roomConfigModule.actions.removeMessagePanel.match(action)
                    || roomConfigModule.actions.updateMessagePanel.match(action)

                    || roomConfigModule.actions.moveCharacterPanel.match(action)
                    || roomConfigModule.actions.resizeCharacterPanel.match(action)

                    || roomConfigModule.actions.moveGameEffectPanel.match(action)
                    || roomConfigModule.actions.resizeGameEffectPanel.match(action)

                    || roomConfigModule.actions.moveParticipantPanel.match(action)
                    || roomConfigModule.actions.resizeParticipantPanel.match(action)

                    || roomConfigModule.actions.movePieceValuePanel.match(action)
                    || roomConfigModule.actions.resizePieceValuePanel.match(action)
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

export const roomConfigEpic = combineEpics(
    roomConfigEpicCore,
);