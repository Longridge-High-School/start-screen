import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect
} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getUserFromUPN, getUPNFromHeaders} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'

import {log} from '~/log.server'

import {
  labelClasses,
  inputClasses,
  fieldsetClasses,
  labelSpanClasses,
  buttonClasses
} from '~/lib/classes'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  return json({user})
}

export const action = async ({request}: ActionFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const title = formData.get('title') as string | undefined
  const key = formData.get('key') as string | undefined

  invariant(title)
  invariant(key)

  await log('Streams', `New Stream: ${title}`, user.username)

  await prisma.liveStream.create({
    data: {
      title,
      key
    }
  })

  return redirect('/admin/live')
}

const AdminAddLive = () => {
  return (
    <div className="rounded-xl bg-white shadow m-4 p-2">
      <h2 className="text-2xl">Add Live Stream</h2>
      <form method="POST">
        <div className={fieldsetClasses()}>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Name</span>
            <input
              name="title"
              type="text"
              className={inputClasses()}
              placeholder="Title"
            />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Key</span>
            <input
              name="key"
              type="text"
              className={inputClasses()}
              placeholder="sTreAmK3y"
            />
          </label>
          <div className={labelClasses()}>
            <button className={buttonClasses()}>Add Live Stream</button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AdminAddLive
