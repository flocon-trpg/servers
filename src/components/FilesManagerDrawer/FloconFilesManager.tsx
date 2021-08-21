import * as React from 'react';
import { Upload } from 'antd';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { accept } from './helper';
import MyAuthContext from '../../contexts/MyAuthContext';
import { useUploadMutation } from '../../generated/graphql';
import { useAsync } from 'react-use';
import ConfigContext from '../../contexts/ConfigContext';
import { createHttpLink } from '@apollo/client';
import { getHttpUri } from '../../config';
import urljoin from 'url-join';
import axios from 'axios';

type FirebaseUploaderProps = {
    onUploaded: () => void;
};

const Uploader: React.FC<FirebaseUploaderProps> = ({ onUploaded }: FirebaseUploaderProps) => {
    const myAuth = React.useContext(MyAuthContext);
    const config = React.useContext(ConfigContext);

    const idToken = useAsync(async () => {
        if (typeof myAuth === 'string') {
            return null;
        }
        return await myAuth.getIdToken();
    }, [myAuth]);

    if (idToken.value == null) {
        return null;
    }

    // TODO: antdのUploaderでアップロードが完了したとき、そのログを消すメッセージが「remove file」でアイコンがゴミ箱なのは紛らわしいと思うので直したい。
    // TODO: 同一ファイル名のファイルをアップロードすると上書きされるので、そのときは失敗させるかダイアログを出したほうが親切か。
    return (
        <Upload.Dragger
            accept={accept}
            customRequest={options => {
                const main = async () => {
                    if (typeof options.file === 'string' || !('name' in options.file)) {
                        return;
                    }
                    const formData = new FormData();
                    formData.append('file', options.file, options.file.name);
                    const axiosConfig = {
                        headers: {
                            Authorization: `Bearer ${idToken.value}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    };
                    const result = await axios
                        .post(
                            urljoin(getHttpUri(config), 'uploader', 'upload', 'public'),
                            formData,
                            axiosConfig
                        )
                        .then(() => true)
                        .catch(err => err);

                    if (result === true) {
                        if (options.onSuccess != null) {
                            options.onSuccess({}, new XMLHttpRequest());
                        }
                        onUploaded();
                    } else {
                        if (options.onError != null) {
                            if (typeof result === 'string') {
                                options.onError(new Error(result));
                                return;
                            }
                            options.onError(result);
                        }
                    }
                };
                main();
            }}
            multiple
        >
            アップロードしたいファイルをここにドラッグするか、クリックしてください
        </Upload.Dragger>
    );
};

export const FloconFilesManager: React.FC = () => {
    return (
        <div>
            <Uploader onUploaded={() => undefined} />
        </div>
    );
};
