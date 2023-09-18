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
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'
import {v4 as uuid} from 'uuid'
import path from 'path'
import {format} from 'date-fns'

import {getUserFromUPN, getUPNFromHeaders} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'
import {log} from '~/log.server'

import {
  labelClasses,
  inputClasses,
  fieldsetClasses,
  labelSpanClasses,
  buttonClasses,
  labelInfoClasses
} from '~/lib/classes'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const advert = await prisma.advert.findFirstOrThrow({
    where: {id: parseInt(params.id!)}
  })

  return json({user, advert})
}

export const action = async ({request, params}: ActionFunctionArgs) => {
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

  const advert = await prisma.advert.findFirstOrThrow({
    where: {id: parseInt(params.id!)}
  })

  if (imageData.filepath) {
    advert.image = path.basename(imageData.filepath)
  }

  const targets = targetsAsString.split(',').map(s => s.trim().toLowerCase())

  advert.name = name
  advert.startDate = new Date(startDate)
  advert.endDate = new Date(endDate)
  advert.target = target
  advert.targets = targets

  await prisma.advert.update({where: {id: parseInt(params.id!)}, data: advert})
  await log('Adverts', `Updated Advert: ${name}`, user.username)

  return redirect('/admin/adverts')
}

const AdminEditAdvert = () => {
  const {advert} = useLoaderData<typeof loader>()

  return (
    <div className="rounded-xl bg-white shadow m-4 p-2">
      <h2 className="text-2xl">Edit Advert</h2>
      <form method="POST" encType="multipart/form-data">
        <div className={fieldsetClasses()}>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Name</span>
            <input
              name="name"
              type="text"
              className={inputClasses()}
              placeholder="Name"
              defaultValue={advert.name}
            />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Start Date</span>
            <input
              name="start-date"
              type="date"
              className={inputClasses()}
              defaultValue={format(new Date(advert.startDate), 'yyyy-LL-dd')}
            />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>End Date</span>
            <input
              name="end-date"
              type="date"
              className={inputClasses()}
              defaultValue={format(new Date(advert.endDate), 'yyyy-LL-dd')}
            />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Target</span>
            <input
              name="target"
              className={inputClasses()}
              placeholder="https://..."
              defaultValue={advert.target}
            />
            <span className={labelInfoClasses()}>
              Set to <i>:ad</i> to link to the full screen image
            </span>
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Targets</span>
            <input
              name="targets"
              type="text"
              className={inputClasses()}
              placeholder="staff, students, year 8"
              defaultValue={advert.targets}
            />
            <span className={labelInfoClasses()}>
              Targets are any class name, year groups, staff/student,
              local/remote or username. E.g. "10 Sc D2b, 10 Sc D2a, Staff",
              "Year 8, Staff", "dpw, aml, sba, remote" or "all". Any icon you
              create will always appear for you in management.
            </span>
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Image</span>
            <input
              name="image"
              type="file"
              className={inputClasses()}
              placeholder="1.2.3.4...."
            />
            <span className={labelInfoClasses()}>
              Only select a file if you want to change it.
            </span>
          </label>
          <div className={labelClasses()}>
            <button className={buttonClasses()}>Edit Advert</button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AdminEditAdvert
