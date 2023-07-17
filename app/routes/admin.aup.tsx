import {
  type LoaderArgs,
  type ActionArgs,
  json,
  redirect,
  type HeadersArgs,
  type LinksFunction
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'
import CodeEditor from '@uiw/react-textarea-code-editor'
import {useState} from 'react'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {createTimings, combineServerTimingHeaders} from '~/utils/timings.server'
import {getConfigValue, setConfigValue} from '~/lib/config.server'
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

import styles from '@uiw/react-textarea-code-editor/dist.css'
import {compileMDX} from '~/lib/mdx.server'

export const links: LinksFunction = () => {
  return [{rel: 'stylesheet', href: styles}]
}

export const loader = async ({request}: LoaderArgs) => {
  const {time, getHeader} = createTimings()

  const user = await time('getUser', 'Get User from header', () =>
    getUserFromUPN(getUPNFromHeaders(request))
  )

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const aup = await getConfigValue('aup')
  const aupRequired = await getConfigValue('aupRequired')
  const aupGroup = await getConfigValue('aupGroup')

  const prisma = getPrisma()

  const [usersCount, aupAcceptedCount] = await time(
    'getAupCounts',
    'Get AUP User Counts',
    async () => {
      return [
        await prisma.user.count({where: {type: 'STUDENT'}}),
        await prisma.user.count({where: {aupAccepted: true, type: 'STUDENT'}})
      ]
    }
  )

  return json(
    {aup, user, usersCount, aupAcceptedCount, aupRequired, aupGroup},
    {
      headers: {'Server-Timing': getHeader()}
    }
  )
}

export const action = async ({request}: ActionArgs) => {
  const {time, getHeader} = createTimings()

  const user = await time('getUser', 'Get User from header', () =>
    getUserFromUPN(getUPNFromHeaders(request))
  )

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const formData = await request.formData()

  const body = formData.get('body') as string | undefined
  const required = formData.get('required') as string | undefined
  const reset = formData.get('reset') as string | undefined
  const group = formData.get('group') as string | undefined

  invariant(body)
  invariant(group)

  const aupCache = await compileMDX(body)

  await setConfigValue('aup', body)
  await setConfigValue('aupCache', aupCache)
  await setConfigValue('aupRequired', required === null ? 'no' : 'yes')
  await setConfigValue('aupGroup', group)

  await log('AUP', 'Updated the AUP', user.username)

  if (reset !== null) {
    const prisma = getPrisma()

    await time('resetUsers', 'Reset User AUP Signatures', () =>
      prisma.user.updateMany({
        data: {aupAccepted: false},
        where: {type: 'STUDENT', aupAccepted: true}
      })
    )

    await log('AUP', 'Reset AUP signatures', user.username)
  }

  return redirect('/admin', {
    headers: {'Server-Timing': getHeader()}
  })
}

export const headers = ({loaderHeaders, actionHeaders}: HeadersArgs) => {
  return combineServerTimingHeaders(loaderHeaders, actionHeaders)
}

const AdminAUP = () => {
  const {aup, usersCount, aupAcceptedCount, aupRequired, aupGroup} =
    useLoaderData<typeof loader>()

  const [body, setBody] = useState(aup)

  return (
    <div className="mt-4 shadow-xl bg-white w-1/2 m-auto rounded-xl p-2">
      <h1 className="text-3xl">Acceptable Use Policy</h1>
      <div className="bg-blue-100 rounded w-full h-2 flex overflow-hidden my-4">
        <div
          className="bg-blue-400"
          style={{width: `${(aupAcceptedCount / usersCount) * 100}`}}
        />
      </div>
      <div className="grid grid-cols-3">
        <div className="text-center">
          <b>{aupAcceptedCount}</b>
          <br />
          Users Accepted AUP
        </div>
        <div className="text-center">
          <b>{usersCount - aupAcceptedCount}</b>
          <br />
          Users still to accept AUP
        </div>
        <div className="text-center">
          <b>{usersCount}</b>
          <br />
          Users
        </div>
      </div>
      <form method="POST">
        <fieldset className={fieldsetClasses()}>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>AUP</span>
            <CodeEditor
              name="body"
              value={body}
              className={inputClasses('min-h-[55vh]')}
              language="jsx"
              onChange={e => {
                setBody(e.target.value)
              }}
            />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Require AUP Signature</span>
            <input
              type="checkbox"
              defaultChecked={aupRequired === 'yes'}
              className={inputClasses()}
              name="required"
            />
            <span className={labelInfoClasses()}>
              If checked users that have not signed the AUP will be redirected
              to it from the start screen.
            </span>
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Reset AUP Signatures</span>
            <input
              type="checkbox"
              defaultChecked={false}
              className={inputClasses()}
              name="reset"
            />
            <span className={labelInfoClasses()}>
              If checked all users will have their signatures reset and they
              will be forced to re-sign the AUP. This will not re-add them to
              the group listed below.
            </span>
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>AD Group</span>
            <input
              type="text"
              name="group"
              defaultValue={aupGroup}
              className={inputClasses()}
            />
            <span className={labelInfoClasses()}>
              If set the user will be <b>removed</b> from the named group when
              they sign the AUP.
            </span>
          </label>
        </fieldset>
        <div className={labelClasses()}>
          <button className={buttonClasses()}>Update AUP</button>
        </div>
      </form>
    </div>
  )
}

export default AdminAUP