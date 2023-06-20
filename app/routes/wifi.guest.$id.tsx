import {type LoaderArgs, json} from '@remix-run/node'
import qrcode from 'qrcode'

import {useLoaderData} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma'

import {getConfigValue} from '~/lib/config.server'

const mecardFormat = (input: string): string => {
  input = input.replace(/\\/g, '\\\\')
  input = input.replace(/"/g, '\\"')
  input = input.replace(/;/g, '\\;')
  input = input.replace(/,/g, '\\,')
  input = input.replace(/:/g, '\\:')
  return input
}

export const loader = async ({params}: LoaderArgs) => {
  const prisma = getPrisma()

  const voucher = await prisma.wirelessVoucher.findFirstOrThrow({
    where: {claimed: {equals: true}, id: parseInt(params.id!)}
  })

  const ssid = await getConfigValue('guestWiFiSSID')
  const psk = await getConfigValue('guestWiFiPSK')

  const wifiString = `WIFI:S:${mecardFormat(ssid)};T:WPA;P:${mecardFormat(
    psk
  )};;`

  const dataUrl = await qrcode.toDataURL(wifiString, {
    errorCorrectionLevel: 'H',
    rendererOpts: {quality: 1}
  })

  return json({voucher, ssid, psk, dataUrl})
}

const VoucherPage = () => {
  const {voucher, ssid, psk, dataUrl} = useLoaderData<typeof loader>()

  return (
    <div className="bg-white m-auto mt-24 rounded-xl p-4 w-[48rem] text-lg overflow-auto">
      <img
        src={dataUrl}
        className="mr-4 float-left h-64"
        alt="Wi-Fi details QRCode"
      />
      <h1 className="text-3xl">Guest Network Access</h1>
      <p>
        <b>Wireless Network</b>:<br />
        {ssid}
        <br />
        <b>Password</b>:<br />
        {psk}
      </p>
      <p className="mt-4">
        <b>Voucher Code</b>:<br />
        {voucher.code.match(/.{1,5}/g)?.join('-')}
      </p>
      <p className="mt-2">{voucher.type}</p>
    </div>
  )
}

export default VoucherPage
