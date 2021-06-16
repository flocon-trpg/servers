import { StateManager } from './StateManager';

type Operation = {
    oldValue: number;
    newValue: number;
}

const initRevision = 0;
const initState = 0;

const createStateManager = () => new StateManager<number, Operation>({
    revision: initRevision,
    state: initState,
    apply: ({ state, operation }) => {
        if (state !== operation.oldValue) {
            throw 'Failure at apply: state !== operation.oldValue';
        }
        return operation.newValue;
    },
    transform: ({ first, second }) => {
        if (first.oldValue !== second.oldValue) {
            throw 'Failure at transform: first.oldValue !== second.oldValue';
        }
        return {
            firstPrime: { oldValue: second.newValue, newValue: first.newValue },
            secondPrime: { oldValue: first.newValue, newValue: first.newValue },
        };
    },
    diff: ({ prevState: prev, nextState: next }) => prev === next ? undefined : ({
        oldValue: prev,
        newValue: next,
    }),
});

it('tests init StateManager', () => {
    const target = createStateManager();

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision);
    expect(target.uiState).toBe(0);
    expect(target.waitingResponseSince()).toBeNull();
});

it('tests StateManager.operate', () => {
    const target = createStateManager();

    const newState = 2;
    target.operate({ oldValue: initState, newValue: newState });

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision);
    expect(target.uiState).toBe(newState);
    expect(target.waitingResponseSince()).toBeNull();
});

it('tests StateManager.post', () => {
    const operation = { oldValue: initState, newValue: 2 };

    const target = createStateManager();

    target.operate(operation);
    const postResult = target.post();

    expect(target.isPosting).toBe(true);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision);
    expect(target.uiState).toBe(operation.newValue);
    expect(target.waitingResponseSince()).not.toBeNull();

    if (postResult === undefined) {
        expect(postResult).not.toBeUndefined();
        throw new Error('Guard');
    }
    expect(postResult.actualState).toBe(0);
    expect(postResult.operationToPost).toEqual(operation);
    expect(postResult.revision).toBe(initRevision);
});

it('tests StateManager: post -> non-id onPosted', () => {
    const operation = { oldValue: initState, newValue: 2 };
    const resultOperation = { oldValue: initState, newValue: 20 };

    const target = createStateManager();

    target.operate(operation);
    const postResult = target.post();
    if (postResult === undefined) {
        throw new Error('Guard');
    }

    postResult.onPosted({
        isSuccess: true,
        isId: false,
        revisionTo: initRevision + 1,
        result: resultOperation,
    });

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision + 1);
    expect(target.uiState).toBe(resultOperation.newValue);
    expect(target.waitingResponseSince()).toBeNull();
});

it('tests StateManager: post -> onPosted({ isId: true })', () => {
    const operation = { oldValue: initState, newValue: 2 };

    const target = createStateManager();

    target.operate(operation);
    const postResult = target.post();
    if (postResult === undefined) {
        throw new Error('Guard');
    }

    postResult.onPosted({
        isSuccess: true,
        isId: true,
        requestId: postResult.requestId,
    });

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision);
    expect(target.uiState).toBe(initState);
    expect(target.waitingResponseSince()).toBeNull();
});

it('tests StateManager: post -> onPosted({ isSuccess: null })', () => {
    const operation = { oldValue: initState, newValue: 2 };

    const target = createStateManager();

    target.operate(operation);
    const postResult = target.post();
    if (postResult === undefined) {
        throw new Error('Guard');
    }

    postResult.onPosted({
        isSuccess: null,
    });

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(true);
    expect(target.uiState).toBe(operation.newValue);
});

it('tests StateManager: post -> onPosted({ isSuccess: false })', () => {
    const operation = { oldValue: initState, newValue: 2 };

    const target = createStateManager();

    target.operate(operation);
    const postResult = target.post();
    if (postResult === undefined) {
        throw new Error('Guard');
    }

    postResult.onPosted({
        isSuccess: false,
    });

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision);
    expect(target.uiState).toBe(operation.newValue);
    expect(target.waitingResponseSince()).toBeNull();
});

it('tests StateManager.onOthersGet(initRevision + 1)', () => {
    const operation = { oldValue: initState, newValue: 2 };

    const target = createStateManager();

    target.onOtherClientsGet(operation, initRevision + 1);

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision + 1);
    expect(target.uiState).toBe(operation.newValue);
    expect(target.waitingResponseSince()).toBeNull();
});

test.each([initRevision - 1, initRevision])('tests StateManager.onOthersGet(%i)', revision => {
    const operation = { oldValue: initState, newValue: 2 };

    const target = createStateManager();

    target.onOtherClientsGet(operation, revision);

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision);
    expect(target.uiState).toBe(initState);
    expect(target.waitingResponseSince()).toBeNull();
});

test('tests StateManager: onOthersGet(initRevision + 2)', () => {
    const operation = { oldValue: initState, newValue: 2 };

    const target = createStateManager();

    target.onOtherClientsGet(operation, initRevision + 2);

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision);
    expect(target.uiState).toBe(initState);
    expect(target.waitingResponseSince()).not.toBeNull();
});

test('tests StateManager.onOthersGet(initRevision + 2) -> onOthersGet(initRevision + 1)', () => {
    const firstOperation = { oldValue: initState, newValue: 2 };
    const secondOperation = { oldValue: 2, newValue: 20 };

    const target = createStateManager();

    target.onOtherClientsGet(secondOperation, initRevision + 2);
    target.onOtherClientsGet(firstOperation, initRevision + 1);

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision + 2);
    expect(target.uiState).toBe(secondOperation.newValue);
    expect(target.waitingResponseSince()).toBeNull();
});

it('tests StateManager: post -> onPosted -> onOthersGet(initRevision + 2)', () => {
    const operation = { oldValue: initState, newValue: 2 };
    const operationResult = { oldValue: initState, newValue: 20 };
    const otherClientsGet = { oldValue: 20, newValue: 200 };

    const target = createStateManager();

    target.operate(operation);
    const postResult = target.post();
    if (postResult === undefined) {
        throw new Error('Guard');
    }

    postResult.onPosted({
        isSuccess: true,
        isId: false,
        revisionTo: initRevision + 1,
        result: operationResult,
    });
    target.onOtherClientsGet(otherClientsGet, initRevision + 2);

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision + 2);
    expect(target.uiState).toBe(otherClientsGet.newValue);
    expect(target.waitingResponseSince()).toBeNull();
});

test('tests StateManager: post -> onOthersGet(initRevision + 2) -> onPosted', () => {
    const firstOperation = { oldValue: initState, newValue: 2 };
    const secondOperation = { oldValue: 20, newValue: 200 };
    const firstOperationResult = { oldValue: initState, newValue: 20 };

    const target = createStateManager();

    target.operate(firstOperation);
    const postResult = target.post();
    if (postResult === undefined) {
        throw new Error('Guard');
    }

    target.onOtherClientsGet(secondOperation, initRevision + 2);
    postResult.onPosted({
        isSuccess: true,
        isId: false,
        revisionTo: initRevision + 1,
        result: firstOperationResult,
    });

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision + 2);
    expect(target.uiState).toBe(secondOperation.newValue);
    expect(target.waitingResponseSince()).toBeNull();
});

test('tests StateManager: operate -> post -> operate -> onPosted({ isSuccess: true })', () => {
    const firstOperation = { oldValue: initState, newValue: 2 };
    const secondOperation = { oldValue: 2, newValue: 20 };
    const firstOperationResult = { oldValue: initState, newValue: 200 };

    const target = createStateManager();

    target.operate(firstOperation);

    const postResult = target.post();
    if (postResult === undefined) {
        throw new Error('Guard');
    }

    target.operate(secondOperation);

    postResult.onPosted({
        isSuccess: true,
        isId: false,
        revisionTo: initRevision + 1,
        result: firstOperationResult,
    });

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision + 1);
    expect(target.uiState).toBe(secondOperation.newValue);
    expect(target.waitingResponseSince()).toBeNull();
});