import { useUpdateAtom } from 'jotai/utils';
import React from 'react';
import { userConfigAtom } from '../atoms/userConfig/userConfigAtom';
import { userConfigData } from '../stubObject';

export const useUserConfigStub = () => {
    const setUserConfig = useUpdateAtom(userConfigAtom);
    React.useEffect(() => {
        setUserConfig(userConfigData);
    }, [setUserConfig]);
};
