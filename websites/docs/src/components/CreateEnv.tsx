import { env } from '@flocon-trpg/core';
import { Checkbox, Collapse, Form, Image, Input, Radio, Space, Table } from 'antd';
import { atom, useAtom, useAtomValue } from 'jotai';
import React from 'react';

const {
    NEXT_PUBLIC_API_HTTP,
    NEXT_PUBLIC_API_WS,
    NEXT_PUBLIC_AUTH_PROVIDERS,
    NEXT_PUBLIC_FIREBASE_CONFIG,
    NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED,
} = env;

const isEmptyString = (value: string): boolean => {
    return value.trim() === '';
};

const isValidUrl = (value: string): boolean => {
    return value.trim().startsWith('https://') || value.trim().startsWith('http://');
};

namespace ErrorMessages {
    export const mustNotBeEmpty = 'この値は必須です。';
    export const notHttpProtocol = 'https:// もしくは http:// で始まる必要があります。';
}

const envTxt = 'envTxt';
const hostingService = 'hostingService';
const headerPadding = 16;
const collapsePadding = 12;
const spaceBetweenCollapseContent = 12;

const deployTypeAtom = atom<typeof envTxt | typeof hostingService>(envTxt);

const apiHttpAtom = atom('');
const apiWsAtom = atom('');
const authProvidersAtoms = {
    anonymousAtom: atom(false),
    emailAtom: atom(false),
    googleAtom: atom(false),
    facebookAtom: atom(false),
    githubAtom: atom(false),
    twitterAtom: atom(false),
    phoneAtom: atom(false),
};
const authProvidersArrayAtom = atom(get => {
    const authProvidersArray: string[] = [];
    if (get(authProvidersAtoms.anonymousAtom)) {
        authProvidersArray.push(env.authProviders.anonymous);
    }
    if (get(authProvidersAtoms.emailAtom)) {
        authProvidersArray.push(env.authProviders.email);
    }
    if (get(authProvidersAtoms.googleAtom)) {
        authProvidersArray.push(env.authProviders.google);
    }
    if (get(authProvidersAtoms.facebookAtom)) {
        authProvidersArray.push(env.authProviders.facebook);
    }
    if (get(authProvidersAtoms.githubAtom)) {
        authProvidersArray.push(env.authProviders.github);
    }
    if (get(authProvidersAtoms.twitterAtom)) {
        authProvidersArray.push(env.authProviders.twitter);
    }
    if (get(authProvidersAtoms.phoneAtom)) {
        authProvidersArray.push(env.authProviders.phone);
    }
    return authProvidersArray;
});

const firebaseConfigAtoms = {
    apiKeyAtom: atom(''),
    authDomainAtom: atom(''),
    projectIdAtom: atom(''),
    storageBucketAtom: atom(''),
    messagingSenderIdAtom: atom(''),
    appIdAtom: atom(''),
};

const firebaseStorageEnabledAtom = atom(true);
const autoDetermineWsUrlAtom = atom(true);
const lineBreakAtom = atom<'\r' | '\n' | '\r\n'>('\n');

const firebaseConfigStringAtom = atom(get => {
    return `{"${env.firebaseConfig.apiKey}":"${get(firebaseConfigAtoms.apiKeyAtom)}","${env.firebaseConfig.authDomain}":"${get(firebaseConfigAtoms.authDomainAtom)}","${env.firebaseConfig.projectId}":"${get(firebaseConfigAtoms.projectIdAtom)}","${env.firebaseConfig.storageBucket}":"${get(firebaseConfigAtoms.storageBucketAtom)}","${env.firebaseConfig.messagingSenderId}":"${get(firebaseConfigAtoms.messagingSenderIdAtom)}","${env.firebaseConfig.appId}":"${get(firebaseConfigAtoms.appIdAtom)}"}`;
});

const apiWsOutputAtom = atom(get => {
    if (get(autoDetermineWsUrlAtom)) {
        return get(apiHttpAtom)
            .trim()
            .replace(/^https:\/\//, 'wss://')
            .replace(/^http:\/\//, 'ws://');
    } else {
        return get(apiWsAtom);
    }
});

const envTxtOutputAtom = atom(get => {
    const apiHttp = get(apiHttpAtom);
    const apiWs = get(apiWsOutputAtom);

    const authProvidersArray = get(authProvidersArrayAtom);
    const authProvidersLine =
        authProvidersArray.length === 0
            ? null
            : `${NEXT_PUBLIC_AUTH_PROVIDERS}=${authProvidersArray.join(',')}`;

    const lines = [
        `${NEXT_PUBLIC_FIREBASE_CONFIG}=${get(firebaseConfigStringAtom)}`,
        `${NEXT_PUBLIC_API_HTTP}=${apiHttp}`,
        `${NEXT_PUBLIC_API_WS}=${apiWs}`,
        authProvidersLine,
        `${NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED}=${get(firebaseStorageEnabledAtom) ? 'true' : 'false'}`,
    ];

    return lines.filter(line => line != null).join(get(lineBreakAtom));
});

const dataSourceOutputAtom = atom(get => {
    const authProvidersArray = get(authProvidersArrayAtom);

    const result: { key: string; value: string }[] = [
        { key: NEXT_PUBLIC_FIREBASE_CONFIG, value: get(firebaseConfigStringAtom) },
        { key: NEXT_PUBLIC_API_HTTP, value: get(apiHttpAtom) },
        { key: NEXT_PUBLIC_API_WS, value: get(apiWsOutputAtom) },
    ];
    if (authProvidersArray.length !== 0) {
        result.push({ key: NEXT_PUBLIC_AUTH_PROVIDERS, value: authProvidersArray.join(',') });
    }
    result.push({
        key: NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED,
        value: get(firebaseStorageEnabledAtom) ? 'true' : 'false',
    });

    return result;
});

const FirebaseConfigFormItem: React.FC<{
    label: string;
    value: string;
    setValue: (newValue: string) => void;
    placeholder: string;
}> = ({ label, value, setValue, placeholder }) => {
    return (
        <Form.Item
            label={<div>{label}</div>}
            validateStatus={isEmptyString(value) ? 'error' : undefined}
            help={isEmptyString(value) ? ErrorMessages.mustNotBeEmpty : undefined}
        >
            <Input
                onChange={e => setValue(e.target.value)}
                value={value}
                placeholder={`例: ${placeholder}`}
            />
        </Form.Item>
    );
};

export const CreateEnv: React.FC = () => {
    const [deployType, setDeployType] = useAtom(deployTypeAtom);

    const [autoWsState, setAutoWsState] = useAtom(autoDetermineWsUrlAtom);

    const [apiKey, setApiKey] = useAtom(firebaseConfigAtoms.apiKeyAtom);
    const [appId, setAppId] = useAtom(firebaseConfigAtoms.appIdAtom);
    const [authDomain, setAuthDomain] = useAtom(firebaseConfigAtoms.authDomainAtom);
    const [messagingSenderId, setMessagingSenderId] = useAtom(
        firebaseConfigAtoms.messagingSenderIdAtom,
    );
    const [projectId, setProjectId] = useAtom(firebaseConfigAtoms.projectIdAtom);
    const [storageBucket, setStorageBucket] = useAtom(firebaseConfigAtoms.storageBucketAtom);

    const [apiHttp, setApiHttp] = useAtom(apiHttpAtom);
    const [apiWs, setApiWs] = useAtom(apiWsAtom);

    const [firebaseStorageEnabled, setFirebaseStorageEnabled] = useAtom(firebaseStorageEnabledAtom);

    const [anonymous, setAnonymous] = useAtom(authProvidersAtoms.anonymousAtom);
    const [email, setEmail] = useAtom(authProvidersAtoms.emailAtom);
    const [facebook, setFacebook] = useAtom(authProvidersAtoms.facebookAtom);
    const [github, setGithub] = useAtom(authProvidersAtoms.githubAtom);
    const [google, setGoogle] = useAtom(authProvidersAtoms.googleAtom);
    const [phone, setPhone] = useAtom(authProvidersAtoms.phoneAtom);
    const [twitter, setTwitter] = useAtom(authProvidersAtoms.twitterAtom);

    const envTxtOutput = useAtomValue(envTxtOutputAtom);
    const envTableDataSource = useAtomValue(dataSourceOutputAtom);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', padding: 8 }}>
            <div>
                <p>
                    Webサーバー
                    v0.7.2以降に対応しています。それより前のバージョンには対応していません。
                </p>
                <h1>使い方</h1>
                <ol>
                    <li>左半分のエリアで値を編集します。</li>
                    <li>右半分のエリアに表示されたデータをデプロイに利用します。</li>
                </ol>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ flex: 1 }}>
                    <h2>Firebase構成オブジェクト</h2>
                    <p>
                        <strong>{'両端にある " の文字は含めずに入力してください。'}</strong>
                    </p>
                    <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                        <FirebaseConfigFormItem
                            label={env.firebaseConfig.apiKey}
                            value={apiKey}
                            setValue={setApiKey}
                            placeholder="exampleABCdef-1234ABcd5678-abCD-12EF"
                        />
                        <FirebaseConfigFormItem
                            label={env.firebaseConfig.authDomain}
                            value={authDomain}
                            setValue={setAuthDomain}
                            placeholder="my-flocon-server.firebaseapp.com"
                        />
                        <FirebaseConfigFormItem
                            label={env.firebaseConfig.projectId}
                            value={projectId}
                            setValue={setProjectId}
                            placeholder="my-flocon-server"
                        />
                        <FirebaseConfigFormItem
                            label={env.firebaseConfig.storageBucket}
                            value={storageBucket}
                            setValue={setStorageBucket}
                            placeholder="my-flocon-server.appspot.com"
                        />
                        <FirebaseConfigFormItem
                            label={env.firebaseConfig.messagingSenderId}
                            value={messagingSenderId}
                            setValue={setMessagingSenderId}
                            placeholder="123456789012"
                        />
                        <FirebaseConfigFormItem
                            label={env.firebaseConfig.appId}
                            value={appId}
                            setValue={setAppId}
                            placeholder="1:123456789012:web:739b84a062e07ccb775b8a"
                        />
                    </Form>
                    <Collapse style={{ marginTop: collapsePadding }}>
                        <Collapse.Panel header="Firebase構成オブジェクトを参照する方法" key="2">
                            <div>
                                まず、Firebase管理画面から歯車アイコンをクリックして「プロジェクトの設定」を開きます。下の方にある、青い丸に白抜き文字で
                                {'</>'}と書かれているボタンをクリックします。
                            </div>
                            <Image
                                width={400}
                                src="/img/tools/firebase-config-2.png"
                                alt="Firebase構成オブジェクト2"
                                preview={{ mask: '拡大する' }}
                            />
                            <div style={{ paddingTop: spaceBetweenCollapseContent }}>
                                サイトの説明に従って、「アプリのニックネーム」を入力して「アプリを登録」ボタンを押します。ご自身がわかりやすい名前で構わないと思います。
                            </div>
                            <Image
                                width={400}
                                src="/img/tools/firebase-config-3.png"
                                alt="Firebase構成オブジェクト3"
                                preview={{ mask: '拡大する' }}
                            />
                            <div style={{ paddingTop: spaceBetweenCollapseContent }}>
                                下の画像のように「Firebase SDK
                                の追加」画面が表示されますが、ここに表示されている内容は後から参照できますのでそのまま下のほうにある「コンソールに進む」ボタンを押してください。「npm
                                install firebase」のコマンド等も実行する必要はありません。
                            </div>
                            <Image
                                width={400}
                                src="/img/tools/firebase-config-4.png"
                                alt="Firebase構成オブジェクト4"
                                preview={{ mask: '拡大する' }}
                            />
                            <div style={{ paddingTop: spaceBetweenCollapseContent }}>
                                {
                                    '下の画像の赤い四角形の部分にFirebase構成オブジェクトが作成されていますので、そこに表示されている内容を入力してください。「npm」「CDN」「構成」のうちどれを選択しても構いませんが、「構成」が一番わかりやすいかと思います。'
                                }
                            </div>
                            <Image
                                width={400}
                                src="/img/tools/firebase-config-1.png"
                                alt="Firebase構成オブジェクト1"
                                preview={{ mask: '拡大する' }}
                            />
                        </Collapse.Panel>
                    </Collapse>
                    <h2 style={{ paddingTop: headerPadding }}>APIサーバーのURL（http, https）</h2>
                    <Form>
                        <Form.Item
                            validateStatus={
                                isEmptyString(apiHttp) || !isValidUrl(apiHttp) ? 'error' : undefined
                            }
                            help={
                                isEmptyString(apiHttp)
                                    ? ErrorMessages.mustNotBeEmpty
                                    : !isValidUrl(apiHttp)
                                      ? ErrorMessages.notHttpProtocol
                                      : undefined
                            }
                        >
                            <Input
                                onChange={e => setApiHttp(e.target.value)}
                                value={apiHttp}
                                placeholder="例: https://example.com"
                            />
                        </Form.Item>
                    </Form>
                    <h2 style={{ paddingTop: headerPadding }}>APIサーバーのURL（ws, wss）</h2>
                    <Checkbox
                        checked={autoWsState}
                        onChange={newValue => {
                            setAutoWsState(newValue.target.checked);
                        }}
                    >
                        「APIサーバーのURL（http, https）」から自動的に推測する（推奨）
                    </Checkbox>
                    {autoWsState ? (
                        <Input disabled value={apiWs} />
                    ) : (
                        <Form>
                            <Form.Item
                                validateStatus={isEmptyString(apiWs) ? 'error' : undefined}
                                help={
                                    isEmptyString(apiWs) ? ErrorMessages.mustNotBeEmpty : undefined
                                }
                            >
                                <Input
                                    onChange={e => setApiWs(e.target.value)}
                                    value={apiWs}
                                    placeholder="例: wss://example.com"
                                />
                            </Form.Item>
                        </Form>
                    )}
                    <h2 style={{ paddingTop: headerPadding }}>
                        Firebase Storage版アップローダーを有効化する
                    </h2>
                    <Checkbox
                        checked={firebaseStorageEnabled}
                        onChange={e => {
                            setFirebaseStorageEnabled(e.target.checked);
                        }}
                    >
                        有効化する
                    </Checkbox>
                    <h2 style={{ paddingTop: headerPadding }}>
                        ブラウザで表示させるFirebase Authenticationのログインプロバイダ（任意）
                    </h2>
                    <p>
                        <strong>
                            この設定は任意です。全てのチェックボックスを空にしたままでも構いません。
                        </strong>
                    </p>
                    <p>
                        チェックが入っていないログインプロバイダは、Floconのログイン画面において非表示になります。ただし全てのチェックボックスが空の場合は、全てのログインプロバイダが表示されます。
                    </p>
                    <Checkbox
                        value={email}
                        onChange={e => {
                            setEmail(e.target.checked);
                        }}
                    >
                        メール/パスワード
                    </Checkbox>
                    <Checkbox
                        value={phone}
                        onChange={e => {
                            setPhone(e.target.checked);
                        }}
                    >
                        電話番号
                    </Checkbox>
                    <Checkbox
                        value={anonymous}
                        onChange={e => {
                            setAnonymous(e.target.checked);
                        }}
                    >
                        匿名
                    </Checkbox>
                    <Checkbox
                        value={google}
                        onChange={e => {
                            setGoogle(e.target.checked);
                        }}
                    >
                        Google
                    </Checkbox>
                    <Checkbox
                        value={facebook}
                        onChange={e => {
                            setFacebook(e.target.checked);
                        }}
                    >
                        Facebook
                    </Checkbox>
                    <Checkbox
                        value={twitter}
                        onChange={e => {
                            setTwitter(e.target.checked);
                        }}
                    >
                        Twitter
                    </Checkbox>
                    <Checkbox
                        value={github}
                        onChange={e => {
                            setGithub(e.target.checked);
                        }}
                    >
                        GitHub
                    </Checkbox>
                    <Collapse style={{ marginTop: collapsePadding }}>
                        <Collapse.Panel header="有効化したログインプロバイダを確認する方法" key="1">
                            <div>
                                <div>
                                    有効化したログインプロバイダは、Firebase
                                    Authenticationの管理画面から参照できます。公式ドキュメントに従ってサーバーをセットアップしている場合は、おそらく下の画像のようになっていると思います。この画像では「メール/パスワード」と「Google」が有効化されています。
                                </div>
                                <Image
                                    width={400}
                                    src="/img/tools/firebase-auth-2.png"
                                    alt="ログインプロバイダの画像1"
                                    preview={{ mask: '拡大する' }}
                                />
                                <div>
                                    ログインプロバイダを1つも有効化していない場合は、下の画像のようになります。この場合は少なくとも1つを管理画面から有効化してください。
                                </div>
                                <Image
                                    width={400}
                                    src="/img/tools/firebase-auth-1.png"
                                    alt="ログインプロバイダの画像2"
                                    preview={{ mask: '拡大する' }}
                                />
                            </div>
                        </Collapse.Panel>
                    </Collapse>
                </div>
                <div style={{ padding: '0 24px', alignSelf: 'center', fontSize: 24 }}>{'⇒'}</div>
                <div style={{ flex: 1 }}>
                    <div>
                        <h3>注意</h3>
                        左半分のエリアでエラーが出ていないことを確認してください。
                        <h3 style={{ paddingTop: headerPadding }}>デプロイ方法</h3>
                        <Radio.Group
                            onChange={e => {
                                const value: unknown = e.target.value;
                                switch (value) {
                                    case envTxt:
                                    case hostingService:
                                        setDeployType(value);
                                        break;
                                }
                            }}
                            value={deployType}
                        >
                            <Space direction="vertical">
                                <Radio value={envTxt}>
                                    静的ファイルを用い、設定には<code>env.txt</code>を使用する（例:
                                    Netlifyのドラッグ＆ドロップによるデプロイ）
                                </Radio>
                                <Radio value={hostingService}>
                                    Next.js に対応したホスティングサービス（例: Vercel）
                                </Radio>
                            </Space>
                        </Radio.Group>
                        <h3 style={{ paddingTop: headerPadding }}>設定方法</h3>
                        {deployType === envTxt ? (
                            <>
                                {
                                    'env.txtの中身を、下に表示されているテキストに置き換えてください。'
                                }
                                <Input.TextArea
                                    style={{ resize: 'none', height: 300, marginTop: 24 }}
                                    readOnly
                                    value={envTxtOutput}
                                />
                            </>
                        ) : (
                            <>
                                ホスティングサービスの設定画面を開き、次のように環境変数を設定してください。
                                <Table
                                    columns={[
                                        { title: 'キー', dataIndex: 'key', key: 'key' },
                                        {
                                            title: '値',
                                            dataIndex: 'value',
                                            key: 'value',
                                            render: value => (
                                                <div style={{ lineBreak: 'anywhere' }}>{value}</div>
                                            ),
                                        },
                                    ]}
                                    dataSource={envTableDataSource}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
