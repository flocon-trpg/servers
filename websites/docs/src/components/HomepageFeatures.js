import React from "react";
import clsx from "clsx";
import styles from "./HomepageFeatures.module.css";

const FeatureList = [
  {
    title: "自鯖でTRPGオンラインセッション",
    Svg: require("../../static/img/server-svgrepo-com.svg").default,
    description: (
      <>
        Flocon（フロコン）は、個人サーバー（自鯖）に設置して利用できる新世代のTRPGオンラインセッションツールです。身内サーバーとしての利用に特化したツールですが、公開サーバーにも対応しています。
      </>
    ),
  },
  {
    title: "多機能なセッションツール",
    Svg: require("../../static/img/square-svgrepo-com.svg").default,
    description: (
      <>
        FloconのTRPGオンラインセッションツールは、多機能かつ自鯖運用可能であることを意識して開発しています。今後も継続的に機能追加を行っていきます。
      </>
    ),
  },
  {
    title: "無料で利用、無料でサーバー運用",
    Svg: require("../../static/img/money-svgrepo-com.svg").default,
    description: (
      <>
        サーバーは、大きな負荷がかからない用途であれば
        <a href="https://heroku.com">Heroku</a>
        などを利用することで無料で設置、運用できます。自鯖専用のアップローダーもあわせて無料でセットアップ可能です。もちろんFlocon本体も無料でご利用いただけます。
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center" style={{ padding: "20px 0" }}>
        <Svg
          className={styles.featureSvg}
          alt={title}
          style={{ width: 100, height: 100 }}
        />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
        <div style={{ paddingTop: 48 }}>
          <h2>多機能なTRPGオンラインセッションツール</h2>
          Floconのセッションツールとしての機能を紹介します。
          <ul className="checkmark" style={{ marginTop: 8 }}>
            <li>サイト全体に簡易的なパスワードをかける</li>
            <li>部屋にパスワードをかける</li>
            <li>部屋の参加者、観戦者の分別</li>
            <li>キャラクターのパラメーターを自由に作成</li>
            <li>
              ボード（他のツールでいうところの「マップ」や「テーブル」に相当します）
            </li>
            <li>キャラクターコマ、立ち絵、ダイスコマ</li>
            <li>
              他のユーザーから秘密にしたいデータ（キャラクター、ダイスコマのダイス、ボード全体など）を隠す
            </li>
            <li>セッションの進行に用いるメインチャンネルと、観戦者も利用できる雑談チャンネルの2種類からメッセージを投稿</li>
            <li>複数人にも送信可能な秘話</li>
            <li>ダイスロール、シークレットダイス</li>
            <li>キャラクターやメッセージをタブで自由に分類</li>
            <li>新規メッセージやユーザーの入退室をブラウザ画面右下に通知</li>
            <li>BGM、SEを流す</li>
            <li>他のユーザーと共有可能な、部屋メモとキャラクターメモ</li>
            <li>チャットパレット</li>
            <li>コマンド</li>
            <li>
              ログ出力。キャラクター画像付きのリッチなログと、テキストをベースとしたシンプルなログの2種類の出力方法に対応
            </li>
            <li>キャラクターとボードのインポート・エクスポート</li>
            <li>
              アップローダー。様々なサーバー設置方法に対応できるように、Heroku
              Freeプランでも無料で使用可能なFirebase
              Storageと、より多機能な内蔵アップローダーの2種類から使用可能
            </li>
            <li>外部URLから画像や音声などのデータの読み込み</li>
          </ul>
        </div>
        <div style={{ paddingTop: 48 }}>
          <h2>多彩なサーバーの設置方法</h2>
          用途に応じた様々な設置方法に対応しています（現時点ではHerokuとNetlifyを用いる方法以外はドキュメントが未整備です。あらかじめご了承ください）。
          <ul className="checkmark" style={{ marginTop: 8 }}>
            <li>HerokuとNetlifyを用いて、無料、お手軽、安全にサーバーを運用</li>
            <li>
              Amazon Web Services、Google
              Cloudなどの様々なクラウドサービスで運用
            </li>
            <li>オンプレミスサーバーで運用</li>
          </ul>
        </div>
        {/* .markdownを付けることでplugin-image-zoomを有効化させている */}
        <div className="markdown" style={{ paddingTop: 48 }}>
          <h2>スクリーンショット</h2>
          <img  src="/img/sample_room.min.webp" alt="スクリーンショット" />
        </div>
        <div style={{ paddingTop: 48 }}>
          <h2>公式サーバー</h2>
          <div>
            <a
              href="https://try.flocon.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              公式サーバー
            </a>
            も運用しています。もしよければぜひご利用ください。
          </div>
        </div>
      </div>
    </section>
  );
}
