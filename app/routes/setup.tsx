import {type LoaderArgs, type ActionArgs, json, redirect} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getUPNFromHeaders} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'
import {setConfigValue} from '~/lib/config.server'

export const loader = async ({request}: LoaderArgs) => {
  const prisma = getPrisma()

  const userCount = await prisma.user.count()

  const upn = getUPNFromHeaders(request)

  if (userCount !== 0) {
    return new Response('Not Found', {status: 404})
  }

  return json({upn})
}

export const action = async ({request}: ActionArgs) => {
  const prisma = getPrisma()

  const userCount = await prisma.user.count()

  if (userCount !== 0) {
    return new Response('Not Found', {status: 404})
  }

  const upn = getUPNFromHeaders(request)

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const username = formData.get('username') as string | undefined

  invariant(name)
  invariant(username)

  await setConfigValue('title', name)
  await setConfigValue('tabTitle', `Start Screen @ ${name}`)

  await prisma.user.create({
    data: {
      name: username,
      username: upn.split('@')[0],
      admin: true,
      type: 'STAFF'
    }
  })

  return redirect('/admin')
}

const SetupPage = () => {
  const {upn} = useLoaderData()

  return (
    <div className="rounded-xl shadow bg-white mt-24 w-1/2 m-auto p-2">
      <h1 className="text-3xl mb-4">Setup</h1>
      <p>Initial Setup will create a staff/admin account for {upn}.</p>
      <form method="POST">
        <fieldset className="border border-gray-100 rounded">
          <label className="w-full grid grid-cols-3 border-gray-100 border-b mb-1">
            <span>School Name</span>
            <input
              name="name"
              type="text"
              className="border-gray-100 border col-span-2 p-2"
            />
            <p className="col-start-2 col-span-2">Main Title</p>
          </label>
          <label className="w-full grid grid-cols-3 border-gray-100 border-b mb-1">
            <span>Your Name</span>
            <input
              name="username"
              type="text"
              className="border-gray-100 border col-span-2 p-2"
            />
            <p className="col-start-2 col-span-2">
              Your name as it will appear on the start screen.
            </p>
          </label>
          <div className="grid grid-cols-3 gap-2 my-2">
            <button className="col-start-2 bg-green-300 rounded-md shadow">
              Setup Site
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  )
}

export default SetupPage
