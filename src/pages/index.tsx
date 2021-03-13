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
            <br/>
            <div>
                <h3>シノビガミのようにセルが存在する背景画像を用いたBoardの作り方ガイド</h3>

                <p>この作業をしないと「セルにスナップ」が正常に動作しなくなります</p>

                <ol>
                    <li>背景画像を設定したら、必要があれば画像の拡大率を調整</li>
                    <li>グリッドの大きさの初期値は0だが、適当に50くらいにする</li>
                    <li>グリッドの数を適当にx=20, y=20くらいにする。この設定は必ずしも必要ないが、次の作業が非常にやりやすくなる</li>
                    <li>グリッドの大きさを調整し、背景画像と合わせる。場合によってはグリッドの基準点も調整しないと完全に合わないかもしれない</li>
                    <li>グリッドの数をx=0,y=0に戻す</li>
                </ol>
            </div>
        </Layout>
    );
};

export default Index;