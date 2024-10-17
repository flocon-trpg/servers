import { HtmlObject, div, generateHtml } from './generateHtml';
import { it, expect, describe } from 'vitest';

describe('generateHtml', () => {
    it('tests XSS', () => {
        const htmlObject: HtmlObject = { type: div, children: '<script>alert("!")</script>' };
        const htmlString = generateHtml(htmlObject);
        expect(htmlString).not.toContain('<script>');
    });
});
