import axios from 'axios';
import urljoin from 'url-join';
import { getHttpUri } from '../../atoms/webConfigAtom/webConfigAtom';
import { WebConfig } from '../../configType';

export const idTokenIsNull = 'idTokenIsNull';
export const files = 'files';
export const thumbs = 'thumbs';

export const getFloconUploaderFile = async ({
    config,
    filename,
    getIdToken,
    mode,
}: {
    config: WebConfig;
    filename: string;
    getIdToken: () => Promise<string | null>;
    mode: typeof files | typeof thumbs;
}) => {
    const idToken = await getIdToken();
    if (idToken == null) {
        return idTokenIsNull;
    }
    return await axios.get(urljoin(getHttpUri(config), 'uploader', mode, filename), {
        // URL.createObjectURLを用いて変換する際、このように responseType: 'blob' にしておかないと画像が表示されない。
        responseType: 'blob',
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });
};
