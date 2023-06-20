import type {ActionFunction, LoaderFunction} from '@remix-run/node'
import {json, redirect} from '@remix-run/server-runtime'
import {invariant, asyncForEach} from '@arcath/utils'

import {getUnifi} from '~/lib/unifi.server'

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

  const count = formData.get('count') as string | undefined
  const duration = formData.get('duration') as string | undefined
  const multiUseData = formData.get('multi-use') as string | undefined

  invariant(count)
  invariant(duration)

  const multiUse = multiUseData === 'on'

  const unifi = await getUnifi()
  const prisma = getPrisma()

  const response = await unifi.createVouchers(
    parseInt(duration) * 86400,
    parseInt(count),
    multiUse ? 0 : 1
  )

  const vouchers = await unifi.getVouchers(response[0].create_time)

  await asyncForEach(vouchers, async voucher => {
    let type = `${duration} Day${parseInt(duration) > 1 ? 's' : ''}`

    if (multiUse) {
      type += ` (Multi Use)`
    }

    await prisma.wirelessVoucher.create({
      data: {code: voucher.code, type, claimed: false}
    })
  })

  await log(
    'Guest WiFi',
    `Created ${count} ${parseInt(duration) * 86400} day ${
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
            <span className={labelSpanClasses()}>Count</span>
            <input
              name="count"
              type="number"
              className={inputClasses()}
              defaultValue={10}
            />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Duration (Days)</span>
            <input
              name="duration"
              type="number"
              className={inputClasses()}
              defaultValue={1}
            />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Multi Use</span>
            <input
              name="multi-use"
              type="checkbox"
              className={inputClasses()}
              defaultChecked={false}
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
