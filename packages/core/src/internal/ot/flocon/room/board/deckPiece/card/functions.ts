import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../../../generator/types';
import { isIdRecord } from '../../../../../record';
import { RequestedBy, admin, client, restrict } from '../../../../../requestedBy';
import * as ReplaceOperation from '../../../../../util/replaceOperation';
import { ServerTransform } from '../../../../../util/type';
import { back, backButRevealedOnce, face, template } from './types';

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

        // 表面の画像を変更する処理。ただし、admin でない場合、カードが表でないときは変更は拒否する。
        // CONSIDER: 現時点では表面の変更を許可する条件が revealStatus === face である。backButRevealedOnce のときも許可することも考えたが、ユーザーがブラウザで画像変更を試してみて、変更できるかどうかで表になったことがあるかどうかを確認できるという不正を防ぐために拒否としている。だが、backButRevealedOnce である画像の表面のデータはどのみちブラウザに存在するため、それによる不正が可能なのにこの画像変更による不正のみに対処するのは少し違和感がある。
        if (isAdmin || stateAfterServerOperation.revealStatus === face) {
        twoWayOperation.face = ReplaceOperation.serverTransform({
            first: serverOperation?.face,
            second: clientOperation.face,
            prevState: stateBeforeServerOperation.face,
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
