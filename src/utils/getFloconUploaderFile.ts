import axios from 'axios';
import urljoin from 'url-join';
import { Config, getHttpUri } from '../config';

export const getFloconUploaderFile = async ({
    config,
    filename,
    idToken,
}: {
    config: Config;
    filename: string;
    idToken: string;
}) => {
    return await axios.get(urljoin(getHttpUri(config), 'uploader', 'files', filename), {
        // URL.createObjectURLを用いて変換する際、このように responseType: 'blob' にしておかないと画像が表示されない。
        responseType: 'blob',
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });
};
