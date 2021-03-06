import { Button } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useDispatch } from 'react-redux';
import FilesManagerDrawer from '../components/FilesManagerDrawer';
import { useCreateRoomMutation } from '../generated/graphql';
import Layout from '../layouts/Layout';
import { FilesManagerDrawerType, none } from '../utils/types';

const Index: React.FC = () => {
    const [drawerType, setDrawerType] = React.useState<FilesManagerDrawerType | null>(null);

    return (
        <Layout requiresLogin={false} showEntryForm={false}>
            <div>
                <Link href='/rooms'>部屋一覧</Link>
                <Button onClick={() => setDrawerType({ openFileType: none })}>Open Files Manager</Button>
                <Link href='/dev-memo'>制作メモ、更新履歴など</Link>
                <FilesManagerDrawer drawerType={drawerType} onClose={() => setDrawerType(null)} />
            </div>
        </Layout>
    );
};

export default Index;