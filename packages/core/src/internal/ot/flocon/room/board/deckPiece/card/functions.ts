import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../../../generator/types';
import { isIdRecord } from '../../../../../record';
import { RequestedBy, admin, client, restrict } from '../../../../../requestedBy';
import * as ReplaceOperation from '../../../../../util/replaceOperation';
import { ServerTransform } from '../../../../../util/type';
import { template } from './types';

export const toClientState =
    (
        requestedBy: RequestedBy,
        /** deckPiece.revealedTo と等しい。 */
        revealedTo: { revealedTo: readonly string[] },
    ) =>
    (source: State<typeof template>): State<typeof template> => {
        let includeFace: boolean;
        if (source.isRevealed) {
            includeFace = true;
        } else {
            switch (requestedBy.type) {
                case restrict:
                    includeFace = false;
                    break;
                case admin:
                    includeFace = true;
                    break;
                case client: {
                    includeFace = revealedTo.revealedTo.includes(requestedBy.userUid);
                    break;
                }
            }
        }
        return {
            ...source,
            face: includeFace ? source.face : undefined,
        };
    };

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
        const isAdmin = requestedBy.type === admin;

        const twoWayOperation: TwoWayOperation<typeof template> = {
            $v: 1,
            $r: 1,
        };

        twoWayOperation.groupId = ReplaceOperation.serverTransform({
            first: serverOperation?.groupId,
            second: clientOperation.groupId,
            prevState: stateBeforeServerOperation.groupId,
        });

        // 表面の画像を変更する処理。ただし、admin でない場合、カードが表でないときは変更は拒否する。
        if (isAdmin || stateAfterServerOperation.isRevealed) {
            twoWayOperation.face = ReplaceOperation.serverTransform({
                first: serverOperation?.face,
                second: clientOperation.face,
                prevState: stateBeforeServerOperation.face,
            });
        }

        twoWayOperation.isRevealed = (() => {
            if (clientOperation.isRevealed == null) {
                return undefined;
            }
            const xform = () =>
                ReplaceOperation.serverTransform({
                    first: serverOperation?.isRevealed,
                    second: clientOperation.isRevealed,
                    prevState: stateBeforeServerOperation.isRevealed,
                });
            if (isAdmin) {
                return xform();
            }

            if (stateAfterServerOperation.isRevealed) {
                return xform();
            } else {
                return undefined;
            }
        })();

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };
