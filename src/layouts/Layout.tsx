import React, { PropsWithChildren } from 'react';
import MyAuthContext from '../contexts/MyAuthContext';
import { useRouter } from 'next/router';
import { Button, Layout as AntdLayout, Row, Col, Space, Form, Input, Spin, Card, Alert } from 'antd';
import { EntryToServerResultType, useEntryToServerMutation } from '../generated/graphql';
import Center from '../foundations/Center';
import useConstant from 'use-constant';
import { getAuth } from '../utils/firebaseHelpers';
import FirebaseAppNotFound from '../components/alerts/FirebaseAppNotFound';
import Link from 'next/link';
import ConfigContext from '../contexts/ConfigContext';
const { Header, Content } = AntdLayout;

type EntryFormComponentProps = {
    // entryが成功したときに呼び出される。
    onEntry: (() => void) | undefined;
}

const EntryFormComponent: React.FC<EntryFormComponentProps> = (props: EntryFormComponentProps) => {
    const [entryToServer, entryToServerResult] = useEntryToServerMutation();
    const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
    const [isFinishedSuccessfully, setIsFinishedSuccessfully] = React.useState<boolean>(false);

    const phraseName = 'phrase';

    return (
        <Form
            name="entryPhrase"
            onFinish={e => {
                if (isSubmitting || isFinishedSuccessfully) {
                    return;
                }
                const phrase: string = e[phraseName];
                setIsSubmitting(true);
                entryToServer({ variables: { phrase } }).then(r => {
                    const resultType = r.data?.result.type;
                    if (resultType == null) {
                        return;
                    }
                    if (resultType === EntryToServerResultType.WrongPhrase) {
                        setIsSubmitting(false);
                        return;
                    }
                    if (props.onEntry == null) {
                        setIsSubmitting(false);
                        return;
                    }
                    setIsSubmitting(false);
                    setIsFinishedSuccessfully(true);
                    props.onEntry();
                });
            }}>
            <Form.Item
                label="Phrase"
                name={phraseName}>
                <Input />
            </Form.Item>

            <Form.Item>
                <Button disabled={isSubmitting || isFinishedSuccessfully} type="primary" htmlType="submit">
                    Submit
                </Button>
                {isSubmitting ? (<Spin />) : null}
                {entryToServerResult?.data?.result.type === EntryToServerResultType.WrongPhrase ? (<Alert message='wrong phrase' type='error' showIcon />) : null}
                {entryToServerResult?.error == null ? null : (<Alert message={entryToServerResult.error.message} type='error' showIcon />)}
                {isFinishedSuccessfully ? (<Alert message='success' type='success' showIcon />) : null}
            </Form.Item>
        </Form>
    );
};

type Props = {
    requiresLogin: boolean;

    // EntryFormを表示させたいときにtrueを渡す。Entryの有無や必要性はここではチェックされない。
    showEntryForm: boolean;

    // EntryFormでのentryが成功したときに呼び出される。
    onEntry?: () => void;
}

const Layout: React.FC<PropsWithChildren<Props>> = ({ children, showEntryForm, onEntry, requiresLogin }: PropsWithChildren<Props>) => {
    const router = useRouter();
    const myAuth = React.useContext(MyAuthContext);
    const config = React.useContext(ConfigContext);
    const auth = getAuth(config);

    if (auth == null) {
        return <FirebaseAppNotFound />;
    }

    const content = (() => {
        if (requiresLogin && myAuth == null) {
            return (<Alert message='Login required' type='error' showIcon />);
        }
        if (showEntryForm) {
            return (
                <Center>
                    <Card title="Entry form" >
                        <EntryFormComponent onEntry={onEntry} />
                    </Card>
                </Center>
            );
        }
        return children;
    })();

    return (
        <AntdLayout style={({ height: '100vh' })}>
            <Header>
                <Row>
                    <Col flex={0}><Link href="/">(Logo)</Link></Col>
                    <Col flex={1} />
                    <Col flex={0}>
                        <Space>
                            {myAuth == null ? null : <div style={({ color: 'white' })}>{myAuth?.displayName} - {myAuth?.uid}</div>}
                            {myAuth == null
                                ? <Button key="2" onClick={() => router.push('/signin')}>Log in</Button>
                                : <Button key="2" onClick={() => auth.signOut()}>Logout</Button>}
                        </Space>
                    </Col>
                </Row>
            </Header>
            <Content>
                {content}
            </Content>
        </AntdLayout>
    );
};

export default Layout;