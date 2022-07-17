import { joinPath, sanitizeFilename, sanitizeFoldername, trySanitizePath } from '../src';

describe('sanitizeFoldername', () => {
    it.each([
        '',
        ' ',
        'foo',
        '.foo',
        'name with spaces',
        'long-folder-name-01234567890123456789',
        '日本語やemoji🍇が含まれるフォルダ名👨‍👨‍👧‍👦',
    ])('tests %o to be success', source => {
        const actual = sanitizeFoldername(source);
        expect(actual).toBe(source);
    });

    it('tests too long string', () => {
        const source =
            '非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に長いフォルダ名';
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
        '日本語やemoji🍇が含まれるファイル名👨‍👨‍👧‍👦.png',
    ])('tests %o to be success', source => {
        const actual = sanitizeFilename(source);
        expect(actual).toBe(source);
    });

    it('tests too long string', () => {
        const source =
            '非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に非常に長いファイル名';
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
            '吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た。しかもあとで聞くとそれは書生という人間中で一番獰悪な種族であったそうだ。この書生というのは時々我々を捕えて煮て食うという話である。しかしその当時は何という考もなかったから別段恐しいとも思わなかった。ただ彼の掌に載せられてスーと持ち上げられた時何だかフワフワした感じがあったばかりである。掌の上で少し落ちついて書生の顔を見たのがいわゆる人間というものの見始であろう。この時妙なものだと思った感じが今でも残っている。第一毛をもって装飾されべきはずの顔がつるつるしてまるで薬缶だ。その後猫にもだいぶ逢ったがこんな片輪には一度も出会わした事がない。のみならず顔の真中があまりに突起している。そうしてその穴の中から時々ぷうぷうと煙を吹く。どうも咽せぽくて実に弱った。これが人間の飲む煙草というものである事はようやくこの頃知った。';
        const actual = trySanitizePath(source);
        expect(actual).toBeNull();
    });

    it('tests too long path', () => {
        // length is 1309 in UTF-8
        const source =
            '吾輩は猫である/名前はまだ無い/どこで生れたかとんと見当がつかぬ/何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している/吾輩はここで始めて人間というものを見た/しかもあとで聞くとそれは書生という人間中で一番獰悪な種族であったそうだ/この書生というのは時々我々を捕えて煮て食うという話である/しかしその当時は何という考もなかったから別段恐しいとも思わなかった/ただ彼の掌に載せられてスーと持ち上げられた時何だかフワフワした感じがあったばかりである/掌の上で少し落ちついて書生の顔を見たのがいわゆる人間というものの見始であろう/この時妙なものだと思った感じが今でも残っている/第一毛をもって装飾されべきはずの顔がつるつるしてまるで薬缶だ/その後猫にもだいぶ逢ったがこんな片輪には一度も出会わした事がない/のみならず顔の真中があまりに突起している/そうしてその穴の中から時々ぷうぷうと煙を吹く/どうも咽せぽくて実に弱った/これが人間の飲む煙草というものである事はようやくこの頃知った';
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
