import { updateProfile } from '@firebase/auth';
import { Alert, Button, Card, Form, Input, Spin, Switch } from 'antd';
import { useAtomValue } from 'jotai';
import React from 'react';
import { firebaseUserAtom } from '../../pages/_app';
import { Center } from '../ui/Center';
import { Layout, login } from '../ui/Layout';

const labelCol = 10;
const wrapperCol = 24 - labelCol;

export const Profile: React.FC = () => {
    const firebaseUser = useAtomValue(firebaseUserAtom);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitErrorMessage, setSubmitErrorMessage] = React.useState<string>();
    const [displayName, setDisplayName] = React.useState<string | null>();
    React.useEffect(() => {
        if (typeof firebaseUser == 'string') {
            return;
        }
        setDisplayName(firebaseUser.displayName);
    }, [firebaseUser]);

    if (typeof firebaseUser === 'string') {
        return null;
    }

    const form = (
        <Form
            name='createRoom'
            labelCol={{ span: labelCol }}
            wrapperCol={{ span: wrapperCol }}
            style={{ width: 600 }}
            onFinish={() => {
                setIsSubmitting(true);
                updateProfile(firebaseUser, { displayName })
                    .catch((err: unknown) => {
                        if (err instanceof Error) {
                            setSubmitErrorMessage(err.message);
                            return;
                        }
                        setSubmitErrorMessage('不明なエラーが発生しました。');
                    })
                    .finally(() => setIsSubmitting(false));
            }}
        >
            <Form.Item label='ユーザー名を有効化'>
                <Switch
                    checked={displayName != null}
                    onChange={newValue => setDisplayName(newValue ? '' : null)}
                />
            </Form.Item>
            <Form.Item label='ユーザー名'>
                <Input
                    disabled={displayName == null}
                    value={displayName ?? ''}
                    onChange={e => {
                        setDisplayName(e.target.value);
                    }}
                />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: labelCol, span: wrapperCol }}>
                <Button disabled={isSubmitting} type='primary' htmlType='submit'>
                    更新
                </Button>
                {isSubmitting ? <Spin /> : null}
                {submitErrorMessage == null ? null : (
                    <Alert message={submitErrorMessage} type='error' showIcon />
                )}
            </Form.Item>
        </Form>
    );

    return (
        <Layout requires={login}>
            <Center>
                <Card title='ユーザー情報の変更'>{form}</Card>
            </Center>
        </Layout>
    );
};
