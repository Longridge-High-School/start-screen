import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect,
  unstable_parseMultipartFormData,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler
} from '@remix-run/node'
import {invariant} from '@arcath/utils'
import {v4 as uuid} from 'uuid'
import path from 'path'

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

  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 5_000_000,
      directory: 'public/adverts/',
      file: ({filename}) => {
        return `${uuid()}${path.extname(filename)}`
      }
    }),
    unstable_createMemoryUploadHandler()
  )

  const formData = await unstable_parseMultipartFormData(request, uploadHandler)

  const name = formData.get('name') as string | undefined
  const startDate = formData.get('start-date') as string | undefined
  const endDate = formData.get('end-date') as string | undefined
  const target = formData.get('target') as string | undefined
  const targetsAsString = formData.get('targets') as string | undefined
  const imageData = formData.get('image') as any as
    | {filepath: string}
    | undefined

  invariant(name)
  invariant(startDate)
  invariant(endDate)
  invariant(target)
  invariant(targetsAsString)
  invariant(imageData)

  const targets = targetsAsString.split(',').map(s => s.trim().toLowerCase())
  const image = path.basename(imageData.filepath)

  await prisma.advert.create({
    data: {
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      target,
      targets,
      image
    }
  })
  await log('Adverts', `New Advert: ${name}`, user.username)

  return redirect('/admin/adverts')
}

const AdminAddAdvert = () => {
  return (
    <div className="rounded-xl bg-white shadow m-4 p-2">
      <h2 className="text-2xl">Add Advert</h2>
      <form method="POST" encType="multipart/form-data">
        <div className={fieldsetClasses()}>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Name</span>
            <input
              name="name"
              type="text"
              className={inputClasses()}
              placeholder="Name"
            />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Start Date</span>
            <input name="start-date" type="date" className={inputClasses()} />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>End Date</span>
            <input name="end-date" type="date" className={inputClasses()} />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Target</span>
            <input
              name="target"
              type="text"
              className={inputClasses()}
              placeholder="https://..."
            />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Targets</span>
            <input
              name="targets"
              type="text"
              className={inputClasses()}
              placeholder="staff, students, year 8"
            />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Image</span>
            <input name="image" type="file" className={inputClasses()} />
          </label>
          <div className={labelClasses()}>
            <button className={buttonClasses()}>Add Advert</button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AdminAddAdvert
