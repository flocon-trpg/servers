/*
This file is a modified copy of https://github.com/motdotla/dotenv/blob/228c7b449dd9adfa93447ba74c8bf894db3068e5/lib/main.js and https://github.com/motdotla/dotenv/blob/228c7b449dd9adfa93447ba74c8bf894db3068e5/lib/main.d.ts, whose author is Scott Motte.
The license of https://github.com/motdotla/dotenv is as follows:


Copyright (c) 2015, Scott Motte
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

// dotenvのparse関数は、next exportするとrequire('fs')のところでエラーが出てしまうため、parse関数だけを抽出したコード

const LINE =
    /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;

export interface DotenvParseOutput {
    [name: string]: string;
}

// Parser src into an Object
export function parse(src: Buffer | string): DotenvParseOutput {
    const obj: DotenvParseOutput = {};

    // Convert buffer to string
    let lines = src.toString();

    // Convert line breaks to same format
    lines = lines.replace(/\r\n?/gm, '\n');

    let match;
    while ((match = LINE.exec(lines)) != null) {
        const key = match[1];

        // Default undefined or null to empty string
        let value = match[2] || '';

        // Remove whitespace
        value = value.trim();

        // Check if double quoted
        const maybeQuote = value[0];

        // Remove surrounding quotes
        value = value.replace(/^(['"`])([\s\S]*)\1$/gm, '$2');

        // Expand newlines if double quoted
        if (maybeQuote === '"') {
            value = value.replace(/\\n/g, '\n');
            value = value.replace(/\\r/g, '\r');
        }

        if (key == null) {
            throw new Error('Type guard. This should not happen.');
        }

        // Add to object
        obj[key] = value;
    }

    return obj;
}
