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
    return await axios.get(urljoin(getHttpUri(config), 'uploader', filename), {
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });
};
