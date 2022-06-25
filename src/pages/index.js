import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import HomepageFeatures from '@site/src/components/HomepageFeatures';
import HomepageShowcase from '@site/src/components/HomepageShowcase';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <img src="/img/favicon.png" height={200} />
        <h1 className="hero__title">Homarr</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', margin: -5 }}>
          <div className={styles.buttons}>
            <Link className="button button--secondary button--lg" to="/docs/quick-start/index">
              Get Started with Homarr 🚀
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description="">
      <HomepageHeader />
      <main>
        <HomepageFeatures />

        <HomepageShowcase />
      </main>
    </Layout>
  );
}
