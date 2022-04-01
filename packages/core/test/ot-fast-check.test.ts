import { Result } from '@kizahasi/result';
import fc from 'fast-check';
import { getArbitrary } from 'fast-check-io-ts';
import {
    State,
    state,
    diff,
    apply,
    toUpOperation,
    applyBack,
    toDownOperation,
    composeDownOperation,
    restore,
    clientTransform,
} from '../src';
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

type RoomState = State<typeof RoomTypes.template>;
// {exact:true} だとfast-check-io-tsで生成されるオブジェクトが何故か{}のみになるため、{exact:false}としている。
const roomState = state(RoomTypes.template, { exact: false });

const expectRoomStateToEqual = (actual: RoomState, expected: RoomState) => {
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
        fc.property(getArbitrary(roomState as any), (state: RoomState) => {
            const d = diff(RoomTypes.template)({ prevState: state, nextState: state });
            expect(d).toBeUndefined();
        }),
        { numRuns }
    );
});

it.concurrent('tests Room.apply', () => {
    fc.assert(
        fc.property(
            getArbitrary(roomState as any),
            getArbitrary(roomState as any),
            (prevState: RoomState, nextState: RoomState) => {
                const d = diff(RoomTypes.template)({ prevState, nextState });
                if (d == null) {
                    fc.pre(false);
                    return;
                }
                const actualNextState = apply(RoomTypes.template)({
                    state: prevState,
                    operation: toUpOperation(RoomTypes.template)(d),
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
            getArbitrary(roomState as any),
            getArbitrary(roomState as any),
            (prevState: RoomState, nextState: RoomState) => {
                const d = diff(RoomTypes.template)({ prevState, nextState });
                if (d == null) {
                    fc.pre(false);
                    return;
                }
                const actualPrevState = applyBack(RoomTypes.template)({
                    state: nextState,
                    operation: toDownOperation(RoomTypes.template)(d),
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
            getArbitrary(roomState as any),
            getArbitrary(roomState as any),
            getArbitrary(roomState as any),
            (state1: RoomState, state2: RoomState, state3: RoomState) => {
                const diff1 = diff(RoomTypes.template)({ prevState: state1, nextState: state2 });
                const diff2 = diff(RoomTypes.template)({ prevState: state2, nextState: state3 });
                if (diff1 == null || diff2 == null) {
                    fc.pre(false);
                    return;
                }
                const actualDownOperation = composeDownOperation(RoomTypes.template)({
                    first: toDownOperation(RoomTypes.template)(diff1),
                    second: toDownOperation(RoomTypes.template)(diff2),
                });
                if (actualDownOperation.isError) {
                    throw actualDownOperation.error;
                }
                const expectedTwoWayOperation = diff(RoomTypes.template)({
                    prevState: state1,
                    nextState: state3,
                });
                const actualState =
                    actualDownOperation.value == null
                        ? Result.ok(state3)
                        : applyBack(RoomTypes.template)({
                              state: state3,
                              operation: actualDownOperation.value,
                          });
                const expectedState =
                    expectedTwoWayOperation == null
                        ? Result.ok(state3)
                        : applyBack(RoomTypes.template)({
                              state: state3,
                              operation: toDownOperation(RoomTypes.template)(
                                  expectedTwoWayOperation
                              ),
                          });
                if (actualState.isError || expectedState.isError) {
                    throw new Error('isError should not be true');
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
            getArbitrary(roomState as any),
            getArbitrary(roomState as any),
            (prevState: RoomState, nextState: RoomState) => {
                const d = diff(RoomTypes.template)({ prevState, nextState });
                if (d == null) {
                    fc.pre(false);
                    return;
                }
                const actual = restore(RoomTypes.template)({
                    nextState,
                    downOperation: toDownOperation(RoomTypes.template)(d),
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

                const actualUpOperation = toUpOperation(RoomTypes.template)(
                    actual.value.twoWayOperation
                );
                const actualNextState = apply(RoomTypes.template)({
                    state: prevState,
                    operation: actualUpOperation,
                });
                if (actualNextState.isError) {
                    throw actualNextState.error;
                }
                expectRoomStateToEqual(Result.get(actualNextState), nextState);

                const actualDownOperation = toDownOperation(RoomTypes.template)(
                    actual.value.twoWayOperation
                );
                const actualPrevState = applyBack(RoomTypes.template)({
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

// serverTransformは、IDがisValidKeyの検証に失敗したときなどにエラーが発生するため、fast-checkを用いたテストは難しい。

it.concurrent('tests Room.clientTransform', () => {
    fc.assert(
        fc.property(
            getArbitrary(roomState as any),
            getArbitrary(roomState as any),
            getArbitrary(roomState as any),
            (rootState, nextState1, nextState2) => {
                const twoWayFirst = diff(RoomTypes.template)({
                    prevState: rootState,
                    nextState: nextState1,
                });
                const twoWaySecond = diff(RoomTypes.template)({
                    prevState: rootState,
                    nextState: nextState2,
                });
                if (twoWayFirst == null || twoWaySecond == null) {
                    fc.pre(false);
                    return;
                }
                const first = toUpOperation(RoomTypes.template)(twoWayFirst);
                const second = toUpOperation(RoomTypes.template)(twoWaySecond);
                const actual = clientTransform(RoomTypes.template)({
                    first,
                    second,
                });
                if (actual.isError) {
                    throw actual.error;
                }
                const firstThenSecondPrime =
                    actual.value.secondPrime == null
                        ? Result.ok(nextState1)
                        : apply(RoomTypes.template)({
                              state: nextState1,
                              operation: actual.value.secondPrime,
                          });
                const secondThenFirstPrime =
                    actual.value.firstPrime == null
                        ? Result.ok(nextState2)
                        : apply(RoomTypes.template)({
                              state: nextState2,
                              operation: actual.value.firstPrime,
                          });
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
