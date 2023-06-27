import {type LoaderArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {useMemo} from 'react'

import {getPrisma} from '~/lib/prisma'
import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'

import {getMDXComponent} from '~/lib/mdx'

export const loader = async ({request}: LoaderArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  const prisma = getPrisma()

  const doodles = await prisma.doodle.findMany({
    where: {
      startDate: {lte: new Date(), gt: new Date(2020, 1, 1)},
      bodyCache: {not: ''}
    },
    orderBy: {startDate: 'desc'}
  })
  const toCome = await prisma.doodle.count({
    where: {startDate: {gt: new Date()}}
  })

  return json({doodles, toCome, user})
}

const Doodles = () => {
  const {doodles, toCome, user} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 p-4 gap-4">
      <div className="bg-white rounded shadow h-full p-8">
        <h1 className="text-3xl mb-4">Doodles</h1>
        <p className="mb-2">
          These are all the past <i>"doodles"</i> that have appeared on the
          start page.
        </p>
        <p className="mb-2">
          There have been a total of {doodles.length} doodles.
        </p>
        {toCome > 0 ? (
          <p className="mb-2">
            There {toCome === 1 ? 'is a doodle' : 'are ' + toCome + ' doodles'}{' '}
            waiting to make an appearance, keep your eyes peeled!
          </p>
        ) : (
          ''
        )}
        {user.admin ? (
          <a
            href="/admin/doodles"
            className="bg-gray-200 rounded shadow w-full p-2 block mt-4 text-black text-center"
          >
            Manage Doodles
          </a>
        ) : (
          ''
        )}
        <a
          href="/start"
          className="bg-gray-200 rounded shadow w-full p-2 block mt-4 text-black text-center"
        >
          Head Back
        </a>
      </div>
      {doodles.map(({id, name, bodyCache}, i) => {
        return (
          <div
            className="grid grid-cols-1 grid-rows-[40rem_4rem] gap-2"
            key={id}
          >
            <div className="h-full">
              <DoodleComponent code={bodyCache} currentUser={user.username} />
            </div>
            <div>
              <div className="rounded bg-white h-full text-center text-xl p-4">
                {name}
                <br />
                <span className="text-xs block">#{doodles.length - i}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const DoodleComponent = ({
  code,
  currentUser
}: {
  code: string
  currentUser: string
}) => {
  const Component = useMemo(
    () => getMDXComponent(code, {currentUser}),
    [code, currentUser]
  )

  return <Component />
}

export default Doodles
