// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Flocon - 自鯖に設置できるTRPGオンラインセッションツール",
  url: "https://flocon.app",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/logo.png",
  organizationName: "kizahasi",
  projectName: "flocon",

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/flocon-trpg/docs/edit/main/",
        },
        blog: {
          showReadingTime: true,
          editUrl: "https://github.com/flocon-trpg/docs/edit/main/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        {
          name: "description",
          content:
            "Flocon（フロコン）は、無料で自鯖に設置できる多機能な新世代のTRPGオンラインセッションツールです。",
        },
        {
          property: "og:description",
          content:
            "Flocon（フロコン）は、無料で自鯖に設置できる多機能な新世代のTRPGオンラインセッションツールです。",
        },
      ],
      image: "img/sample_room.min.webp",
      colorMode: {
        defaultMode: "dark",
      },
      navbar: {
        title: "Flocon",
        logo: {
          alt: "Flocon Logo",
          src: "img/logo.png",
        },
        items: [
          {
            type: "doc",
            docId: "intro",
            position: "left",
            label: "ドキュメント",
          },
          {
            type: "doc",
            docId: "public_servers",
            label: "公開サーバー一覧",
            position: "left",
          },
          {
            href: "https://github.com/flocon-trpg/servers/releases",
            label: "ダウンロード",
            position: "left",
          },
          // { to: "/blog", label: "Blog", position: "left" },
          {
            href: "https://github.com/flocon-trpg/servers",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "コミュニティ",
            items: [
              {
                label: "Discord",
                href: "https://discord.gg/cy3vhmU6Tx",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/flocon_trpg",
              },
            ],
          },
          {
            title: "その他",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/flocon-trpg/servers",
              },
              {
                label: "GitHub（ドキュメント）",
                href: "https://github.com/flocon-trpg/docs",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} kizahasi`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      i18n: {
        defaultLocale: "ja",
        locales: ["ja"],
      },
    }),
  plugins: ["plugin-image-zoom"],
};

module.exports = config;
