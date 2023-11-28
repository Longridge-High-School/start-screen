import {type Doodle as DBDoodle} from '@prisma/client'

import {MDXComponent} from '../mdx'

export const Doodle = ({
  doodle,
  currentUser,
  startScreen
}: {
  doodle: Pick<DBDoodle, 'bodyCache'> | null
  currentUser: string
  startScreen: boolean
}) => {
  return (
    <div>
      {doodle ? (
        <MDXComponent
          code={doodle.bodyCache}
          currentUser={currentUser}
          startScreen={startScreen}
        />
      ) : (
        ''
      )}
    </div>
  )
}
