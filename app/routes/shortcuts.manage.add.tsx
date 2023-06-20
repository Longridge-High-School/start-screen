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
import type {Shortcut} from '@prisma/client'
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

export const loader: LoaderFunction = async ({request}) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  return json({user})
}

export const action: ActionFunction = async ({request}) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

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

  const icon = path.basename(iconData.filepath)

  const shortcut: Omit<Shortcut, 'id'> = {
    title,
    target,
    scopes,
    ownerId: user.id,
    icon: icon,
    priority: clamp(parseInt(priority), 1, 11)
  }

  await prisma.shortcut.create({data: shortcut})
  await log('Shortcuts', `Added new shortcut ${title}`, user.username)

  return redirect(`/shortcuts/manage`)
}

const AddShortcutPage = () => {
  return (
    <div className="rounded-xl bg-white mt-4 p-4">
      <h1 className="text-2xl mb-4">Add Shortcut</h1>
      <form method="post" encType="multipart/form-data">
        <fieldset className={fieldsetClasses()}>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Title</span>
            <input
              name="title"
              type="text"
              className={inputClasses()}
              placeholder="A Website"
            />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Link</span>
            <input
              name="target"
              type="text"
              className={inputClasses()}
              placeholder="https://www.example.com"
            />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Icon</span>
            <input name="icon" type="file" className={inputClasses()} />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Scope</span>
            <input
              name="scope"
              type="text"
              className={inputClasses()}
              placeholder="10 SC D2b, Staff"
            />
            <span className={labelInfoClasses()}>
              Scopes are any class name, year groups, staff/student,
              local/remote or username. E.g. "10 Sc D2b, 10 Sc D2a, Staff",
              "Year 8, Staff", "dpw, aml, sba, remote" or "all". Any icon you
              create will always appear for you in management.
            </span>
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Priority</span>
            <input
              name="priority"
              type="number"
              className={inputClasses()}
              min={1}
              max={11}
              defaultValue={5}
            />
            <span className={labelInfoClasses()}>
              Shortcuts are sorted by priority then name. 1 means top of the
              list, 10 bottom. 11 will not appear on the start page but instead
              will trigger a "more" button to go to a full page of shortcuts.
            </span>
          </label>
          <div className={labelClasses('gap-2')}>
            <button className={buttonClasses()}>Add!</button>
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

export default AddShortcutPage
