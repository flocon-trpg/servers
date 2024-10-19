import {
    PingDocument,
    PongDocument,
    PongSubscription,
    PongSubscriptionVariables,
} from '@flocon-trpg/typed-document-node';
import { createFileRoute } from '@tanstack/react-router';
import { Button, InputNumber } from 'antd';
import React from 'react';
import { CombinedError, useClient, useMutation, useSubscription } from 'urql';
import { pipe, subscribe } from 'wonka';

type PongObservableResultState =
    | {
          type: 'success';
          value: {
              createdBy?: string | null;
              value: number;
          };
      }
    | {
          type: 'error';
          error: CombinedError;
      };

const PingPong: React.FC = () => {
    const urqlClient = useClient();
    const [pingMutationResult, pingMutation] = useMutation(PingDocument);
    const [pongSubscription] = useSubscription({ query: PongDocument });
    const [postValue, setPostValue] = React.useState(0);
    const [pongObservableResult, setPongObservableResult] =
        React.useState<PongObservableResultState>();

    React.useEffect(() => {
        const subscription = pipe(
            urqlClient.subscription<PongSubscription, PongSubscriptionVariables>(PongDocument, {}),
            subscribe(pong => {
                if (pong.data != null) {
                    setPongObservableResult({ type: 'success', value: pong.data.pong });
                    return;
                }
                if (pong.error != null) {
                    setPongObservableResult({ type: 'error', error: pong.error });
                }
            }),
        );
        return () => subscription.unsubscribe();
    }, [urqlClient]);

    const pingMutationResponse: JSX.Element | null = (() => {
        if (pingMutationResult.error != null) {
            return <div>{pingMutationResult.error.message}</div>;
        }
        if (pingMutationResult.data != null) {
            return (
                <>
                    <div>{pingMutationResult.data.result.value}</div>
                    <div>{pingMutationResult.data.result.createdBy ?? '(anonymous)'}</div>
                </>
            );
        }
        return null;
    })();

    const pongObservableResponse: JSX.Element | JSX.Element[] | null = (() => {
        if (pongObservableResult == null) {
            return <div>no value</div>;
        }
        switch (pongObservableResult.type) {
            case 'success':
                return (
                    <>
                        <div>{pongObservableResult.value.value}</div>
                        <div>{pongObservableResult.value.createdBy ?? '(anonymous)'}</div>
                    </>
                );
            case 'error':
                return <div>{pongObservableResult.error.message}</div>;
        }
    })();

    const pongHooksResponse: JSX.Element | null = (() => {
        if (pongSubscription.error != null) {
            return <div>{pongSubscription.error.message}</div>;
        }
        if (pongSubscription.fetching) {
            return <div>loading</div>;
        }
        if (pongSubscription.data != null) {
            return (
                <>
                    <div>{pongSubscription.data.pong.value}</div>
                    <div>{pongSubscription.data.pong.createdBy ?? '(anonymous)'}</div>
                </>
            );
        }
        return null;
    })();

    return (
        <div>
            <h2>ping pong test</h2>
            <div>You can do simple tests of GraphQL subscription here.</div>
            <div>This subscribes pongs invoked by other users.</div>
            <InputNumber
                value={postValue}
                onChange={value => (typeof value === 'number' ? setPostValue(value) : undefined)}
            />
            <Button onClick={() => void pingMutation({ value: postValue })} type="primary">
                Ping
            </Button>
            <h3>ping response (mutation)</h3>
            {pingMutationResponse}
            <h3>pong (subscription method)</h3>
            {pongObservableResponse}
            <h3>pong (useSubscription hook)</h3>
            {pongHooksResponse}
        </div>
    );
};

export const Route = createFileRoute('/tests/pingpong')({
    component: PingPong,
});
