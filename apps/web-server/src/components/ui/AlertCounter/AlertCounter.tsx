import { LoadingOutlined } from '@ant-design/icons';
import { simpleId } from '@flocon-trpg/core';
import { recordToArray } from '@flocon-trpg/utils';
import { Alert as AntdAlert, AlertProps as AntdAlertProps } from 'antd';
import { produce } from 'immer';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import React, { PropsWithChildren, useContext } from 'react';

export const AlertCounterContext = React.createContext<symbol | null>(null);

type AlertCounterElement = {
    type: 'loading' | 'error' | 'warning' | 'info' | 'success' | undefined;
};

const alertCountersAtom = atom<
    Readonly<{
        [
            // このキーは for-in 式で列挙されないため symbol を使っている
            contextId: symbol
        ]: {
            [
                // このキーは for-in 式で列挙されるため symbol は使えない
                hookId: string
            ]: AlertCounterElement;
        };
    }>
>({});

const useSetAlertCounter = (alertCounterElement: AlertCounterElement) => {
    const contextId = useContext(AlertCounterContext);
    const setAlertCounters = useSetAtom(alertCountersAtom);

    React.useEffect(() => {
        if (contextId == null) {
            return;
        }

        const hookId = simpleId();

        setAlertCounters(prev =>
            produce(prev, draft => {
                if (draft[contextId] === undefined) {
                    draft[contextId] = {};
                }
                draft[contextId][hookId] = { type: alertCounterElement.type };
            }),
        );

        return () => {
            setAlertCounters(prev =>
                produce(prev, draft => {
                    if (draft[contextId] === undefined) {
                        return;
                    }
                    delete draft[contextId][hookId];
                }),
            );
        };
    }, [contextId, alertCounterElement.type, setAlertCounters]);
};

/** エラーや警告が出ている Alert をカウントするコンポーネントを提供します。 */
export namespace AlertCounter {
    /** カウント対象となる `Alert` を作成します。Ant Design の `Alert` をそのまま使うだけではカウントの対象にはなりません。*/
    export const Alert: React.FC<AntdAlertProps> = props => {
        useSetAlertCounter({ type: props.type });
        return <AntdAlert {...props} />;
    };

    /** 結果待ちのものがあることを `AlertCounter.Counter` に対して示すコンポーネントです。`children` の有無は問いません。 */
    export const CountAsLoading: React.FC<PropsWithChildren> = ({ children }) => {
        useSetAlertCounter({ type: 'loading' });
        return children;
    };

    /** `AlertCounter.Alert` と `AlertCounter.CountAsLoading` の個数をカウントして表示します。 */
    export const Counter: React.FC<Omit<AntdAlertProps, 'type' | 'message'>> = props => {
        const contextId = useContext(AlertCounterContext);
        const alertCounters = useAtomValue(alertCountersAtom);
        const alertCounter = React.useMemo(() => {
            if (contextId == null) {
                return null;
            }
            return recordToArray(alertCounters[contextId] ?? {}).reduce(
                (seed, { value }) => {
                    seed[value.type ?? 'undefined'] += 1;
                    return seed;
                },
                { loading: 0, error: 0, warning: 0, info: 0, success: 0, undefined: 0 } satisfies {
                    loading: number;
                    error: number;
                    warning: number;
                    info: number;
                    success: number;
                    undefined: number;
                },
            );
        }, [alertCounters, contextId]);

        if (alertCounter == null) {
            // AlertCounterContext が設定されていないときにも Alert の個数をカウントさせることは可能だが、グローバルでカウントさせたい場面は考えづらいため、バグとして扱うことでバグ検知の助けにすることを優先している。
            return (
                <AntdAlert
                    {...props}
                    type="error"
                    message={
                        'AlertCounterContext が設定されていません。おそらくコードにバグがあるようです。'
                    }
                />
            );
        }

        let type: AntdAlertProps['type'];
        let message: string;
        const nonSuccessMessage = `${alertCounter.error} 件のエラーメッセージと ${alertCounter.warning} 件の警告メッセージがあります。`;
        const nonSuccessMessageWithFetching =
            nonSuccessMessage + `他に ${alertCounter.loading} 件のチェックの完了を待っています…`;
        if (alertCounter.error !== 0) {
            type = 'error';
            message = alertCounter.loading ? nonSuccessMessageWithFetching : nonSuccessMessage;
        } else if (alertCounter.warning !== 0) {
            type = 'warning';
            message = alertCounter.loading ? nonSuccessMessageWithFetching : nonSuccessMessage;
        } else if (alertCounter.loading !== 0) {
            type = 'info';
            message = `${alertCounter.loading} 件のチェックの完了を待っています…`;
        } else {
            type = 'success';
            message = '問題は見つかりませんでした。';
        }

        return (
            <AntdAlert
                {...props}
                type={type}
                message={message}
                icon={type === 'info' ? <LoadingOutlined /> : props.icon}
            />
        );
    };
}
