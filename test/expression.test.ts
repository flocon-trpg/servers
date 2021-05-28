import { analyze, expr1, plain } from '../dist';

it('tests {HP}', () => {
    const actual = analyze('{HP}');
    if (actual.isError === true) {
        fail('actual.isError');
    }
    expect(actual.value.length).toBe(1);
    const actual0 = actual.value[0];
    if (actual0.type !== expr1) {
        fail('actual0.type !== expr1');
    }
    expect(actual0.path).toEqual(['HP']);
});

it('tests {{HP}}', () => {
    const actual = analyze('{{HP}}');
    expect(actual.isError).toBe(true);
});

it('tests {"敏捷"}', () => {
    const actual = analyze('{"敏捷"}');
    if (actual.isError === true) {
        fail('actual.isError');
    }
    expect(actual.value.length).toBe(1);
    const actual0 = actual.value[0];
    if (actual0.type !== expr1) {
        fail('actual0.type !== expr1');
    }
    expect(actual0.path).toEqual(['敏捷']);
});

it('tests {敏捷}', () => {
    const actual = analyze('{敏捷}');
    expect(actual.isError).toBe(true);
});

it('tests {foo.\'bar\'."baz"}', () => {
    const actual = analyze('{foo.\'bar\'."baz"}');
    if (actual.isError === true) {
        fail('actual.isError');
    }
    expect(actual.value.length).toBe(1);
    const actual0 = actual.value[0];
    if (actual0.type !== expr1) {
        fail('actual0.type !== expr1');
    }
    expect(actual0.path).toEqual(['foo', 'bar', 'baz']);
});

it("tests {'{foo}'}", () => {
    const actual = analyze("{'{foo}'}");
    if (actual.isError === true) {
        fail('actual.isError');
    }
    expect(actual.value.length).toBe(1);
    const actual0 = actual.value[0];
    if (actual0.type !== expr1) {
        fail('actual0.type !== expr1');
    }
    expect(actual0.path).toEqual(['{foo}']);
});

it('tests {"{foo}"}', () => {
    const actual = analyze('{"{foo}"}');
    if (actual.isError === true) {
        fail('actual.isError');
    }
    expect(actual.value.length).toBe(1);
    const actual0 = actual.value[0];
    if (actual0.type !== expr1) {
        fail('actual0.type !== expr1');
    }
    expect(actual0.path).toEqual(['{foo}']);
});

it('tests {HP}{MP}', () => {
    const actual = analyze('{HP}{MP}');
    if (actual.isError === true) {
        fail('actual.isError');
    }
    expect(actual.value.length).toBe(2);
    const actual0 = actual.value[0];
    const actual1 = actual.value[1];

    if (actual0.type !== expr1) {
        fail('actual0.type !== expr1');
    }
    expect(actual0.path).toEqual(['HP']);
    if (actual1.type !== expr1) {
        fail('actual1.type !== expr1');
    }
    expect(actual1.path).toEqual(['MP']);
});

it('tests a{b}c', () => {
    const actual = analyze('a{b}c');
    if (actual.isError === true) {
        fail('actual.isError');
    }
    expect(actual.value.length).toBe(3);
    const actual0 = actual.value[0];
    const actual1 = actual.value[1];
    const actual2 = actual.value[2];

    if (actual0.type !== plain) {
        fail('actual0.type !== plain');
    }
    expect(actual0.text).toEqual('a');

    if (actual1.type !== expr1) {
        fail('actual1.type !== expr1');
    }
    expect(actual1.path).toEqual(['b']);

    if (actual2.type !== plain) {
        fail('actual0.type !== plain');
    }
    expect(actual2.text).toEqual('c');
});

it('tests "a{b}c"', () => {
    const actual = analyze('"a{b}c"');
    if (actual.isError === true) {
        fail('actual.isError');
    }
    expect(actual.value.length).toBe(3);
    const actual0 = actual.value[0];
    const actual1 = actual.value[1];
    const actual2 = actual.value[2];

    if (actual0.type !== plain) {
        fail('actual0.type !== plain');
    }
    expect(actual0.text).toEqual('"a');

    if (actual1.type !== expr1) {
        fail('actual1.type !== expr1');
    }
    expect(actual1.path).toEqual(['b']);

    if (actual2.type !== plain) {
        fail('actual0.type !== plain');
    }
    expect(actual2.text).toEqual('c"');
});

it('tests a\\{b\\}c', () => {
    const actual = analyze('a\\{b\\}c');
    if (actual.isError === true) {
        fail('actual.isError');
    }
    expect(actual.value.length).toBe(1);
    const actual0 = actual.value[0];

    if (actual0.type !== plain) {
        fail('actual0.type !== plain');
    }
    expect(actual0.text).toEqual('a{b}c');
});
