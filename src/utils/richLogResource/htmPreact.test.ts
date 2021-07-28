import axios from 'axios';
import { htmPreact } from './htmPreact';

it('tests htmPreact code', async () => {
    const getResult = await axios.get('https://unpkg.com/htm@3.1.0/preact/standalone.umd.js');
    const actual = getResult.data;

    expect(htmPreact).toBe(actual.trim());
});
