import { analyzeUrl } from './analyzeUrl';

describe('analyzeUrl', () => {
    it('tests dropbox', () => {
        const actual = analyzeUrl(
            'https://www.dropbox.com/s/abcdefg123456/%E5%A6%96%E8%A1%93%E5%B8%AB.jpg?dl=0',
        );
        expect(actual).not.toBeNull();
        expect(actual?.type).toBe('dropbox');
        expect(actual?.directLink).toBe(
            'https://dl.dropboxusercontent.com/s/abcdefg123456/%E5%A6%96%E8%A1%93%E5%B8%AB.jpg',
        );
        expect(actual?.fileName).toBe('%E5%A6%96%E8%A1%93%E5%B8%AB');
        expect(actual?.fileExtension).toBe('jpg');
    });

    it.each(['http', 'https'])('tests %o', protocol => {
        const actual = analyzeUrl(
            `${protocol}://example.com/abcdefg123456/%E5%A6%96%E8%A1%93%E5%B8%AB.jpg?dummy=1`,
        );
        expect(actual).not.toBeNull();
        expect(actual?.type).toBe('others');
        expect(actual?.directLink).toBe(
            `${protocol}://example.com/abcdefg123456/%E5%A6%96%E8%A1%93%E5%B8%AB.jpg?dummy=1`,
        );
        expect(actual?.fileName).toBe('%E5%A6%96%E8%A1%93%E5%B8%AB');
        expect(actual?.fileExtension).toBe('jpg');
    });

    it('tests foo/bar.mp3', () => {
        const actual = analyzeUrl('foo/bar.mp3');
        expect(actual).not.toBeNull();
        expect(actual?.type).toBe('others');
        expect(actual?.directLink).toBe('foo/bar.mp3');
        expect(actual?.fileName).toBe('bar');
        expect(actual?.fileExtension).toBe('mp3');
    });

    it('tests root-relative URL', () => {
        const actual = analyzeUrl('/foo/bar/baz');
        expect(actual).not.toBeNull();
        expect(actual?.type).toBe('others');
        expect(actual?.directLink).toBe('/foo/bar/baz');
        expect(actual?.fileName).toBe('baz');
        expect(actual?.fileExtension).toBeNull();
    });

    it('tests ""', () => {
        const actual = analyzeUrl('');
        expect(actual).not.toBeNull();
        expect(actual?.type).toBe('others');
        expect(actual?.directLink).toBe('');
        expect(actual?.fileName).toBe('');
        expect(actual?.fileExtension).toBeNull();
    });

    it('tests "/"', () => {
        const actual = analyzeUrl('/');
        expect(actual).not.toBeNull();
        expect(actual?.type).toBe('others');
        expect(actual?.directLink).toBe('/');
        expect(actual?.fileName).toBe('');
        expect(actual?.fileExtension).toBeNull();
    });

    it.each(['file:./foo', 'file:///', 'javascript:alert("hello!")', 'ftp://example.com/foo.txt'])(
        'tests "%o"',
        invalidUrl => {
            const actual = analyzeUrl(invalidUrl);
            expect(actual).toBeNull();
        },
    );
});
