import urljoin from 'url-join';
import { getHttpUri } from '../../atoms/webConfigAtom/webConfigAtom';
import { MockableWebConfig, WebConfig } from '../../configType';

export const idTokenIsNull = 'idTokenIsNull';
export const files = 'files';
export const thumbs = 'thumbs';

export const getFloconUploaderFile = async ({
    config,
    filename,
    getIdToken,
    mode,
}: {
    config: WebConfig | MockableWebConfig;
    filename: string;
    getIdToken: () => Promise<string | null>;
    mode: typeof files | typeof thumbs;
}) => {
    const idToken = await getIdToken();
    if (idToken == null) {
        return idTokenIsNull;
    }
    const url = urljoin(getHttpUri(config), 'uploader', mode, filename);
    return await fetch(url, {
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    })
        .then(r => r.blob())
        .catch(() => null);
};
