import {type LoaderArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'

import {getPrisma} from '~/lib/prisma'

export const loader = async ({request}: LoaderArgs) => {
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

const AdminIndex = () => {
  const {usersCount, doodlesCount, advertsCount} = useLoaderData()

  return (
    <div>
      <div className="bg-white w-1/2 rounded-xl shadow p-2 m-auto mt-4">
        <h1 className="text-3xl">Admin</h1>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-3">
            <p className="text-center">
              Start Screen -{' '}
              <a href="https://github.com/Longridge-High-School/start-screen">
                GitHub
              </a>{' '}
              -{' '}
              <a href="https://longridge-high-school.github.io/start-screen/">
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
    </div>
  )
}

export default AdminIndex
