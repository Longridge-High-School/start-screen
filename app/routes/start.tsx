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
import {COMPONENT_STATUS} from '~/utils/constants'

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

  const message = await time(
    'getMessagesForUser',
    'Get messages for the current user',
    async () => {
      const today = new Date()

      const messageDate = new Date(
        `${today.getFullYear()}-${(today.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${today
          .getDate()
          .toString()
          .padStart(2, '0')} 00:00:00+0000`
      )

      const activeMessages = await prisma.infoMessage.findMany({
        where: {
          startDate: {lte: messageDate},
          endDate: {gte: messageDate}
        },
        orderBy: {endDate: 'asc'}
      })

      const messages = activeMessages.filter(({scopes: messageScopes}) => {
        const {common} = diffArray(scopes, messageScopes)

        if (common.length > 0) {
          return true
        }

        let matched = false

        messageScopes.forEach(scope => {
          if (scope[0] === '/') {
            scopes.forEach(s => {
              if (s === user?.username) {
                return
              }

              const regex = new RegExp(scope.slice(1, -1))

              const matches = regex.exec(s)

              if (matches) {
                matched = true
              }
            })
          }
        })

        return matched
      })

      if (messages[0]) {
        return messages[0]
      }

      return undefined
    }
  )

  const components = await time('getComponents', 'Get Components', async () => {
    if (user.type !== 'STAFF') {
      return []
    }

    return prisma.componentGroup.findMany({
      orderBy: {order: 'asc'},
      include: {
        components: {
          select: {id: true, name: true, state: true},
          orderBy: {name: 'asc'}
        }
      }
    })
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
      snowScript,
      message,
      components
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
  const {
    headerStrip,
    user,
    doodle,
    logo,
    title,
    shortcuts,
    levels,
    advert,
    message,
    components,
    hasOverflow
  } = useLoaderData<typeof loader>()

  let messageColors = ''

  if (message) {
    switch (message.type) {
      case 'Danger':
        messageColors = 'bg-red-500 border-red-600'
        break
      case 'Warning':
        messageColors = 'bg-yellow-500 border-yellow-600'
        break
      default:
        messageColors = 'bg-blue-500 border-blue-600'
    }
  }

  return (
    <div>
      <div className="text-center bg-brand-dark text-white text-xl p-2">
        {headerStrip !== '' ? (
          <MDXComponent
            code={headerStrip}
            currentUser={user!.username}
            startScreen={false}
          />
        ) : (
          ''
        )}
      </div>
      {message ? (
        <a
          className={`mx-4 mt-4 border-2 shadow-xl bg-opacity-75 p-1 block text-black ${messageColors}`}
          href={message.target}
        >
          <strong>{message.title}</strong>
          <p dangerouslySetInnerHTML={{__html: message.message}} />
        </a>
      ) : (
        ''
      )}
      <div className="grid grid-cols-start gap-8 p-4 h-full">
        <TabedBox>
          <Tab icon="🔎">
            <div className="p-2 text-center col-span-2 grid grid-cols-4">
              <img
                src={logo}
                className="h-[12rem] my-auto mx-auto pt-4 row-span-2"
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
          {components.length > 0 ? (
            <Tab icon="🩺">
              <div className="p-4">
                <h2 className="text-3xl mb-2">System Status</h2>
                <div className="flex">
                  {components.map(({name, id, components}) => {
                    return (
                      <div key={id} className="grow">
                        <h3 className="text-lg">{name}</h3>
                        <ul>
                          {components.map(({id, name, state}) => {
                            return (
                              <li key={id}>
                                {COMPONENT_STATUS[state].icon} {name}
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )
                  })}
                </div>
                <a href="/system-status">More Details</a>
              </div>
            </Tab>
          ) : undefined}
        </TabedBox>
        <div className="row-span-2 h-[40rem] grid">
          <Doodle
            doodle={doodle}
            currentUser={user!.username}
            startScreen={true}
          />
        </div>
        <div className="col-span-2 row-span-2">
          <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
            {shortcuts.map(({id, title, icon, target}) => {
              return (
                <a
                  key={id}
                  href={target}
                  className="bg-white border border-gray-300 shadow-xl scale-100 hover:scale-105 hover:shadow-sm hover:shadow-inner transition-all p-2 flex items-center"
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
                className="bg-white border border-gray-300 shadow-xl scale-100 hover:scale-105 hover:shadow-sm hover:shadow-inner transition-all p-2 flex items-center"
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
            {hasOverflow ? (
              <a
                href="/shortcuts"
                className="bg-white border border-gray-300 shadow-xl scale-100 hover:scale-105 hover:shadow-sm hover:shadow-inner transition-all p-2 flex items-center"
              >
                <img
                  src="/img/directory.png"
                  alt="More Shortcuts"
                  className="w-16 aspect-square mr-2"
                />
                More...
              </a>
            ) : (
              ''
            )}
            {user && user.admin ? (
              <a
                href="/admin"
                className="bg-white border border-gray-300 shadow-xl scale-100 hover:scale-105 hover:shadow-sm hover:shadow-inner transition-all p-2 flex items-center"
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
