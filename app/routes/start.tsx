import {type LoaderArgs, type HeadersArgs} from '@remix-run/node'
import {useEffect} from 'react'
import {diffArray, pick, increment} from '@arcath/utils'
import {json} from '@remix-run/node'
import {useLoaderData, useCatch, useSearchParams} from '@remix-run/react'

import {Button} from '~/lib/components/boxes/button'
import {Intro} from '~/lib/components/boxes/intro'
import {Doodle} from '~/lib/components/doodle'

import {getConfigValues} from '~/lib/config.server'
import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {createTimings} from '~/utils/timings.server'

import {getPrisma, getShortcutsForUser} from '~/lib/prisma'
import {MDXComponent} from '~/lib/mdx'

import {getSupplyLevels} from '~/lib/printers.server'

export const loader = async ({request}: LoaderArgs) => {
  const {time, getHeader} = createTimings()
  const user = await time('getUser', 'Get User from header', () =>
    getUserFromUPN(getUPNFromHeaders(request))
  )
  const prisma = getPrisma()

  const {shortcuts, hasOverflow, scopes} = await time(
    'getShortcutsForUser',
    'Get shortcuts for the given user',
    () => getShortcutsForUser(user, request)
  )

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

  const doodle = await time('getDoodle', 'Get doodle', async () => {
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

  return json(
    {
      user,
      shortcuts,
      title,
      dateFormat,
      levels,
      hasOverflow,
      advert,
      logo,
      headerStrip,
      doodle: doodle === null ? null : pick(doodle, ['bodyCache']),
      snowScript,
      message
    },
    {
      headers: {'Server-Timing': getHeader()}
    }
  )
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}

const letItSnow = () => {
  if (typeof document !== 'undefined') {
    var embedimSnow = document.getElementById('embedim--snow')
    if (!embedimSnow) {
      function embRand(a: number, b: number) {
        return Math.floor(Math.random() * (b - a + 1)) + a
      }
      var embCSS =
        '.embedim-snow{position: absolute;width: 10px;height: 10px;background: white;border-radius: 50%;margin-top:-10px}'
      var embHTML = ''
      for (let i = 1; i < 200; i++) {
        embHTML += '<i class="embedim-snow"></i>'
        var rndX = embRand(0, 1000000) * 0.0001,
          rndO = embRand(-100000, 100000) * 0.0001,
          rndT = (embRand(3, 8) * 10).toFixed(2),
          rndS = (embRand(0, 10000) * 0.0001).toFixed(2)
        embCSS +=
          '.embedim-snow:nth-child(' +
          i +
          '){' +
          'opacity:' +
          (embRand(1, 10000) * 0.0001).toFixed(2) +
          ';' +
          'transform:translate(' +
          rndX.toFixed(2) +
          'vw,-10px) scale(' +
          rndS +
          ');' +
          'animation:fall-' +
          i +
          ' ' +
          embRand(10, 30) +
          's -' +
          embRand(0, 30) +
          's linear infinite' +
          '}' +
          '@keyframes fall-' +
          i +
          '{' +
          rndT +
          '%{' +
          'transform:translate(' +
          (rndX + rndO).toFixed(2) +
          'vw,' +
          rndT +
          'vh) scale(' +
          rndS +
          ')' +
          '}' +
          'to{' +
          'transform:translate(' +
          (rndX + rndO / 2).toFixed(2) +
          'vw, 105vh) scale(' +
          rndS +
          ')' +
          '}' +
          '}'
      }
      embedimSnow = document.createElement('div')
      embedimSnow.id = 'embedim--snow'
      embedimSnow.innerHTML =
        '<style>#embedim--snow{position:fixed;left:0;top:0;bottom:0;width:100vw;height:100vh;overflow:hidden;z-index:9999999;pointer-events:none}' +
        embCSS +
        '</style>' +
        embHTML
      document.body.appendChild(embedimSnow)
    }
  }
}

const StartPage = () => {
  const {
    user,
    shortcuts,
    title,
    dateFormat,
    levels,
    hasOverflow,
    advert,
    doodle,
    logo,
    headerStrip,
    snowScript,
    message
  } = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
  const buttonDelay = increment({
    increment: (current, count) => {
      const addition = Math.log(count + 2)

      return addition / 10
    }
  })

  useEffect(() => {
    if (snowScript === 'yes') {
      letItSnow()
    }
  })

  const newTab = searchParams.get('newtab') !== null

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
          <MDXComponent code={headerStrip} currentUser={user!.username} />
        ) : (
          ''
        )}
      </div>
      {message ? (
        <a
          className={`mx-4 mt-4 border-2 rounded-xl bg-opacity-75 p-1 block text-black ${messageColors}`}
          href={message.target}
        >
          <strong>{message.title}</strong>
          <p dangerouslySetInnerHTML={{__html: message.message}} />
        </a>
      ) : (
        ''
      )}
      <div className="grid grid-cols-2 2xl:grid-cols-5 p-4 gap-4">
        <Intro
          name={user ? user.name : undefined}
          title={title}
          dateFormat={dateFormat}
          logo={logo}
        />
        <div className="col-span-1 2xl:col-span-2 row-span-2 2xl:row-span-3">
          <div className="grid grid-cols-2 gap-4">
            {shortcuts.map(shortcut => {
              return (
                <Button
                  key={shortcut.id}
                  label={shortcut.title}
                  target={shortcut.target}
                  image={`/icons/${shortcut.icon}`}
                  delay={buttonDelay()}
                  newTab={newTab}
                />
              )
            })}
            {hasOverflow ? (
              <Button
                label="More..."
                target="/shortcuts"
                image="/img/directory.png"
                delay={buttonDelay()}
                newTab={newTab}
              />
            ) : (
              ''
            )}
            {user && user.type === 'STAFF' ? (
              <Button
                label="Manage Shortcuts"
                target="/shortcuts/manage"
                image="/img/directory.png"
                delay={buttonDelay()}
                newTab={newTab}
              />
            ) : (
              ''
            )}
            {user && user.admin ? (
              <Button
                label="Admin"
                target="/admin"
                image="/img/ssl-certificate.png"
                delay={buttonDelay()}
                newTab={newTab}
              />
            ) : (
              ''
            )}
          </div>
        </div>
        <Doodle doodle={doodle} currentUser={user!.username} />

        {advert === null ? (
          ''
        ) : (
          <a
            href={
              advert.target === ':ad' ? `/advert/${advert.id}` : advert.target
            }
            className="col-span-2"
          >
            <img
              src={`/adverts/${advert.image}`}
              alt={advert.name}
              className="aspect-video w-full rounded-xl shadow-xl"
            />
          </a>
        )}
        <div className="col-span-2 grid grid-cols-2 gap-2">
          {levels.map(({name, black, cyan, yellow, magenta}, i) => {
            return (
              <div
                className="h-16 bg-gray-500 rounded-xl shadow flex items-end relative overflow-hidden"
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
      </div>
    </div>
  )
}

export const CatchBoundary = () => {
  const {status, data} = useCatch()

  return (
    <div className="bg-white w-1/2 mt-12 mx-auto rounded-xl border border-red-500 p-4">
      <h1 className="mb-4 text-xl text-red-500">Error {status}</h1>
      <p className="mb-2">
        Something went wrong. Try a hard refresh (Ctrl+F5) and if that doesn't
        fix it contact IT with the error below.
      </p>
      <p>Details:</p>
      <p className="bg-gray-300 opacity-50 rounded-lg p-2">{data}</p>
    </div>
  )
}

export default StartPage
