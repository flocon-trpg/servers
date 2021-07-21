import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BufferedTextArea, OnChangeParams } from './BufferedTextArea';

const delayTime = 1100;

const delay = async (delayTime: number) => {
    await new Promise(r => setTimeout(r, delayTime));
};

test.each`
    bufferDuration        | invokeUpdate1 | invokeUpdate2
    ${'default' as const} | ${false}      | ${false}
    ${'default' as const} | ${true}       | ${false}
    ${'default' as const} | ${true}       | ${true}
    ${'short' as const}   | ${false}      | ${false}
    ${'short' as const}   | ${true}       | ${false}
    ${'short' as const}   | ${true}       | ${true}
    ${1000}               | ${false}      | ${false}
    ${1000}               | ${true}       | ${false}
    ${1000}               | ${true}       | ${true}
`(
    'BufferedTextAreaのテキスト変更直後のonChange',
    async ({ bufferDuration, invokeUpdate1, invokeUpdate2 }) => {
        const onChangeHistory: OnChangeParams[] = [];
        const onChange = (params: OnChangeParams) => {
            onChangeHistory.push(params);
        };
        render(
            <BufferedTextArea
                value="TEXT_VALUE1"
                bufferDuration={bufferDuration}
                onChange={onChange}
            />
        );
        if (invokeUpdate1) {
            fireEvent.change(screen.getByDisplayValue('TEXT_VALUE1'), {
                target: { value: 'TEXT_VALUE2' },
            });
        }
        if (invokeUpdate2) {
            fireEvent.change(screen.getByDisplayValue('TEXT_VALUE2'), {
                target: { value: 'TEXT_VALUE3' },
            });
        }
        expect(onChangeHistory).toEqual([]);
    }
);

test.each(['default', 'short', 1000] as const)(
    'BufferedTextAreaに何も変更がなかったときのonChange',
    async bufferDuration => {
        const onChangeHistory: OnChangeParams[] = [];
        const onChange = (params: OnChangeParams) => {
            onChangeHistory.push(params);
        };
        render(
            <BufferedTextArea
                value="TEXT_VALUE1"
                bufferDuration={bufferDuration}
                onChange={onChange}
            />
        );
        await act(async () => await delay(delayTime));
        expect(onChangeHistory).toEqual([]);
    }
);

test.each(['default', 'short', 1000] as const)(
    'BufferedTextAreaに2回変更があったときのonChange',
    async bufferDuration => {
        const onChangeHistory: OnChangeParams[] = [];
        const onChange = (params: OnChangeParams) => {
            onChangeHistory.push(params);
        };
        render(
            <BufferedTextArea
                value="TEXT_VALUE1"
                bufferDuration={bufferDuration}
                onChange={onChange}
            />
        );
        fireEvent.change(screen.getByDisplayValue('TEXT_VALUE1'), {
            target: { value: 'TEXT_VALUE2' },
        });
        fireEvent.change(screen.getByDisplayValue('TEXT_VALUE2'), {
            target: { value: 'TEXT_VALUE3' },
        });
        await act(async () => await delay(delayTime));
        expect(onChangeHistory).toEqual([
            { previousValue: 'TEXT_VALUE1', currentValue: 'TEXT_VALUE3' },
        ]);
    }
);

test.each`
    bufferDuration        | newValue
    ${'default' as const} | ${'TEXT_VALUE2'}
    ${'default' as const} | ${'TEXT_VALUE3'}
    ${'short' as const}   | ${'TEXT_VALUE2'}
    ${'short' as const}   | ${'TEXT_VALUE3'}
    ${1000}               | ${'TEXT_VALUE2'}
    ${1000}               | ${'TEXT_VALUE3'}
`(
    'BufferedTextAreaに入力中に、valueが更新されたときのonChange',
    async ({ bufferDuration, newValue }) => {
        const onChangeHistory: OnChangeParams[] = [];
        const onChange = (params: OnChangeParams) => {
            onChangeHistory.push(params);
        };
        const { rerender } = render(
            <BufferedTextArea
                value="TEXT_VALUE1"
                bufferDuration={bufferDuration}
                onChange={onChange}
            />
        );
        fireEvent.change(screen.getByDisplayValue('TEXT_VALUE1'), { target: { value: newValue } });
        rerender(
            <BufferedTextArea
                value="TEXT_VALUE3"
                bufferDuration={bufferDuration}
                onChange={onChange}
            />
        );
        await act(async () => await delay(delayTime));
        expect(onChangeHistory).toEqual([]);
    }
);

test.each`
    bufferDuration        | newValue
    ${'default' as const} | ${'TEXT_VALUE2'}
    ${'default' as const} | ${'TEXT_VALUE3'}
    ${'short' as const}   | ${'TEXT_VALUE2'}
    ${'short' as const}   | ${'TEXT_VALUE3'}
    ${1000}               | ${'TEXT_VALUE2'}
    ${1000}               | ${'TEXT_VALUE3'}
`(
    'BufferedTextAreaに入力中に、valueが更新された直後に再び入力したときのonChange',
    async ({ bufferDuration, newValue }) => {
        const onChangeHistory: OnChangeParams[] = [];
        const onChange = (params: OnChangeParams) => {
            onChangeHistory.push(params);
        };
        const { rerender } = render(
            <BufferedTextArea
                value="TEXT_VALUE1"
                bufferDuration={bufferDuration}
                onChange={onChange}
            />
        );
        fireEvent.change(screen.getByDisplayValue('TEXT_VALUE1'), { target: { value: newValue } });
        rerender(
            <BufferedTextArea
                value="TEXT_VALUE3"
                bufferDuration={bufferDuration}
                onChange={onChange}
            />
        );
        fireEvent.change(screen.getByDisplayValue('TEXT_VALUE3'), {
            target: { value: 'TEXT_VALUE4' },
        });
        expect(onChangeHistory).toEqual([]);
        await act(async () => await delay(delayTime));
        expect(onChangeHistory).toEqual([
            { previousValue: 'TEXT_VALUE3', currentValue: 'TEXT_VALUE4' },
        ]);
    }
);
