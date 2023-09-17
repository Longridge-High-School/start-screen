import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect,
  type HeadersArgs
} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getUserFromUPN, getUPNFromHeaders} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'
import {log} from '~/log.server'
import {createTimings} from '~/utils/timings.server'

import {
  labelClasses,
  inputClasses,
  fieldsetClasses,
  labelSpanClasses,
  buttonClasses
} from '~/lib/classes'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {time, getHeader} = createTimings()

  const user = await time('getUser', 'Get User from header', () =>
    getUserFromUPN(getUPNFromHeaders(request))
  )

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  return json({user}, {headers: {'Server-Timing': getHeader()}})
}

export const action = async ({request}: ActionFunctionArgs) => {
  const {time, getHeader} = createTimings()

  const user = await time('getUser', 'Get User from header', () =>
    getUserFromUPN(getUPNFromHeaders(request))
  )

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const title = formData.get('title') as string | undefined
  const type = formData.get('type') as
    | ('Info' | 'Danger' | 'Warning')
    | undefined
  const message = formData.get('message') as string | undefined
  const startDate = formData.get('start-date') as string | undefined
  const endDate = formData.get('end-date') as string | undefined
  let target = formData.get('target') as string
  const scope = formData.get('scopes') as string | undefined

  invariant(title)
  invariant(type)
  invariant(message)
  invariant(startDate)
  invariant(endDate)
  invariant(scope)

  if (!target) {
    target = '#'
  }

  const scopes = scope.split(',').map(s => s.trim().toLowerCase())

  await time('createMessage', 'Create Message', () => {
    return prisma.infoMessage.create({
      data: {
        title,
        type,
        message,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        target,
        scopes
      }
    })
  })

  await log('Message', `Created new message ${title}`, user.username)

  return redirect('/admin/messages', {headers: {'Server-Timing': getHeader()}})
}

export const headers = ({actionHeaders}: HeadersArgs) => {
  return actionHeaders
}

const AddMessagePage = () => {
  return (
    <div className="rounded-xl bg-white shadow m-4 p-2">
      <h2 className="text-2xl">Add Message</h2>
      <form method="POST">
        <div className={fieldsetClasses('grid grid-cols-2')}>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Title</span>
            <input
              name="title"
              type="text"
              className={inputClasses()}
              placeholder="A Message"
            />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Type</span>
            <select name="type" className={inputClasses()}>
              <option value="Info">Info</option>
              <option value="Warning">Warning</option>
              <option value="Danger">Danger</option>
            </select>
          </label>
          <label className={labelClasses('col-span-2')}>
            <span className={labelSpanClasses()}>Message</span>
            <input
              name="message"
              type="text"
              className={inputClasses()}
              placeholder="More <i>details</i> for the message."
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
              placeholder="http://target.link/"
            />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Scopes</span>
            <input
              name="scopes"
              type="text"
              className={inputClasses()}
              placeholder="staff, user"
            />
          </label>
          <button className={buttonClasses('bg-green-300', ['col-start-1'])}>
            Add Message
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddMessagePage
