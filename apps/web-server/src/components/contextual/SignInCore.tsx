// firebaseuiは内部でwindowを使っているようで、next.jsだとpages内のどこかでimportするだけで"ReferenceError: window is not defined"というエラーがビルド時に出る。
// そこで、dynamic loadingを使うことで回避している。https://dev.to/vvo/how-to-solve-window-is-not-defined-errors-in-react-and-next-js-5f97
// dynamicはReactのComponentをimportする際にしか使えないみたいなので、signin.tsxでimport firebaseuiは不可能。そのため、ここでComponentを定義して、それをdynamic loadingするようにしている。

import React from 'react';
import firebase from 'firebase/app';
import * as firebaseui from 'firebaseui';
import { getAuth } from '../../utils/firebaseHelpers';
import { email, facebook, github, google, phone, twitter } from '../../env';
import { useWebConfig } from '../../hooks/useWebConfig';

const toSignInOptions = (providers: string[]) => {
    const signInOptions: firebaseui.auth.Config['signInOptions'] = [];
    if (providers.includes(email)) {
        signInOptions.push(firebase.auth.EmailAuthProvider.PROVIDER_ID);
    }
    if (providers.includes(facebook)) {
        signInOptions.push(firebase.auth.FacebookAuthProvider.PROVIDER_ID);
    }
    if (providers.includes(github)) {
        signInOptions.push(firebase.auth.GithubAuthProvider.PROVIDER_ID);
    }
    if (providers.includes(google)) {
        signInOptions.push(firebase.auth.GoogleAuthProvider.PROVIDER_ID);
    }
    if (providers.includes(phone)) {
        signInOptions.push(firebase.auth.PhoneAuthProvider.PROVIDER_ID);
    }
    if (providers.includes(twitter)) {
        signInOptions.push(firebase.auth.TwitterAuthProvider.PROVIDER_ID);
    }
    return signInOptions;
};

const SignInCore: React.FC = () => {
    const config = useWebConfig();
    const auth = config?.value == null ? null : getAuth(config.value);
    const [altMessage, setAltMessage] = React.useState<string | null>('loading...');
    const authContainerRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (
            config?.value?.authProviders == null ||
            auth == null ||
            authContainerRef.current == null
        ) {
            return;
        }

        const signInOptions = toSignInOptions(config.value.authProviders);
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
    }, [auth, authContainerRef, config?.value?.authProviders]);

    return (
        <div>
            <div ref={authContainerRef} />
            <span>{altMessage}</span>
        </div>
    );
};

export default SignInCore;
