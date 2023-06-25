import React from 'react'
import clsx from 'clsx'
import styles from './styles.module.css'

type FeatureItem = {
  title: string
  description: JSX.Element
}

const FeatureList: FeatureItem[] = [
  {
    title: 'Easy to Use',
    description: <>Designed to get up and running quickly.</>
  },
  {
    title: 'Designed by Education for Education',
    description: (
      <>
        Born from a rural secondary school in Lancashire, start screen is used
        in every tab to get students where they need to go quickly.
      </>
    )
  },
  {
    title: 'Feature Rich',
    description: (
      <>Unobtrusive features that can enchance the page or hide away un-used.</>
    )
  }
]

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures(): JSX.Element {
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
  )
}
