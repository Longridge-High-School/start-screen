import {type LoaderArgs, json, type ActionArgs} from '@remix-run/node'
import {Form, useActionData} from '@remix-run/react'
import {useState} from 'react'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'

import {getPrisma} from '~/lib/prisma'

import {backup} from '~/lib/backup.server'

import {buttonClasses, labelClasses, labelSpanClasses} from '~/lib/classes'

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

export const action = async ({request}: ActionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  await backup()

  return json({result: true})
}

const AdminBackup = () => {
  const [submitted, setSubmitted] = useState(false)
  const actionData = useActionData<typeof action>()

  return (
    <div className="grid grid-cols-2 gap-4 w-3/4 m-auto mt-4">
      <div className="bg-white rounded-xl shadow p-2">
        <h2 className="text-3xl mb-2">Backup</h2>
        <p className="mb-2">Use the button below to generate a backup.</p>
        <Form
          action="/admin/backup"
          method="POST"
          onSubmit={() => setSubmitted(true)}
        >
          <button
            className={buttonClasses('bg-green-300', ['disabled:bg-gray-300'])}
            disabled={submitted}
          >
            Backup
          </button>
        </Form>
        {actionData && actionData.result ? (
          <p className="mt-4 mb-2">
            <a
              href="/backups/backup.zip"
              className={buttonClasses('bg-blue-300')}
            >
              Download
            </a>
          </p>
        ) : (
          ''
        )}
      </div>
      <div className="bg-white rounded-xl shadow p-2">
        <h2 className="text-3xl mb-2">Restore</h2>
        <p className="mb-2">Restore a backup zip file to the system.</p>
        <form
          action="/admin/restore"
          method="POST"
          encType="multipart/form-data"
        >
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Upload Backup</span>
            <input type="file" name="file" placeholder="backup.zip" />
          </label>
          <div className={labelClasses()}>
            <button className={buttonClasses()}>Restore Backup</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminBackup
