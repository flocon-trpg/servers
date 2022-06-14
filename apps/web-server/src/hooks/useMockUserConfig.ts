import { useUpdateAtom } from 'jotai/utils';
import React from 'react';
import { userConfigAtom } from '../atoms/userConfigAtom/userConfigAtom';
import { mockUserConfig } from '../mocks';

export const useMockUserConfig = () => {
    const setUserConfig = useUpdateAtom(userConfigAtom);
    React.useEffect(() => {
        setUserConfig(mockUserConfig);
    }, [setUserConfig]);
};
