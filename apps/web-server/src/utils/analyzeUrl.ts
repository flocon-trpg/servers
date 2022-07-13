import { extname } from './extname';

export const others = 'others';
export const dropbox = 'dropbox';

type Result =
    | {
          type: typeof others;
          directLink: string;
          fileName: string;
          fileExtension: string | null;
      }
    | {
          type: typeof dropbox;
          directLink: string;
          fileName: string;
          fileExtension: string | null;
      };

// 想定しているpathnameの例（1文字目の/がないケースも含む）
// '/blog'
// '/blog.png'
// '/path/name'
// '/path/name.git'
// '/'
const getFileData = (pathname: string) => {
    const fileName = pathname.split('/').pop();
    if (fileName == null) {
        throw new Error('This should not happen');
    }
    return extname(fileName);
};

export const analyzeUrl = (url: string): Result | null => {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        return null;
    }
    switch (parsed.protocol) {
        case 'http:':
        case 'https:':
            break;
        default:
            return null;
    }
    const fileData = getFileData(parsed.pathname);
    if (parsed.protocol === 'https:') {
        switch (parsed.host) {
            case 'www.dropbox.com':
                return {
                    ...fileData,
                    type: dropbox,
                    directLink: `https://dl.dropboxusercontent.com${parsed.pathname}`,
                };
        }
    }
    return {
        ...fileData,
        type: others,
        directLink: url,
    };
};
