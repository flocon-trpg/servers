import { useQueryClient } from '@tanstack/react-query';
import { useAtomValue, useSetAtom } from 'jotai/react';
import React from 'react';
import { hideAllOverlayActionAtom } from '../atoms/hideAllOverlayActionAtom/hideAllOverlayActionAtom';
import { firebaseAuthAtom } from './useSetupApp';

export function useSignOut() {
    const auth = useAtomValue(firebaseAuthAtom);
    const queryClient = useQueryClient();
    const hideAllOverlay = useSetAtom(hideAllOverlayActionAtom);

    return React.useCallback(async () => {
        if (auth == null) {
            return false;
        }
        await auth.signOut();
        // ユーザーに依存しないキャッシュは削除しなくても構わないが、コードを単純にするため全て削除している。
        await queryClient.resetQueries();
        hideAllOverlay();
        return true;
    }, [auth, hideAllOverlay, queryClient]);
}
