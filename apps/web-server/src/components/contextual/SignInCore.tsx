// firebaseuiは内部でwindowを使っているようで、next.jsだとpages内のどこかでimportするだけで"ReferenceError: window is not defined"というエラーがビルド時に出る。
// そこで、dynamic loadingを使うことで回避している。https://dev.to/vvo/how-to-solve-window-is-not-defined-errors-in-react-and-next-js-5f97
// dynamicはReactのComponentをimportする際にしか使えないようなので、ここでComponentを定義して、それをdynamic loadingするようにしている。

import React from 'react';
import {
    EmailAuthProvider,
    FacebookAuthProvider,
    GithubAuthProvider,
    GoogleAuthProvider,
    PhoneAuthProvider,
    TwitterAuthProvider,
} from 'firebase/auth';
import * as firebaseui from 'firebaseui';
import {
    anonymous,
    email,
    facebook,
    github,
    google,
    NEXT_PUBLIC_AUTH_PROVIDERS,
    phone,
    twitter,
} from '../../env';
import { useWebConfig } from '../../hooks/useWebConfig';
import { Alert, Button, Tooltip } from 'antd';
import { Center } from '../ui/Center';
import { useRouter } from 'next/router';
import * as Icons from '@ant-design/icons';
import classNames from 'classnames';
import { flex, flexColumn, itemsCenter } from '../../utils/className';
import { signInAnonymously } from '@firebase/auth';
import { useAtomValue } from 'jotai/utils';
import { firebaseAuthAtom } from '../../pages/_app';

const toSignInOptions = (providers: string[]) => {
    const signInOptions: firebaseui.auth.Config['signInOptions'] = [];
    if (providers.includes(email)) {
        signInOptions.push({
            provider: EmailAuthProvider.PROVIDER_ID,
            requireDisplayName: false,
        });
    }
    if (providers.includes(facebook)) {
        signInOptions.push(FacebookAuthProvider.PROVIDER_ID);
    }
    if (providers.includes(github)) {
        signInOptions.push(GithubAuthProvider.PROVIDER_ID);
    }
    if (providers.includes(google)) {
        signInOptions.push(GoogleAuthProvider.PROVIDER_ID);
    }
    if (providers.includes(phone)) {
        signInOptions.push(PhoneAuthProvider.PROVIDER_ID);
    }
    if (providers.includes(twitter)) {
        signInOptions.push(TwitterAuthProvider.PROVIDER_ID);
    }
    return signInOptions;
};

const isAnonymousLoginEnabled = (providers: string[]): boolean => {
    return providers.includes(anonymous);
};

const createFirebaseErrorMessage = (firebaseAuthErrorCode: string | undefined) => {
    switch (firebaseAuthErrorCode) {
        case undefined:
            return undefined;
        case 'auth/admin-restricted-operation':
            return `匿名ログインが有効化されていないようです。サーバー管理者に、Firebaseの管理画面で匿名ログインを有効化し忘れていないか、もしくは${NEXT_PUBLIC_AUTH_PROVIDERS}の設定に誤って${anonymous}を含めていないかどうかを確認してください。`;
        default:
            return `エラーが発生しました: ${firebaseAuthErrorCode}`;
    }
};

const SignInCore: React.FC = () => {
    const config = useWebConfig();
    const router = useRouter();
    const auth = useAtomValue(firebaseAuthAtom);
    const [altMessage, setAltMessage] = React.useState<string | null>('loading...');
    const authContainerRef = React.useRef<HTMLDivElement | null>(null);
    const [firebaseAuthErrorMessage, setFirebaseAuthErrorMessage] = React.useState<string>();
    const [signingUpAsAnonymous, setSigningUpAsAnonymous] = React.useState(false);

    React.useEffect(() => {
        if (
            config?.value?.authProviders == null ||
            auth == null ||
            authContainerRef.current == null
        ) {
            return;
        }

        const signInOptions = toSignInOptions(config.value.authProviders);
        if (signInOptions.length === 0 && !isAnonymousLoginEnabled(config.value.authProviders)) {
            setAltMessage(
                `エラー: config 内の ${NEXT_PUBLIC_AUTH_PROVIDERS} でログインプロバイダが1つも指定されていないため、ログインできません。この問題を解決するには、サーバー管理者に問い合わせてください。`
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
                // https://firebase.google.com/docs/auth/web/firebaseui#handling_anonymous_user_upgrade_merge_conflicts
                // autoUpgradeAnonymousUsers: trueのときは、signInFailureが空だとconsoleに`[firebaseui] Missing "signInFailure" callback: "signInFailure" callback needs to be provided when "autoUpgradeAnonymousUsers" is set to true.`というエラーメッセージが出力される。
                signInFailure: async error => {
                    if (error.code !== 'firebaseui/anonymous-upgrade-merge-conflict') {
                        // 2021/12/25現在の仕様では、ここに来ることはない
                        console.error(error);
                        return;
                    }
                    setFirebaseAuthErrorMessage(
                        '匿名アカウントは、既に作成済みのアカウントにアップグレードすることはできません。'
                    );
                },
                uiShown: function () {
                    // The widget is rendered.
                    // Hide the loader.
                    setAltMessage(null);
                },
            },
            signInSuccessUrl: '/',
            signInOptions,
            autoUpgradeAnonymousUsers: true,

            // これがないと、何故か「Sign in with Google」を押しても画面が切り替わらずログインできない。理由は不明。なおメールアドレスは問題なかった。Googleとメールアドレス以外は未調査。
            signInFlow: 'popup',

            tosUrl: '/tos',
            privacyPolicyUrl: '/privacy_policy',
        };
        const authUI = firebaseui.auth.AuthUI.getInstance() ?? new firebaseui.auth.AuthUI(auth);
        authUI.start(authContainerRef.current, firebaseAuthConfig);
    }, [auth, authContainerRef, config?.value?.authProviders]);

    if (config?.value == null) {
        return null;
    }

    const isAnonymous = auth?.currentUser?.isAnonymous === true;
    const signInOptions = toSignInOptions(config.value.authProviders);

    return (
        <div>
            {altMessage == null && isAnonymousLoginEnabled(config.value.authProviders) && (
                <div
                    style={{ margin: '24px 0' }}
                    className={classNames(flex, flexColumn, itemsCenter)}
                >
                    <Tooltip title='アカウントを作成せずにログインします。匿名ログインユーザーのデータは消失しやすいため、あくまでお試しとして使うことを推奨します。非匿名アカウントに後からアップグレードすることもできます。'>
                        <Button
                            disabled={auth == null || signingUpAsAnonymous}
                            size='large'
                            onClick={() => {
                                if (auth == null || signingUpAsAnonymous) {
                                    return;
                                }
                                setSigningUpAsAnonymous(true);
                                signInAnonymously(auth)
                                    .then(() => {
                                        router.push('/');
                                    })
                                    .catch(e => {
                                        // 匿名ログイン以外の場合は、`The identity provider configuration is not found.`というメッセージがFirebaseUIによって自動的にブラウザの画面上部に表示される
                                        setFirebaseAuthErrorMessage(
                                            createFirebaseErrorMessage(e.code)
                                        );
                                        setSigningUpAsAnonymous(false);
                                    });
                            }}
                        >
                            <div>
                                {signingUpAsAnonymous && (
                                    <span style={{ marginRight: 4 }}>
                                        <Icons.LoadingOutlined />
                                    </span>
                                )}
                                <span>匿名ログイン</span>
                            </div>
                        </Button>
                    </Tooltip>
                    {isAnonymous && (
                        <div style={{ paddingTop: '24px 0' }}>
                            {signInOptions.length === 0
                                ? '匿名ログイン以外のログインプロバイダーが有効化されていないため、非匿名アカウントにアップグレードすることはできません。'
                                : '匿名ログインしているため、Sign inすることで非匿名アカウントにアップグレードできます。'}
                        </div>
                    )}
                </div>
            )}
            <div ref={authContainerRef} />
            {firebaseAuthErrorMessage != null && (
                <Center>
                    <Alert
                        style={{ margin: '24px 48px' }}
                        showIcon
                        type='error'
                        message={firebaseAuthErrorMessage}
                    />
                </Center>
            )}
            <span>{altMessage}</span>
        </div>
    );
};

export default SignInCore;
