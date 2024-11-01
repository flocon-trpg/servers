import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
    title: 'Flocon - 自鯖に設置できるTRPGオンラインセッションツール',
    // tagline: 'Dinosaurs are cool',
    favicon: 'img/logo.png',
    url: 'https://flocon.app',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'ja',
        locales: ['ja'],
    },

    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './sidebars.ts',
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl: 'https://github.com/flocon-trpg/servers/edit/main/',
                },
                blog: {
                    showReadingTime: true,
                    // feedOptions: {
                    //   type: ['rss', 'atom'],
                    //   xslt: true,
                    // },
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl: 'https://github.com/flocon-trpg/servers/edit/main/',
                    // Useful options to enforce blogging best practices
                    onInlineTags: 'warn',
                    onInlineAuthors: 'warn',
                    onUntruncatedBlogPosts: 'warn',
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        image: 'img/sample_room.min.webp',
        navbar: {
            title: 'Flocon',
            logo: {
                alt: 'Flocon Logo',
                src: 'img/logo.png',
            },
            items: [
                {
                    type: 'doc',
                    docId: 'intro',
                    position: 'left',
                    label: 'ドキュメント',
                },
                {
                    type: 'doc',
                    docId: 'public_servers',
                    label: '公開サーバー一覧',
                    position: 'left',
                },
                {
                    href: 'https://github.com/flocon-trpg/servers/releases',
                    label: 'ダウンロード',
                    position: 'left',
                },
                // { to: "/blog", label: "Blog", position: "left" },
                {
                    href: 'https://github.com/flocon-trpg/servers',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'コミュニティ',
                    items: [
                        {
                            label: 'Discord',
                            href: 'https://discord.gg/cy3vhmU6Tx',
                        },
                        {
                            label: 'Twitter',
                            href: 'https://twitter.com/flocon_trpg',
                        },
                    ],
                },
                {
                    title: 'その他',
                    items: [
                        {
                            label: 'GitHub',
                            href: 'https://github.com/flocon-trpg/servers',
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} kizahasi`,
        },
        metadata: [
            {
                name: 'description',
                content:
                    'Flocon（フロコン）は、無料で自鯖に設置できる多機能な新世代のTRPGオンラインセッションツールです。',
            },
            {
                property: 'og:description',
                content:
                    'Flocon（フロコン）は、無料で自鯖に設置できる多機能な新世代のTRPGオンラインセッションツールです。',
            },
        ],
        colorMode: {
            defaultMode: 'dark',
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } satisfies Preset.ThemeConfig,
    plugins: ['plugin-image-zoom'],
};

export default config;
