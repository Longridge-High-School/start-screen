import {type ActionArgs, json, type HeadersArgs} from '@remix-run/node'

import {compileMDX} from '~/lib/mdx.server'
import {createTimings} from '~/utils/timings.server'
import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'

export const action = async ({request}: ActionArgs) => {
  const {time, getHeader} = createTimings()

  const user = await time('getUser', 'Get User from header', () =>
    getUserFromUPN(getUPNFromHeaders(request))
  )

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const {source} = await request.json()

  const mdx = await time('compileMdx', 'Compile MDX', () => compileMDX(source))

  return json(
    {mdx},
    {
      headers: {'Server-Timing': getHeader()}
    }
  )
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}
