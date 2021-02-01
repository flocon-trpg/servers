import { useRouter } from 'next/router';
import React from 'react';
import RoomComponent from '../../components/room/Room';
import { GetRoomFailureType, JoinRoomAsPlayerMutation, JoinRoomFailureType, ParticipantRole, RoomAsListItemFragment, RoomGetStateFragment, useJoinRoomAsPlayerMutation, useJoinRoomAsSpectatorMutation, useRoomOperatedSubscription } from '../../generated/graphql';
import { Alert, Button, Input, Result, Spin } from 'antd';
import Layout from '../../layouts/Layout';
import { ApolloProvider, FetchResult } from '@apollo/client';
import MyAuthContext from '../../contexts/MyAuthContext';
import { createState } from '../../stateManagers/states/room';
import { getRoomFailure, joined, loading, mutationFailure, nonJoined, requiresLogin, useRoomState } from '../../hooks/useRoomState';
import AlertDialog from '../../foundations/AlertDialog';
import Loading from '../../components/alerts/Loading';

type JoinRoomFormProps = {
    room: RoomAsListItemFragment;
    onJoin?: (params: { name: string; role: ParticipantRole }) => void;
}

const JoinRoomForm: React.FC<JoinRoomFormProps> = ({ room, onJoin }: JoinRoomFormProps) => {
    const [name, setName] = React.useState<string>('anonymous');
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
                    onJoin(result.data.result);
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
        const phrase = room.requiresPhraseToJoinAsPlayer ? playerPhrase : undefined;
        await joinRoomAsPlayer({ variables: { id: room.id, phrase, name } }).then(OnGetResult);
    };
    const onJoinAsSpectatorButtonClick = async () => {
        if (disableJoinActions) {
            return;
        }
        const phrase = room.requiresPhraseToJoinAsSpectator ? spectatorPhrase : undefined;
        await joinRoomAsSpectator({ variables: { id: room.id, phrase, name } }).then(OnGetResult);
    };
    return (
        <Spin spinning={disableJoinActions}>
            {errorMessage == null ? null : (<Alert message={errorMessage} type='error' showIcon />)}
            <Input
                onChange={e => setName(e.target.value)}
                value={name}
                placeholder="name" />
            <Input
                disabled={!room.requiresPhraseToJoinAsPlayer}
                onChange={e => setPlayerPhrase(e.target.value)}
                value={playerPhrase}
                placeholder="player phrase" />
            <Button
                type="primary"
                onClick={onJoinAsPlayerButtonClick}>
                join as a player
            </Button>
            <Input
                disabled={!room.requiresPhraseToJoinAsSpectator}
                onChange={e => setSpectatorPhrase(e.target.value)}
                value={spectatorPhrase}
                placeholder="spectator phrase" />
            <Button
                type="primary"
                onClick={onJoinAsSpectatorButtonClick}>
                join as a spectator
            </Button>
        </Spin>
    );
};

const RoomRouter: React.FC<{ id: string }> = ({ id }: { id: string }) => {
    const { refetch, state } = useRoomState(id);

    switch (state.type) {
        case joined: {
            if (state.operate == null) {
                // TODO: Buttonなどを用いたreloadに対応させる。
                return (
                    <Layout requiresLogin showEntryForm={false}>
                        <AlertDialog alert={(<Alert type="error" message="Please reload browser" showIcon />)} />
                    </Layout>);
            }
            return (
                <Layout requiresLogin showEntryForm={false}>
                    <RoomComponent roomId={id} roomState={state.state} operate={state.operate} />
                </Layout>);
        }
        case nonJoined:
            return (<Layout requiresLogin showEntryForm={false}>
                <JoinRoomForm room={state.nonJoinedRoom} onJoin={() => refetch()} />
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