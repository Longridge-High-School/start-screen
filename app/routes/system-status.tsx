import {type LoaderArgs, json, type HeadersArgs} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {type ComponentState, type Component} from '@prisma/client'
import {useState} from 'react'
import {format, subHours} from 'date-fns'

import {createTimings} from '~/utils/timings.server'
import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'
import {COMPONENT_STATUS} from '~/utils/constants'

export const loader = async ({request}: LoaderArgs) => {
  const {time, getHeader} = createTimings()
  const user = await time('getUser', 'Get User from header', () =>
    getUserFromUPN(getUPNFromHeaders(request))
  )

  if(user.type !== 'STAFF'){
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const componentGroups = await time(
    'getComponentGroups',
    'Get Component Groups',
    () =>
      prisma.componentGroup.findMany({
        orderBy: {order: 'asc'},
        include: {
          components: {
            select: {id: true, name: true, state: true},
            orderBy: {name: 'asc'}
          }
        }
      })
  )

  const incidents = await time('getIncidents', 'Get Incidents', () =>
    prisma.incident.findMany({
      where: {
        OR: [{open: true}, {updatedAt: {lte: subHours(new Date(), 0)}}],
        AND: {parentId: {equals: null}}
      },
      orderBy: {createdAt: 'asc'},
      include: {component: true, children: {orderBy: {createdAt: 'asc'}}}
    })
  )

  return json(
    {componentGroups, user, incidents},
    {
      headers: {'Server-Timing': getHeader()}
    }
  )
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}

const SystemStatus = () => {
  const {componentGroups, incidents} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2 gap-16 p-16">
      <div>
        {componentGroups.map(({id, name, components, defaultExpanded}) => {
          return (
            <ComponentGroup
              key={id}
              name={name}
              components={components}
              defaultExpanded={defaultExpanded}
            />
          )
        })}
      </div>
      <div>
        {incidents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-xl p-2 text-center">
            No open incidents!
          </div>
        ) : (
          incidents.map(incident => {
            return (
              <div
                className="bg-white rounded-xl shadow-xl p-2 mb-4"
                key={incident.id}
              >
                <h3 className="text-xl mb-4">
                  {incident.component.name} - {incident.title}
                </h3>
                <ol className="ml-2 border-l-2 border-brand-dark">
                  <li>
                    <div className="flex-start flex items-center">
                      <div className="-ml-[9px] -mt-2 mr-3 flex h-4 w-4 items-center justify-center rounded-full bg-brand-dark"></div>
                      <h4 className="-mt-2 text-xl font-semibold">
                        {COMPONENT_STATUS[incident.state].icon}{' '}
                        {format(
                          new Date(incident.createdAt),
                          'do MMMM yyyy HH:mm'
                        )}
                      </h4>
                    </div>
                    <div className="ml-6 pb-6">
                      <p className="mb-4 mt-2">{incident.message}</p>
                    </div>
                  </li>
                  {incident.children.map(child => {
                    return (
                      <li key={child.id}>
                        <div className="flex-start flex items-center">
                          <div className="-ml-[9px] -mt-2 mr-3 flex h-4 w-4 items-center justify-center rounded-full bg-brand-dark"></div>
                          <h4 className="-mt-2 text-xl font-semibold">
                            {COMPONENT_STATUS[child.state].icon}{' '}
                            {format(
                              new Date(child.createdAt),
                              'do MMMM yyyy HH:mm'
                            )}
                          </h4>
                        </div>
                        <div className="ml-6 pb-6">
                          <p className="mb-4 mt-2">{child.message}</p>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

const ComponentGroup = ({
  name,
  components,
  defaultExpanded
}: {
  name: string
  components: Pick<Component, "id" | "name" | "state">[]
  defaultExpanded: boolean
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const state = components.reduce((state, component) => {
    if (
      COMPONENT_STATUS[component.state].number < COMPONENT_STATUS[state].number
    ) {
      return component.state
    }

    return state
  }, 'Operational' as ComponentState)

  const groupStatus = COMPONENT_STATUS[state]

  return (
    <div className="bg-white rounded-xl shadow-xl p-2">
      <div className="text-2xl">
        {groupStatus.icon} {name}
        <span
          className="float-right cursor-pointer"
          onClick={() => {
            setExpanded(!expanded)
          }}
        >
          {expanded ? '⬆️' : '⬇️'}
        </span>
      </div>
      {expanded ? (
        <table className="mt-4">
          <tbody>
            {components.map(({id, name, state}) => {
              return (
                <tr key={id}>
                  <td>{COMPONENT_STATUS[state].icon}</td>
                  <td>{name}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        ''
      )}
    </div>
  )
}

export default SystemStatus
