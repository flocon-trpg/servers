import React from 'react';
import { FileItemFragment } from '../generated/graphql';

type Props = {
    state: FileItemFragment;
};

export const FloconUploaderFileLink: React.FC<Props> = ({ state }: Props) => {
    // TODO: クリックしたらファイルのダウンロードを開始などする
    return <span>{state.screenname}</span>;
};
