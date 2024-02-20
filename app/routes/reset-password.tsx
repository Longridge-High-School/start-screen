import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs
} from '@remix-run/node'
import {useActionData} from '@remix-run/react'
import ldap from 'ldapjs'
import {invariant} from '@arcath/utils'
import {useState, useEffect} from 'react'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getConfigValue} from '~/lib/config.server'
import {log} from '~/log.server'

import {
  inputClasses,
  fieldsetClasses,
  labelClasses,
  buttonClasses
} from '~/lib/classes'

const encodePassword = (password: string) => {
  return Buffer.from('"' + password + '"', 'utf16le').toString()
}

const resetPassword = async (username: string) => {
  const dc = await getConfigValue('adDomainController')
  const adminDN = await getConfigValue('adAdminDN')
  const adminPassword = await getConfigValue('adAdminPassword')
  const studentsOU = await getConfigValue('adStudentsOU')

  return new Promise<{error?: string; message?: string}>(resolve => {
    const client = ldap.createClient({
      url: `ldaps://${dc}`,
      tlsOptions: {rejectUnauthorized: false}
    })
    client.bind(adminDN, adminPassword, err => {
      if (err) {
        resolve({error: 'Unable to connect to the domain'})
        return
      }

      client.search(
        studentsOU,
        {
          filter: `(sAMAccountName=${username})`,
          scope: 'sub'
        },
        (err, res) => {
          if (err) {
            resolve({error: `Unable to find user ${username}`})
            return
          }
          let entries = 0

          res.on('searchEntry', entry => {
            entries += 1
            client.modify(
              entry.dn.toString(),
              [
                new ldap.Change({
                  operation: 'replace',
                  modification: new ldap.Attribute({
                    type: 'unicodePwd',
                    values: encodePassword(`${username.slice(0, 5)}1`)
                  })
                }),
                new ldap.Change({
                  operation: 'replace',
                  modification: new ldap.Attribute({
                    type: 'pwdLastSet',
                    values: '0000'
                  })
                })
              ],
              err => {
                if (err) {
                  console.dir(err)
                  resolve({error: `Unable to reset password`})
                  client.unbind()
                  return
                }

                resolve({
                  message: `Reset password to "${username.slice(0, 5)}1"`
                })
                client.unbind()
              }
            )
          })

          res.on('end', result => {
            if (entries === 0) {
              resolve({error: `Unable to find user ${username}`})
              client.unbind()
            }
          })
        }
      )
    })
  })
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const allowedUsers = (await getConfigValue('adAllowedUsers'))
    .split(',')
    .map(e => e.trim())

  if (!allowedUsers.includes(user.username)) {
    throw new Response('Access Denied', {status: 403})
  }

  return json({user})
}

export const action = async ({request}: ActionFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const allowedUsers = (await getConfigValue('adAllowedUsers'))
    .split(',')
    .map(e => e.trim())

  if (!allowedUsers.includes(user.username)) {
    throw new Response('Access Denied', {status: 403})
  }

  const formData = await request.formData()

  const targetUser = formData.get('user') as string | undefined

  invariant(targetUser)

  await log(
    'Password Reset',
    `Reset password for AD user "${targetUser}"`,
    user.username
  )

  const result = await resetPassword(targetUser)

  await log(
    'Password Reset',
    `Result: ${result.error ? result.error : result.message}`,
    user.username
  )

  return json({...result})
}

const ResetPassword = () => {
  const data = useActionData<typeof action>()
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    setDisabled(true)
  }, [setDisabled])

  return (
    <div className="m-auto w-1/2 bg-white p-2 rounded-xl mt-64 shadow-xl">
      <h1 className="text-3xl">Student Password Reset</h1>
      <p className="mb-2">
        This tool will reset a students password on the network and Office 365.
      </p>
      {data?.error ? (
        <p className="bg-red-300 rounded shadow p-1 mb-2">{data.error}</p>
      ) : (
        ''
      )}
      {data?.message ? (
        <p className="bg-blue-300 rounded shadow p-1 mb-2">{data.message}</p>
      ) : (
        ''
      )}
      <form method="POST">
        <fieldset className={fieldsetClasses()}>
          <label className={labelClasses()}>
            Username
            <input
              name="user"
              type="text"
              className={inputClasses()}
              placeholder="studentname"
              autoComplete="off"
              onChange={e => {
                setDisabled(e.target.value.length < 3)
              }}
            />
          </label>
          <button
            className={buttonClasses('bg-green-300', ['disabled:bg-gray-300'])}
            disabled={disabled}
          >
            Reset Password
          </button>
          <a
            className={buttonClasses('bg-gray-300', ['text-white', 'ml-2'])}
            href="/start"
          >
            Cancel
          </a>
        </fieldset>
      </form>
    </div>
  )
}

export default ResetPassword
