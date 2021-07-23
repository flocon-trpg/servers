import parseUrl from 'parse-url';

export const others = 'others';
export const dropbox = 'dropbox';

type Result =
    | {
          type: typeof others;
          directLink: string;
      }
    | {
          type: typeof dropbox;
          directLink: string;
      };

export const getDirectLink = (url: string): Result => {
    const parsed = parseUrl(url);
    if (parsed.protocol === 'https') {
        switch (parsed.resource) {
            case 'www.dropbox.com':
                return {
                    type: dropbox,
                    directLink: `https://dl.dropboxusercontent.com${parsed.pathname}`,
                };
        }
    }
    return {
        type: others,
        directLink: url,
    };
};
