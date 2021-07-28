import parseUrl from 'parse-url';

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
const getFileData = (pathname: string): { fileName: string; fileExtension: string | null } => {
    const fileName = pathname.split('/').pop();
    if (fileName == null) {
        throw new Error('This should not happen');
    }
    const fileNameArray = fileName.split('.');
    const last = fileNameArray.pop();
    if (last == null) {
        throw new Error('This should not happen');
    }
    const secondLast = fileNameArray.pop();
    if (secondLast == null || secondLast === '') {
        return {
            fileName: last,
            fileExtension: null,
        };
    }
    return {
        fileName: secondLast,
        fileExtension: last,
    };
};

export const analyzeUrl = (url: string): Result => {
    const parsed = parseUrl(url);
    const fileData = getFileData(parsed.pathname);
    if (parsed.protocol === 'https') {
        switch (parsed.resource) {
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
