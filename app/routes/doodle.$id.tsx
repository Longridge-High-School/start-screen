import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {useMemo, useState} from 'react'

import {getPrisma} from '~/lib/prisma'
import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'

import {getMDXComponent} from '~/lib/mdx'

import {buttonClasses, inputClasses} from '~/lib/classes'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  const prisma = getPrisma()

  const doodle = await prisma.doodle.findFirstOrThrow({
    where: {
      id: parseInt(params.id!),
      bodyCache: {not: ''}
    }
  })

  return json({doodle, user})
}

const DoodlePreview = () => {
  const {doodle, user} = useLoaderData<typeof loader>()

  const doodleClasses = ['w-[360px] h-[820px]', 'w-[680px] h-[560px]']

  const [currentUser, setCurrentUser] = useState(user.username)
  const [doodleClass, setDoodleClass] = useState(0)

  const Preview = useMemo(
    () => getMDXComponent(doodle.bodyCache, {currentUser}),
    [doodle.bodyCache, currentUser]
  )

  return (
    <div className="m-12">
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button
          className={buttonClasses('bg-blue-300', ['col-start-1'])}
          onClick={() => setDoodleClass(0)}
        >
          16:9 Screen
        </button>
        <button
          className={buttonClasses('bg-blue-300')}
          onClick={() => setDoodleClass(1)}
        >
          4:3 Screen
        </button>
        <input
          className={inputClasses()}
          value={currentUser}
          onChange={e => setCurrentUser(e.target.value)}
        />
      </div>
      <div className={`${doodleClasses[doodleClass]} m-auto`}>
        <Preview />
      </div>
    </div>
  )
}

export default DoodlePreview
