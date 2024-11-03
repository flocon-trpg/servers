import { Button, ButtonProps } from 'antd';
import React from 'react';
import { useSingleExecuteAsync0 } from '@/hooks/useSingleExecuteAsync';

type Props = Omit<ButtonProps, 'onClick'> & {
    onClick?: () => PromiseLike<unknown>;
};

// AwaitableButtonのコードは短いので、このコンポーネントを使わずに直接ButtonとuseIsExecutingAsyncFnを使って書いてもよいが、ButtonのonClickにasyncな関数を渡したいケースは多いと考えられるため、少しながらコードの量を減らすことができることが期待される。必要なさそうであればAwaitableButtonを削除してもよい。
export const AwaitableButton: React.FC<Props> = props => {
    const { execute, isExecuting } = useSingleExecuteAsync0(props.onClick);
    return <Button {...props} onClick={execute} disabled={isExecuting || props.disabled} />;
};
