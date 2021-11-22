import { prompt, Separator, SeparatorOptions } from 'inquirer';
import { DotenvParseOutput, parse } from 'dotenv';
import { stringify } from 'envfile';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { toBeNever } from '@flocon-trpg/utils';
import chalk from 'chalk';

export const ja = 'ja';
export const en = 'en';
export type Lang = typeof ja | typeof en;

const env = '.env';
const envLocal = '.env.local';
type Filename = typeof env | typeof envLocal;

export const leaf = 'leaf';
export const node = 'node';
export type Leaf = {
    type: typeof leaf;
    // 同一children内に存在する他のLeafのenvKeyと重複する文字列を付けてはならない
    envKey: string;
    question: (lang: Lang) => Promise<string>;
};

export type RootNode = {
    type: typeof node;
    parent?: undefined;
    // 同一children内に存在する他のNodeのkeyと重複する文字列を付けてはならない
    key: string;
    message?: undefined;
    children: Child[];
};
export type NonRootNode = {
    type: typeof node;
    parent: Node;
    // 同一children内に存在する他のNodeのkeyと重複する文字列を付けてはならない
    key: string;
    message: (lang: Lang) => string;
    children: Child[];
};
export type Node = RootNode | NonRootNode;
export type Child = Leaf | Node;

class EnvPrompts {
    public constructor(
        private readonly lang: Lang,
        private readonly filename: Filename,
        private readonly dotEnvObject: DotenvParseOutput,
        private readonly root: Node
    ) {}

    private rootNodeMessage(): string {
        switch (this.lang) {
            case en:
                return 'Choose a value to change (Not written to the file until you choose "save")';
            case ja:
                return '変更する値を選択してください ("保存"を選択するまでファイルには書き込まれません)';
        }
    }

    private getSaveMessage(): string {
        switch (this.lang) {
            case en:
                return 'Save';
            case ja:
                return '保存';
        }
    }

    private getGoBackMessage(): string {
        switch (this.lang) {
            case en:
                return 'Go back';
            case ja:
                return '戻る';
        }
    }

    private async directory(node: Node): Promise<void> {
        const dirChoices: ({ name: string; value: string } | SeparatorOptions)[] = [];
        const saveChoices: typeof dirChoices = [];

        const parentFolderValue = 'parentFolder';
        const saveValue = 'save';

        // 上下にループするため、Separatorは2つで挟んでいる
        if (node.parent == null) {
            saveChoices.push(new Separator());
            saveChoices.push({
                name: this.getSaveMessage(),
                value: saveValue,
            });
            saveChoices.push(new Separator());
        } else {
            saveChoices.push(new Separator());
            dirChoices.push({ name: this.getGoBackMessage(), value: parentFolderValue });
            dirChoices.push(new Separator());
        }

        const childrenChoices = node.children.map(t => {
            if (t.type === leaf) {
                return {
                    name: `${this.dotEnvObject[t.envKey] == null ? '○' : '●'} ${t.envKey}`,
                    value: t.envKey,
                };
            }
            return {
                name: t.message == null ? this.rootNodeMessage() : t.message(this.lang),
                value: t.key,
            };
        });

        const name = 'name';
        const result = await prompt<{ [name]: string }>([
            {
                type: 'list',
                name,
                message: node.message == null ? this.rootNodeMessage() : node.message(this.lang),
                choices: [...dirChoices, ...childrenChoices, ...saveChoices],
            },
        ]);

        switch (result[name]) {
            case parentFolderValue:
                if (node.parent == null) {
                    throw new Error('this should not happen');
                }
                return await this.directory(node.parent);
            case saveValue:
                await this.save();
                return;
            default: {
                for (const t of node.children) {
                    if (t.type === leaf) {
                        if (t.envKey === result[name]) {
                            await this.execQuestion(t);
                            await this.directory(node);
                            return;
                        }
                        continue;
                    }
                    if (t.key === result[name]) {
                        await this.directory(t);
                        return;
                    }
                }
                throw new Error('this should not happen');
            }
        }
    }

    private async execQuestion(leaf: Leaf) {
        if (this.dotEnvObject[leaf.envKey] == null) {
            this.dotEnvObject[leaf.envKey] = await leaf.question(this.lang);
            return;
        }

        let message: string;
        switch (this.lang) {
            case en:
                message = 'The value already exists. choose your action';
                break;
            case ja:
                message = '選択された値はすでに存在します。アクションを選択してください';
                break;
        }

        let replaceMessage: string;
        switch (this.lang) {
            case en:
                replaceMessage = 'Replace to a new value';
                break;
            case ja:
                replaceMessage = '新しい値に置き換え';
                break;
        }

        let delMessage: string;
        switch (this.lang) {
            case en:
                delMessage = 'Delete';
                break;
            case ja:
                delMessage = '削除';
                break;
        }

        let cancelMessage: string;
        switch (this.lang) {
            case en:
                cancelMessage = 'Cancel';
                break;
            case ja:
                cancelMessage = 'キャンセル';
                break;
        }

        const replace = 'replace';
        const delete$ = 'delete';
        const cancel = 'cancel';

        const name = 'replaceConfirm';
        const result = await prompt<{ [name]: string }>([
            {
                type: 'list',
                name,
                message,
                choices: [
                    {
                        value: cancel,
                        name: cancelMessage,
                    },
                    {
                        value: replace,
                        name: replaceMessage,
                    },
                    {
                        value: delete$,
                        name: delMessage,
                    },
                ],
            },
        ]);
        switch (result[name]) {
            case replace:
                this.dotEnvObject[leaf.envKey] = await leaf.question(this.lang);
                break;
            case delete$:
                delete this.dotEnvObject[leaf.envKey];
                break;
            case cancel:
                break;
        }
    }

    private async save(): Promise<void> {
        switch (this.lang) {
            case ja:
                console.info('ファイルへの書き込みを開始します…');
                break;
            case en:
                console.info('Writing to the file...');
                break;
            default:
                toBeNever(this.lang);
        }

        await writeFile(this.filename, stringify(this.dotEnvObject), 'utf-8');

        switch (this.lang) {
            case ja:
                console.info('ファイルへの書き込みが完了しました');
                break;
            case en:
                console.info('Finished writing to the file');
                break;
            default:
                toBeNever(this.lang);
        }
    }

    public async start(): Promise<void> {
        await this.directory(this.root);
    }
}

export const startApp = async (rootNode: RootNode) => {
    console.info(
        'To exit without saving to a file, press Ctrl+C. / 保存せずに終了する場合は Ctrl+C を押してください。'
    );

    let lang: Lang;
    {
        const name = 'name';
        const p = await prompt<{ [name]: string }>([
            {
                type: 'list',
                name,
                message: 'Choose your language',
                choices: [
                    { name: 'English', value: en },
                    { name: 'Japanese', value: ja },
                ],
            },
        ]);
        const result = p[name];
        switch (result) {
            case en:
                lang = result;
                break;
            case ja:
                lang = result;
                break;
            default:
                throw new Error('this should not happen');
        }
    }

    let filename: Filename;
    let dotEnvObject: DotenvParseOutput;
    let fileExists: boolean;
    {
        let message: string;
        switch (lang) {
            case en:
                message = 'Choose a filename';
                break;
            case ja:
                message = 'ファイル名を選択してください';
                break;
        }

        const name = 'name';
        const p = await prompt<{ [name]: string }>([
            {
                type: 'list',
                name,
                message,
                choices: [
                    { name: envLocal, value: envLocal },
                    { name: env, value: env },
                ],
            },
        ]);
        const result = p[name];
        switch (result) {
            case env:
                filename = result;
                break;
            case envLocal:
                filename = result;
                break;
            default:
                throw new Error('this should not happen');
        }

        let dotEnvText: string;
        fileExists = existsSync(filename);
        if (fileExists) {
            dotEnvText = await readFile(filename, 'utf-8');
        } else {
            dotEnvText = '';
        }

        // dotEnvText === '' の場合は {} になる。
        dotEnvObject = parse(dotEnvText);
    }

    if (fileExists) {
        switch (lang) {
            case en:
                console.info(
                    chalk.yellow(
                        'The file already exists. If you save, a part of the file (e.g. comments) may be deleted.'
                    )
                );
                break;
            case ja:
                console.info(
                    chalk.yellow(
                        '指定されたファイルはすでに存在します。保存すると、ファイル内の一部のテキスト (コメントなど) が削除されることがあります。'
                    )
                );
                break;
            default:
                toBeNever(lang);
        }
    }

    const instance = new EnvPrompts(lang, filename, dotEnvObject, rootNode);
    await instance.start();
};
