import type {ActionFunction, LoaderFunction} from '@remix-run/node'
import {json, redirect} from '@remix-run/server-runtime'
import {invariant, asyncForEach} from '@arcath/utils'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'
import {log} from '~/log.server'

import {
  fieldsetClasses,
  labelClasses,
  inputClasses,
  buttonClasses,
  labelSpanClasses
} from '~/lib/classes'

export const loader: LoaderFunction = async ({request}) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  return json({})
}

export const action: ActionFunction = async ({request}) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const formData = await request.formData()

  const codesAsString = formData.get('codes') as string | undefined
  const duration = formData.get('duration') as string | undefined
  const multiUseData = formData.get('multi-use') as string | undefined

  invariant(codesAsString)
  invariant(duration)

  const multiUse = multiUseData === 'on'

  const prisma = getPrisma()

  const codes = codesAsString.split('\r\n').filter(v => v.length > 2)

  await asyncForEach(codes, async code => {
    let type = `${duration} Hour${parseInt(duration) > 1 ? 's' : ''}`

    if (multiUse) {
      type += ` (Multi Use)`
    }

    await prisma.wirelessVoucher.create({
      data: {code, type, claimed: false}
    })
  })

  await log(
    'Guest WiFi',
    `Created ${codes.length} ${parseInt(duration)} hour ${
      multiUse ? 'Multi Use' : ''
    } vouchers`,
    user.username
  )

  return redirect('/wifi/guest')
}

const CreatePage = () => {
  return (
    <div className="mx-auto w-[38rem] rounded-xl bg-white mt-16 p-4">
      <h1 className="text-2xl">Create Vouchers</h1>
      <form method="POST">
        <fieldset className={fieldsetClasses()}>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Codes (One per line)</span>
            <textarea name="codes" className={inputClasses()} />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Duration (Hours)</span>
            <input
              name="duration"
              type="number"
              className={inputClasses()}
              defaultValue={12}
            />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Multi Use</span>
            <input
              name="multi-use"
              type="checkbox"
              className={inputClasses()}
              defaultChecked={true}
            />
          </label>
          <div className={labelClasses()}>
            <button className={buttonClasses()}>Create Vouchers!</button>
          </div>
        </fieldset>
      </form>
    </div>
  )
}

export default CreatePage
