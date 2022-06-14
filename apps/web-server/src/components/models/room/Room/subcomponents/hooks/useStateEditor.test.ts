import { act, renderHook } from '@testing-library/react';
import { CreateModeParams, UpdateModeParams, useStateEditor } from './useStateEditor';

type Props<T> = {
    createMode: CreateModeParams<T> | undefined;
    updateMode: UpdateModeParams<T> | undefined;
};

describe('useStateEditor', () => {
    it.each([true, false])('tests { createMode: undefined, updateMode: undefined }', okFirst => {
        const { result } = renderHook(props => useStateEditor<string>(props), {
            initialProps: { createMode: undefined, updateMode: undefined },
        });

        expect(result.current.state).toBeUndefined();

        const invokeOk = () =>
            act(() => {
                const okResult = result.current.ok();
                expect(okResult.isNone).toBe(true);
            });
        const invokeUpdateState = () =>
            act(() => {
                result.current.updateState(() => 'DUMMY');
            });

        if (okFirst) {
            invokeOk();
            invokeUpdateState();
        } else {
            invokeUpdateState();
            invokeOk();
        }

        expect(result.current.state).toBeUndefined();
    });

    it('tests create->updateState', () => {
        let stateToCreate: string | undefined = undefined;
        const initialProps: Props<string> = {
            createMode: {
                createInitState: () => 'init1',
                onCreate: x => {
                    stateToCreate = x;
                },
            },
            updateMode: undefined,
        };
        const { result } = renderHook(props => useStateEditor<string>(props), { initialProps });
        expect(result.current.state).toBe('init1');
        expect(stateToCreate).toBeUndefined();
        act(() => {
            result.current.updateState(prevState => {
                expect(prevState).toBe('init1');
                return 'updated1';
            });
        });
        expect(stateToCreate).toBeUndefined();
        expect(result.current.state).toBe('updated1');
    });

    it('tests create->ok', () => {
        let stateToCreate: string | undefined = undefined;
        let createInitState: () => string = () => 'init1';
        const initialProps: Props<string> = {
            createMode: {
                createInitState: () => createInitState(),
                onCreate: x => {
                    stateToCreate = x;
                },
            },
            updateMode: undefined,
        };
        const { result } = renderHook(props => useStateEditor<string>(props), {
            initialProps,
        });
        expect(result.current.state).toBe('init1');
        expect(stateToCreate).toBeUndefined();
        act(() => {
            createInitState = () => 'init2';
            const okResult = result.current.ok();
            expect(okResult.value).toBe('init1');
        });
        expect(stateToCreate).toBe('init1');
        expect(result.current.state).toBe('init1');
    });

    it.each([true, false])('tests create->create', updateInitState => {
        let stateToCreate: string | undefined = undefined;
        const initialProps: Props<string> = {
            createMode: {
                createInitState: () => 'init1',
                onCreate: x => {
                    stateToCreate = x;
                },
            },
            updateMode: undefined,
        };
        const { result, rerender } = renderHook(props => useStateEditor<string>(props), {
            initialProps,
        });
        act(() => {
            result.current.updateState(() => 'updated1');
        });
        const props2: Props<string> = {
            createMode: {
                createInitState: () => 'init2',
                updateInitState: updateInitState
                    ? (prevState: string) => {
                          expect(prevState).toBe('init1');
                          return 'updatedInit1';
                      }
                    : undefined,
                onCreate: (x: string) => {
                    stateToCreate = x;
                },
            },
            updateMode: undefined,
        };
        rerender(props2);
        // ok を実行しない限り、createInitStateは原則として実行されない。
        // 理由は、以前のstateが残っていたほうがユーザー体験の向上が期待できるため。
        // ただし、PiecePositionなど一部の値を変更したいこともあるので、その場合はupdateInitStateを使う。
        expect(result.current.state).toBe(updateInitState ? 'updatedInit1' : 'init1');
        expect(stateToCreate).toBeUndefined();
    });
});
