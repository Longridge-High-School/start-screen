import {
  type LoaderFunctionArgs,
  json,
  type ActionFunctionArgs
} from '@remix-run/node'
import {useLoaderData, useActionData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'

import {getPrisma, getScopesForUser} from '~/lib/prisma'

import {
  buttonClasses,
  fieldsetClasses,
  inputClasses,
  labelClasses,
  labelSpanClasses
} from '~/lib/classes'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const usersCount = await prisma.user.count()
  const doodlesCount = await prisma.doodle.count()
  const advertsCount = await prisma.advert.count()

  return json({usersCount, doodlesCount, advertsCount})
}

export const action = async ({request}: ActionFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const username = formData.get('username') as string | undefined

  invariant(username)

  const lookupUser = await prisma.user.findFirst({where: {username}})

  if (lookupUser === null) {
    return json({user: null})
  }

  const scopes = await getScopesForUser(lookupUser, request)

  return json({user: lookupUser, scopes})
}

const AdminIndex = () => {
  const {usersCount, doodlesCount, advertsCount} =
    useLoaderData<typeof loader>()
  const data = useActionData<typeof action>()

  return (
    <div>
      <div className="bg-white w-1/2 rounded-xl shadow p-2 m-auto mt-4">
        <h1 className="text-3xl">Admin</h1>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-3">
            <p className="text-center bg-brand-light rounded-xl p-2">
              Start Screen -{' '}
              <a
                href="https://github.com/Longridge-High-School/start-screen"
                className="text-black"
              >
                GitHub
              </a>{' '}
              -{' '}
              <a
                href="https://longridge-high-school.github.io/start-screen/"
                className="text-black"
              >
                Docs
              </a>
            </p>
          </div>
          <a
            href="/admin/config"
            className="text-center border border-brand-dark rounded"
          >
            Config
          </a>
          <a
            href="/admin/branding"
            className="text-center border border-brand-dark rounded"
          >
            Branding
          </a>
          <a
            href="/admin/manual-users"
            className="text-center border border-brand-dark rounded"
          >
            Manual Users
          </a>
          <a
            href="/admin/admins"
            className="text-center border border-brand-dark rounded"
          >
            Admins
          </a>
          <a
            href="/admin/printers"
            className="text-center border border-brand-dark rounded"
          >
            Printers
          </a>
          <a
            href="/admin/adverts"
            className="text-center border border-brand-dark rounded"
          >
            Adverts
          </a>
          <a
            href="/admin/pages"
            className="text-center border border-brand-dark rounded"
          >
            Pages
          </a>
          <a
            href="/admin/assets"
            className="text-center border border-brand-dark rounded"
          >
            Assets
          </a>
          <a
            href="/admin/doodles"
            className="text-center border border-brand-dark rounded"
          >
            Doodles
          </a>
          <a
            href="/admin/messages"
            className="text-center border border-brand-dark rounded"
          >
            Info Messages
          </a>
          <a
            href="/admin/system-status"
            className="text-center border border-brand-dark rounded"
          >
            System Status
          </a>
          <a
            href="/admin/aup"
            className="text-center border border-brand-dark rounded"
          >
            Acceptable Use Policy
          </a>
          <a
            href="/admin/logs"
            className="text-center border border-brand-dark rounded"
          >
            Logs
          </a>
          <a
            href="/admin/debug"
            className="text-center border border-brand-dark rounded"
          >
            Debug Headers
          </a>
          <a
            href="/admin/backup"
            className="text-center border border-brand-dark rounded"
          >
            Backup
          </a>
        </div>
      </div>
      <div className="bg-white w-1/2 rounded-xl shadow p-2 m-auto mt-4">
        <h1 className="text-2xl">Stats</h1>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-2xl">{usersCount}</p>
            <p>Users</p>
          </div>
          <div className="text-center">
            <p className="text-2xl">{doodlesCount}</p>
            <p>Doodles</p>
          </div>
          <div className="text-center">
            <p className="text-2xl">{advertsCount}</p>
            <p>Adverts</p>
          </div>
        </div>
      </div>
      <div className="bg-white w-1/2 rounded-xl shadow p-2 m-auto mt-4">
        <h1 className="text-2xl">User Lookup</h1>
        <form method="POST" action="/admin?index">
          <fieldset className={fieldsetClasses()}>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Username</span>
              <input
                type="text"
                name="username"
                placeholder="auser"
                className={inputClasses()}
              />
            </label>
            <div className={labelClasses()}>
              <button className={buttonClasses()}>Lookup User</button>
            </div>
          </fieldset>
        </form>
        {data && data.user && typeof data.user !== 'boolean' ? (
          <div>
            <h2 className="text-xl">
              {data.user.name} ({data.user.type})
            </h2>
            <h3 className="text-lg">Scopes</h3>
            <ul>
              {data.scopes.map((scope, i) => {
                return <li key={i}>{scope}</li>
              })}
            </ul>
            {data.user.type === 'STUDENT'
              ? data.user.aupAccepted
                ? 'Has signed the AUP'
                : 'Has not signed the AUP'
              : ''}
          </div>
        ) : (
          ''
        )}
      </div>
    </div>
  )
}

export default AdminIndex
