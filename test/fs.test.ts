import { Result } from '@kizahasi/result';
import fc from 'fast-check';
import { getArbitrary } from 'fast-check-io-ts';
import * as Room from '../src/internal/ot/room/v1';
import { normalizeRoomState } from './normalizeRoomState';

// 組み合わせ量が多いため、デフォルト値(100)より多い値を設定している
const numRuns = 500;

it.concurrent('tests Room.apply', () => {
    fc.assert(
        fc.property(getArbitrary(Room.state), getArbitrary(Room.state), (prevState, nextState) => {
            const diff = Room.diff({ prevState, nextState });
            if (diff == null) {
                expect(prevState).toEqual(nextState);
                return;
            }
            const actualNextState = Room.apply({
                state: prevState,
                operation: Room.toUpOperation(diff),
            });
            if (actualNextState.isError) {
                fail('isError should not be true');
            }
            expect({
                ...normalizeRoomState(actualNextState.value),
                createdBy: undefined,
            }).toEqual({
                ...normalizeRoomState(nextState),
                createdBy: undefined,
            });
        }),
        { numRuns }
    );
});

it.concurrent('tests Room.applyBack', () => {
    fc.assert(
        fc.property(getArbitrary(Room.state), getArbitrary(Room.state), (prevState, nextState) => {
            const diff = Room.diff({ prevState, nextState });
            if (diff == null) {
                expect(prevState).toEqual(nextState);
                return;
            }
            const actualPrevState = Room.applyBack({
                state: nextState,
                operation: Room.toDownOperation(diff),
            });
            if (actualPrevState.isError) {
                fail('isError should not be true');
            }
            expect({
                ...normalizeRoomState(actualPrevState.value),
                createdBy: undefined,
            }).toEqual({
                ...normalizeRoomState(prevState),
                createdBy: undefined,
            });
        }),
        { numRuns }
    );
});

it.concurrent('tests Room.composeDownOperation', () => {
    fc.assert(
        fc.property(
            getArbitrary(Room.state),
            getArbitrary(Room.state),
            getArbitrary(Room.state),
            (state1, state2, state3) => {
                const diff1 = Room.diff({ prevState: state1, nextState: state2 });
                const diff2 = Room.diff({ prevState: state2, nextState: state3 });
                if (diff1 == null || diff2 == null) {
                    return;
                }
                const actualDownOperation = Room.composeDownOperation({
                    first: Room.toDownOperation(diff1),
                    second: Room.toDownOperation(diff2),
                });
                if (actualDownOperation.isError) {
                    fail('isError should not be true');
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
                expect({
                    ...normalizeRoomState(actualState.value),
                }).toEqual({
                    ...normalizeRoomState(expectedState.value),
                });
            }
        ),
        { numRuns }
    );
});
