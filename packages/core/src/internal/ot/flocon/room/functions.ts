import { Result } from '@kizahasi/result';
import { isStrIndex20, isStrIndex5 } from '../../../indexes';
import { State, TwoWayOperation, UpOperation } from '../../generator/types';
import * as NullableTextOperation from '../../nullableTextOperation';
import { isIdRecord } from '../../record';
import * as RecordOperation from '../../recordOperation';
import {
    RequestedBy,
    admin,
    anyValue,
    client,
    isBoardOwner,
    isBoardVisible,
    isOwner,
    none,
    restrict,
} from '../../requestedBy';
import * as TextOperation from '../../textOperation';
import * as ReplaceOperation from '../../util/replaceOperation';
import { ServerTransform, TwoWayError } from '../../util/type';
import * as Bgm from './bgm/functions';
import * as BgmTypes from './bgm/types';
import * as Board from './board/functions';
import * as BoardTypes from './board/types';
import * as Character from './character/functions';
import * as CharacterTypes from './character/types';
import * as Memo from './memo/functions';
import * as MemoTypes from './memo/types';
import * as ParamNames from './paramName/functions';
import * as ParamNamesTypes from './paramName/types';
import * as Participant from './participant/functions';
import * as ParticipantTypes from './participant/types';
import * as RollCalls from './rollCall/functions';
import { getOpenRollCall } from './rollCall/getOpenRollCall';
import { template } from './types';

const oneToTenArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

/**
 * Stateから、指定されたユーザーが閲覧できないデータを取り除いた新しいStateを返す。
 * @param requestedBy 生成されたStateを渡すユーザーの種類。権限を確認するために用いられる。
 */
export const toClientState =
    (requestedBy: RequestedBy) =>
    (source: State<typeof template>): State<typeof template> => {
        return {
            ...source,
            bgms: RecordOperation.toClientState({
                serverState: source.bgms,
                isPrivate: () => false,
                toClientState: ({ state }) => Bgm.toClientState(state),
            }),
            boolParamNames: RecordOperation.toClientState({
                serverState: source.boolParamNames,
                isPrivate: () => false,
                toClientState: ({ state }) => ParamNames.toClientState(state),
            }),
            boards: RecordOperation.toClientState({
                serverState: source.boards,
                isPrivate: (_, boardId) =>
                    !isBoardVisible({
                        boardId,
                        requestedBy,
                        currentRoomState: source,
                    }),
                toClientState: ({ state }) => Board.toClientState(requestedBy, source)(state),
            }),
            characters: RecordOperation.toClientState<
                State<typeof CharacterTypes.template>,
                State<typeof CharacterTypes.template>
            >({
                serverState: source.characters,
                isPrivate: state =>
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: state.ownerParticipantId ?? anyValue,
                    }) && state.isPrivate,
                toClientState: ({ state }) =>
                    Character.toClientState(
                        isOwner({
                            requestedBy,
                            ownerParticipantId: state.ownerParticipantId ?? anyValue,
                        }),
                        requestedBy,
                        source,
                    )(state),
            }),
            memos: RecordOperation.toClientState({
                serverState: source.memos,
                isPrivate: () => false,
                toClientState: ({ state }) => Memo.toClientState(state),
            }),
            numParamNames: RecordOperation.toClientState({
                serverState: source.numParamNames,
                isPrivate: () => false,
                toClientState: ({ state }) => ParamNames.toClientState(state),
            }),
            participants: RecordOperation.toClientState({
                serverState: source.participants,
                isPrivate: () => false,
                toClientState: ({ state }) => Participant.toClientState(state),
            }),
            strParamNames: RecordOperation.toClientState({
                serverState: source.strParamNames,
                isPrivate: () => false,
                toClientState: ({ state }) => ParamNames.toClientState(state),
            }),
        };
    };

/**
 * クライアントによる変更の要求を表すOperationを受け取り、APIサーバーのStateに対してapplyできる状態のOperationに変換して返す。変換処理では、主に次の2つが行われる。
 * - クライアントから受け取ったOperationのうち、不正なもの（例: そのユーザーが本来削除できないはずのキャラクターを削除しようとする）があった場合に、取り除くか拒否してエラーを返す
 * - 編集競合が発生している場合は解決する
 *
 * @param requestedBy 変更を要求したユーザーの種類。権限を確認するために用いられる。
 * @param stateBeforeServerOperation クライアントがStateを変更しようとしたときに用いられたState。
 * @param stateAfterServerOperation APIサーバーにおける実際の最新のState。
 * @param serverOperation `stateBeforeServerOperation`と`stateAfterServerOperation`のDiff。`stateBeforeServerOperation`と`stateAfterServerOperation`が等しい場合はundefined。
 * @param clientOperation クライアントが要求している変更。
 * @returns `stateAfterServerOperation`に対してapplyできる状態のOperation。
 */
export const serverTransform =
    (
        requestedBy: RequestedBy,
    ): ServerTransform<
        State<typeof template>,
        TwoWayOperation<typeof template>,
        UpOperation<typeof template>
    > =>
    ({
        stateBeforeServerOperation,
        stateAfterServerOperation,
        clientOperation,
        serverOperation,
    }) => {
        switch (requestedBy.type) {
            case restrict:
                // エラーを返すべきかもしれない
                return Result.ok(undefined);
            case client: {
                const me = (stateAfterServerOperation.participants ?? {})[requestedBy.userUid];
                if (me == null || me.role == null || me.role === ParticipantTypes.Spectator) {
                    // エラーを返すべきかもしれない
                    return Result.ok(undefined);
                }
                break;
            }
            case admin:
                break;
        }
        const isAdmin = requestedBy.type === admin;

        const bgms = RecordOperation.serverTransform<
            State<typeof BgmTypes.template>,
            State<typeof BgmTypes.template>,
            TwoWayOperation<typeof BgmTypes.template>,
            UpOperation<typeof BgmTypes.template>,
            TwoWayError
        >({
            stateBeforeFirst: stateBeforeServerOperation.bgms ?? {},
            stateAfterFirst: stateAfterServerOperation.bgms ?? {},
            first: serverOperation?.bgms,
            second: clientOperation.bgms,
            innerTransform: ({ prevState, nextState, first, second }) =>
                Bgm.serverTransform({
                    stateBeforeServerOperation: prevState,
                    stateAfterServerOperation: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ key }) => !isStrIndex5(key),
            },
        });
        if (bgms.isError) {
            return bgms;
        }

        const boolParamNames = RecordOperation.serverTransform<
            State<typeof ParamNamesTypes.template>,
            State<typeof ParamNamesTypes.template>,
            TwoWayOperation<typeof ParamNamesTypes.template>,
            UpOperation<typeof ParamNamesTypes.template>,
            TwoWayError
        >({
            stateBeforeFirst: stateBeforeServerOperation.boolParamNames ?? {},
            stateAfterFirst: stateAfterServerOperation.boolParamNames ?? {},
            first: serverOperation?.boolParamNames,
            second: clientOperation.boolParamNames,
            innerTransform: ({ prevState, nextState, first, second }) =>
                ParamNames.serverTransform({
                    stateBeforeServerOperation: prevState,
                    stateAfterServerOperation: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ key }) => !isStrIndex20(key),
            },
        });
        if (boolParamNames.isError) {
            return boolParamNames;
        }

        const boards = RecordOperation.serverTransform<
            State<typeof BoardTypes.template>,
            State<typeof BoardTypes.template>,
            TwoWayOperation<typeof BoardTypes.template>,
            UpOperation<typeof BoardTypes.template>,
            TwoWayError
        >({
            first: serverOperation?.boards,
            second: clientOperation.boards,
            stateBeforeFirst: stateBeforeServerOperation.boards ?? {},
            stateAfterFirst: stateAfterServerOperation.boards ?? {},
            innerTransform: ({ first, second, prevState, nextState }) =>
                Board.serverTransform(
                    requestedBy,
                    stateAfterServerOperation,
                )({
                    stateBeforeServerOperation: prevState,
                    stateAfterServerOperation: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ newState }) =>
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: newState.ownerParticipantId ?? none,
                    }),
                cancelUpdate: ({ key }) => {
                    return !isBoardVisible({
                        boardId: key,
                        currentRoomState: stateAfterServerOperation,
                        requestedBy,
                    });
                },
                cancelRemove: ({ state }) =>
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: state.ownerParticipantId ?? anyValue,
                    }),
            },
        });
        if (boards.isError) {
            return boards;
        }

        const characters = RecordOperation.serverTransform<
            State<typeof CharacterTypes.template>,
            State<typeof CharacterTypes.template>,
            TwoWayOperation<typeof CharacterTypes.template>,
            UpOperation<typeof CharacterTypes.template>,
            TwoWayError
        >({
            first: serverOperation?.characters,
            second: clientOperation.characters,
            stateBeforeFirst: stateBeforeServerOperation.characters ?? {},
            stateAfterFirst: stateAfterServerOperation.characters ?? {},
            innerTransform: ({ first, second, prevState, nextState }) =>
                Character.serverTransform(
                    isOwner({
                        requestedBy,
                        ownerParticipantId: nextState.ownerParticipantId ?? anyValue,
                    }),
                    requestedBy,
                    stateAfterServerOperation,
                )({
                    stateBeforeServerOperation: prevState,
                    stateAfterServerOperation: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ newState }) =>
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: newState.ownerParticipantId ?? none,
                    }),
                cancelUpdate: ({ nextState }) =>
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: nextState.ownerParticipantId ?? anyValue,
                    }) && nextState.isPrivate,
                cancelRemove: ({ state }) =>
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: state.ownerParticipantId ?? anyValue,
                    }) && state.isPrivate,
            },
        });
        if (characters.isError) {
            return characters;
        }

        // TODO: ファイルサイズが巨大になりそうなときに拒否する機能
        const memos = RecordOperation.serverTransform<
            State<typeof MemoTypes.template>,
            State<typeof MemoTypes.template>,
            TwoWayOperation<typeof MemoTypes.template>,
            UpOperation<typeof MemoTypes.template>,
            TwoWayError
        >({
            stateBeforeFirst: stateBeforeServerOperation.memos ?? {},
            stateAfterFirst: stateAfterServerOperation.memos ?? {},
            first: serverOperation?.memos,
            second: clientOperation.memos,
            innerTransform: ({ prevState, nextState, first, second }) =>
                Memo.serverTransform({
                    stateBeforeServerOperation: prevState,
                    stateAfterServerOperation: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {},
        });
        if (memos.isError) {
            return memos;
        }

        const numParamNames = RecordOperation.serverTransform<
            State<typeof ParamNamesTypes.template>,
            State<typeof ParamNamesTypes.template>,
            TwoWayOperation<typeof ParamNamesTypes.template>,
            UpOperation<typeof ParamNamesTypes.template>,
            TwoWayError
        >({
            stateBeforeFirst: stateBeforeServerOperation.numParamNames ?? {},
            stateAfterFirst: stateAfterServerOperation.numParamNames ?? {},
            first: serverOperation?.numParamNames,
            second: clientOperation.numParamNames,
            innerTransform: ({ prevState, nextState, first, second }) =>
                ParamNames.serverTransform({
                    stateBeforeServerOperation: prevState,
                    stateAfterServerOperation: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ key }) => !isStrIndex20(key),
            },
        });
        if (numParamNames.isError) {
            return numParamNames;
        }

        const strParamNames = RecordOperation.serverTransform<
            State<typeof ParamNamesTypes.template>,
            State<typeof ParamNamesTypes.template>,
            TwoWayOperation<typeof ParamNamesTypes.template>,
            UpOperation<typeof ParamNamesTypes.template>,
            TwoWayError
        >({
            stateBeforeFirst: stateBeforeServerOperation.strParamNames ?? {},
            stateAfterFirst: stateAfterServerOperation.strParamNames ?? {},
            first: serverOperation?.strParamNames,
            second: clientOperation.strParamNames,
            innerTransform: ({ prevState, nextState, first, second }) =>
                ParamNames.serverTransform({
                    stateBeforeServerOperation: prevState,
                    stateAfterServerOperation: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ key }) => !isStrIndex20(key),
            },
        });
        if (strParamNames.isError) {
            return strParamNames;
        }

        const participants = RecordOperation.serverTransform<
            State<typeof ParticipantTypes.template>,
            State<typeof ParticipantTypes.template>,
            TwoWayOperation<typeof ParticipantTypes.template>,
            UpOperation<typeof ParticipantTypes.template>,
            TwoWayError
        >({
            stateBeforeFirst: stateBeforeServerOperation.participants ?? {},
            stateAfterFirst: stateAfterServerOperation.participants ?? {},
            first: serverOperation?.participants,
            second: clientOperation.participants,
            innerTransform: ({ prevState, nextState, first, second, key }) =>
                Participant.serverTransform({
                    requestedBy,
                    participantKey: key,
                })({
                    stateBeforeServerOperation: prevState,
                    stateAfterServerOperation: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {},
        });
        if (participants.isError) {
            return participants;
        }

        const hasNoOpenRollCall =
            getOpenRollCall(stateAfterServerOperation.rollCalls ?? {}) == null;
        const rollCalls = RecordOperation.serverTransform({
            stateBeforeFirst: stateBeforeServerOperation.rollCalls ?? {},
            stateAfterFirst: stateAfterServerOperation.rollCalls ?? {},
            first: serverOperation?.rollCalls,
            second: clientOperation.rollCalls,
            innerTransform: ({ prevState, nextState, first, second }) =>
                RollCalls.serverTransform({
                    requestedBy,
                })({
                    stateBeforeServerOperation: prevState,
                    stateAfterServerOperation: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: () => !(isAdmin && hasNoOpenRollCall),
                cancelRemove: () => !(isAdmin && hasNoOpenRollCall),
            },
        });
        if (rollCalls.isError) {
            return rollCalls;
        }

        const twoWayOperation: TwoWayOperation<typeof template> = {
            $v: 2,
            $r: 1,
            bgms: bgms.value,
            boards: boards.value,
            characters: characters.value,
            boolParamNames: boolParamNames.value,
            memos: memos.value,
            numParamNames: numParamNames.value,
            strParamNames: strParamNames.value,
            participants: participants.value,
            rollCalls: rollCalls.value,
        };

        // activeBoardIdには、自分が作成したBoardしか設定できない。ただし、nullishにするのは誰でもできる。
        if (clientOperation.activeBoardId != null) {
            if (
                clientOperation.activeBoardId.newValue == null ||
                isBoardOwner({
                    requestedBy,
                    boardId: clientOperation.activeBoardId.newValue,
                    currentRoomState: stateAfterServerOperation,
                }) === true
            ) {
                twoWayOperation.activeBoardId = ReplaceOperation.serverTransform({
                    first: serverOperation?.activeBoardId,
                    second: clientOperation.activeBoardId,
                    prevState: stateBeforeServerOperation.activeBoardId,
                });
            }
        }

        const name = TextOperation.serverTransform({
            first: serverOperation?.name,
            second: clientOperation.name,
            prevState: stateBeforeServerOperation.name,
        });
        if (name.isError) {
            return name;
        }
        twoWayOperation.name = name.value;

        for (const i of oneToTenArray) {
            const key = `characterTag${i}Name` as const;
            const transformed = NullableTextOperation.serverTransform({
                first: serverOperation?.[key],
                second: clientOperation[key],
                prevState: stateBeforeServerOperation[key],
            });
            if (transformed.isError) {
                return transformed;
            }
            twoWayOperation[key] = transformed.value;
        }

        for (const i of oneToTenArray) {
            const key = `publicChannel${i}Name` as const;
            const transformed = TextOperation.serverTransform({
                first: serverOperation?.[key],
                second: clientOperation[key],
                prevState: stateBeforeServerOperation[key],
            });
            if (transformed.isError) {
                return transformed;
            }
            twoWayOperation[key] = transformed.value;
        }

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };
