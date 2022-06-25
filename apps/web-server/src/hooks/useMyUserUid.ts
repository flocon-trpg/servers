import { useAtomValue } from 'jotai';
import React from 'react';
import { firebaseUserAtom } from '../pages/_app';
import { authNotFound, loading, notSignIn } from '../utils/firebase/firebaseUserState';

export const useMyUserUid = () => {
    const firebaseUser = useAtomValue(firebaseUserAtom);
    let initResult: string | undefined;
    switch (firebaseUser) {
        case loading:
        case authNotFound:
        case notSignIn:
            break;
        default:
            initResult = firebaseUser.uid;
            break;
    }
    // initResultをセットしないと、一瞬resultがundefinedとしてコンポーネントがレンダーされてしまうため、見た目に影響を及ぼすことがある。
    const [result, setResult] = React.useState<string | undefined>(initResult);
    React.useEffect(() => {
        // $myAuthが切り替わったときに、loadingならば前のuidを返す作りにしている
        switch (firebaseUser) {
            case loading:
                return;
            case authNotFound:
            case notSignIn:
                setResult(undefined);
                return;
            default:
                setResult(firebaseUser.uid);
        }
    }, [firebaseUser]);
    return result;
};
