import {type LoaderArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {useMemo} from 'react'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'

import {getMDXComponent} from '~/lib/mdx'

export const loader = async ({request, params}: LoaderArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  const prisma = getPrisma()

  const page = await prisma.page.findFirst({where: {slug: params.slug!}})

  if (page?.staffOnly && (!user || user.type !== 'STAFF')) {
    throw new Response('Access Denied', {status: 403})
  }

  if (!page) {
    throw new Response('Not Found', {status: 404})
  }

  return json({page})
}

const PageSlug = () => {
  const {page} = useLoaderData<typeof loader>()

  const Page = useMemo(() => getMDXComponent(page.bodyCache), [page.bodyCache])

  if (page.simplePage) {
    return (
      <div className="m-auto w-1/2 bg-white rounded-xl p-2 shadow-xl mt-12 prose">
        <Page />
        <p>
          <a href="/start">Back</a>
        </p>
      </div>
    )
  }

  return <Page />
}

export default PageSlug
