import axios from 'axios';
import urljoin from 'url-join';
import { getHttpUri } from '../../atoms/webConfig/webConfigAtom';
import { WebConfig } from '../../configType';

export const files = 'files';
export const thumbs = 'thumbs';

export const getFloconUploaderFile = async ({
    config,
    filename,
    idToken,
    mode,
}: {
    config: WebConfig;
    filename: string;
    idToken: string;
    mode: typeof files | typeof thumbs;
}) => {
    return await axios.get(urljoin(getHttpUri(config), 'uploader', mode, filename), {
        // URL.createObjectURLを用いて変換する際、このように responseType: 'blob' にしておかないと画像が表示されない。
        responseType: 'blob',
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });
};
