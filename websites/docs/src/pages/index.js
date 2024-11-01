import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./index.module.css";
import HomepageFeatures from "../components/HomepageFeatures";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)} style={{backgroundColor: '#2566c1'}}>
      <div className="container">
        <h1 className="hero__title" style={{ color: "white" }}>
          Flocon（フロコン）
        </h1>
        <p className="hero__subtitle" style={{ color: "white" }}>
          無料で自鯖に設置できる新世代のTRPGオンラインセッションツール
        </p>
        <div className={styles.buttons}>
          <Link
            style={{ margin: "6px 12px" }}
            className="button button--secondary button--lg"
            to="/docs/intro"
          >
            ドキュメント
          </Link>
          <Link
            style={{ margin: "6px 12px" }}
            className="button button--secondary button--lg"
            to="/docs/faq"
          >
            {"Q&A"}
          </Link>
          <Link
            style={{ margin: "6px 12px" }}
            className="button button--secondary button--lg"
            href="https://try.flocon.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            公式サーバー
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
