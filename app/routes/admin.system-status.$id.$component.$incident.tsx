import {
  type LoaderFunctionArgs,
  json,
  type ActionFunctionArgs,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'
import {type ComponentState} from '@prisma/client'

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

  const incident = await time('getIncident', 'Get Incident', () =>
    prisma.incident.findFirstOrThrow({
      where: {id: parseInt(params.incident!)},
      include: {component: true, children: {orderBy: {createdAt: 'asc'}}}
    })
  )

  return json(
    {user, incident},
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

  const message = formData.get('message') as string | undefined
  const status = formData.get('status') as ComponentState | undefined

  invariant(message)
  invariant(status)

  const prisma = getPrisma()

  await time('createIncident', 'Create Incident', () =>
    prisma.incident.create({
      data: {
        message,
        title: '',
        parentId: parseInt(params.incident!),
        state: status,
        componentId: parseInt(params.component!)
      }
    })
  )

  await time('updateComponent', 'Update Component', () =>
    prisma.component.update({
      where: {id: parseInt(params.component!)},
      data: {state: status}
    })
  )

  if (status === 'Operational') {
    await time('updateParent', 'Update Parent', () =>
      prisma.incident.update({
        where: {id: parseInt(params.incident!)},
        data: {open: false}
      })
    )
  }

  return redirect(
    `/admin/system-status/${params.id}/${params.component}/${params.incident}}`,
    {
      headers: {'Server-Timing': getHeader()}
    }
  )
}

const AdminSystemStatusIncidentComponentGroup = () => {
  const {incident} = useLoaderData<typeof loader>()

  return (
    <div className="bg-white rounded-xl shadow-xl p-2">
      <h2 className="text-xl">{incident.title}</h2>
      <p className="mb-2">{incident.message}</p>
      {incident.children.map(child => {
        return (
          <p key={child.id}>
            {child.message}{' '}
            <a
              href={`/admin/system-status/${incident.component.groupId}/${incident.component.id}/${child.id}/delete`}
            >
              🗑️
            </a>
          </p>
        )
      })}
      <form
        method="post"
        action={`/admin/system-status/${incident.component.groupId}/${incident.component.id}/${incident.id}`}
      >
        <fieldset className={fieldsetClasses()}>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Message</span>
            <textarea name="message" className={inputClasses()} />
          </label>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Status</span>
            <div className="col-span-3">
              <StateSelector initial="Unkown" name="status" />
            </div>
          </label>
          <div className={labelClasses()}>
            <button className={buttonClasses()}>Add Message</button>
          </div>
        </fieldset>
      </form>
    </div>
  )
}

export default AdminSystemStatusIncidentComponentGroup
