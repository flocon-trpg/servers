import { PostResult, StateManager } from './stateManager';

type HistoryElement<TState, TOperation> =
    | {
          type: 'operate';
          revision: number;
          nextState: TState;
      }
    | {
          type: 'beforePost';
          uiState: TState;
      }
    | {
          type: 'posting';
          uiState: TState;
          value: Omit<PostResult<TState, TOperation>, 'onPosted'> | undefined;
      }
    | {
          type: 'beforeEndPostAsSuccess';
          operation: TOperation;
          uiState: TState;
          revisionTo: number;
      }
    | {
          type: 'afterEndPostAsSuccess';
          uiState: TState;
      }
    | {
          type: 'beforeEndPostAsId';
          requestId: string;
          uiState: TState;
      }
    | {
          type: 'afterEndPostAsId';
          uiState: TState;
      }
    | {
          type: 'beforeEndPostAsNotSuccess';
          uiState: TState;
      }
    | {
          type: 'afterEndPostAsNotSuccess';
          uiState: TState;
      }
    | {
          type: 'endPostAsUnknown';
          uiState: TState;
      }
    | {
          type: 'beforeOtherClientsGet';
          uiState: TState;
          operation: TOperation;
          revisionTo: number;
      }
    | {
          type: 'afterOtherClientsGet';
          uiState: TState;
      };

const maxHistoryCount = 20;

export class StateManagerHistoryQueue<TState, TOperation> {
    private _history: HistoryElement<TState, TOperation>[] = [];

    private add(elem: HistoryElement<TState, TOperation>) {
        this._history.push(elem);
        if (this._history.length > maxHistoryCount) {
            this._history.shift();
        }
    }

    public get history(): ReadonlyArray<HistoryElement<TState, TOperation>> {
        return this._history;
    }

    public operateAsState(stateManager: StateManager<TState, TOperation>, state: TState): void {
        this.add({
            type: 'operate',
            revision: stateManager.revision,
            nextState: state,
        });
    }
    public beforePost(stateManager: StateManager<TState, TOperation>): void {
        this.add({
            type: 'beforePost',
            uiState: stateManager.uiState,
        });
    }

    public beginPost(
        stateManager: StateManager<TState, TOperation>,
        value: Omit<PostResult<TState, TOperation>, 'onPosted'> | undefined,
    ): void {
        this.add({
            type: 'posting',
            uiState: stateManager.uiState,
            value,
        });
    }

    public beforeEndPostAsId(
        stateManager: StateManager<TState, TOperation>,
        requestId: string,
    ): void {
        this.add({
            type: 'beforeEndPostAsId',
            requestId,
            uiState: stateManager.uiState,
        });
    }

    public afterEndPostAsId(stateManager: StateManager<TState, TOperation>): void {
        this.add({
            type: 'afterEndPostAsId',
            uiState: stateManager.uiState,
        });
    }

    public beforeEndPostAsSuccess(
        stateManager: StateManager<TState, TOperation>,
        operation: TOperation,
        revisionTo: number,
    ): void {
        this.add({
            type: 'beforeEndPostAsSuccess',
            uiState: stateManager.uiState,
            operation,
            revisionTo,
        });
    }

    public afterEndPostAsSuccess(stateManager: StateManager<TState, TOperation>): void {
        this.add({
            type: 'afterEndPostAsSuccess',
            uiState: stateManager.uiState,
        });
    }

    public beforeOtherClientsGet(
        stateManager: StateManager<TState, TOperation>,
        operation: TOperation,
        revisionTo: number,
    ): void {
        this.add({
            type: 'beforeOtherClientsGet',
            uiState: stateManager.uiState,
            operation,
            revisionTo,
        });
    }

    public afterOtherClientsGet(stateManager: StateManager<TState, TOperation>): void {
        this.add({
            type: 'afterOtherClientsGet',
            uiState: stateManager.uiState,
        });
    }

    public beforeEndPostAsNotSuccess(stateManager: StateManager<TState, TOperation>): void {
        this.add({
            type: 'beforeEndPostAsNotSuccess',
            uiState: stateManager.uiState,
        });
    }

    public afterEndPostAsNotSuccess(stateManager: StateManager<TState, TOperation>): void {
        this.add({
            type: 'afterEndPostAsNotSuccess',
            uiState: stateManager.uiState,
        });
    }

    public endPostAsUnknown(stateManager: StateManager<TState, TOperation>): void {
        this.add({
            type: 'endPostAsUnknown',
            uiState: stateManager.uiState,
        });
    }
}
