import {type LoaderArgs, json, type ActionArgs, redirect} from '@remix-run/node'
import {Outlet, useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'

import {createTimings} from '~/utils/timings.server'

import {StateSelector} from '~/lib/components/inputs/component-status'

import {
  fieldsetClasses,
  labelClasses,
  inputClasses,
  buttonClasses,
  labelSpanClasses
} from '~/lib/classes'
import {COMPONENT_STATUS} from '~/utils/constants'

export const loader = async ({request, params}: LoaderArgs) => {
  const {time, getHeader} = createTimings()

  const user = await time('getUser', 'Get User from header', () =>
    getUserFromUPN(getUPNFromHeaders(request))
  )

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const componentGroup = await time(
    'getComponentGroup',
    'Get Component Group',
    () =>
      prisma.componentGroup.findFirstOrThrow({
        where: {id: parseInt(params.id!)},
        include: {components: true}
      })
  )

  return json(
    {user, componentGroup},
    {
      headers: {'Server-Timing': getHeader()}
    }
  )
}

export const action = async ({request, params}: ActionArgs) => {
  const {time, getHeader} = createTimings()

  const user = await time('getUser', 'Get User from header', () =>
    getUserFromUPN(getUPNFromHeaders(request))
  )

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const status = formData.get('status') as string | undefined
  const description = formData.get('description') as string | undefined

  invariant(name)
  invariant(status)
  invariant(description)

  await time('createComponent', 'Create Component', () =>
    prisma.component.create({
      data: {
        name,
        state: status as any,
        description,
        descriptionCache: '',
        groupId: parseInt(params.id!)
      }
    })
  )

  return redirect(`/admin/system-status/${parseInt(params.id!)}`, {
    headers: {'Server-Timing': getHeader()}
  })
}

const AdminSystemStatusComponentGroup = () => {
  const {componentGroup} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="bg-white rounded-xl shadow-xl p-2">
        <h2 className="text-xl">{componentGroup.name}</h2>
        <table>
          <thead>
            <tr>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {componentGroup.components.map(({id, name, state}) => {
              return (
                <tr key={id}>
                  <td>
                    <a href={`/admin/system-status/${componentGroup.id}/${id}`}>
                      {name}
                    </a>
                  </td>
                  <td>{COMPONENT_STATUS[state].status}</td>
                  <td></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <form
          method="post"
          action={`/admin/system-status/${componentGroup.id}`}
        >
          <fieldset className={fieldsetClasses()}>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Name</span>
              <input name="name" type="text" className={inputClasses()} />
            </label>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Status</span>
              <div className="col-span-3">
                <StateSelector initial="Unkown" name="status" />
              </div>
            </label>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Description</span>
              <input
                name="description"
                type="text"
                className={inputClasses()}
              />
            </label>
            <div className={labelClasses()}>
              <button className={buttonClasses()}>Add Component</button>
            </div>
          </fieldset>
        </form>
      </div>
      <div className="col-span-2">
        <Outlet />
      </div>
    </div>
  )
}

export default AdminSystemStatusComponentGroup
