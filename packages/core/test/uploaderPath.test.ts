import { joinPath, sanitizeFilename, sanitizeFoldername, trySanitizePath } from '../src';

describe('sanitizeFoldername', () => {
    it.each([
        '',
        ' ',
        'foo',
        '.foo',
        'name with spaces',
        'long-folder-name-01234567890123456789',
        'æ¥æ¬èªãemojiðãå«ã¾ãããã©ã«ãåð¨âð¨âð§âð¦',
    ])('tests %o to be success', source => {
        const actual = sanitizeFoldername(source);
        expect(actual).toBe(source);
    });

    it('tests too long string', () => {
        const source =
            'éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«é·ããã©ã«ãå';
        const actual = sanitizeFoldername(source);
        expect(actual).not.toBe('');
        expect(actual).not.toBe(source);
    });

    it('tests "/"', () => {
        const source = '/';
        const actual = sanitizeFoldername(source);
        expect(actual).toBe('_');
    });

    it('tests "path/name"', () => {
        const source = 'path/name';
        const actual = sanitizeFoldername(source);
        expect(actual).not.toBe('');
        expect(actual).toBe('path_name');
    });
});

describe('sanitizeFilename', () => {
    it.each([
        '',
        ' ',
        'foo',
        '.foo',
        'name with spaces.exe',
        'long-file-name-01234567890123456789.txt',
        'æ¥æ¬èªãemojiðãå«ã¾ãããã¡ã¤ã«åð¨âð¨âð§âð¦.png',
    ])('tests %o to be success', source => {
        const actual = sanitizeFilename(source);
        expect(actual).toBe(source);
    });

    it('tests too long string', () => {
        const source =
            'éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«éå¸¸ã«é·ããã¡ã¤ã«å';
        const actual = sanitizeFilename(source);
        expect(actual).toBeNull();
    });

    it('tests "/"', () => {
        const source = '/';
        const actual = sanitizeFilename(source);
        expect(actual).toBe('_');
    });

    it('tests "path/name"', () => {
        const source = 'path/name';
        const actual = sanitizeFilename(source);
        expect(actual).toBe('path_name');
    });

    it('tests "name?"', () => {
        const source = 'name_';
        const actual = sanitizeFilename(source);
        expect(actual).toBe('name_');
    });
});

describe('trySanitizePath', () => {
    it.each(['', '/', '//', '///', [], ['']])('tests %o', source => {
        const actual = trySanitizePath(source);
        expect(actual?.string).toBe('');
        expect(actual?.array).toEqual([]);
    });

    it.each([
        'foo.txt',
        '/foo.txt',
        'foo.txt/',
        '/foo.txt/',
        '//foo.txt///',
        ['foo.txt'],
        ['', 'foo.txt', ''],
    ])('tests %o', source => {
        const actual = trySanitizePath(source);
        expect(actual?.string).toBe('foo.txt');
        expect(actual?.array).toEqual(['foo.txt']);
    });

    it.each([
        'foo/bar/baz.txt',
        '/foo/bar/baz.txt',
        'foo/bar/baz.txt/',
        '/foo/bar/baz.txt/',
        '///foo//bar////baz.txt///',
        ['foo', 'bar', 'baz.txt'],
        ['', 'foo', 'bar', '', 'baz.txt', ''],
    ])('tests %o', source => {
        const actual = trySanitizePath(source);
        expect(actual?.string).toBe('foo/bar/baz.txt');
        expect(actual?.array).toEqual(['foo', 'bar', 'baz.txt']);
    });

    it.each([
        'foo/bar?baz.txt',
        '/foo/bar?baz.txt',
        'foo/bar?baz.txt/',
        '/foo/bar?baz.txt/',
        '/foo//bar?baz.txt//',
        ['foo', 'bar?baz.txt'],
        ['foo', '', 'bar?baz.txt', ''],
    ])('tests %o', source => {
        const actual = trySanitizePath(source);
        expect(actual?.string).toBe('foo/bar_baz.txt');
        expect(actual?.array).toEqual(['foo', 'bar_baz.txt']);
    });

    it('tests too long filename', () => {
        // length is 1344 in UTF-8
        const source =
            'å¾è¼©ã¯ç«ã§ãããååã¯ã¾ã ç¡ããã©ãã§çãããã¨ãã¨è¦å½ãã¤ãã¬ãä½ã§ãèæãããããããæã§ãã£ã¼ãã£ã¼æ³£ãã¦ããäºã ãã¯è¨æ¶ãã¦ãããå¾è¼©ã¯ããã§å§ãã¦äººéã¨ãããã®ãè¦ããããããã¨ã§èãã¨ããã¯æ¸çã¨ããäººéä¸­ã§ä¸çªç°æªãªç¨®æã§ãã£ãããã ããã®æ¸çã¨ããã®ã¯æãæããæãã¦ç®ã¦é£ãã¨ããè©±ã§ãããããããã®å½æã¯ä½ã¨ããèããªãã£ãããå¥æ®µæããã¨ãæããªãã£ãããã å½¼ã®æã«è¼ãããã¦ã¹ã¼ã¨æã¡ä¸ããããæä½ã ããã¯ãã¯ããæãããã£ãã°ããã§ãããæã®ä¸ã§å°ãè½ã¡ã¤ãã¦æ¸çã®é¡ãè¦ãã®ãããããäººéã¨ãããã®ã®è¦å§ã§ãããããã®æå¦ãªãã®ã ã¨æã£ãæããä»ã§ãæ®ã£ã¦ãããç¬¬ä¸æ¯ããã£ã¦è£é£¾ããã¹ãã¯ãã®é¡ãã¤ãã¤ããã¦ã¾ãã§è¬ç¼¶ã ããã®å¾ç«ã«ãã ãã¶é¢ã£ãããããªçè¼ªã«ã¯ä¸åº¦ãåºä¼ãããäºããªããã®ã¿ãªããé¡ã®çä¸­ããã¾ãã«çªèµ·ãã¦ããããããã¦ãã®ç©´ã®ä¸­ããæãã·ãã·ãã¨çãå¹ããã©ããå½ãã½ãã¦å®ã«å¼±ã£ãããããäººéã®é£²ãçèã¨ãããã®ã§ããäºã¯ãããããã®é ç¥ã£ãã';
        const actual = trySanitizePath(source);
        expect(actual).toBeNull();
    });

    it('tests too long path', () => {
        // length is 1309 in UTF-8
        const source =
            'å¾è¼©ã¯ç«ã§ãã/ååã¯ã¾ã ç¡ã/ã©ãã§çãããã¨ãã¨è¦å½ãã¤ãã¬/ä½ã§ãèæãããããããæã§ãã£ã¼ãã£ã¼æ³£ãã¦ããäºã ãã¯è¨æ¶ãã¦ãã/å¾è¼©ã¯ããã§å§ãã¦äººéã¨ãããã®ãè¦ã/ããããã¨ã§èãã¨ããã¯æ¸çã¨ããäººéä¸­ã§ä¸çªç°æªãªç¨®æã§ãã£ãããã /ãã®æ¸çã¨ããã®ã¯æãæããæãã¦ç®ã¦é£ãã¨ããè©±ã§ãã/ããããã®å½æã¯ä½ã¨ããèããªãã£ãããå¥æ®µæããã¨ãæããªãã£ã/ãã å½¼ã®æã«è¼ãããã¦ã¹ã¼ã¨æã¡ä¸ããããæä½ã ããã¯ãã¯ããæãããã£ãã°ããã§ãã/æã®ä¸ã§å°ãè½ã¡ã¤ãã¦æ¸çã®é¡ãè¦ãã®ãããããäººéã¨ãããã®ã®è¦å§ã§ããã/ãã®æå¦ãªãã®ã ã¨æã£ãæããä»ã§ãæ®ã£ã¦ãã/ç¬¬ä¸æ¯ããã£ã¦è£é£¾ããã¹ãã¯ãã®é¡ãã¤ãã¤ããã¦ã¾ãã§è¬ç¼¶ã /ãã®å¾ç«ã«ãã ãã¶é¢ã£ãããããªçè¼ªã«ã¯ä¸åº¦ãåºä¼ãããäºããªã/ã®ã¿ãªããé¡ã®çä¸­ããã¾ãã«çªèµ·ãã¦ãã/ãããã¦ãã®ç©´ã®ä¸­ããæãã·ãã·ãã¨çãå¹ã/ã©ããå½ãã½ãã¦å®ã«å¼±ã£ã/ãããäººéã®é£²ãçèã¨ãããã®ã§ããäºã¯ãããããã®é ç¥ã£ã';
        const actual = trySanitizePath(source);
        expect(actual).toBeNull();
    });
});

describe('joinPath', () => {
    it.each(['', '/', '//', [], ['', '']])('tests %o', source => {
        const actual = joinPath(source);
        expect(actual?.array).toEqual([]);
        expect(actual?.string).toBe('');
    });

    it('tests "", ""', () => {
        const actual = joinPath('', '');
        expect(actual?.array).toEqual([]);
        expect(actual?.string).toBe('');
    });

    it('tests [], []', () => {
        const actual = joinPath([], []);
        expect(actual?.array).toEqual([]);
        expect(actual?.string).toBe('');
    });

    it('should preserve / in arrays', () => {
        const actual = joinPath(['a/b']);
        expect(actual?.array).toEqual(['a/b']);
        expect(actual?.string).toBe('a/b');
    });

    it.each(['foo.txt', ['foo.txt']])('tests %o', source => {
        const actual = joinPath(source);
        expect(actual?.array).toEqual(['foo.txt']);
        expect(actual?.string).toEqual('foo.txt');
    });

    it.each([
        {
            left: 'foo.txt',
            right: [],
        },
        {
            left: ['foo.txt'],
            right: '',
        },
        {
            left: [],
            right: ['foo.txt'],
        },
        {
            left: '',
            right: 'foo.txt',
        },
    ])('tests %o', ({ left, right }) => {
        const actual = joinPath(left, right);
        expect(actual?.array).toEqual(['foo.txt']);
        expect(actual?.string).toEqual('foo.txt');
    });

    it.each([
        {
            left: 'foo',
            right: ['bar.txt'],
        },
        {
            left: ['foo'],
            right: 'bar.txt',
        },
        {
            left: 'foo/bar.txt',
            right: '',
        },
        {
            left: [],
            right: ['foo', 'bar.txt'],
        },
        {
            left: ['', 'foo', ''],
            right: '///bar.txt///',
        },
    ])('tests %o', ({ left, right }) => {
        const actual = joinPath(left, right);
        expect(actual?.array).toEqual(['foo', 'bar.txt']);
        expect(actual?.string).toEqual('foo/bar.txt');
    });

    it('tests "foo", "bar", "baz.txt"', () => {
        const actual = joinPath('foo', 'bar', 'baz.txt');
        expect(actual?.array).toEqual(['foo', 'bar', 'baz.txt']);
        expect(actual?.string).toEqual('foo/bar/baz.txt');
    });

    it('tests ["foo"], ["bar"], ["baz.txt"]', () => {
        const actual = joinPath(['foo'], ['bar'], ['baz.txt']);
        expect(actual?.array).toEqual(['foo', 'bar', 'baz.txt']);
        expect(actual?.string).toEqual('foo/bar/baz.txt');
    });

    it('tests ["foo", "bar"], "baz.txt"', () => {
        const actual = joinPath(['foo', 'bar'], 'baz.txt');
        expect(actual?.array).toEqual(['foo', 'bar', 'baz.txt']);
        expect(actual?.string).toEqual('foo/bar/baz.txt');
    });

    it('tests "foo", ["bar", "baz.txt"]', () => {
        const actual = joinPath('foo', ['bar', 'baz.txt']);
        expect(actual?.array).toEqual(['foo', 'bar', 'baz.txt']);
        expect(actual?.string).toEqual('foo/bar/baz.txt');
    });
});
