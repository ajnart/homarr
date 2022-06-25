import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Modern and Simple Design',
    Svg: require('@site/static/img/undraw_illustrations/undraw_futuristic_interface_re_0cm6.svg').default,
    description: (
      <>
        Homarr has a simple yet modern design for organizing your services at a central place.
      </>
    ),
  },
  {
    title: 'Integrate existing services easily',
    Svg: require('@site/static/img/undraw_illustrations/undraw_services_re_hu5n.svg').default,
    description: (
      <>
        Homarr let's you integrate your existing services and applications easily and quick. Integrations can be tailored and configured to your needs.
      </>
    ),
  },
  {
    title: 'Open Source and active community',
    Svg: require('@site/static/img/undraw_illustrations/undraw_body_text_re_9riw.svg').default,
    description: (
      <>
        Homarr is open source and licensed under MIT. Users are welcome to contribute or sugest improvements 💪
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
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
      </div>
    </section>
  );
}
