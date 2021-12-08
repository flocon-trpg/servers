import React from 'react';
import dynamic from 'next/dynamic';

const SignIn: React.FC = () => {
    const SignInCore = dynamic(() => import('../components/contextual/SignInCore'), { ssr: false });
    return <SignInCore />;
};

export default SignIn;
