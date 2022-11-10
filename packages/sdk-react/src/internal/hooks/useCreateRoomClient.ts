import { GraphQLClient, RoomClient, createRoomClient } from '@flocon-trpg/sdk';
import { useEffect, useMemo, useState } from 'react';
import { usePreviousDistinct } from 'react-use';
import { useMemoOne } from 'use-memo-one';

type Result<TCustomMessage, TGraphQLError> = {
    value: RoomClient<TCustomMessage, TGraphQLError>;
    recreate: () => void;
};

type Params<TGraphQLError> = {
    client: GraphQLClient<TGraphQLError>;
    roomId: string;
    userUid: string;
};

/**
 * `createRoomClient` を実行して、戻り値を返します。ただし、引数が nullish の場合は null を返します。
 *
 * 引数の `client`, `roomId`, `userUid` は hooks の deps に用いられているため、いずれかが更新されるたびに RoomClient は再作成されます。再作成されると API サーバーとの間に通信が発生するため負荷がかかり、加えて RoomClient の一部のデータも失われるため、更新の必要がない場合は更新をなるべく避ける必要があります。特に `client` は object なので、use-memo-one パッケージの `useMemoOne` もしくは React の `useMemo` などを用いることを推奨します。
 */
export function useCreateRoomClient<TCustomMessage, TGraphQLError>(
    params: Params<TGraphQLError>
): Result<TCustomMessage, TGraphQLError>;
export function useCreateRoomClient<TCustomMessage, TGraphQLError>(
    params: Params<TGraphQLError> | null | undefined
): Result<TCustomMessage, TGraphQLError> | null;
export function useCreateRoomClient<TCustomMessage, TGraphQLError>(
    params: Params<TGraphQLError> | null | undefined
): Result<TCustomMessage, TGraphQLError> | null {
    const client = params?.client;
    const roomId = params?.roomId;
    const userUid = params?.userUid;
    const [recreateKey, setRecreateKey] = useState(0);

    const result = useMemoOne(() => {
        if (client == null || roomId == null || userUid == null) {
            return null;
        }
        return createRoomClient<TCustomMessage, TGraphQLError>({ client, roomId, userUid });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client, roomId, userUid, recreateKey]);
    const previousResult = usePreviousDistinct(result);

    useEffect(() => {
        previousResult?.unsubscribe();
    }, [previousResult]);

    return useMemo(() => {
        if (result == null) {
            return null;
        }
        return {
            value: result,
            recreate: () => {
                setRecreateKey(i => i + 1);
            },
        };
    }, [result]);
}
