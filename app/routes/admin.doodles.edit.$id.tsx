import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  json,
  redirect,
  type LinksFunction,
  type HeadersArgs
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {useState, useMemo} from 'react'
import {invariant} from '@arcath/utils'
import {format} from 'date-fns'
import CodeEditor from '@uiw/react-textarea-code-editor'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'

import {getMDXComponent} from '~/lib/mdx'
import {compileMDX} from '~/lib/mdx.server'
import {createTimings, combineServerTimingHeaders} from '~/utils/timings.server'

import {log} from '~/log.server'

import {
  fieldsetClasses,
  labelClasses,
  inputClasses,
  buttonClasses,
  labelSpanClasses,
  labelInfoClasses
} from '~/lib/classes'

import styles from '@uiw/react-textarea-code-editor/dist.css'

export const links: LinksFunction = () => {
  return [{rel: 'stylesheet', href: styles}]
}

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const {time, getHeader} = createTimings()

  const user = await time('getUser', 'Get User from header', () =>
    getUserFromUPN(getUPNFromHeaders(request))
  )
  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const doodle = await time('getDoodle', 'Get Doodle', () =>
    prisma.doodle.findFirstOrThrow({
      where: {id: parseInt(params.id!)}
    })
  )

  return json(
    {user, doodle},
    {
      headers: {'Server-Timing': getHeader()}
    }
  )
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  const {time, getHeader} = createTimings()

  const user = await time('getUser', 'Get User from header', () =>
    getUserFromUPN(getUPNFromHeaders(request))
  )

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const startDate = formData.get('start-date') as string | undefined
  const endDate = formData.get('end-date') as string | undefined
  const body = formData.get('body') as string | undefined

  invariant(name)
  invariant(startDate)
  invariant(endDate)
  invariant(body)

  const prisma = getPrisma()

  const doodle = await time('updateDoodle', 'Update Doodle', async () =>
    prisma.doodle.update({
      where: {
        id: parseInt(params.id!)
      },
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        body,
        bodyCache: await time('compileMDX', 'Compile MDX', () =>
          compileMDX(body)
        )
      }
    })
  )

  await log('Doodles', `Updated Doodle ${name}`, user.username)

  return redirect(`/admin/doodles/edit/${doodle.id}`, {
    headers: {'Server-Timing': getHeader()}
  })
}

export const headers = ({loaderHeaders, actionHeaders}: HeadersArgs) => {
  return combineServerTimingHeaders(loaderHeaders, actionHeaders)
}

const AdminDoodlesEdit = () => {
  const {doodle, user} = useLoaderData<typeof loader>()
  const [preview, setPreview] = useState(doodle.bodyCache)
  const [body, setBody] = useState(doodle.body)
  const [currentUser, setCurrentUser] = useState(user.username)
  const [startScreen, setStartScreen] = useState(true)

  const Preview = useMemo(
    () =>
      preview === ''
        ? () => <div />
        : getMDXComponent(preview, {currentUser, startScreen}),
    [preview, currentUser, startScreen]
  )

  const updatePreview = async () => {
    const response = await fetch('/admin/api/mdx', {
      method: 'post',
      body: JSON.stringify({source: body}),
      headers: {'Content-Type': 'application/json'}
    })

    const {mdx} = await response.json()

    setPreview(mdx)
  }

  return (
    <div className="grid grid-cols-2 gap-2 p-4">
      <div className="bg-white shadow-xl rounded-xl p-2">
        <h1 className="text-3xl mb-4">Edit Doodle</h1>
        <form method="POST">
          <fieldset className={fieldsetClasses()}>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Name</span>
              <input
                name="name"
                type="text"
                className={inputClasses()}
                placeholder="Some Day 2023"
                defaultValue={doodle.name}
              />
            </label>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Start Date</span>
              <input
                name="start-date"
                type="date"
                className={inputClasses()}
                defaultValue={format(new Date(doodle.startDate), 'yyyy-LL-dd')}
              />
            </label>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>End Date</span>
              <input
                name="end-date"
                type="date"
                className={inputClasses()}
                defaultValue={format(new Date(doodle.endDate), 'yyyy-LL-dd')}
              />
              <span className={labelInfoClasses()}>
                Set to the same as Start Date for a single day Doodle.
              </span>
            </label>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Body</span>
              <CodeEditor
                name="body"
                value={doodle.body}
                className={inputClasses('min-h-[55vh]')}
                language="jsx"
                onChange={e => {
                  setBody(e.target.value)
                }}
              />
              <span className={labelInfoClasses()}>
                Bundle size: {preview.length}
              </span>
            </label>
            <div className={labelClasses('gap-2')}>
              <button className={buttonClasses()}>Update Doodle!</button>
              <button
                className={buttonClasses('bg-blue-300', ['col-start-3'])}
                onClick={async e => {
                  e.preventDefault()
                  await updatePreview()
                }}
              >
                Preview Doodle!
              </button>
            </div>
          </fieldset>
        </form>
      </div>
      <div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            className={inputClasses()}
            value={currentUser}
            onChange={e => setCurrentUser(e.target.value)}
          />
          <button
            className={buttonClasses('bg-blue-300', [
              'col-start-1',
              'col-span-2'
            ])}
            onClick={() => setStartScreen(!startScreen)}
          >
            {startScreen ? 'Disable Start Screen' : 'Enable Start Screen'}
          </button>
        </div>
        <div className={`w-[360px] h-[820px] m-auto`}>
          {preview !== '' ? <Preview /> : ''}
        </div>
      </div>
    </div>
  )
}

export default AdminDoodlesEdit
