import {
  type LoaderFunctionArgs,
  json,
  type ActionFunctionArgs
} from '@remix-run/node'
import {Form, useActionData, useLoaderData} from '@remix-run/react'
import {useState} from 'react'
import fs from 'fs'
import path from 'path'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'

import {addJob} from '~/lib/queues.server'

import {buttonClasses, labelClasses, labelSpanClasses} from '~/lib/classes'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const backupsDir = path.join(process.cwd(), 'public', 'backups')
  const files = await fs.promises.readdir(backupsDir)

  return json({files})
}

export const action = async ({request}: ActionFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  await addJob('createBackup', {})

  return json({result: true})
}

const AdminBackup = () => {
  const [submitted, setSubmitted] = useState(false)
  const actionData = useActionData<typeof action>()
  const {files} = useLoaderData<typeof loader>()

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
        <h2>Backups:</h2>
        <ul>
          {files.map((file, i) => {
            return (
              <li key={i}>
                <a href={`/backups/${file}`}>{file}</a>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="bg-white rounded-xl shadow p-2">
        <h2 className="text-3xl mb-2">Restore</h2>
        <p className="mb-2">Restore a backup zip file to the system.</p>
        <p className="mb-2 p-1 bg-red-300 rounded">
          This is in early testing, be careful restoring.
        </p>
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
