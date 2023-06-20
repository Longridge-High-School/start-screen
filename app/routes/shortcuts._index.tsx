import {type LoaderArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {getShortcutsForUser} from '~/lib/prisma'
import {getUserFromUPN, getUPNFromHeaders} from '~/lib/user.server'

import {Button} from '~/lib/components/boxes/button'

export const loader = async ({request}: LoaderArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  const {shortcuts} = await getShortcutsForUser(user, request, Infinity, false)

  return json({shortcuts})
}

const ShortcutsPage = () => {
  const {shortcuts} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-6 gap-4 p-4">
      {shortcuts.map(shortcut => {
        return (
          <Button
            key={shortcut.id}
            label={shortcut.title}
            target={shortcut.target}
            image={`/icons/${shortcut.icon}`}
            delay={0}
          />
        )
      })}
      <Button label="Back" target="/start" image="/img/logo.png" delay={0} />
    </div>
  )
}

export default ShortcutsPage
