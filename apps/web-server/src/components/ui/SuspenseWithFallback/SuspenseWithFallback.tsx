import { PropsWithChildren, Suspense } from 'react';

const Fallback: React.FC = () => {
    // TODO: 現在は簡易的な作りになっているので、もう少しマシなものにする
    return (
        <div>
            {'読み込み中です… もし読み込みが終わらない場合は Flocon のバグの可能性があります。'}
        </div>
    );
};

type Props = {
    modifyFallback?: (baseElement: JSX.Element) => React.ReactNode;
} & PropsWithChildren;

export const SuspenseWithFallback: React.FC<Props> = ({ modifyFallback, children }) => {
    return (
        <Suspense fallback={modifyFallback == null ? <Fallback /> : modifyFallback(<Fallback />)}>
            {children}
        </Suspense>
    );
};
