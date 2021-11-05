// firebaseuiは内部でwindowを使っているようで、next.jsだとpages内のどこかでimportするだけで"ReferenceError: window is not defined"というエラーがビルド時に出る。
// そこで、dynamic loadingを使うことで回避している。https://dev.to/vvo/how-to-solve-window-is-not-defined-errors-in-react-and-next-js-5f97
// dynamicはReactのComponentをimportする際にしか使えないみたいなので、signin.tsxでimport firebaseuiは不可能。そのため、ここでComponentを定義して、それをdynamic loadingするようにしている。

import React from 'react';
import firebase from 'firebase/app';
import * as firebaseui from 'firebaseui';
import { getAuth } from '../utils/firebaseHelpers';
import { ConfigContext } from '../contexts/ConfigContext';
import { Config } from '../config';

const toSignInOptions = (provider: Config['web']['firebase']['auth']['provider']) => {
    const signInOptions: firebaseui.auth.Config['signInOptions'] = [];
    if (provider.email === true) {
        signInOptions.push(firebase.auth.EmailAuthProvider.PROVIDER_ID);
    }
    if (provider.facebook === true) {
        signInOptions.push(firebase.auth.FacebookAuthProvider.PROVIDER_ID);
    }
    if (provider.github === true) {
        signInOptions.push(firebase.auth.GithubAuthProvider.PROVIDER_ID);
    }
    if (provider.google === true) {
        signInOptions.push(firebase.auth.GoogleAuthProvider.PROVIDER_ID);
    }
    if (provider.phone === true) {
        signInOptions.push(firebase.auth.PhoneAuthProvider.PROVIDER_ID);
    }
    if (provider.twitter === true) {
        signInOptions.push(firebase.auth.TwitterAuthProvider.PROVIDER_ID);
    }
    return signInOptions;
};

const SignInCore: React.FC = () => {
    const config = React.useContext(ConfigContext);
    const auth = getAuth(config);
    const [altMessage, setAltMessage] = React.useState<string | null>('loading...');
    const authContainerRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (auth == null || authContainerRef.current == null) {
            return;
        }

        const signInOptions = toSignInOptions(config.web.firebase.auth.provider);
        if (signInOptions.length === 0) {
            setAltMessage(
                'エラー: config 内の firebase.auth.provider でログインプロバイダが1つも指定されていないため、ログインできません。この問題を解決するには、サーバー管理者に問い合わせてください。'
            );
            return;
        }

        const firebaseAuthConfig: firebaseui.auth.Config = {
            callbacks: {
                signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                    // User successfully signed in.
                    // Return type determines whether we continue the redirect automatically
                    // or whether we leave that to developer to handle.
                    return true;
                },
                uiShown: function () {
                    // The widget is rendered.
                    // Hide the loader.
                    setAltMessage(null);
                },
            },
            signInSuccessUrl: '/',
            signInOptions,

            // これがないと、何故か「Sign in with Google」を押しても画面が切り替わらずログインできない。理由は不明。なおメールアドレスは問題なかった。Googleとメールアドレス以外は未調査。
            signInFlow: 'popup',

            // TODO: Terms of service url
            //tosUrl: '<your-tos-url>',
            // TODO: Privacy policy url.
            //privacyPolicyUrl: '<your-privacy-policy-url>'
        };
        const authUI = firebaseui.auth.AuthUI.getInstance() ?? new firebaseui.auth.AuthUI(auth);
        authUI.start(authContainerRef.current, firebaseAuthConfig);
    }, [auth, authContainerRef, config.web.firebase.auth.provider]);

    return (
        <div>
            <div ref={authContainerRef} />
            <span>{altMessage}</span>
        </div>
    );
};

export default SignInCore;
