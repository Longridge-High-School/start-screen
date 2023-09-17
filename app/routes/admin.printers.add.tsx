import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect
} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getUserFromUPN, getUPNFromHeaders} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'
import {resetCache} from '~/lib/printers.server'
import {log} from '~/log.server'

import {
  labelClasses,
  inputClasses,
  fieldsetClasses,
  labelSpanClasses,
  buttonClasses
} from '~/lib/classes'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  return json({user})
}

export const action = async ({request}: ActionFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const ip = formData.get('ip') as string | undefined
  const snmp = formData.get('snmp') as string | undefined
  const staff = formData.get('staff') as string | undefined
  const blackOID = formData.get('blackoid') as string | undefined
  const cyanOID = formData.get('cyanoid') as string | undefined
  const magentaOID = formData.get('magentaoid') as string | undefined
  const yellowOID = formData.get('yellowoid') as string | undefined

  invariant(name)
  invariant(ip)
  invariant(snmp)
  invariant(blackOID)
  invariant(cyanOID)
  invariant(magentaOID)
  invariant(yellowOID)

  await prisma.printer.create({
    data: {
      name,
      ip,
      snmpCommunity: snmp,
      staffOnly: staff !== undefined,
      blackOID,
      cyanOID,
      magentaOID,
      yellowOID
    }
  })
  await log('Printers', `Added Printer ${name}`, user.username)

  resetCache()

  return redirect('/admin/printers')
}

const AddPrinterPage = () => {
  return (
    <div className="rounded-xl bg-white shadow m-4 p-2">
      <h2 className="text-2xl">Add Printer</h2>
      <form method="POST">
        <div className={fieldsetClasses('grid grid-cols-2')}>
          <div>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Name</span>
              <input
                name="name"
                type="text"
                className={inputClasses()}
                placeholder="Main Office"
              />
            </label>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>IP</span>
              <input
                name="ip"
                type="text"
                className={inputClasses()}
                placeholder="10.0.0.10"
              />
            </label>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>SNMP Community</span>
              <input
                name="snmp"
                type="text"
                className={inputClasses()}
                placeholder="public"
              />
            </label>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Staff Only</span>
              <input name="staff" type="checkbox" className={inputClasses()} />
            </label>
          </div>
          <div>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Black OID</span>
              <input
                name="blackoid"
                type="text"
                className={inputClasses()}
                placeholder="1.2.3.4...."
              />
            </label>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Cyan OID</span>
              <input
                name="cyanoid"
                type="text"
                className={inputClasses()}
                placeholder="1.2.3.4...."
              />
            </label>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Magenta OID</span>
              <input
                name="magentaoid"
                type="text"
                className={inputClasses()}
                placeholder="1.2.3.4...."
              />
            </label>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Yellow OID</span>
              <input
                name="yellowoid"
                type="text"
                className={inputClasses()}
                placeholder="1.2.3.4...."
              />
            </label>
          </div>
          <button className={buttonClasses('bg-green-300')}>Add!</button>
        </div>
      </form>
    </div>
  )
}

export default AddPrinterPage
