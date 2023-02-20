import React from 'react';
import { Layout } from '@/components/ui/Layout/Layout';

const NotFound: React.FC = () => {
    // ダークテーマだとデフォルトの404ページは見えにくくなるので自前で作成している。
    return (
        <Layout>
            <h1>404 - Not Found</h1>
        </Layout>
    );
};

export default NotFound;
