import type {ActionFunction, LoaderFunction} from '@remix-run/node'
import type {User, WirelessVoucher} from '@prisma/client'

import {json, redirect} from '@remix-run/node'
import {useLoaderData} from 'react-router'
import {invariant} from '@arcath/utils'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'
import {log} from '~/log.server'

export const loader: LoaderFunction = async ({request}) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const vouchers = await prisma.wirelessVoucher.findMany({
    where: {claimed: {equals: false}}
  })

  return json({user, vouchers})
}

export const action: ActionFunction = async ({request}) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const formData = await request.formData()

  const voucherId = formData.get('voucher') as string | undefined
  const reason = formData.get('reason') as string | undefined

  invariant(voucherId)
  invariant(reason)

  const prisma = getPrisma()

  const voucher = await prisma.wirelessVoucher.findFirstOrThrow({
    where: {id: parseInt(voucherId)}
  })

  voucher.claimed = true
  voucher.note = reason

  await prisma.wirelessVoucher.update({data: voucher, where: {id: voucher.id}})
  await log('Guest Wifi', `Claimed Wifi Code ${voucher.id}`, user.username)

  return redirect(`/wifi/guest/${voucher.id}`)
}

const WiFiPage = () => {
  const {vouchers, user} = useLoaderData() as {
    vouchers: WirelessVoucher[]
    user: User
  }

  return (
    <div className="grid grid-cols-3">
      <div>
        <div className="m-8 p-2 rounded-xl bg-white">
          <h1 className="text-2xl mb-4">Wi Fi Vouchers</h1>
          {user.admin ? (
            <a
              href="/wifi/create"
              className="m-4 block bg-gray-100 rounded p-2 shadow text-center"
            >
              Create Codes
            </a>
          ) : (
            ''
          )}
          {user.admin ? (
            <a
              href="/wifi/claimed"
              className="m-4 block bg-gray-100 rounded p-2 shadow text-center"
            >
              Claim Log
            </a>
          ) : (
            ''
          )}
        </div>
      </div>
      <div className="col-span-2 grid grid-cols-3 gap-2 pt-8">
        {vouchers.map(voucher => {
          return (
            <div key={voucher.id} className="rounded-lg bg-white h-48 p-2">
              <h2 className="text-xl mb-4">LHS Guest Network Access</h2>
              <p>
                <b>Voucher Code</b>: XXXXX-
                {voucher.code.match(/.{1,5}/g)?.pop()}
                <br />
                {voucher.type}
              </p>
              <p>
                <form method="POST" className="grid grid-cols-4 mt-4">
                  <input type="hidden" name="voucher" value={voucher.id} />
                  <input
                    type="text"
                    name="reason"
                    placeholder="Claim Reason"
                    className="border-gray-100 border rounded-l p-2 col-span-3"
                  />
                  <button className="border-gray-100 border bg-green-300 rounded-r p-2">
                    Claim
                  </button>
                </form>
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WiFiPage
