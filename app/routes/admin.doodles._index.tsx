import {type LoaderArgs, type ActionArgs, json, redirect} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'
import {format} from 'date-fns'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
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

export const loader = async ({request}: LoaderArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const doodles = await prisma.doodle.findMany({orderBy: {name: 'asc'}})

  return json({doodles, user})
}

export const action = async ({request}: ActionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const startDate = formData.get('start-date') as string | undefined
  const endDate = formData.get('end-date') as string | undefined

  invariant(name)
  invariant(startDate)
  invariant(endDate)

  const prisma = getPrisma()

  const doodle = await prisma.doodle.create({
    data: {
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      body: '',
      bodyCache: ''
    }
  })

  await log('Doodles', `Created new Doodle ${name}`, user.username)

  return redirect(`/admin/doodles/edit/${doodle.id}`)
}

const AdminDoodles = () => {
  const {doodles} = useLoaderData<typeof loader>()

  return (
    <div className="bg-white w-1/2 rounded-xl shadow p-2 m-auto mt-4">
      <h1 className="text-3xl mb-4">Doodles</h1>
      <table className="w-full">
        <thead>
          <tr>
            <th scope="col" className="px-6 py-3">
              Name
            </th>
            <th scope="col" className="px-6 py-3">
              Start Date
            </th>
            <th scope="col" className="px-6 py-3">
              End Date
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {doodles.map(({id, name, startDate, endDate}) => {
            return (
              <tr key={id}>
                <td>{name}</td>
                <td>{format(new Date(startDate), 'dd-MM-yyyy')}</td>
                <td>{format(new Date(endDate), 'dd-MM-yyyy')}</td>
                <td>
                  <a href={`/admin/doodles/edit/${id}`}>✏</a>
                  <br />
                  <a href={`/admin/doodles/delete/${id}`}>🗑</a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <h2 className="text-2xl mb-2">New Doodle</h2>
      <form method="POST">
        <fieldset className={fieldsetClasses()}>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Name</span>
            <input
              name="name"
              type="text"
              className={inputClasses()}
              placeholder="Some Day 2023"
            />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Start Date</span>
            <input name="start-date" type="date" className={inputClasses()} />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>End Date</span>
            <input name="end-date" type="date" className={inputClasses()} />
            <span className={labelInfoClasses()}>
              Set to the same as Start Date for a single day Doodle.
            </span>
          </label>
          <div className={labelClasses()}>
            <button className={buttonClasses()}>Add Doodle!</button>
          </div>
        </fieldset>
      </form>
    </div>
  )
}

export default AdminDoodles
