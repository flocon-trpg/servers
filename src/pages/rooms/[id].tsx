import { useRouter } from 'next/router';
import React from 'react';
import RoomComponent from '../../components/room/Room';
import { GetRoomFailureType, JoinRoomAsPlayerMutation, JoinRoomFailureType, ParticipantRole, RoomAsListItemFragment, RoomGetStateFragment, useJoinRoomAsPlayerMutation, useJoinRoomAsSpectatorMutation, useRoomOperatedSubscription } from '../../generated/graphql';
import { Alert, Button, Card, Input, Result, Spin, Tooltip } from 'antd';
import Layout from '../../layouts/Layout';
import { ApolloProvider, FetchResult } from '@apollo/client';
import MyAuthContext from '../../contexts/MyAuthContext';
import { createState } from '../../stateManagers/states/room';
import { getRoomFailure, joined, loading, mutationFailure, nonJoined, requiresLogin, useRoomState } from '../../hooks/useRoomState';
import AlertDialog from '../../foundations/AlertDialog';
import Loading from '../../components/alerts/Loading';
import { State as ParticipantsState } from '../../stateManagers/states/participant';
import Center from '../../foundations/Center';

type JoinRoomFormProps = {
    roomState: RoomAsListItemFragment;
    onJoin?: () => void;
}

const JoinRoomForm: React.FC<JoinRoomFormProps> = ({ roomState, onJoin }: JoinRoomFormProps) => {
    const myAuth = React.useContext(MyAuthContext);
    const [name, setName] = React.useState<string>(myAuth?.displayName ?? '');
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
                    onClick={onJoinAsPlayerButtonClick}>
                    入室
                </Button>
            </div>
        </Spin>
    );
};

const RoomRouter: React.FC<{ id: string }> = ({ id }: { id: string }) => {
    const { refetch, state } = useRoomState(id);

    switch (state.type) {
        case joined: {
            if (state.operateRoom == null) {
                // TODO: Buttonなどを用いたreloadに対応させる。
                return (
                    <Layout requiresLogin showEntryForm={false}>
                        <AlertDialog alert={(<Alert type="error" message="Please reload browser" showIcon />)} />
                    </Layout>);
            }
            return (
                <Layout requiresLogin showEntryForm={false}>
                    <RoomComponent roomId={id} roomState={state.roomState} participantsState={state.participantsState} operate={state.operateRoom} />
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
                            <AlertDialog alert={(<Alert type="error" message="Room not found" showIcon />)} />
                        </Layout>);
                case GetRoomFailureType.NotSignIn:
                    return (
                        <Layout requiresLogin showEntryForm={false}>
                            <AlertDialog alert={(<Alert type="error" message="Need to sign in" showIcon />)} />
                        </Layout>);
                default:
                    return (
                        <Layout requiresLogin showEntryForm={false}>
                            <AlertDialog alert={(<Alert type="error" message="Unknown failure type!" showIcon />)} />
                        </Layout>);
            }
        }
        case loading:
            return (
                <Layout requiresLogin showEntryForm={false}>
                    <AlertDialog alert={(<Loading />)} />
                </Layout>);
        case requiresLogin:
            return (
                <Layout requiresLogin showEntryForm={false} />);
        case mutationFailure:
            // TODO: mutationFailureが細分化されたら、こちらも細分化する。
            return (
                <Layout requiresLogin showEntryForm={false}>
                    <AlertDialog alert={(<Alert type="error" message="Please reload browser" showIcon />)} />
                </Layout>);
    }
};

const RoomCore: React.FC = () => {
    const router = useRouter();
    const id = router.query.id;

    if (Array.isArray(id) || id == null) {
        return (
            <Layout requiresLogin showEntryForm={false}>
                <Alert
                    type="error"
                    message="Invalid parameter" />
            </Layout>);
    }

    return (<RoomRouter id={id} />);
};

const Room: React.FC = () => {
    return (<RoomCore />);
};

export default Room;