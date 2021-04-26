import { useRouter } from 'next/router';
import React from 'react';
import RoomComponent from '../../components/room/Room';
import { GetRoomFailureType, JoinRoomAsPlayerMutation, JoinRoomFailureType, ParticipantRole, RoomAsListItemFragment, RoomGetStateFragment, useJoinRoomAsPlayerMutation, useJoinRoomAsSpectatorMutation, useRoomOperatedSubscription } from '../../generated/graphql';
import { Alert, Button, Card, Input, Result, Spin, notification as antdNotification } from 'antd';
import Layout from '../../layouts/Layout';
import { ApolloProvider, FetchResult } from '@apollo/client';
import MyAuthContext from '../../contexts/MyAuthContext';
import { deleted, getRoomFailure, joined, loading, mutationFailure, myAuthIsUnavailable, nonJoined, useRoomState } from '../../hooks/useRoomState';
import Center from '../../foundations/Center';
import LogNotificationContext, { TextNotification, toTextNotification, Notification, TextNotificationsState } from '../../components/room/contexts/LogNotificationContext';
import LoadingResult from '../../foundations/Result/LoadingResult';
import NotSignInResult from '../../foundations/Result/NotSignInResult';

type JoinRoomFormProps = {
    roomState: RoomAsListItemFragment;
    onJoin?: () => void;
}

const JoinRoomForm: React.FC<JoinRoomFormProps> = ({ roomState, onJoin }: JoinRoomFormProps) => {
    const myAuth = React.useContext(MyAuthContext);
    const [name, setName] = React.useState<string>(typeof myAuth === 'string' ? '' : (myAuth.displayName ?? ''));
    const [playerPhrase, setPlayerPhrase] = React.useState<string>('');
    const [spectatorPhrase, setSpectatorPhrase] = React.useState<string>('');
    const [joinRoomAsPlayer, joinRoomAsPlayerResult] = useJoinRoomAsPlayerMutation();
    const [joinRoomAsSpectator, joinRoomAsSpectatorResult] = useJoinRoomAsSpectatorMutation();
    const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);

    const disableJoinActions = joinRoomAsPlayerResult.loading || joinRoomAsSpectatorResult.loading;

    const OnGetResult = (result: FetchResult<JoinRoomAsPlayerMutation, Record<string, any>, Record<string, any>>) => {
        if (result.data == null) {
            return;
        }
        switch (result.data.result.__typename) {
            case 'JoinRoomSuccessResult':
                if (onJoin != null) {
                    onJoin();
                }
                return;
            case 'JoinRoomFailureResult':
                switch (result.data.result.failureType) {
                    case JoinRoomFailureType.WrongPhrase: {
                        setErrorMessage('Wrong phrase');
                        return;
                    }
                    case JoinRoomFailureType.NotFound: {
                        setErrorMessage('Not found. Deleted?');
                        return;
                    }
                    case JoinRoomFailureType.NotSignIn: {
                        setErrorMessage('Need to sign in');
                        return;
                    }
                    case JoinRoomFailureType.NotEntry: {
                        // entryできた後、管理者がentryを無効化した後にここに来る可能性がある。
                        // ただ、レアケースなことに加えてここからEntryFormを出す処理が面倒なので、ブラウザの更新により再度entryすることを促すだけにしている。
                        setErrorMessage('Not entry anymore. Please reload the browser.');
                        return;
                    }
                }
        }
    };
    const onJoinAsPlayerButtonClick = async () => {
        if (disableJoinActions) {
            return;
        }
        const phrase = roomState.requiresPhraseToJoinAsPlayer ? playerPhrase : undefined;
        await joinRoomAsPlayer({ variables: { id: roomState.id, phrase, name } }).then(OnGetResult);
    };
    const onJoinAsSpectatorButtonClick = async () => {
        if (disableJoinActions) {
            return;
        }
        const phrase = roomState.requiresPhraseToJoinAsSpectator ? spectatorPhrase : undefined;
        await joinRoomAsSpectator({ variables: { id: roomState.id, phrase, name } }).then(OnGetResult);
    };
    return (
        <Spin spinning={disableJoinActions}>
            {errorMessage == null ? null : (<Alert message={errorMessage} type='error' showIcon />)}
            <div style={({ display: 'grid', gridTemplateRows: '42px 34px 42px 42px 42px', gridTemplateColumns: '150px 280px 100px', alignItems: 'center' })}>
                <div style={({ gridColumn: 1, gridRow: 1, marginRight: 8, justifySelf: 'right' })}>名前</div>
                <Input
                    style={({ gridColumn: 2, gridRow: 1 })}
                    onChange={e => setName(e.target.value)}
                    value={name}
                    placeholder="名前" />
                <div style={({ gridColumn: 1, gridRow: 3, marginRight: 8, justifySelf: 'right' })}>参加者として入室</div>
                {roomState.requiresPhraseToJoinAsPlayer ? <Input
                    style={({ gridColumn: 2, gridRow: 3 })}
                    onChange={e => setPlayerPhrase(e.target.value)}
                    value={playerPhrase}
                    placeholder="参加フレーズ" /> : <div style={({ gridColumn: 2, gridRow: 3, marginLeft: 4, fontSize: 'small' })}>(参加フレーズなしで入室できます)</div>}
                <Button
                    style={({ gridColumn: 3, gridRow: 3 })}
                    type='primary'
                    onClick={onJoinAsPlayerButtonClick}>
                    入室
                </Button>
                <div style={({ gridColumn: 1, gridRow: 4, marginRight: 8, justifySelf: 'right' })}>観戦者として入室</div>
                {roomState.requiresPhraseToJoinAsSpectator ? <Input
                    style={({ gridColumn: 2, gridRow: 4 })}
                    onChange={e => setSpectatorPhrase(e.target.value)}
                    value={spectatorPhrase}
                    placeholder="観戦フレーズ" /> : <div style={({ gridColumn: 2, gridRow: 4, marginLeft: 4, fontSize: 'small' })}>(観戦フレーズなしで入室できます)</div>}
                <Button
                    style={({ gridColumn: 3, gridRow: 4 })}
                    type='primary'
                    onClick={onJoinAsSpectatorButtonClick}>
                    入室
                </Button>
            </div>
        </Spin>
    );
};

const RoomRouter: React.FC<{ id: string; logNotifications: TextNotificationsState }> = ({ id, logNotifications }: { id: string; logNotifications: TextNotificationsState }) => {
    const { refetch, state } = useRoomState(id);

    switch (state.type) {
        case joined: {
            if (state.operateRoom == null) {
                // TODO: Buttonなどを用いたreloadに対応させる。
                return (
                    <Layout requiresLogin showEntryForm={false}>
                        <Result status='error' title='サーバーから応答を受け取ることができませんでした。' subTitle='ブラウザを更新してください。' />
                    </Layout>);
            }
            return (
                <Layout requiresLogin showEntryForm={false}>
                    <RoomComponent roomId={id} roomState={state.roomState} operate={state.operateRoom} logNotifications={logNotifications} />
                </Layout>);
        }
        case nonJoined:
            return (<Layout requiresLogin showEntryForm={false}>
                <Center>
                    <Card title="入室" >
                        <JoinRoomForm roomState={state.nonJoinedRoom} onJoin={() => refetch()} />
                    </Card>
                </Center>
            </Layout >);
        case getRoomFailure: {
            switch (state.getRoomFailureType) {
                case GetRoomFailureType.NotEntry:
                    return (
                        <Layout requiresLogin showEntryForm={true} onEntry={() => refetch()}>
                        </Layout>);
                case GetRoomFailureType.NotFound:
                    return (
                        <Layout requiresLogin showEntryForm={false}>
                            <Result status='404' title='該当する部屋が見つかりませんでした。' subTitle='部屋が存在しているか、適切な権限があるかどうか確認してください。' />
                        </Layout>);
                case GetRoomFailureType.NotSignIn:
                    return (
                        <Layout requiresLogin showEntryForm={false}>
                            <NotSignInResult />
                        </Layout>);
            }
            break;
        }
        case loading:
            return (
                <Layout requiresLogin showEntryForm={false}>
                    <LoadingResult />
                </Layout>);
        case myAuthIsUnavailable:
            return (
                <Layout requiresLogin showEntryForm={false} />);
        case mutationFailure:
            // TODO: mutationFailureが細分化されたら、こちらも細分化する。
            return (
                <Layout requiresLogin showEntryForm={false}>
                    <Result status='error' title='mutationに失敗しました。' subTitle='ブラウザを更新してください。' />
                </Layout>);
        case deleted:
            return (
                <Layout requiresLogin={false} showEntryForm={false}>
                    <Result
                        status='warning'
                        title='この部屋は削除されました。'
                    />
                </Layout>);
    }
};

const RoomCore: React.FC<{ id: string }> = ({ id }: { id: string }) => {
    // LogNotificationContextはuseRoomStateで使われる。そのため、useRoomStateの上位であるこのComponentで渡している。
    const [logNotification, setLogNotification] = React.useState<Notification>();
    const [logNotifications, setLogNotifications] = React.useState<TextNotificationsState>({ values: [], newValue: null });
    React.useEffect(() => {
        if (logNotification == null) {
            return;
        }
        const textNotification = toTextNotification(logNotification);
        antdNotification[textNotification.type]({
            message: textNotification.message,
            description: textNotification.description,
            placement: 'bottomRight',
        });
        setLogNotifications(oldValue => {
            return {
                values: [...oldValue.values, textNotification],
                newValue: textNotification,
            }
        });
    }, [logNotification]);

    return (<LogNotificationContext.Provider value={setLogNotification}>
        <RoomRouter id={id} logNotifications={logNotifications} />
    </LogNotificationContext.Provider>);
}

const Room: React.FC = () => {
    const router = useRouter();
    const id = router.query.id

    if (Array.isArray(id) || id == null) {
        return (
            <Layout requiresLogin showEntryForm={false}>
                <Result
                    status="error"
                    title="パラメーターが不正です。" />
            </Layout>);
    }
    return (<RoomCore id={id} />);
};

export default Room;