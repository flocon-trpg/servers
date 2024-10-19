import { FirebaseError } from '@firebase/util';
import { Alert, Button, Form, Input, Tooltip } from 'antd';
import classNames from 'classnames';
import {
    AuthProvider,
    EmailAuthProvider,
    FacebookAuthProvider,
    GithubAuthProvider,
    GoogleAuthProvider,
    PhoneAuthProvider,
    TwitterAuthProvider,
    createUserWithEmailAndPassword,
    fetchSignInMethodsForEmail,
    linkWithCredential,
    linkWithPopup,
    signInAnonymously,
    signInWithEmailAndPassword,
    signInWithPopup,
    updateProfile,
} from 'firebase/auth';
import { useAtom, useAtomValue, useSetAtom } from 'jotai/react';
import { atom } from 'jotai/vanilla';
import React from 'react';
import { storybookAtom } from '@/atoms/storybookAtom/storybookAtom';
import { Center } from '@/components/ui/Center/Center';
import { Layout } from '@/components/ui/Layout/Layout';
import { anonymous, email, facebook, github, google, phone, twitter } from '@/env';
import { firebaseAuthAtom } from '@/hooks/useSetupApp';
import { useWebConfig } from '@/hooks/useWebConfig';
import { flex, flexColumn, flexRow } from '@/styles/className';
import { useNavigate } from '@tanstack/react-router';
import { AwaitableButton } from '@/components/ui/AwaitableButton/AwaitableButton';

const displayName = 'new user';
const formWidth = 400;

const errorAtom = atom<FirebaseError | string | undefined>(undefined);
const isSubmittingAtom = atom(false);
const emailModeAtom = atom(false);

const useLoginWithAuthProvider = (): ((provider: AuthProvider) => Promise<void>) => {
    const isStorybook = useAtomValue(storybookAtom).isStorybook;
    const auth = useAtomValue(firebaseAuthAtom);
    const router = useNavigate();
    const setError = useSetAtom(errorAtom);
    const result = React.useCallback(
        async (provider: AuthProvider) => {
            if (auth == null) {
                return;
            }
            if (auth.currentUser?.isAnonymous === true) {
                await linkWithPopup(auth.currentUser, provider)
                    .then(() => {
                        setError(undefined);
                        // CONSIDER: await されていない。これで問題ないか？
                        void router({ to: '/' });
                    })
                    .catch((error: FirebaseError) => {
                        setError(error);
                    });
                return;
            }
            await signInWithPopup(auth, provider)
                .then(async () => {
                    // ソーシャルアカウントによるログインの場合は、アカウントの利用が初めてか否かを判断できないようなので、「初めての場合のみdisplayNameをリセットする」といったことはできない。そのためリセットは行わないようにしている。
                    // なお、result.operationType、result.user.metadataを用いて判定する方法はうまくいかなかった。

                    setError(undefined);
                    await router({ to: '/' });
                })
                .catch((error: FirebaseError) => {
                    setError(error);
                });
        },
        [auth, router, setError],
    );
    if (isStorybook) {
        return () => {
            // CONSIDER: 永遠に resolve も reject もしないようになっているが問題ないのか？
            return new Promise<void>(() => undefined);
        };
    }
    return result;
};

const Email: React.FC = () => {
    const labelCol = 8;
    const wrapperCol = 16;

    const router = useNavigate();
    const setError = useSetAtom(errorAtom);
    const [isSubmitting, setIsSubmitting] = useAtom(isSubmittingAtom);
    const setEmailMode = useSetAtom(emailModeAtom);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const auth = useAtomValue(firebaseAuthAtom);
    const onSuccess = React.useCallback(async () => {
        setError(undefined);
        setEmail('');
        setPassword('');
        setEmailMode(false);
        await router({ to: '/' });
    }, [router, setEmailMode, setError]);

    if (auth == null) {
        return null;
    }

    return (
        <Form
            name="mailForm"
            labelCol={{ span: labelCol }}
            wrapperCol={{ span: wrapperCol }}
            initialValues={{ remember: true }}
            style={{ width: formWidth }}
        >
            <Form.Item label="メールアドレス" name="email">
                <Input
                    name="emailInput"
                    value={email}
                    onChange={e => {
                        setEmail(e.target.value);
                    }}
                />
            </Form.Item>

            <Form.Item label="パスワード" name="password">
                <Input.Password value={password} onChange={e => setPassword(e.target.value)} />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: labelCol, span: wrapperCol }}>
                <div className={classNames(flex, flexRow)}>
                    {auth.currentUser?.isAnonymous === true ? (
                        <AwaitableButton
                            onClick={async () => {
                                if (auth.currentUser == null) {
                                    return;
                                }
                                const credential = EmailAuthProvider.credential(email, password);
                                setIsSubmitting(true);
                                await linkWithCredential(auth.currentUser, credential)
                                    .then(async () => {
                                        await onSuccess();
                                    })
                                    .catch((err: FirebaseError) => setError(err))
                                    .finally(() => {
                                        setPassword('');
                                        setIsSubmitting(false);
                                    });
                            }}
                        >
                            非匿名アカウントに変換
                        </AwaitableButton>
                    ) : (
                        <>
                            <AwaitableButton
                                disabled={isSubmitting}
                                onClick={async () => {
                                    setIsSubmitting(true);
                                    await createUserWithEmailAndPassword(auth, email, password)
                                        .then(async cred => {
                                            const user = cred.user;
                                            //await sendEmailVerification(user);
                                            await updateProfile(user, {
                                                displayName,
                                                photoURL: null,
                                            });
                                            await onSuccess();
                                        })
                                        .catch((err: FirebaseError) => setError(err))
                                        .finally(() => {
                                            setPassword('');
                                            setIsSubmitting(false);
                                        });
                                }}
                            >
                                アカウント作成
                            </AwaitableButton>
                            <AwaitableButton
                                disabled={isSubmitting}
                                onClick={async () => {
                                    setIsSubmitting(true);

                                    const main = async () => {
                                        const signInMethods = await fetchSignInMethodsForEmail(
                                            auth,
                                            email,
                                        ).catch((err: FirebaseError) => {
                                            setError(err);
                                            return null;
                                        });

                                        await signInWithEmailAndPassword(auth, email, password)
                                            .then(async () => {
                                                await onSuccess();
                                            })
                                            .catch((err: FirebaseError) => {
                                                setError(err);

                                                if (signInMethods == null) {
                                                    return;
                                                }

                                                // とあるメールアドレスxがあるとする。以下の手順を踏んだ際、xを用いてsignInWithEmailAndPasswordを実行してもauth/wrong-passwordが常に返されてログインできなくなる。https://github.com/firebase/firebaseui-web/issues/122
                                                // 1. メールアドレス・パスワード方式でxのアカウントを作成
                                                // 2. xをverifyしない（Floconでは現時点ではverifyする手段はないため、2の条件は常に満たされる）
                                                // 3. xを用いてGoogleアカウントでログイン
                                                // もし2でverifyしていればxはメールアドレス・パスワードとGoogleアカウントの2つがリンクされたアカウントとなるが、verifyしない場合は3の時点でGoogleアカウントのみがリンクされた状態になる。
                                                // firebaseuiはこの場合に自動的にGoogleアカウントでログインするのでユーザーフレンドリーである。そのためFloconでもなるべく再現するようにしている。
                                                if (
                                                    signInMethods.every(
                                                        method =>
                                                            method !==
                                                            EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD,
                                                    )
                                                ) {
                                                    if (
                                                        signInMethods.includes(
                                                            GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD,
                                                        )
                                                    ) {
                                                        setError(
                                                            '指定されたメールアドレスは「メールアドレス・パスワード」でログインすることはできません。代わりに「Googleアカウント」でログインしてください。',
                                                        );
                                                        setEmailMode(false);
                                                        return;
                                                    }
                                                }
                                            });
                                    };

                                    await main().finally(() => {
                                        setPassword('');
                                        setIsSubmitting(false);
                                    });
                                }}
                            >
                                ログイン
                            </AwaitableButton>
                        </>
                    )}
                </div>
            </Form.Item>
        </Form>
    );
};

const areProvidersEmpty = (providers: string[]): boolean => {
    if (providers.includes(anonymous)) {
        return false;
    }
    if (providers.includes(email)) {
        return false;
    }
    if (providers.includes(facebook)) {
        return false;
    }
    if (providers.includes(github)) {
        return false;
    }
    if (providers.includes(google)) {
        return false;
    }
    if (providers.includes(phone)) {
        return false;
    }
    if (providers.includes(twitter)) {
        return false;
    }
    return true;
};

const SignInContent: React.FC = () => {
    const setIsSubmitting = useSetAtom(isSubmittingAtom);
    React.useEffect(() => {
        setIsSubmitting(false);
    }, [setIsSubmitting]);

    const config = useWebConfig();
    const router = useNavigate();
    const setError = useSetAtom(errorAtom);
    const auth = useAtomValue(firebaseAuthAtom);
    const [emailMode, setEmailMode] = useAtom(emailModeAtom);
    const authError = useAtomValue(errorAtom);

    const googleProvider = React.useMemo(() => new GoogleAuthProvider(), []);
    const facebookProvider = React.useMemo(() => new FacebookAuthProvider(), []);
    const githubProvider = React.useMemo(() => new GithubAuthProvider(), []);
    const phoneProvider = React.useMemo(
        () => (auth == null ? undefined : new PhoneAuthProvider(auth)),
        [auth],
    );
    const twitterProvider = React.useMemo(() => new TwitterAuthProvider(), []);

    const loginWithAuthProvider = useLoginWithAuthProvider();

    const areProvidersEmptyValue = React.useMemo(() => {
        const authProviders = config?.value?.authProviders ?? [];
        return areProvidersEmpty(authProviders);
    }, [config?.value?.authProviders]);
    const authProviders = config?.value?.authProviders ?? [];

    if (config?.isError === true) {
        return <div>{config.error}</div>;
    }

    if (config?.value === undefined || auth == null) {
        return <div>Firebase のサービスを準備しています…</div>;
    }

    const suffix =
        auth.currentUser?.isAnonymous === true ? 'で非匿名アカウントに変換' : 'でログイン';

    let authUI: JSX.Element;
    if (emailMode) {
        authUI = (
            <>
                <a
                    style={{ marginBottom: 12, marginLeft: 12, alignSelf: 'start' }}
                    onClick={() => setEmailMode(false)}
                >
                    {'< 戻る'}
                </a>
                <Email />
            </>
        );
    } else {
        const margin = 4;
        authUI = (
            <>
                <a
                    style={{ marginBottom: 12, alignSelf: 'start' }}
                    onClick={() => void router({ to: '/' })}
                >
                    {'< トップページに戻る'}
                </a>
                {(areProvidersEmptyValue || authProviders.includes(email)) && (
                    <Button style={{ margin }} onClick={() => setEmailMode(true)}>
                        {`メールアドレス・パスワード${suffix}`}
                    </Button>
                )}
                {(areProvidersEmptyValue || authProviders.includes(google)) && (
                    <AwaitableButton
                        style={{ margin }}
                        onClick={() => loginWithAuthProvider(googleProvider)}
                    >
                        {`Googleアカウント${suffix}`}
                    </AwaitableButton>
                )}
                {(areProvidersEmptyValue || authProviders.includes(twitter)) && (
                    <AwaitableButton
                        style={{ margin }}
                        onClick={() => loginWithAuthProvider(twitterProvider)}
                    >
                        {`Twitterアカウント${suffix}`}
                    </AwaitableButton>
                )}
                {(areProvidersEmptyValue || authProviders.includes(facebook)) && (
                    <AwaitableButton
                        style={{ margin }}
                        onClick={() => loginWithAuthProvider(facebookProvider)}
                    >
                        {`Facebookアカウント${suffix}`}
                    </AwaitableButton>
                )}
                {(areProvidersEmptyValue || authProviders.includes(github)) && (
                    <AwaitableButton
                        style={{ margin }}
                        onClick={() => loginWithAuthProvider(githubProvider)}
                    >
                        {`GitHubアカウント${suffix}`}
                    </AwaitableButton>
                )}
                {(areProvidersEmptyValue || authProviders.includes(phone)) && (
                    <AwaitableButton
                        style={{ margin }}
                        onClick={async () =>
                            phoneProvider == null
                                ? undefined
                                : await loginWithAuthProvider(phoneProvider)
                        }
                    >
                        {`電話認証${suffix}`}
                    </AwaitableButton>
                )}
                {(areProvidersEmptyValue || authProviders.includes(anonymous)) && (
                    <Tooltip title="アカウントを作成せずに匿名でログインします。匿名ユーザーのデータは消失しやすいため、あくまでお試しとして使うことを推奨します。非匿名アカウントに後からアップグレードすることもできます。">
                        <Button
                            style={{ margin }}
                            onClick={() => {
                                signInAnonymously(auth)
                                    .then(async result => {
                                        await updateProfile(result.user, {
                                            displayName,
                                            photoURL: null,
                                        });
                                        setError(undefined);
                                        await router({ to: '/' });
                                    })
                                    .catch((error: FirebaseError) => {
                                        setError(error);
                                    });
                            }}
                        >
                            匿名認証でログイン
                        </Button>
                    </Tooltip>
                )}
            </>
        );
    }

    const authErrorToAlertProps = (
        error: FirebaseError | string,
    ): {
        message: React.ReactNode;
        type: 'error' | 'warning' | 'info';
        description: string | undefined;
    } | null => {
        if (typeof error === 'string') {
            return { message: error, type: 'error', description: undefined };
        }
        // See https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth
        switch (error.code) {
            case 'auth/operation-not-allowed':
                return {
                    message: (
                        <div>
                            <p>選択したログイン方法は有効化されていないため、利用できません。</p>
                            <p>
                                サーバー運用者の方へ:
                                <br />
                                {
                                    'このログイン方法を有効化する場合は、Firebase Authentication の管理画面にある「ログイン プロバイダ」から有効化できます。このログイン方法を有効化しない場合は、NEXT_PUBLIC_AUTH_PROVIDERS の設定でボタンを隠すこともできます。'
                                }
                            </p>
                        </div>
                    ),
                    type: 'error',
                    description: error.code,
                };
            case 'auth/cancelled-popup-request':
                return {
                    message:
                        'ポップアップが複数開かれました。最後に開かれたポップアップ以外は全て自動的に閉じられます。',
                    type: 'warning',
                    description: error.code,
                };
            case 'auth/popup-blocked':
                return {
                    message:
                        'ポップアップがブロックされたため、処理を実行できませんでした。ポップアップブロッカーを使っている場合は、一時的に無効化してください。',
                    type: 'error',
                    description: error.code,
                };
            case 'auth/popup-closed-by-user':
                return {
                    message: 'ポップアップが閉じられたため、処理は中断されました。',
                    type: 'info',
                    description: error.code,
                };
            case 'auth/unauthorized-domain':
                return {
                    message: (
                        <div>
                            <p>
                                この Web
                                サーバーのドメインは承認されていないため、処理を実行できません。
                            </p>
                            <p>
                                サーバー運用者の方へ:
                                <br />
                                {
                                    'Firebase Authentication の管理画面から、この Web サーバーのドメインを承認済みドメインに追加する必要があります。例えばこのページの URL が https://flocon.example.com/signin の場合は、flocon.example.com を承認済みドメインとして追加します。'
                                }
                            </p>
                        </div>
                    ),
                    type: 'error',
                    description: error.code,
                };
            case 'auth/wrong-password':
                return {
                    message: 'パスワードが誤っています。',
                    type: 'error',
                    description: error.code,
                };
            case 'auth/invalid-email':
                return {
                    message: '無効なメールアドレスです。',
                    type: 'error',
                    description: error.code,
                };
            case 'auth/user-not-found':
                return {
                    message: '該当するユーザーは見つかりませんでした。',
                    type: 'error',
                    description: error.code,
                };
            case 'auth/admin-restricted-operation':
            default:
                return { message: error.message, type: 'error', description: error.code };
        }
    };

    const alertProps = authError == null ? null : authErrorToAlertProps(authError);

    return (
        <Center setPaddingY={false}>
            <div style={{ padding: 24 }} className={classNames(flex, flexColumn)}>
                {alertProps != null && (
                    <Center setPaddingY={false}>
                        <Alert
                            style={{ width: formWidth, marginBottom: 16 }}
                            type={alertProps.type}
                            showIcon
                            message={alertProps.message}
                            description={alertProps.description}
                        />
                    </Center>
                )}
                {authUI}
            </div>
        </Center>
    );
};

export const SignIn: React.FC = () => {
    return (
        <Layout>
            <SignInContent />
        </Layout>
    );
};
