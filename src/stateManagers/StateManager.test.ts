import { StateManager } from './StateManager';

const initRevision = 0;
const initState = 0;

const createStateManager = () => new StateManager<number, number, number>({
    revision: initRevision,
    state: initState,
    applyGetOperation: ({ state, operation }) => state + operation,
    applyPostOperation: ({ state, operation }) => state + operation,
    composePostOperation: ({ first, second }) => first + second,
    transform: ({ first, second }) => ({ firstPrime: first, secondPrime: second }),
    diff: ({ prev, next }) => next - prev,
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

    target.operate(2);

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision);
    expect(target.uiState).toBe(initState + 2);
    expect(target.waitingResponseSince()).toBeNull();
});

it('tests StateManager.post', () => {
    const operation = 2;

    const target = createStateManager();

    target.operate(operation);
    const postResult = target.post();

    expect(target.isPosting).toBe(true);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision);
    expect(target.uiState).toBe(initState + operation);
    expect(target.waitingResponseSince()).not.toBeNull();

    if (postResult === undefined) {
        expect(postResult).not.toBeUndefined();
        throw 'Guard';
    }
    expect(postResult.actualState).toBe(0);
    expect(postResult.operationToPost).toBe(operation);
    expect(postResult.revision).toBe(initRevision);
});

it('tests StateManager.post -> non-id onPosted', () => {
    const operation = 2;
    const resultOperation = 20;

    const target = createStateManager();

    target.operate(operation);
    const postResult = target.post();
    if (postResult === undefined) {
        throw 'Guard';
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
    expect(target.uiState).toBe(initState + resultOperation);
    expect(target.waitingResponseSince()).toBeNull();
});

it('tests StateManager.post -> id onPosted', () => {
    const operation = 2;

    const target = createStateManager();

    target.operate(operation);
    const postResult = target.post();
    if (postResult === undefined) {
        throw 'Guard';
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

it('tests StateManager.post -> onPosted({ isSuccess: null })', () => {
    const operation = 2;

    const target = createStateManager();

    target.operate(operation);
    const postResult = target.post();
    if (postResult === undefined) {
        throw 'Guard';
    }

    postResult.onPosted({
        isSuccess: null,
    });

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(true);
    expect(target.uiState).toBe(initState + operation);
});

it('tests StateManager.post -> onPosted({ isSuccess: false })', () => {
    const operation = 2;

    const target = createStateManager();

    target.operate(operation);
    const postResult = target.post();
    if (postResult === undefined) {
        throw 'Guard';
    }

    postResult.onPosted({
        isSuccess: false,
    });

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision);
    expect(target.uiState).toBe(initState + operation);
    expect(target.waitingResponseSince()).toBeNull();
});

it('tests StateManager.onOthersGet(initRevision + 1)', () => {
    const operation = 2;

    const target = createStateManager();

    target.onOthersGet(operation, initRevision + 1);

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision + 1);
    expect(target.uiState).toBe(initState + operation);
    expect(target.waitingResponseSince()).toBeNull();
});

test.each([initRevision - 1, initRevision])('tests StateManager.onOthersGet(%i)', revision => {
    const operation = 2;

    const target = createStateManager();

    target.onOthersGet(operation, revision);

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision);
    expect(target.uiState).toBe(initState);
    expect(target.waitingResponseSince()).toBeNull();
});

test('tests StateManager.onOthersGet(initRevision + 2)', () => {
    const operation = 2;

    const target = createStateManager();

    target.onOthersGet(operation, initRevision + 2);

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision);
    expect(target.uiState).toBe(initState);
    expect(target.waitingResponseSince()).not.toBeNull();
});

test('tests StateManager.onOthersGet(initRevision + 2) -> onOthersGet(initRevision + 1)', () => {
    const firstOperation = 2;
    const secondOperation = 20;

    const target = createStateManager();

    target.onOthersGet(firstOperation, initRevision + 2);
    target.onOthersGet(secondOperation, initRevision + 1);

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision + 2);
    expect(target.uiState).toBe(initState + firstOperation + secondOperation);
    expect(target.waitingResponseSince()).toBeNull();
});

test('tests StateManager.post -> onOthersGet(initRevision + 2) -> onPosted', () => {
    const firstOperation = 2;
    const secondOperation = 20;
    const firstOperationResult = 200;

    const target = createStateManager();

    target.operate(firstOperation);
    const postResult = target.post();
    if (postResult === undefined) {
        throw 'Guard';
    }

    target.onOthersGet(secondOperation, initRevision + 2);
    postResult.onPosted({
        isSuccess: true,
        isId: false,
        revisionTo: initRevision + 1,
        result: firstOperationResult,
    });

    expect(target.isPosting).toBe(false);
    expect(target.requiresReload).toBe(false);
    expect(target.revision).toBe(initRevision + 2);
    expect(target.uiState).toBe(initState + firstOperationResult + secondOperation);
    expect(target.waitingResponseSince()).toBeNull();
});