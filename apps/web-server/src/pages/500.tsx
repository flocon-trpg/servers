import React from 'react';
import { Layout } from '@/components/ui/Layout/Layout';

const InternalServerError: React.FC = () => {
    // SSGで500は使われるのだろうか？
    return (
        <Layout>
            <h1>500 - Internal Server Error</h1>
        </Layout>
    );
};

export default InternalServerError;
