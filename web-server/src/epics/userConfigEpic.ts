import { AnyAction } from 'redux';
import { Observable } from 'rxjs';
import { StateObservable } from 'redux-observable';
import * as Rx from 'rxjs/operators';
import { RootState } from '../store';
import { userConfigModule } from '../modules/userConfigModule';
import { setUserConfig } from '../utils/localStorage/userConfig';

const saveToStorageSampleTime = 500;

const isNotNullOrUndefined = <T>(source: T | null | undefined): source is T => {
    if (source == null) {
        return false;
    }
    return true;
};

export const userConfigEpic = (
    action$: Observable<AnyAction>,
    state$: StateObservable<RootState>
): Observable<AnyAction> => {
    return new Observable<AnyAction>(observer => {
        return action$
            .pipe(
                Rx.map(action => {
                    if (userConfigModule.actions.set.match(action)) {
                        return action;
                    }
                    return null;
                }),
                Rx.filter(isNotNullOrUndefined),
                Rx.groupBy(action => action.payload.userUid),
                Rx.map(group =>
                    group.pipe(
                        // TODO: configをユーザーが更新した直後にすぐブラウザを閉じると、閉じる直前のconfigが保存されないケースがある。余裕があれば直したい（閉じるときに強制保存orダイアログを出すなど）。
                        Rx.sampleTime(saveToStorageSampleTime),
                        Rx.map(() => {
                            const userConfigModule = state$.value.userConfigModule;
                            if (userConfigModule == null) {
                                return new Promise(() => undefined);
                            }
                            return setUserConfig(userConfigModule);
                        })
                    )
                ),
                Rx.mergeAll(),
                Rx.mergeAll()
            )
            .subscribe(() => undefined, observer.error, observer.complete);
    });
};
