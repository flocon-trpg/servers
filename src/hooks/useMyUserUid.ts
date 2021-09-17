import React from 'react';
import {
    authNotFound,
    FirebaseUserState,
    loading,
    MyAuthContext,
    notSignIn,
} from '../contexts/MyAuthContext';

// MyAuthContextが取得できない場所では、引数として渡すことでMyAuthContextの代わりに使わせることができる
export const useMyUserUid = (myAuth?: FirebaseUserState) => {
    const [result, setResult] = React.useState<string>();
    const myAuthContext = React.useContext(MyAuthContext);
    const $myAuth = myAuth ?? myAuthContext;
    React.useEffect(() => {
        // $myAuthが切り替わったときに、loadingならば前のuidを返す作りにしている
        switch ($myAuth) {
            case loading:
                return;
            case authNotFound:
            case notSignIn:
                setResult(undefined);
                return;
            default:
                setResult($myAuth.value.uid);
        }
    }, [$myAuth]);
    return result;
};
