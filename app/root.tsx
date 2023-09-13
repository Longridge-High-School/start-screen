import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
  useLoaderData
} from '@remix-run/react'
import type {V2_MetaFunction, LinksFunction, LoaderArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {pick} from '@arcath/utils'
import colorString from 'color-string'

import {getConfigValue} from './lib/config.server'
import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'

import styles from './styles/app.css'

export const loader = async ({request}: LoaderArgs) => {
  const tabTitle = await getConfigValue('tabTitle')

  const user = await getUserFromUPN(getUPNFromHeaders(request))

  const brandDark = await getConfigValue('brandDark')
  const brandLight = await getConfigValue('brandLight')
  const background = await getConfigValue('background')
  const logo = await getConfigValue('logo')
  const analyticsDomain = await getConfigValue('analyticsDomain')

  return json({
    tabTitle,
    brandDark,
    brandLight,
    background,
    logo,
    analyticsDomain,
    currentUser: pick(user, ['id', 'name', 'admin', 'username'])
  })
}

export type RootLoaderData = Awaited<
  ReturnType<Awaited<ReturnType<typeof loader>>['json']>
>

export const meta: V2_MetaFunction = ({data}) => {
  return [{title: data.tabTitle}]
}

export const links: LinksFunction = () => {
  return [{rel: 'stylesheet', href: styles}]
}

export default function App() {
  const {brandDark, brandLight, background, logo, analyticsDomain} =
    useLoaderData<typeof loader>()

  const [bdR, bdG, rdB] = colorString.get.rgb(brandDark)
  const [blR, blG, rlB] = colorString.get.rgb(brandLight)

  const css = `:root{
    --color-brand-dark: ${bdR} ${bdG} ${rdB};
    --color-brand-light: ${blR} ${blG} ${rlB};
  }`

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <link rel="icon" href={logo} />
        <style>{css}</style>
      </head>
      <body
        style={{backgroundImage: `url('${background}')`}}
        className="bg-fixed"
      >
        <Outlet />
        <ScrollRestoration />
        {analyticsDomain !== '' ? (
          <script
            defer
            data-domain="connect.lhs.lancs.sch.uk"
            src={`https://${analyticsDomain}/js/script.tagged-events.outbound-links.js`}
          />
        ) : (
          ''
        )}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export const ErrorBoundary = () => {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    const {status, data} = error

    return (
      <div
        style={{
          fontFamily:
            'ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji"',
          margin: 'auto',
          marginTop: '10rem',
          width: '50rem'
        }}
      >
        <h1 style={{color: 'red'}}>Error {status}</h1>
        <p>
          Something went wrong. Try a hard refresh (Ctrl+F5) and if that doesn't
          fix it contact IT with the error below.
        </p>
        <p>Details:</p>
        <p
          style={{
            marginTop: '0',
            backgroundColor: '#ccc',
            padding: '1rem',
            borderRadius: '1rem'
          }}
        >
          {data}
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        fontFamily:
          'ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji"',
        margin: 'auto',
        marginTop: '10rem',
        width: '50rem'
      }}
    >
      <h1 style={{color: 'red'}}>Unknown Error</h1>
      <p className="mb-2">
        Something went wrong. Try a hard refresh (Ctrl+F5) and if that doesn't
        fix it contact IT with the error below.
      </p>
    </div>
  )
}
