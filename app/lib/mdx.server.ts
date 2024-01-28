import {bundleMDX} from 'mdx-bundler'

export const compileMDX = async (mdx: string) => {
  const {code, errors} = await bundleMDX({
    source: mdx,
    globals: {
      'lib-hooks-use-hydrated': 'useHydrated',
      'data-current-user': 'currentUser',
      'framer-motion/motion': 'motion'
    },
    mdxOptions: () => {
      return {}
    }
  })

  console.dir(errors)

  return code
}
