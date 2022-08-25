import { Result } from '@kizahasi/result';
import { back, backButRevealedOnce, template } from './types';
import { State, TwoWayOperation, UpOperation } from '@/ot/generator';
import { isIdRecord } from '@/ot/record';
import { RequestedBy, admin, client, restrict } from '@/ot/requestedBy';
import * as ReplaceOperation from '@/ot/util/replaceOperation';
import { ServerTransform } from '@/ot/util/type';

export const toClientState =
    (
        requestedBy: RequestedBy,
        /** deckPiece.revealedTo と等しい。 */
        revealedTo: { revealedTo: readonly string[] }
    ) =>
    (source: State<typeof template>): State<typeof template> => {
        let includeFace: boolean;
        if (source.revealStatus === back) {
            switch (requestedBy.type) {
                case restrict:
                    includeFace = false;
                    break;
                case admin:
                    includeFace = true;
                    break;
                case client: {
                    if (revealedTo.revealedTo.includes(requestedBy.userUid)) {
                        includeFace = true;
                        break;
                    }
                    includeFace = source.revealStatus !== back;
                    break;
                }
            }
        } else {
            includeFace = true;
        }
        return {
            ...source,
            face: includeFace ? source.face : undefined,
        };
    };

export const serverTransform =
    (
        requestedBy: RequestedBy
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
        const isAdmin = requestedBy.type === admin;

        const twoWayOperation: TwoWayOperation<typeof template> = {
            $v: 1,
            $r: 1,
        };

        twoWayOperation.back = ReplaceOperation.serverTransform({
            first: serverOperation?.back,
            second: clientOperation.back,
            prevState: stateBeforeServerOperation.back,
        });

        twoWayOperation.face = ReplaceOperation.serverTransform({
            first: serverOperation?.face,
            second: clientOperation.face,
            prevState: stateBeforeServerOperation.face,
        });

        twoWayOperation.sortKey = ReplaceOperation.serverTransform({
            first: serverOperation?.sortKey,
            second: clientOperation.sortKey,
            prevState: stateBeforeServerOperation.sortKey,
        });

        if (isAdmin) {
            twoWayOperation.subSortKey = ReplaceOperation.serverTransform({
                first: serverOperation?.subSortKey,
                second: clientOperation.subSortKey,
                prevState: stateBeforeServerOperation.subSortKey,
            });
        }

        twoWayOperation.revealStatus = (() => {
            if (clientOperation.revealStatus == null) {
                return undefined;
            }
            const xform = () =>
                ReplaceOperation.serverTransform({
                    first: serverOperation?.revealStatus,
                    second: clientOperation.revealStatus,
                    prevState: stateBeforeServerOperation.revealStatus,
                });
            if (
                stateAfterServerOperation.revealStatus === back &&
                clientOperation.revealStatus.newValue === backButRevealedOnce
            ) {
                return undefined;
            }
            if (isAdmin) {
                return xform();
            }
            // admin 以外は、(back 以外から)back に変更することはできない
            if (clientOperation.revealStatus.newValue === back) {
                return undefined;
            }
            return xform();
        })();

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };
