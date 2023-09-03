import {
  type LoaderArgs,
  type HeadersArgs,
  type ActionArgs,
  json,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {useState} from 'react'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getMDXComponent} from '~/lib/mdx'
import {
  findUserDN,
  createClient,
  createChange,
  createAttribute
} from '~/lib/ldap.server'

import {getConfigValue} from '~/lib/config.server'

import {createTimings, combineServerTimingHeaders} from '~/utils/timings.server'
import {buttonClasses, inputClasses, labelSpanClasses} from '~/lib/classes'
import {getPrisma} from '~/lib/prisma'

export const loader = async ({request}: LoaderArgs) => {
  const {time, getHeader} = createTimings()
  const user = await time('getUser', 'Get User from header', () =>
    getUserFromUPN(getUPNFromHeaders(request))
  )

  const aup = await getConfigValue('aupCache')

  return json(
    {user, aup},
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

  const prisma = getPrisma()

  const aupGroupName = await getConfigValue('aupGroup')

  if (aupGroupName !== '') {
    const dc = await getConfigValue('adDomainController')
    const adminDN = await getConfigValue('adAdminDN')
    const adminPassword = await getConfigValue('adAdminPassword')
    const studentsOU = await getConfigValue('adStudentsOU')
    const groupDN = await getConfigValue('aupGroup')

    const {client} = await createClient(dc, adminDN, adminPassword)

    if (!client) {
      throw new Response('Error connecting to LDAP', {status: 500})
    }

    const {dn} = await findUserDN(client, user.username, studentsOU)

    if (!dn) {
      throw new Response('Error finding user', {status: 500})
    }

    const change = createChange({
      operation: 'delete',
      modification: createAttribute('member', dn)
    })

    await new Promise((resolve, reject) => {
      client.modify(groupDN, [change], err => {
        resolve(err)
      })
    })

    client.unbind()
  }

  await time('updateUser', 'Update User', () =>
    prisma.user.update({where: {id: user.id}, data: {aupAccepted: true}})
  )

  return redirect('/start', {
    headers: {'Server-Timing': getHeader()}
  })
}

export const headers = ({loaderHeaders, actionHeaders}: HeadersArgs) => {
  return combineServerTimingHeaders(loaderHeaders, actionHeaders)
}

const AcceptableUsePolicy = () => {
  const {user, aup} = useLoaderData<typeof loader>()
  const [signature, setSignature] = useState('')

  const AUP = getMDXComponent(aup, {currentUser: user.username})

  return (
    <div>
      {user.aupAccepted ? (
        ''
      ) : (
        <div className="w-3/4 prose bg-brand-dark text-white rounded-xl shadow-xl m-auto mt-12 p-2">
          Before you can use the school network please read and accept the
          acceptable use policy.
        </div>
      )}
      <div className="w-3/4 prose bg-white rounded-xl shadow-xl m-auto mt-12 p-2">
        <AUP />
      </div>
      <div className="w-3/4 bg-white rounded-xl shadow-xl m-auto mt-12 p-2 grid grid-cols-4 gap-2">
        <h3 className={labelSpanClasses()}>Sign</h3>
        <input
          className={inputClasses()}
          value={signature}
          onChange={e => {
            setSignature(e.target.value)
          }}
          placeholder="Enter your full name as displayed below."
        />
        <form method="POST">
          <button
            className={buttonClasses('bg-green-300', [
              'col-start-4',
              'disabled:bg-green-100 disabled:shadow-none',
              'w-full'
            ])}
            disabled={signature !== user.name}
          >
            Sign
          </button>
        </form>
        <div className="col-start-2 px-2 text-grey-400">{user.name}</div>
      </div>
    </div>
  )
}

export default AcceptableUsePolicy
