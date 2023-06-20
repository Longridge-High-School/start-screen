import {type ActionArgs, json} from '@remix-run/node'

import {compileMDX} from '~/lib/mdx.server'

export const action = async ({request}: ActionArgs) => {
  const {source} = await request.json()

  const mdx = await compileMDX(source)

  return json({mdx})
}
