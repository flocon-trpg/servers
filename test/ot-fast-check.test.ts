import { Result } from '@kizahasi/result';
import fc from 'fast-check';
import { getArbitrary } from 'fast-check-io-ts';
import * as Room from '../src/internal/ot/room/functions';
import * as RoomTypes from '../src/internal/ot/room/types';
import { normalizeRoomState } from './normalizeRoomState';

const TEST_NUM_RUNS = process.env.TEST_NUM_RUNS;
let numRuns: number;
if (TEST_NUM_RUNS == null) {
    // 組み合わせ量が多いため、numRuns=100では足りない
    // TEST_NUM_RUNSの値を大きくしたテストをCIなど別箇所で行う前提のため、numRunsの初期値はテストを高速化する目的で100という小さめの値にしている
    numRuns = 100;
} else {
    numRuns = parseInt(TEST_NUM_RUNS);
    if (isNaN(numRuns)) {
        throw new Error('TEST_NUM_RUNS must be empty or integer');
    }
}

console.log(`numRuns: ${numRuns}`);

const expectRoomStateToEqual = (actual: RoomTypes.State, expected: RoomTypes.State) => {
    expect({
        ...normalizeRoomState(actual),
        createdBy: undefined,
    }).toEqual({
        ...normalizeRoomState(expected),
        createdBy: undefined,
    });
};

// fc.preで弾かれるパターンをテストしている
it.concurrent('tests id diff', () => {
    fc.assert(
        fc.property(getArbitrary(RoomTypes.state), state => {
            const diff = Room.diff({ prevState: state, nextState: state });
            expect(diff).toBeUndefined();
        }),
        { numRuns }
    );
});

it.concurrent('tests Room.apply', () => {
    fc.assert(
        fc.property(
            getArbitrary(RoomTypes.state),
            getArbitrary(RoomTypes.state),
            (prevState, nextState) => {
                const diff = Room.diff({ prevState, nextState });
                if (diff == null) {
                    fc.pre(false);
                    return;
                }
                const actualNextState = Room.apply({
                    state: prevState,
                    operation: Room.toUpOperation(diff),
                });
                if (actualNextState.isError) {
                    throw actualNextState.error;
                }
                expectRoomStateToEqual(actualNextState.value, nextState);
            }
        ),
        { numRuns }
    );
});

it.concurrent('tests Room.applyBack', () => {
    fc.assert(
        fc.property(
            getArbitrary(RoomTypes.state),
            getArbitrary(RoomTypes.state),
            (prevState, nextState) => {
                const diff = Room.diff({ prevState, nextState });
                if (diff == null) {
                    fc.pre(false);
                    return;
                }
                const actualPrevState = Room.applyBack({
                    state: nextState,
                    operation: Room.toDownOperation(diff),
                });
                if (actualPrevState.isError) {
                    throw actualPrevState.error;
                }
                expectRoomStateToEqual(actualPrevState.value, prevState);
            }
        ),
        { numRuns }
    );
});

it.concurrent('tests Room.composeDownOperation', () => {
    fc.assert(
        fc.property(
            getArbitrary(RoomTypes.state),
            getArbitrary(RoomTypes.state),
            getArbitrary(RoomTypes.state),
            (state1, state2, state3) => {
                const diff1 = Room.diff({ prevState: state1, nextState: state2 });
                const diff2 = Room.diff({ prevState: state2, nextState: state3 });
                if (diff1 == null || diff2 == null) {
                    fc.pre(false);
                    return;
                }
                const actualDownOperation = Room.composeDownOperation({
                    first: Room.toDownOperation(diff1),
                    second: Room.toDownOperation(diff2),
                });
                if (actualDownOperation.isError) {
                    throw actualDownOperation.error;
                }
                const expectedTwoWayOperation = Room.diff({ prevState: state1, nextState: state3 });
                const actualState =
                    actualDownOperation.value == null
                        ? Result.ok(state3)
                        : Room.applyBack({
                              state: state3,
                              operation: actualDownOperation.value,
                          });
                const expectedState =
                    expectedTwoWayOperation == null
                        ? Result.ok(state3)
                        : Room.applyBack({
                              state: state3,
                              operation: Room.toDownOperation(expectedTwoWayOperation),
                          });
                if (actualState.isError || expectedState.isError) {
                    fail('isError should not be true');
                }
                expectRoomStateToEqual(actualState.value, expectedState.value);
            }
        ),
        { numRuns }
    );
});

it.concurrent('tests Room.restore', () => {
    fc.assert(
        fc.property(
            getArbitrary(RoomTypes.state),
            getArbitrary(RoomTypes.state),
            (prevState, nextState) => {
                const diff = Room.diff({ prevState, nextState });
                if (diff == null) {
                    fc.pre(false);
                    return;
                }
                const actual = Room.restore({
                    nextState,
                    downOperation: Room.toDownOperation(diff),
                });

                if (actual.isError) {
                    // 例えばstrParamなどのキャラクターのパラメーターは、nextStateになったときに削除されることはありえず、Errorとなる。そのようなケースをここで弾いている。
                    fc.pre(false);
                    throw actual.error;
                }

                expectRoomStateToEqual(actual.value.prevState, prevState);

                if (actual.value.twoWayOperation == null) {
                    expectRoomStateToEqual(prevState, nextState);
                    return;
                }

                const actualUpOperation = Room.toUpOperation(actual.value.twoWayOperation);
                const actualNextState = Room.apply({
                    state: prevState,
                    operation: actualUpOperation,
                });
                if (actualNextState.isError) {
                    throw actualNextState.error;
                }
                expectRoomStateToEqual(Result.get(actualNextState), nextState);

                const actualDownOperation = Room.toDownOperation(actual.value.twoWayOperation);
                const actualPrevState = Room.applyBack({
                    state: nextState,
                    operation: actualDownOperation,
                });
                if (actualPrevState.isError) {
                    throw actualPrevState.error;
                }
                expectRoomStateToEqual(Result.get(actualPrevState), prevState);
            }
        ),
        { numRuns }
    );
});

it.concurrent('tests Room.clientTransform', () => {
    fc.assert(
        fc.property(
            getArbitrary(RoomTypes.state),
            getArbitrary(RoomTypes.state),
            getArbitrary(RoomTypes.state),
            (rootState, nextState1, nextState2) => {
                const twoWayFirst = Room.diff({ prevState: rootState, nextState: nextState1 });
                const twoWaySecond = Room.diff({ prevState: rootState, nextState: nextState2 });
                if (twoWayFirst == null || twoWaySecond == null) {
                    fc.pre(false);
                    return;
                }
                const first = Room.toUpOperation(twoWayFirst);
                const second = Room.toUpOperation(twoWaySecond);
                const actual = Room.clientTransform({
                    first,
                    second,
                });
                if (actual.isError) {
                    throw actual.error;
                }
                const firstThenSecondPrime =
                    actual.value.secondPrime == null
                        ? Result.ok(nextState1)
                        : Room.apply({ state: nextState1, operation: actual.value.secondPrime });
                const secondThenFirstPrime =
                    actual.value.firstPrime == null
                        ? Result.ok(nextState2)
                        : Room.apply({ state: nextState2, operation: actual.value.firstPrime });
                if (firstThenSecondPrime.isError) {
                    throw firstThenSecondPrime.error;
                }
                if (secondThenFirstPrime.isError) {
                    throw secondThenFirstPrime.error;
                }

                expectRoomStateToEqual(firstThenSecondPrime.value, secondThenFirstPrime.value);
            }
        ),
        { numRuns }
    );
});
