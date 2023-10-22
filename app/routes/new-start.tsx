import {type LoaderFunctionArgs, json, type HeadersArgs} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {pick, diffArray} from '@arcath/utils'

import {createTimings} from '~/utils/timings.server'
import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getConfigValues} from '~/lib/config.server'
import {getPrisma, getShortcutsForUser} from '~/lib/prisma'
import {getSupplyLevels} from '~/lib/printers.server'

import {MDXComponent} from '~/lib/mdx'
import {Doodle} from '~/lib/components/doodle'
import {TabedBox, Tab} from '~/lib/components/tabed-box'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {time, getHeader} = createTimings()

  const url = new URL(request.url)
  const doodleIdString = url.searchParams.get('doodle')
  let doodleId = 0

  if (doodleIdString) {
    doodleId = parseInt(doodleIdString)
  }

  const user = await time('getUser', 'Get User from header', () =>
    getUserFromUPN(getUPNFromHeaders(request))
  )

  const prisma = getPrisma()

  const [title, dateFormat, logo, headerStrip, snowScript] = await time(
    'getConfig',
    'Get config from database',
    () =>
      getConfigValues([
        'title',
        'dateFormat',
        'logo',
        'headerStripCache',
        'snowScript'
      ])
  )

  const doodle = await time('getDoodle', 'Get doodle', async () => {
    if (doodleId !== 0) {
      return prisma.doodle.findFirstOrThrow({where: {id: doodleId}})
    }

    const today = new Date()
    const doodleDate = new Date(
      `${today.getFullYear()}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${today
        .getDate()
        .toString()
        .padStart(2, '0')} 00:00:00+0000`
    )

    return prisma.doodle.findFirst({
      where: {
        startDate: {lte: doodleDate},
        endDate: {gte: doodleDate}
      },
      orderBy: {endDate: 'asc'}
    })
  })

  const {shortcuts, hasOverflow, scopes} = await time(
    'getShortcutsForUser',
    'Get shortcuts for the given user',
    () => getShortcutsForUser(user, request)
  )

  const levels = await time(
    'getSupplyLevels',
    'Get printer supply levels',
    async () => {
      return (await getSupplyLevels()).filter(({staffOnly}) => {
        if (user.type !== 'STAFF') {
          return !staffOnly
        }

        return true
      })
    }
  )

  const advert = await time('getAds', 'Get adverts', async () => {
    const allAdverts = await prisma.advert.findMany({
      where: {startDate: {lte: new Date()}, endDate: {gte: new Date()}}
    })

    const adverts = allAdverts.filter(({targets}) => {
      const {common} = diffArray(targets, scopes)

      return common.length > 0
    })

    return adverts.length > 0
      ? adverts[Math.floor(Math.random() * adverts.length)]
      : null
  })

  return json(
    {
      title,
      user,
      headerStrip,
      logo,
      dateFormat,
      doodle: doodle === null ? null : pick(doodle, ['bodyCache']),
      shortcuts,
      hasOverflow,
      scopes,
      levels,
      advert,
      snowScript
    },
    {
      headers: {'Server-Timing': getHeader()}
    }
  )
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}

const StartPage = () => {
  const {headerStrip, user, doodle, logo, title, shortcuts, levels, advert} =
    useLoaderData<typeof loader>()

  return (
    <div>
      <div className="text-center bg-brand-dark text-white text-xl p-2">
        {headerStrip !== '' ? (
          <MDXComponent code={headerStrip} currentUser={user!.username} />
        ) : (
          ''
        )}
      </div>
      <div className="grid grid-cols-start gap-8 p-4 h-full">
        <TabedBox>
          <Tab icon="🔎">
            <div className="p-2 text-center col-span-2 grid grid-cols-4">
              <img
                src={logo}
                className="h-[calc(100%-3rem)] mx-auto pt-4 row-span-2"
                alt="Logo"
              />
              <div className="col-span-3">
                <h1
                  className="text-brand-dark text-3xl leading-[2rem] font-bold [text-shadow:0_14px_18px_rgba(0,0,0,0.12)] mb-5"
                  dangerouslySetInnerHTML={{__html: title}}
                />
                {user.name ? (
                  <h2 className="text-brand-dark text-xl font-bold mb-3">
                    {user.name}
                  </h2>
                ) : (
                  ''
                )}
              </div>
              <form
                action="https://www.google.com/search"
                method="GET"
                className="grid grid-cols-4 gap-2 p-2 col-span-3"
              >
                <img src="/img/google.jpg" className="h-16" alt="Google Logo" />
                <input
                  type="search"
                  className="border border-black rounded w-full h-16 col-span-2 my-2 p-2"
                  name="q"
                />
                <button
                  type="submit"
                  className="bg-gray-200 h-16 rounded m-2 border-2 border-gray-200 hover:border-gray-400"
                >
                  Google Search
                </button>
              </form>
            </div>
          </Tab>
          <Tab icon="🖨">
            <div className="grid grid-cols-3 gap-4 p-4 w-full">
              {levels.map(({name, black, cyan, yellow, magenta}, i) => {
                return (
                  <div
                    className="h-24 bg-gray-500 rounded-xl shadow flex items-end relative overflow-hidden"
                    key={i}
                  >
                    <div className="absolute top-0 px-2 py-1 bg-white/50 rounded">
                      {name}
                    </div>
                    <div
                      className="bg-black w-1/4 text-center text-black hover:text-white"
                      style={{height: `${black}%`}}
                    >
                      {black}%
                    </div>
                    <div
                      className="bg-blue-300 w-1/4 text-center text-blue-300 hover:text-black"
                      style={{height: `${cyan}%`}}
                    >
                      {cyan}%
                    </div>
                    <div
                      className="bg-yellow-300 w-1/4 text-center text-yellow-300 hover:text-black"
                      style={{height: `${yellow}%`}}
                    >
                      {yellow}%
                    </div>
                    <div
                      className="bg-pink-300 w-1/4 text-center text-pink-300 hover:text-black"
                      style={{height: `${magenta}%`}}
                    >
                      {magenta}%
                    </div>
                  </div>
                )
              })}
            </div>
          </Tab>
          <Tab icon="🩺">Widget</Tab>
        </TabedBox>
        <div className="row-span-2 h-[40rem] grid">
          <Doodle doodle={doodle} currentUser={user!.username} />
        </div>
        <div className="col-span-2 row-span-2">
          <div className="grid grid-cols-3 gap-4">
            {shortcuts.map(({id, title, icon, target}) => {
              return (
                <a
                  key={id}
                  href={target}
                  className="bg-white border border-gray-300 shadow-xl hover:shadow-sm hover:shadow-inner transition-all p-2 flex items-center"
                >
                  <img
                    src={`/icons/${icon}`}
                    alt={title}
                    className="w-16 aspect-square mr-2"
                  />
                  {title}
                </a>
              )
            })}
            {user && user.type === 'STAFF' ? (
              <a
                href="/shortcuts/manage"
                className="bg-white border border-gray-300 shadow-xl hover:shadow-sm hover:shadow-inner transition-all p-2 flex items-center"
              >
                <img
                  src="/img/directory.png"
                  alt="Manage Shortcuts"
                  className="w-16 aspect-square mr-2"
                />
                Manage Shortcuts
              </a>
            ) : (
              ''
            )}
            {user && user.admin ? (
              <a
                href="/admin"
                className="bg-white border border-gray-300 shadow-xl hover:shadow-sm hover:shadow-inner transition-all p-2 flex items-center"
              >
                <img
                  src="/img/ssl-certificate.png"
                  alt="Admin"
                  className="w-16 aspect-square mr-2"
                />
                Admin
              </a>
            ) : (
              ''
            )}
          </div>
        </div>
        {advert === null ? (
          ''
        ) : (
          <a
            href={
              advert.target === ':ad' ? `/advert/${advert.id}` : advert.target
            }
            className=""
          >
            <img
              src={`/adverts/${advert.image}`}
              alt={advert.name}
              className="aspect-video w-full border border-gray-300 shadow-xl"
            />
          </a>
        )}
      </div>
    </div>
  )
}

export default StartPage
