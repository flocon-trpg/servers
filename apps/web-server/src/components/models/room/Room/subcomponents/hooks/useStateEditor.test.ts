// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { CreateModeParams, UpdateModeParams, useStateEditor } from './useStateEditor';
import { it, expect, describe, vi } from 'vitest';

type Props<T> = {
    createMode: CreateModeParams<T> | undefined;
    updateMode: UpdateModeParams<T> | undefined;
};

describe('useStateEditor', () => {
    it.each([true, false])('tests empty mode', okFirst => {
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
        let firstAct;
        let secondAct;
        if (okFirst) {
            firstAct = invokeOk;
            secondAct = invokeUpdateState;
        } else {
            firstAct = invokeUpdateState;
            secondAct = invokeOk;
        }

        firstAct();
        expect(result.current.state).toBeUndefined();
        secondAct();
        expect(result.current.state).toBeUndefined();
    });

    it('tests createMode', () => {
        const onCreate = vi.fn<(_: string) => void>();
        const initialProps: Props<string> = {
            createMode: {
                createInitState: () => 'init',
                onCreate,
            },
            updateMode: undefined,
        };
        const { result } = renderHook(props => useStateEditor<string>(props), {
            initialProps,
        });
        expect(result.current.state).toBe('init');
        expect(onCreate).not.toHaveBeenCalled();
    });

    it('tests createMode->updateState', () => {
        const onCreate = vi.fn<(_: string) => void>();
        const initialProps: Props<string> = {
            createMode: {
                createInitState: () => 'init1',
                onCreate,
            },
            updateMode: undefined,
        };
        const { result } = renderHook(props => useStateEditor<string>(props), { initialProps });
        act(() => {
            result.current.updateState(prevState => {
                expect(prevState).toBe('init1');
                return 'updated1';
            });
        });
        expect(onCreate).not.toHaveBeenCalled();
        expect(result.current.state).toBe('updated1');
    });

    it('tests createMode->ok', () => {
        const onCreate = vi.fn<(_: string) => void>();
        let createInitState: () => string = () => 'init1';
        const initialProps: Props<string> = {
            createMode: {
                createInitState: () => createInitState(),
                onCreate,
            },
            updateMode: undefined,
        };
        const { result } = renderHook(props => useStateEditor<string>(props), {
            initialProps,
        });
        act(() => {
            createInitState = () => 'init2';
            const okResult = result.current.ok();
            expect(okResult.value).toBe('init1');
        });
        expect(result.current.state).toBe('init1');
        expect(onCreate).toHaveBeenCalledTimes(1);
        expect(onCreate.mock.lastCall?.[0]).toBe('init1');
    });

    it.each([
        {
            setUpdateInitState: true,
            emptyModeBeforeSecondCreateMode: true,
        },
        {
            setUpdateInitState: false,
            emptyModeBeforeSecondCreateMode: true,
        },
        {
            setUpdateInitState: true,
            emptyModeBeforeSecondCreateMode: false,
        },
        {
            setUpdateInitState: false,
            emptyModeBeforeSecondCreateMode: false,
        },
    ])(
        'tests createMode->updateState->(empty mode)?->createMode',
        ({ setUpdateInitState, emptyModeBeforeSecondCreateMode }) => {
            const initialProps: Props<string> = {
                createMode: {
                    createInitState: () => 'init1',
                    onCreate: () => undefined,
                },
                updateMode: undefined,
            };
            const { result, rerender } = renderHook(props => useStateEditor<string>(props), {
                initialProps,
            });
            act(() => {
                result.current.updateState(() => 'updated1');
            });
            if (emptyModeBeforeSecondCreateMode) {
                rerender({ createMode: undefined, updateMode: undefined });
            }
            const onCreate = vi.fn<(_: string) => void>();
            const props2: Props<string> = {
                createMode: {
                    createInitState: () => 'init2',
                    updateInitState: setUpdateInitState
                        ? (prevState: string) => {
                              expect(prevState).toBe('updated1');
                              return 'updated-updated1';
                          }
                        : undefined,
                    onCreate,
                },
                updateMode: undefined,
            };
            rerender(props2);
            // ok を実行しない限り、createInitStateは原則として実行されない。
            // 理由は、以前のstateが残っていたほうがユーザー体験の向上が期待できるため。
            // ただし、PiecePositionなど一部の値を変更したいこともあるので、その場合はupdateInitStateを使う。
            expect(result.current.state).toBe(setUpdateInitState ? 'updated-updated1' : 'updated1');
            expect(onCreate).not.toHaveBeenCalled();
        },
    );

    it('tests updateMode', () => {
        const updateWithImmer = vi.fn();
        const initialProps: Props<string> = {
            createMode: undefined,
            updateMode: {
                state: 'init',
                onUpdate: updateWithImmer,
            },
        };
        const { result } = renderHook(props => useStateEditor<string>(props), {
            initialProps,
        });
        expect(result.current.state).toBe('init');
        expect(updateWithImmer).not.toHaveBeenCalled();
    });

    it('tests updateMode->updateState', () => {
        const onUpdate = vi.fn<(_: string) => void>();
        const initialProps: Props<string> = {
            createMode: undefined,
            updateMode: {
                state: 'init',
                onUpdate,
            },
        };
        const { result } = renderHook(props => useStateEditor<string>(props), {
            initialProps,
        });
        act(() =>
            result.current.updateState(prevState => {
                expect(prevState).toBe('init');
                return 'next';
            }),
        );
        // onUpdateをトリガーとしてpropsを外部から変更するまでstateは変わらない
        expect(result.current.state).toBe('init');
        expect(onUpdate).toHaveBeenCalledTimes(1);
        expect(onUpdate.mock.lastCall?.[0]).toBe('next');
    });

    it('tests updateMode->updateMode', () => {
        const initialProps: Props<string> = {
            createMode: undefined,
            updateMode: {
                state: 'init',
                onUpdate: () => undefined,
            },
        };
        const { result, rerender } = renderHook(props => useStateEditor<string>(props), {
            initialProps,
        });
        const updateWithImmer = vi.fn();
        const nextProps: Props<string> = {
            createMode: undefined,
            updateMode: {
                state: 'next',
                onUpdate: updateWithImmer,
            },
        };
        rerender(nextProps);
        expect(result.current.state).toBe('next');
        expect(updateWithImmer).not.toHaveBeenCalled();
    });
});
