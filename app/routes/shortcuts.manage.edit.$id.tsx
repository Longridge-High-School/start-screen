import path from 'path'
import type {ActionFunction, LoaderFunction} from '@remix-run/node'
import {
  redirect,
  unstable_parseMultipartFormData,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  json
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import type {Shortcut, User} from '@prisma/client'
import {invariant, clamp} from '@arcath/utils'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'
import {log} from '~/log.server'

import {
  fieldsetClasses,
  labelClasses,
  inputClasses,
  buttonClasses,
  labelSpanClasses,
  labelInfoClasses
} from '~/lib/classes'

interface LoaderData {
  user: User
  shortcut: Shortcut
}

export const loader: LoaderFunction = async ({request, params}) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const shortcut = await prisma.shortcut.findFirstOrThrow({
    where: {id: parseInt(params.id!), ownerId: user.id}
  })

  return json({user, shortcut})
}

export const action: ActionFunction = async ({request, params}) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const shortcut = await prisma.shortcut.findFirstOrThrow({
    where: {id: parseInt(params.id!), ownerId: user.id}
  })

  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 5_000_000,
      directory: 'public/icons/',
      file: ({filename}) => filename
    }),
    unstable_createMemoryUploadHandler()
  )

  const formData = await unstable_parseMultipartFormData(request, uploadHandler)

  const title = formData.get('title') as string | undefined
  const target = formData.get('target') as string | undefined
  const scope = formData.get('scope') as string | undefined
  const iconData = formData.get('icon') as any as {filepath: string} | undefined
  const priority = formData.get('priority') as string | undefined

  invariant(title)
  invariant(target)
  invariant(scope)
  invariant(iconData)
  invariant(priority)

  const scopes = scope.split(',').map(s => s.trim().toLowerCase())

  shortcut.title = title
  shortcut.target = target
  shortcut.scopes = scopes
  shortcut.priority = clamp(parseInt(priority), 1, 11)

  if (iconData.filepath) {
    shortcut.icon = path.basename(iconData.filepath)
  }

  await prisma.shortcut.update({where: {id: shortcut.id}, data: shortcut})
  await log('Shortcuts', `Updated Shortcut ${title}`, user.username)

  return redirect(`/shortcuts/manage`)
}

const EditShortcutPage = () => {
  const {shortcut} = useLoaderData<LoaderData>()

  return (
    <div className="rounded-xl bg-white mt-4 p-4">
      <h1 className="text-2xl mb-4">Edit Shortcut</h1>
      <form method="post" encType="multipart/form-data">
        <fieldset className={fieldsetClasses()}>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Title</span>
            <input
              name="title"
              type="text"
              className={inputClasses()}
              placeholder="A Website"
              defaultValue={shortcut.title}
            />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Link</span>
            <input
              name="target"
              type="text"
              className={inputClasses()}
              placeholder="https://www.example.com"
              defaultValue={shortcut.target}
            />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Icon</span>
            <input name="icon" type="file" className={inputClasses()} />
            <span className={labelInfoClasses()}>
              Only select a file if you want to change it.
            </span>
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Scope</span>
            <input
              name="scope"
              type="text"
              className={inputClasses()}
              placeholder="10 SC D2b, Staff"
              defaultValue={shortcut.scopes.join(', ')}
            />
            <span className="col-start-2 col-span-2 text-gray-400 px-2">
              Scopes are any class name, year groups, staff/student,
              local/remote or username. E.g. "10 Sc D2b, 10 Sc D2a, Staff",
              "Year 8, Staff", "dpw, aml, sba, remote" or "all". Any icon you
              create will always appear for you in management.
            </span>
          </label>
          <label className={labelClasses()}>
            <span>Priority</span>
            <input
              name="priority"
              type="number"
              className={inputClasses()}
              min={1}
              max={10}
              defaultValue={shortcut.priority}
            />
            <span className={labelInfoClasses()}>
              Shortcuts are sorted by priority then name. 1 means top of the
              list, 10 bottom. 11 will not appear on the start page but instead
              will trigger a "more" button to go to a full page of shortcuts.
            </span>
          </label>
          <div className={labelClasses('gap-2')}>
            <button className={buttonClasses()}>Update</button>
            <a
              href="/shortcuts"
              className={buttonClasses('bg-gray-200', [
                'col-start-3',
                'text-center'
              ])}
            >
              Cancel
            </a>
          </div>
        </fieldset>
      </form>
    </div>
  )
}

export default EditShortcutPage
