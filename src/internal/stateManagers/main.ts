import { StateManagerCore } from './stateManagerCore';
import { StateManagerParameters } from './types';

type OnPosted<T> =
    | {
          isSuccess: true;
          isId: false;
          revisionTo: number;
          result: T;
      }
    | {
          isSuccess: true;
          isId: true;
          requestId: string;
      }
    | {
          isSuccess: false | null; // 確実に失敗したときはfalse、成功したか失敗したかわからないときはnull
      };

export class StateManager<TState, TOperation> {
    private core: StateManagerCore<TState, TOperation>;
    private _requiresReload = false;

    public constructor(private readonly params: StateManagerParameters<TState, TOperation>) {
        this.core = new StateManagerCore<TState, TOperation>(params);
    }

    public get isPosting(): boolean {
        if (this.requiresReload) {
            return false;
        }
        return this.core.isPosting;
    }

    public get uiState(): TState {
        return this.core.uiState;
    }

    public get revision(): number {
        return this.core.revision;
    }

    public get requiresReload(): boolean {
        return this._requiresReload;
    }

    public waitingResponseSince(): Date | null {
        if (this.requiresReload) {
            return null;
        }
        return this.core.waitingResponseSince();
    }

    public onOtherClientsGet(operation: TOperation, revisionTo: number): void {
        if (this.requiresReload) {
            throw new Error('this.requiresReload === true');
        }

        this.core.onGet(operation, revisionTo, false);
    }

    public operate(state: TState): void {
        if (this.requiresReload) {
            throw new Error('this.requiresReload === true');
        }

        this.core.operateAsState(state);
    }

    public post():
        | {
              operationToPost: TOperation;
              syncedState: TState;
              revision: number;
              requestId: string;
              onPosted: (onPosted: OnPosted<TOperation>) => void;
          }
        | undefined {
        if (this.requiresReload) {
            throw new Error('this.requiresReload === true');
        }

        const toPost = this.core.post();
        if (toPost === undefined) {
            return undefined;
        }
        let isOnPostedExecuted = false;
        const onPosted = (onPosted: OnPosted<TOperation>) => {
            if (isOnPostedExecuted) {
                return;
            }
            isOnPostedExecuted = true;
            switch (onPosted.isSuccess) {
                case true:
                    if (onPosted.isId) {
                        this.core.endPostAsId(onPosted.requestId);
                        return;
                    }
                    this.core.onGet(onPosted.result, onPosted.revisionTo, true);
                    return;
                case false:
                    this.core.cancelPost();
                    return;
                case null:
                    this._requiresReload = true;
                    return;
            }
        };
        return { ...toPost, onPosted };
    }

    public reload({ state, revision }: { state: TState; revision: number }): void {
        this.core = new StateManagerCore<TState, TOperation>({
            ...this.params,
            revision: revision,
            state,
        });
        this._requiresReload = false;
    }
}
