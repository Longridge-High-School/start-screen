import {
  type LoaderFunctionArgs,
  json,
  type ActionFunctionArgs,
  redirect
} from '@remix-run/node'
import {useLoaderData, Outlet} from '@remix-run/react'
import {invariant} from '@arcath/utils'
import {type ComponentState} from '@prisma/client'
import {format} from 'date-fns'

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

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const {time, getHeader} = createTimings()

  const user = await time('getUser', 'Get User from header', () =>
    getUserFromUPN(getUPNFromHeaders(request))
  )

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const component = await time('getComponent', 'Get Component', () =>
    prisma.component.findFirstOrThrow({
      where: {id: parseInt(params.component!)},
      include: {incidents: {where: {parentId: null}}}
    })
  )

  return json(
    {user, component},
    {
      headers: {'Server-Timing': getHeader()}
    }
  )
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  const {time, getHeader} = createTimings()

  const user = await time('getUser', 'Get User from header', () =>
    getUserFromUPN(getUPNFromHeaders(request))
  )

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const formData = await request.formData()

  const title = formData.get('title') as string | undefined
  const status = formData.get('status') as ComponentState | undefined
  const message = formData.get('message') as string | undefined

  invariant(title)
  invariant(status)
  invariant(message)

  const prisma = getPrisma()

  const incident = await time('createIncident', 'Create Incident', () =>
    prisma.incident.create({
      data: {
        title,
        message,
        componentId: parseInt(params.component!),
        state: status
      }
    })
  )

  await time('updateComponent', 'Update Component', () =>
    prisma.component.update({
      where: {id: parseInt(params.component!)},
      data: {state: status}
    })
  )

  return redirect(
    `/admin/system-status/${params.id}/${params.component}/${incident.id}`,
    {
      headers: {'Server-Timing': getHeader()}
    }
  )
}

const SystemStatusGroupComponent = () => {
  const {component} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-white rounded-xl shadow-xl p-2">
        <h2 className="text-xl">{component.name}</h2>
        <table>
          <thead>
            <tr>
              <th scope="col" className="px-6 py-3">
                Title
              </th>
              <th scope="col" className="px-6 py-3">
                Date
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {component.incidents.map(incident => {
              return (
                <tr key={incident.id}>
                  <td>
                    <a
                      href={`/admin/system-status/${component.groupId}/${component.id}/${incident.id}`}
                    >
                      {incident.title}
                    </a>
                  </td>
                  <td>
                    {format(new Date(incident.createdAt), 'do MMMM yyyy HH:mm')}
                  </td>
                  <td>
                    <a
                      href={`/admin/system-status/${component.groupId}/${component.id}/${incident.id}/delete`}
                    >
                      🗑️
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <form
          method="post"
          action={`/admin/system-status/${component.groupId}/${component.id}`}
        >
          <fieldset className={fieldsetClasses()}>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Name</span>
              <input name="title" type="text" className={inputClasses()} />
            </label>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Status</span>
              <div className="col-span-3">
                <StateSelector initial="Unkown" name="status" />
              </div>
            </label>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Message</span>
              <textarea name="message" className={inputClasses()} />
            </label>
            <div className={labelClasses()}>
              <button className={buttonClasses()}>Add Incident</button>
            </div>
          </fieldset>
        </form>
      </div>
      <Outlet />
    </div>
  )
}

export default SystemStatusGroupComponent
