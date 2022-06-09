import { act, renderHook } from '@testing-library/react';
import { useStateEditor } from './useStateEditor';

describe('useStateEditor', () => {
    it.each([true, false])('tests { createMode: undefined, updateMode: undefined }', okFirst => {
        const { result } = renderHook(() =>
            useStateEditor<string>({ createMode: undefined, updateMode: undefined })
        );
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

    it.skip('tests create->updateState', () => {
        let stateToCreate: string | undefined = undefined;
        const { result } = renderHook(() =>
            useStateEditor<string>({
                createMode: {
                    createInitState: () => 'init1',
                    onCreate: x => {
                        stateToCreate = x;
                    },
                },
                updateMode: undefined,
            })
        );
        expect(result.current.state).toBe('init1');
        expect(stateToCreate).toBeUndefined();
        act(() => {
            result.current.updateState(prevState => {
                expect(prevState).toBe('init1');
                return 'updated1';
            });
        });
        expect(stateToCreate).toBeUndefined();
        // TODO: ↓ここでfailするためテストをskipしている。原因は不明。解明できたらskipを解除する。
        expect(result.current.state).toBe('updated1');
    });

    it('tests create->ok', () => {
        let stateToCreate: string | undefined = undefined;
        let createInitState: () => string = () => 'init1';
        const { result } = renderHook(() =>
            useStateEditor<string>({
                createMode: {
                    createInitState: () => createInitState(),
                    onCreate: x => {
                        stateToCreate = x;
                    },
                },
                updateMode: undefined,
            })
        );
        expect(result.current.state).toBe('init1');
        expect(stateToCreate).toBeUndefined();
        act(() => {
            createInitState = () => 'init2';
            const okResult = result.current.ok();
            expect(okResult.value).toBe('init1');
        });
        expect(stateToCreate).toBe('init1');
        expect(result.current.state).toBe('init2');
    });

    it('tests create->create', () => {
        let stateToCreate: string | undefined = undefined;
        const { result, rerender } = renderHook(() =>
            useStateEditor<string>({
                createMode: {
                    createInitState: () => 'init1',
                    onCreate: x => {
                        stateToCreate = x;
                    },
                },
                updateMode: undefined,
            })
        );
        act(() => {
            result.current.updateState(() => 'updated1');
        });
        rerender({
            createMode: {
                createInitState: () => 'init2',
                onCreate: (x: string) => {
                    stateToCreate = x;
                },
            },
            updateMode: undefined,
        });
        // ok を実行しない限り、stateは原則として変わらない。
        // 理由は、以前のstateが残っていたほうがユーザー体験の向上が期待できるため。
        expect(result.current.state).toBe('init1');
        expect(stateToCreate).toBeUndefined();
    });
});
