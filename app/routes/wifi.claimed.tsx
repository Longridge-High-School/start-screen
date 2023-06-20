import type {LoaderFunction} from '@remix-run/node'
import type {User, WirelessVoucher} from '@prisma/client'

import {json} from '@remix-run/node'
import {useLoaderData} from 'react-router'
import {format} from 'date-fns'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'

export const loader: LoaderFunction = async ({request}) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const vouchers = await prisma.wirelessVoucher.findMany({
    where: {claimed: {equals: true}}
  })

  return json({user, vouchers})
}

const ClaimedPage = () => {
  const {vouchers} = useLoaderData() as {
    vouchers: WirelessVoucher[]
    user: User
  }

  return (
    <div className="bg-white w-1/2 m-auto rounded-xl shadow p-2 mt-12">
      <h1 className="text-xl mb-4">Claimed Codes</h1>

      <table className="w-full text-left">
        <thead>
          <tr>
            <th scope="col" className="px-6 py-3">
              Code
            </th>
            <th scope="col" className="px-6 py-3">
              Type
            </th>
            <th scope="col" className="px-6 py-3">
              Claim Reason
            </th>
            <th scope="col" className="px-6 py-3">
              Claim Time
            </th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((voucher, i) => {
            let className = ''

            if (i % 2 === 0) {
              className += 'bg-gray-50'
            }

            return (
              <tr key={voucher.id} className={className}>
                <th scope="row" className="px-6 py-4 font-medium">
                  {voucher.code.match(/.{1,5}/g)?.join('-')}
                </th>
                <td className="px-6 py-4">{voucher.type}</td>
                <td className="px-6 py-4">{voucher.note}</td>
                <td className="px-6 py-4">
                  {format(new Date(voucher.updatedAt), 'dd/MM/yy HH:mm:ss')}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ClaimedPage
