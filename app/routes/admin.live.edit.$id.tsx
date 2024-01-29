import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect
} from '@remix-run/node'
import {invariant} from '@arcath/utils'
import {useLoaderData} from '@remix-run/react'

import {getUserFromUPN, getUPNFromHeaders} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'
import {compileMDX} from '~/lib/mdx.server'

import {log} from '~/log.server'

import {
  labelClasses,
  inputClasses,
  fieldsetClasses,
  labelSpanClasses,
  buttonClasses
} from '~/lib/classes'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const stream = await prisma.liveStream.findFirstOrThrow({
    where: {id: parseInt(params.id!)}
  })

  return json({user, stream})
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const title = formData.get('title') as string | undefined
  const key = formData.get('key') as string | undefined
  const description = formData.get('description') as string | undefined

  invariant(title)
  invariant(key)
  invariant(description)

  await log('Streams', `Edit Stream: ${title}`, user.username)

  await prisma.liveStream.update({
    where: {id: parseInt(params.id!)},
    data: {
      title,
      key,
      description,
      descriptionCache: await compileMDX(description)
    }
  })

  return redirect('/admin/live')
}

const AdminEditLive = () => {
  const {stream} = useLoaderData<typeof loader>()

  return (
    <div className="rounded-xl bg-white shadow m-4 p-2">
      <h2 className="text-2xl">Edit Live Stream</h2>
      <form method="POST">
        <div className={fieldsetClasses()}>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Name</span>
            <input
              name="title"
              type="text"
              className={inputClasses()}
              placeholder="Title"
              defaultValue={stream.title}
            />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Key</span>
            <input
              name="key"
              type="text"
              className={inputClasses()}
              placeholder="sTreAmK3y"
              defaultValue={stream.key}
            />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Description</span>
            <textarea
              name="description"
              className={inputClasses()}
              placeholder="About the stream"
              defaultValue={stream.description}
            />
          </label>
          <div className={labelClasses()}>
            <button className={buttonClasses()}>Edit Live Stream</button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AdminEditLive
