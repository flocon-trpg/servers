import { useSetAtom } from 'jotai/react';
import React from 'react';
import { userConfigAtom } from '../atoms/userConfigAtom/userConfigAtom';
import { mockUserConfig } from '../mocks';

export const useMockUserConfig = () => {
    const setUserConfig = useSetAtom(userConfigAtom);
    React.useEffect(() => {
        setUserConfig(mockUserConfig);
    }, [setUserConfig]);
};
