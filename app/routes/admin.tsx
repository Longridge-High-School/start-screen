import {json, type LoaderArgs} from '@remix-run/node'
import {Outlet} from '@remix-run/react'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'

export const loader = async ({request}: LoaderArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  return json({})
}

const AdminPage = () => {
  return (
    <div>
      <div className="w-full bg-white border-b-2 border-b-brand-dark flex gap-2">
        <a href="/admin">
          <h1 className="text-xl text-brand-dark ml-4">Admin</h1>
        </a>
        <div className="grow leading-8 flex gap-4">
          <a href="/admin/config">Config</a>
          <a href="/admin/branding">Branding</a>
          <a href="/admin/manual-users">Manual Users</a>
          <a href="/admin/admins">Admins</a>
          <a href="/admin/printers">Printers</a>
          <a href="/admin/adverts">Adverts</a>
          <a href="/admin/pages">Pages</a>
          <a href="/admin/assets">Assets</a>
          <a href="/admin/doodles">Doodles</a>
          <a href="/admin/messages">Info Messages</a>
          <a href="/admin/logs">Logs</a>
          <a href="/admin/debug">Debug Headers</a>
        </div>
        <a href="/start" className="leading-8 mr-4">
          Back
        </a>
      </div>
      <Outlet />
    </div>
  )
}

export default AdminPage
