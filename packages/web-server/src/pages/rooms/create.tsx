import { Alert, Button, Card, Form, Input, Spin, Switch } from 'antd';
import { useRouter } from 'next/router';
import React from 'react';
import { Layout, loginAndEntry } from '../../layouts/Layout';
import { CreateRoomDocument, CreateRoomInput } from '@flocon-trpg/typed-document-node';
import { Center } from '../../components/Center';
import { MyAuthContext } from '../../contexts/MyAuthContext';
import { useMutation } from '@apollo/client';

const labelCol = 10;
const wrapperCol = 24 - labelCol;

const roomName = 'roomName';
const participantName = 'userName';
const joinAsPlayerPhrase = 'joinAsPlayerPhrase';
const joinAsSpectatorPhrase = 'joinAsSpectatorPhrase';

const CreateRoomCore: React.FC = () => {
    const router = useRouter();
    const [createRoom, createRoomResult] = useMutation(CreateRoomDocument);
    const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
    const [isJoinAsPlayerPhraseEnabled, setIsJoinAsPlayerPhraseEnabled] =
        React.useState<boolean>(false);
    const [isJoinAsSpectatorPhraseEnabled, setIsJoinAsSpectatorPhraseEnabled] =
        React.useState<boolean>(false);
    const myAuth = React.useContext(MyAuthContext);

    // TODO: 横幅などが足りないため、Formで表現するようなものではない気がする。
    const form = (
        <Form
            name='createRoom'
            labelCol={{ span: labelCol }}
            wrapperCol={{ span: wrapperCol }}
            style={{ width: 600 }}
            initialValues={{
                [participantName]: typeof myAuth === 'string' ? undefined : myAuth.displayName,
            }}
            onFinish={e => {
                if (isSubmitting) {
                    return;
                }
                const roomNameValue: string = e[roomName] ?? '';
                const participantNameValue: string = e[participantName] ?? '';
                const joinAsPlayerPhraseValue: string = e[joinAsPlayerPhrase] ?? '';
                const joinAsSpectatorPhraseValue: string = e[joinAsSpectatorPhrase] ?? '';
                const input: CreateRoomInput = {
                    roomName: roomNameValue,
                    participantName: participantNameValue,
                    joinAsPlayerPhrase: isJoinAsPlayerPhraseEnabled
                        ? joinAsPlayerPhraseValue
                        : undefined,
                    joinAsSpectatorPhrase: isJoinAsSpectatorPhraseEnabled
                        ? joinAsSpectatorPhraseValue
                        : undefined,
                };
                setIsSubmitting(true);
                createRoom({ variables: { input } }).then(r => {
                    switch (r.data?.result.__typename) {
                        case 'CreateRoomSuccessResult': {
                            router.push(`/rooms/${r.data?.result.id}`);
                            return;
                        }
                        case 'CreateRoomFailureResult': {
                            // 現状、ここには来ない
                            setIsSubmitting(false);
                            return;
                        }
                    }
                    setIsSubmitting(false);
                });
            }}
        >
            <Form.Item label='部屋の名前' name={roomName}>
                <Input />
            </Form.Item>
            <Form.Item label='自分の名前' name={participantName}>
                <Input />
            </Form.Item>
            <Form.Item label='参加パスワードを有効化'>
                <Switch
                    checked={isJoinAsPlayerPhraseEnabled}
                    onChange={setIsJoinAsPlayerPhraseEnabled}
                />
            </Form.Item>
            <Form.Item label='参加パスワード' name={joinAsPlayerPhrase}>
                <Input disabled={!isJoinAsPlayerPhraseEnabled} />
            </Form.Item>
            <Form.Item label='観戦パスワードを有効化'>
                <Switch
                    checked={isJoinAsSpectatorPhraseEnabled}
                    onChange={setIsJoinAsSpectatorPhraseEnabled}
                />
            </Form.Item>
            <Form.Item label='観戦パスワード' name={joinAsSpectatorPhrase}>
                <Input disabled={!isJoinAsSpectatorPhraseEnabled} />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: labelCol, span: wrapperCol }}>
                <Button disabled={isSubmitting} type='primary' htmlType='submit'>
                    OK
                </Button>
                {isSubmitting ? <Spin /> : null}
                {createRoomResult.error == null ? null : (
                    <Alert message={createRoomResult.error.message} type='error' showIcon />
                )}
            </Form.Item>
        </Form>
    );

    return (
        <Layout requires={loginAndEntry}>
            <Center>
                <Card title='部屋の新規作成'>{form}</Card>
            </Center>
        </Layout>
    );
};

const CreateRoom: React.FC = () => {
    return <CreateRoomCore />;
};

export default CreateRoom;
