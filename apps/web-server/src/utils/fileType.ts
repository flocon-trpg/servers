import { extname } from './extname';

export const image = 'image';

export const sound = 'sound';

export const others = 'others';

export type FileType = typeof image | typeof sound | typeof others;

export const guessFileType = (name: string): FileType => {
    switch (extname(name).fileExtension?.toLowerCase()) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'webp':
            return image;
        case 'mp3':
        case 'ogg':
        case 'oga':
        case 'wav':
        case 'aac':
        case 'weba':
            return sound;
        default:
            return others;
    }
};
